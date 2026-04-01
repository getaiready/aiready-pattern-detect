import {
  OrganizationsClient,
  CreateAccountCommand,
  DescribeCreateAccountStatusCommand,
  ListAccountsCommand,
  ListTagsForResourceCommand,
  TagResourceCommand,
} from '@aws-sdk/client-organizations';
import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from '@aws-sdk/client-sts';
import {
  IAMClient,
  CreateRoleCommand,
  AttachRolePolicyCommand,
  CreateOpenIDConnectProviderCommand,
  GetOpenIDConnectProviderCommand,
} from '@aws-sdk/client-iam';
import {
  CodeBuildClient,
  CreateProjectCommand,
  ImportSourceCredentialsCommand,
  StartBuildCommand,
} from '@aws-sdk/client-codebuild';

const orgClient = new OrganizationsClient({ region: 'us-east-1' }); // Organizations API is only in us-east-1
const stsClient = new STSClient({});

/**
 * Initiates the creation of a new AWS account specialized for a ClawMore Managed node.
 * Uses an address-tagged email to create unique accounts linked to a single owner email.
 *
 * @param userEmail - The owner's email address (will be sanitized for uniqueness).
 * @param userName - Friendly name for the account owner, used in the AccountName.
 * @param userId - Unique ID for the user to include in the account name.
 * @returns The CreateAccount request id which can be polled for completion.
 * @throws When the Organizations API fails to initiate account creation.
 */
export async function createManagedAccount(
  userEmail: string,
  userName: string,
  userId?: string,
  isWarmPool: boolean = false
): Promise<{ requestId: string; estimatedTimeSeconds: number }> {
  const sanitizedEmail = isWarmPool
    ? userEmail.replace('@', `+clawpool-${Date.now().toString(36)}@`)
    : userEmail.replace('@', '+clawmore@');

  const shortId = userId ? userId.substring(0, 8).toUpperCase() : 'WARM';
  const accountName = isWarmPool
    ? `Claw-WarmPool-${Date.now().toString(36)}`
    : `Claw-${shortId} (${userName})`;

  const tags = [
    { Key: 'Project', Value: 'ClawMore' },
    { Key: 'Type', Value: 'ManagedNode' },
    { Key: 'Status', Value: isWarmPool ? 'Available' : 'Active' },
    { Key: 'CreatedAt', Value: new Date().toISOString() },
  ];

  if (!isWarmPool) {
    tags.push({ Key: 'Owner', Value: userEmail });
    if (userId) tags.push({ Key: 'UserId', Value: userId });
  }

  const command = new CreateAccountCommand({
    Email: sanitizedEmail,
    AccountName: accountName,
    RoleName: 'OrganizationAccountAccessRole',
    Tags: tags,
  });

  const response = await orgClient.send(command);

  if (!response.CreateAccountStatus?.Id) {
    throw new Error('Failed to initiate account creation');
  }

  // AWS account creation typically takes 2-5 minutes
  const estimatedTimeSeconds = isWarmPool ? 30 : 180; // Warm pool accounts are faster

  return {
    requestId: response.CreateAccountStatus.Id,
    estimatedTimeSeconds,
  };
}

/**
 * Polls AWS until the account creation is complete and returns the new Account ID.
 *
 * @param requestId - The CreateAccount request id returned by `createManagedAccount`.
 * @param maxRetries - Maximum number of polling iterations (defaults to 20).
 * @returns The created AWS Account ID once creation succeeds.
 * @throws On failure state or when polling times out.
 */
export async function waitForAccountCreation(
  requestId: string,
  maxRetries = 20,
  onProgress?: (progress: { attempt: number; status: string }) => void
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const command = new DescribeCreateAccountStatusCommand({
      CreateAccountRequestId: requestId,
    });

    const response = await orgClient.send(command);
    const status = response.CreateAccountStatus?.State;

    if (onProgress) {
      onProgress({
        attempt: i + 1,
        status: status || 'UNKNOWN',
      });
    }

    if (status === 'SUCCEEDED' && response.CreateAccountStatus?.AccountId) {
      return response.CreateAccountStatus.AccountId;
    }

    if (status === 'FAILED') {
      throw new Error(
        `Account creation failed: ${response.CreateAccountStatus?.FailureReason}`
      );
    }

    // Wait 5 seconds before polling again
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('Timeout waiting for account creation');
}

/**
 * Scans the AWS Organization for an account tagged as available for vending.
 *
 * @returns The account id of an available account, or `null` when none found.
 */
export async function findAvailableAccountInPool(): Promise<string | null> {
  const listCommand = new ListAccountsCommand({});
  const response = await orgClient.send(listCommand);

  if (!response.Accounts) return null;

  for (const account of response.Accounts) {
    if (account.Status !== 'ACTIVE') continue;

    try {
      const tagsCommand = new ListTagsForResourceCommand({
        ResourceId: account.Id!,
      });
      const tagsResponse = await orgClient.send(tagsCommand);

      const statusTag = tagsResponse.Tags?.find((t) => t.Key === 'Status');
      if (statusTag?.Value === 'Available') {
        return account.Id!;
      }
    } catch (_e) {
      // Skip accounts where we can't read tags (e.g. Master account)
      continue;
    }
  }

  return null;
}

/**
 * Re-tags an account from the pool to a specific owner and project.
 *
 * @param accountId - The AWS Account Id to tag.
 * @param email - Owner email to assign to the account.
 * @param repo - Project/repository name to set on the account tags.
 * @returns Promise that resolves when tagging completes.
 */
export async function assignAccountToOwner(
  accountId: string,
  email: string,
  repo: string
) {
  const tagCommand = new TagResourceCommand({
    ResourceId: accountId,
    Tags: [
      { Key: 'Status', Value: 'Active' },
      { Key: 'Owner', Value: email },
      { Key: 'Project', Value: repo },
      { Key: 'VendedAt', Value: new Date().toISOString() },
    ],
  });

  await orgClient.send(tagCommand);
}

/**
 * Assumes the OrganizationAccountAccessRole in the sub-account and returns temporary credentials.
 * Includes a retry loop to handle propagation delay after account creation.
 *
 * @param accountId - The AWS Account Id of the sub-account to assume into.
 * @returns Temporary credentials object `{ accessKeyId, secretAccessKey, sessionToken }`.
 * @throws When the STS assume-role call does not return credentials after retries.
 */
export async function assumeSubAccountRole(accountId: string) {
  const roleArn = `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`;
  const maxRetries = 10;
  const delayMs = 15000; // 15 seconds between retries

  for (let i = 0; i < maxRetries; i++) {
    try {
      const command = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: 'ClawMoreBootstrapSession',
        DurationSeconds: 3600, // 1 hour
      });

      const response = await stsClient.send(command);

      if (!response.Credentials) {
        throw new Error('Failed to assume sub-account role: No credentials');
      }

      return {
        accessKeyId: response.Credentials.AccessKeyId!,
        secretAccessKey: response.Credentials.SecretAccessKey!,
        sessionToken: response.Credentials.SessionToken!,
      };
    } catch (error: any) {
      if (
        error.name === 'AccessDenied' ||
        error.name === 'InvalidIdentityToken'
      ) {
        console.log(
          `[AWS] Role ${roleArn} not yet assume-able (attempt ${i + 1}/${maxRetries}). Waiting...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `Failed to assume sub-account role ${roleArn} after ${maxRetries} attempts`
  );
}

/**
 * Bootstraps a newly created managed account with OIDC trust for GitHub Actions.
 *
 * This removes the need for long-lived Access Keys by allowing GitHub Actions
 * to assume a role via OpenID Connect.
 *
 * @param accountId - The AWS Account Id of the managed account to bootstrap.
 * @param githubOrg - The GitHub organization (e.g. 'clawmost').
 * @param repoName - The repository name allowed to assume the role.
 * @returns The ARN of the created OIDC role in the sub-account.
 */
export async function bootstrapManagedAccount(
  accountId: string,
  githubOrg: string = 'clawmost',
  repoName?: string
) {
  const credentials = await assumeSubAccountRole(accountId);
  const iamClient = new IAMClient({
    region: 'us-east-1',
    credentials,
  });

  const stsClientMain = new STSClient({});
  const identity = await stsClientMain.send(new GetCallerIdentityCommand({}));
  const mainAccountId = identity.Account!;

  // 1. Create OIDC Provider for GitHub if it doesn't exist
  const providerArn = `arn:aws:iam::${accountId}:oidc-provider/token.actions.githubusercontent.com`;
  try {
    await iamClient.send(
      new GetOpenIDConnectProviderCommand({
        OpenIDConnectProviderArn: providerArn,
      })
    );
  } catch (error: any) {
    if (
      error.name === 'NoSuchEntity' ||
      error.name === 'NoSuchEntityException'
    ) {
      try {
        await iamClient.send(
          new CreateOpenIDConnectProviderCommand({
            Url: 'https://token.actions.githubusercontent.com',
            ClientIDList: ['sts.amazonaws.com'],
            ThumbprintList: [
              '6938fd4d98bab03faadb97b34396831e3780aea1',
              '1c58a3a8518e8759bf075b76b750d4f2df264fcd',
            ],
          })
        );
      } catch (createErr: any) {
        if (createErr.name !== 'EntityAlreadyExists') throw createErr;
      }
    } else {
      throw error;
    }
  }

  const roleName = 'ClawMore-GitHub-Actions-Role';

  // 2. Create Role with OIDC Trust Policy
  const sub = repoName
    ? `repo:${githubOrg}/${repoName}:*`
    : `repo:${githubOrg}/*:*`;

  const trustPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          Federated: providerArn,
        },
        Action: 'sts:AssumeRoleWithWebIdentity',
        Condition: {
          StringLike: {
            'token.actions.githubusercontent.com:sub': sub,
          },
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
        },
      },
      {
        Effect: 'Allow',
        Principal: {
          AWS: `arn:aws:iam::${mainAccountId}:root`,
        },
        Action: 'sts:AssumeRole',
      },
    ],
  };

  try {
    await iamClient.send(
      new CreateRoleCommand({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
        Description: 'OIDC role for GitHub Actions to deploy and evolve code.',
      })
    );
  } catch (error: any) {
    if (error.name === 'EntityAlreadyExists') {
      // Update trust policy if it already exists
      // (Note: UpdateRoleCommand only updates description/timeout,
      // use UpdateAssumeRolePolicyCommand for policy)
      const { UpdateAssumeRolePolicyCommand } =
        await import('@aws-sdk/client-iam');
      await iamClient.send(
        new UpdateAssumeRolePolicyCommand({
          RoleName: roleName,
          PolicyDocument: JSON.stringify(trustPolicy),
        })
      );
    } else {
      throw error;
    }
  }

  // 3. Attach AdministratorAccess (for bootstrap/deploy)
  await iamClient.send(
    new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
    })
  );

  return `arn:aws:iam::${accountId}:role/${roleName}`;
}

/**
 * Creates a CodeBuild project in the managed sub-account for autonomous deployments.
 * This removes the dependency on GitHub Actions free tier limits.
 */
export async function createCodeBuildProject(
  accountId: string,
  repoUrl: string,
  githubToken: string
) {
  const credentials = await assumeSubAccountRole(accountId);
  const codebuild = new CodeBuildClient({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials,
  });

  const projectName = 'ClawMore-Initial-Deploy';

  // 1. Import GitHub Credentials into the sub-account's CodeBuild
  try {
    await codebuild.send(
      new ImportSourceCredentialsCommand({
        authType: 'PERSONAL_ACCESS_TOKEN',
        serverType: 'GITHUB',
        token: githubToken,
      })
    );
  } catch (error: any) {
    if (
      error.name !== 'ResourceAlreadyExistsException' &&
      !error.message?.includes('AlreadyExists')
    ) {
      throw error;
    }
    console.log('[AWS] GitHub credentials already exist in sub-account.');
  }

  // 2. Create the CodeBuild Project
  try {
    await codebuild.send(
      new CreateProjectCommand({
        name: projectName,
        description: 'Autonomous deployment of the ClawMore Spoke node.',
        source: {
          type: 'GITHUB',
          location: repoUrl,
          buildspec: 'buildspec.yml',
        },
        artifacts: { type: 'NO_ARTIFACTS' },
        environment: {
          type: 'LINUX_CONTAINER',
          image: 'aws/codebuild/standard:7.0',
          computeType: 'BUILD_GENERAL1_SMALL',
          environmentVariables: [{ name: 'SST_STAGE', value: 'production' }],
        },
        serviceRole: `arn:aws:iam://${accountId}:role/ClawMore-Bootstrap-Role`,
      })
    );
  } catch (error: any) {
    if (
      error.name !== 'ResourceAlreadyExistsException' &&
      !error.message?.includes('AlreadyExists')
    ) {
      throw error;
    }
    console.log('[AWS] CodeBuild project already exists.');
  }

  return projectName;
}

/**
 * Starts a CodeBuild build in the managed sub-account.
 */
export async function triggerCodeBuildBuild(
  accountId: string,
  projectName: string
) {
  const credentials = await assumeSubAccountRole(accountId);
  const codebuild = new CodeBuildClient({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials,
  });

  await codebuild.send(
    new StartBuildCommand({
      projectName: projectName,
    })
  );
}
