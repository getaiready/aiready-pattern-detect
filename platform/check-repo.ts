import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'ap-southeast-2' });
const ddb = DynamoDBDocumentClient.from(client);

async function check() {
  const repoId = process.argv[2];
  if (!repoId) throw new Error('Repo ID required');

  const res = await ddb.send(
    new GetCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK: `REPO#${repoId}`, SK: 'META' },
    })
  );
  console.log(JSON.stringify(res.Item, null, 2));
}

check().catch(console.error);
