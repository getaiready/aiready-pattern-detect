import type { DependencyNode, FileClassification } from './types';

/**
 * Constants for file classifications to avoid magic strings
 */
export const Classification = {
  BARREL: 'barrel-export' as const,
  TYPE_DEFINITION: 'type-definition' as const,
  NEXTJS_PAGE: 'nextjs-page' as const,
  LAMBDA_HANDLER: 'lambda-handler' as const,
  SERVICE: 'service-file' as const,
  EMAIL_TEMPLATE: 'email-template' as const,
  PARSER: 'parser-file' as const,
  COHESIVE_MODULE: 'cohesive-module' as const,
  UTILITY_MODULE: 'utility-module' as const,
  MIXED_CONCERNS: 'mixed-concerns' as const,
  UNKNOWN: 'unknown' as const,
};

/**
 * Classify a file into a specific type for better analysis context
 *
 * @param node The dependency node representing the file
 * @param cohesionScore The calculated cohesion score for the file
 * @param domains The detected domains/concerns for the file
 * @returns The determined file classification
 */
export function classifyFile(
  node: DependencyNode,
  cohesionScore: number = 1,
  domains: string[] = []
): FileClassification {
  // 1. Detect barrel exports (primarily re-exports)
  if (isBarrelExport(node)) {
    return Classification.BARREL;
  }

  // 2. Detect type definition files
  if (isTypeDefinition(node)) {
    return Classification.TYPE_DEFINITION;
  }

  // 3. Detect Next.js App Router pages
  if (isNextJsPage(node)) {
    return Classification.NEXTJS_PAGE;
  }

  // 4. Detect Lambda handlers
  if (isLambdaHandler(node)) {
    return Classification.LAMBDA_HANDLER;
  }

  // 5. Detect Service files
  if (isServiceFile(node)) {
    return Classification.SERVICE;
  }

  // 6. Detect Email templates
  if (isEmailTemplate(node)) {
    return Classification.EMAIL_TEMPLATE;
  }

  // 7. Detect Parser/Transformer files
  if (isParserFile(node)) {
    return Classification.PARSER;
  }

  // 8. Detect Session/State management files
  if (isSessionFile(node)) {
    // If it has high cohesion, it's a cohesive module
    if (cohesionScore >= 0.25 && domains.length <= 1)
      return Classification.COHESIVE_MODULE;
    return Classification.UTILITY_MODULE; // Group with utility for now
  }

  // 9. Detect Utility modules (multi-domain but functional purpose)
  if (isUtilityModule(node)) {
    return Classification.UTILITY_MODULE;
  }

  // 10. Detect Config/Schema files
  if (isConfigFile(node)) {
    return Classification.COHESIVE_MODULE;
  }

  // Cohesion and Domain heuristics
  if (domains.length <= 1 && domains[0] !== 'unknown') {
    return Classification.COHESIVE_MODULE;
  }

  if (domains.length > 1 && cohesionScore < 0.4) {
    return Classification.MIXED_CONCERNS;
  }

  if (cohesionScore >= 0.7) {
    return Classification.COHESIVE_MODULE;
  }

  return Classification.UNKNOWN;
}

/**
 * Detect if a file is a barrel export (index.ts)
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be a barrel export
 */
export function isBarrelExport(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  // Barrel files are typically named index.ts or index.js
  const isIndexFile = fileName === 'index.ts' || fileName === 'index.js';

  // Small file with many exports is likely a barrel
  const isSmallAndManyExports =
    node.tokenCost < 1000 && (exports || []).length > 5;

  // RE-EXPORT HEURISTIC for non-index files
  const isReexportPattern =
    (exports || []).length >= 5 &&
    (exports || []).every(
      (e) =>
        e.type === 'const' ||
        e.type === 'function' ||
        e.type === 'type' ||
        e.type === 'interface'
    );

  return !!isIndexFile || !!isSmallAndManyExports || !!isReexportPattern;
}

/**
 * Detect if a file is primarily type definitions
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be primarily types
 */
export function isTypeDefinition(node: DependencyNode): boolean {
  const { file } = node;

  // Check file extension
  if (file.endsWith('.d.ts')) return true;

  // Check if all exports are types or interfaces
  const nodeExports = node.exports || [];
  const hasExports = nodeExports.length > 0;
  const areAllTypes =
    hasExports &&
    nodeExports.every((e) => e.type === 'type' || e.type === 'interface');
  const allTypes: boolean = !!areAllTypes;

  // Check if path includes 'types' or 'interfaces'
  const isTypePath =
    file.toLowerCase().includes('/types/') ||
    file.toLowerCase().includes('/interfaces/') ||
    file.toLowerCase().includes('/models/');

  return allTypes || (isTypePath && hasExports);
}

/**
 * Detect if a file is a utility module
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be a utility module
 */
export function isUtilityModule(node: DependencyNode): boolean {
  const { file } = node;

  // Check if path includes 'utils', 'helpers', etc.
  const isUtilPath =
    file.toLowerCase().includes('/utils/') ||
    file.toLowerCase().includes('/helpers/') ||
    file.toLowerCase().includes('/util/') ||
    file.toLowerCase().includes('/helper/');

  const fileName = file.split('/').pop()?.toLowerCase();
  const isUtilName =
    fileName?.includes('utils.') ||
    fileName?.includes('helpers.') ||
    fileName?.includes('util.') ||
    fileName?.includes('helper.');

  return !!isUtilPath || !!isUtilName;
}

/**
 * Detect if a file is a Lambda/API handler
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be a Lambda handler
 */
export function isLambdaHandler(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const handlerPatterns = [
    'handler',
    '.handler.',
    '-handler.',
    'lambda',
    '.lambda.',
    '-lambda.',
  ];
  const isHandlerName = handlerPatterns.some((pattern) =>
    fileName?.includes(pattern)
  );

  const isHandlerPath =
    file.toLowerCase().includes('/handlers/') ||
    file.toLowerCase().includes('/lambdas/') ||
    file.toLowerCase().includes('/lambda/') ||
    file.toLowerCase().includes('/functions/');

  const hasHandlerExport = (exports || []).some(
    (e) =>
      e.name.toLowerCase() === 'handler' ||
      e.name.toLowerCase() === 'main' ||
      e.name.toLowerCase() === 'lambdahandler' ||
      e.name.toLowerCase().endsWith('handler')
  );

  return !!isHandlerName || !!isHandlerPath || !!hasHandlerExport;
}

/**
 * Detect if a file is a service file
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be a service file
 */
export function isServiceFile(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const servicePatterns = ['service', '.service.', '-service.', '_service.'];
  const isServiceName = servicePatterns.some((pattern) =>
    fileName?.includes(pattern)
  );
  const isServicePath = file.toLowerCase().includes('/services/');
  const hasServiceNamedExport = (exports || []).some(
    (e) =>
      e.name.toLowerCase().includes('service') ||
      e.name.toLowerCase().endsWith('service')
  );
  const hasClassExport = (exports || []).some((e) => e.type === 'class');

  return (
    !!isServiceName ||
    !!isServicePath ||
    (!!hasServiceNamedExport && !!hasClassExport)
  );
}

/**
 * Detect if a file is an email template/layout
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be an email template
 */
export function isEmailTemplate(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const emailTemplatePatterns = [
    '-email-',
    '.email.',
    '_email_',
    '-template',
    '.template.',
    '_template',
    '-mail.',
    '.mail.',
  ];
  const isEmailTemplateName = emailTemplatePatterns.some((pattern) =>
    fileName?.includes(pattern)
  );
  const isEmailPath =
    file.toLowerCase().includes('/emails/') ||
    file.toLowerCase().includes('/mail/') ||
    file.toLowerCase().includes('/notifications/');

  const hasTemplateFunction = (exports || []).some(
    (e) =>
      e.type === 'function' &&
      (e.name.toLowerCase().startsWith('render') ||
        e.name.toLowerCase().startsWith('generate') ||
        (e.name.toLowerCase().includes('template') &&
          e.name.toLowerCase().includes('email')))
  );

  return !!isEmailPath || !!isEmailTemplateName || !!hasTemplateFunction;
}

/**
 * Detect if a file is a parser/transformer
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be a parser
 */
export function isParserFile(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const parserPatterns = [
    'parser',
    '.parser.',
    '-parser.',
    '_parser.',
    'transform',
    '.transform.',
    'converter',
    'mapper',
    'serializer',
  ];
  const isParserName = parserPatterns.some((pattern) =>
    fileName?.includes(pattern)
  );
  const isParserPath =
    file.toLowerCase().includes('/parsers/') ||
    file.toLowerCase().includes('/transformers/');

  const hasParseFunction = (exports || []).some(
    (e) =>
      e.type === 'function' &&
      (e.name.toLowerCase().startsWith('parse') ||
        e.name.toLowerCase().startsWith('transform') ||
        e.name.toLowerCase().startsWith('extract'))
  );

  return !!isParserName || !!isParserPath || !!hasParseFunction;
}

/**
 * Detect if a file is a session/state management file
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be a session/state file
 */
export function isSessionFile(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const sessionPatterns = ['session', 'state', 'context', 'store'];
  const isSessionName = sessionPatterns.some((pattern) =>
    fileName?.includes(pattern)
  );
  const isSessionPath =
    file.toLowerCase().includes('/sessions/') ||
    file.toLowerCase().includes('/state/');

  const hasSessionExport = (exports || []).some(
    (e) =>
      e.name.toLowerCase().includes('session') ||
      e.name.toLowerCase().includes('state') ||
      e.name.toLowerCase().includes('store')
  );

  return !!isSessionName || !!isSessionPath || !!hasSessionExport;
}

/**
 * Detect if a file is a configuration or schema file
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be a config file
 */
export function isConfigFile(node: DependencyNode): boolean {
  const { file, exports } = node;
  const lowerPath = file.toLowerCase();
  const fileName = file.split('/').pop()?.toLowerCase();

  const configPatterns = [
    '.config.',
    'tsconfig',
    'jest.config',
    'package.json',
    'aiready.json',
    'next.config',
    'sst.config',
  ];
  const isConfigName = configPatterns.some((p) => fileName?.includes(p));
  const isConfigPath =
    lowerPath.includes('/config/') ||
    lowerPath.includes('/settings/') ||
    lowerPath.includes('/schemas/');

  const hasSchemaExports = (exports || []).some(
    (e) =>
      e.name.toLowerCase().includes('schema') ||
      e.name.toLowerCase().includes('config') ||
      e.name.toLowerCase().includes('setting')
  );

  return !!isConfigName || !!isConfigPath || !!hasSchemaExports;
}

/**
 * Detect if a file is a Next.js App Router page
 *
 * @param node The dependency node to check
 * @returns True if the file appears to be a Next.js page
 */
export function isNextJsPage(node: DependencyNode): boolean {
  const { file, exports } = node;
  const lowerPath = file.toLowerCase();
  const fileName = file.split('/').pop()?.toLowerCase();

  const isInAppDir =
    lowerPath.includes('/app/') || lowerPath.startsWith('app/');
  const isPageFile = fileName === 'page.tsx' || fileName === 'page.ts';

  if (!isInAppDir || !isPageFile) return false;

  const hasDefaultExport = (exports || []).some((e) => e.type === 'default');
  const nextJsExports = [
    'metadata',
    'generatemetadata',
    'faqjsonld',
    'jsonld',
    'icon',
  ];
  const hasNextJsExports = (exports || []).some((e) =>
    nextJsExports.includes(e.name.toLowerCase())
  );

  return !!hasDefaultExport || !!hasNextJsExports;
}

/**
 * Adjust cohesion score based on file classification
 *
 * @param baseCohesion The initial cohesion score
 * @param classification The file classification
 * @param node Optional dependency node for further context
 * @returns The adjusted cohesion score
 */
export function adjustCohesionForClassification(
  baseCohesion: number,
  classification: FileClassification,
  node?: DependencyNode
): number {
  switch (classification) {
    case Classification.BARREL:
      return 1;
    case Classification.TYPE_DEFINITION:
      return 1;
    case Classification.NEXTJS_PAGE:
      return 1;
    case Classification.UTILITY_MODULE: {
      if (
        node &&
        hasRelatedExportNames(
          (node.exports || []).map((e) => e.name.toLowerCase())
        )
      ) {
        return Math.max(0.8, Math.min(1, baseCohesion + 0.45));
      }
      return Math.max(0.75, Math.min(1, baseCohesion + 0.35));
    }
    case Classification.SERVICE:
      return Math.max(0.72, Math.min(1, baseCohesion + 0.3));
    case Classification.LAMBDA_HANDLER:
      return Math.max(0.75, Math.min(1, baseCohesion + 0.35));
    case Classification.EMAIL_TEMPLATE:
      return Math.max(0.72, Math.min(1, baseCohesion + 0.3));
    case Classification.PARSER:
      return Math.max(0.7, Math.min(1, baseCohesion + 0.3));
    case Classification.COHESIVE_MODULE:
      return Math.max(baseCohesion, 0.7);
    case Classification.MIXED_CONCERNS:
      return baseCohesion;
    default:
      return Math.min(1, baseCohesion + 0.1);
  }
}

/**
 * Check if export names suggest related functionality
 *
 * @param exportNames List of exported names
 * @returns True if names appear related
 */
function hasRelatedExportNames(exportNames: string[]): boolean {
  if (exportNames.length < 2) return true;

  const stems = new Set<string>();
  const domains = new Set<string>();

  const verbs = [
    'get',
    'set',
    'create',
    'update',
    'delete',
    'fetch',
    'save',
    'load',
    'parse',
    'format',
    'validate',
  ];
  const domainPatterns = [
    'user',
    'order',
    'product',
    'session',
    'email',
    'file',
    'db',
    'api',
    'config',
  ];

  for (const name of exportNames) {
    for (const verb of verbs) {
      if (name.startsWith(verb) && name.length > verb.length) {
        stems.add(name.slice(verb.length).toLowerCase());
      }
    }
    for (const domain of domainPatterns) {
      if (name.includes(domain)) domains.add(domain);
    }
  }

  if (stems.size === 1 || domains.size === 1) return true;

  return false;
}

/**
 * Adjust fragmentation score based on file classification
 *
 * @param baseFragmentation The initial fragmentation score
 * @param classification The file classification
 * @returns The adjusted fragmentation score
 */
export function adjustFragmentationForClassification(
  baseFragmentation: number,
  classification: FileClassification
): number {
  switch (classification) {
    case Classification.BARREL:
      return 0;
    case Classification.TYPE_DEFINITION:
      return 0;
    case Classification.UTILITY_MODULE:
    case Classification.SERVICE:
    case Classification.LAMBDA_HANDLER:
    case Classification.EMAIL_TEMPLATE:
    case Classification.PARSER:
    case Classification.NEXTJS_PAGE:
      return baseFragmentation * 0.2;
    case Classification.COHESIVE_MODULE:
      return baseFragmentation * 0.3;
    case Classification.MIXED_CONCERNS:
      return baseFragmentation;
    default:
      return baseFragmentation * 0.7;
  }
}
