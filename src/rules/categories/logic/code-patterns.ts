/**
 * Code pattern detection utilities - consolidates similar pattern checks
 * Reduces 40+ LOC of repetitive pattern detection logic
 */

export const CodePatterns = {
  // Enum patterns
  hasCommonEnumValues: (code: string): boolean =>
    (code.includes("LOW = 'low'") ||
      code.includes('LOW = 0') ||
      code.includes("LOW = 'LOW'")) &&
    (code.includes("HIGH = 'high'") ||
      code.includes('HIGH = 2') ||
      code.includes("HIGH = 'HIGH'")) &&
    (code.includes("MEDIUM = 'medium'") ||
      code.includes('MEDIUM = 1') ||
      code.includes("MEDIUM = 'MEDIUM'")),

  isEnumDefinition: (code: string): boolean =>
    /(?:export\s+)?(?:const\s+)?enum\s+/.test(code) ||
    (code.includes('enum ') && code.includes('{') && code.includes('}')),

  // Type patterns
  hasOnlyTypeDefinitions: (code: string): boolean =>
    (code.includes('interface ') ||
      code.includes('type ') ||
      code.includes('enum ')) &&
    !code.includes('function ') &&
    !code.includes('class ') &&
    !code.includes('const ') &&
    !code.includes('let ') &&
    !code.includes('export default'),

  isInterfaceOnlySnippet: (code: string): boolean =>
    code.trim().startsWith('interface ') &&
    code.includes('{') &&
    code.includes('}') &&
    !code.includes('function ') &&
    !code.includes('const ') &&
    !code.includes('return '),

  hasTypeDefinition: (code: string): boolean =>
    code.includes('interface ') ||
    code.includes('type ') ||
    code.includes('enum '),

  // Utility patterns
  hasUtilPattern: (code: string): boolean =>
    code.includes('function format') ||
    code.includes('function parse') ||
    code.includes('function sanitize') ||
    code.includes('function normalize') ||
    code.includes('function convert'),

  // Hook patterns
  hasHookPattern: (code: string): boolean =>
    code.includes('function use') ||
    code.includes('export function use') ||
    code.includes('const use') ||
    code.includes('export const use'),

  // Score patterns
  hasScorePattern: (code: string): boolean =>
    (code.includes('if (score >=') || code.includes('if (score >')) &&
    code.includes('return') &&
    code.includes("'") &&
    code.split('if (score').length >= 3,

  // Visualization patterns
  hasVizPattern: (code: string): boolean =>
    (code.includes('dragstarted') ||
      code.includes('dragged') ||
      code.includes('dragended')) &&
    (code.includes('simulation') ||
      code.includes('d3.') ||
      code.includes('alphaTarget')),

  // Switch/Icon patterns
  hasSwitchPattern: (code: string): boolean =>
    code.includes('switch (') &&
    code.includes("case '") &&
    code.includes('return') &&
    code.split('case ').length >= 4,

  hasIconPattern: (code: string): boolean =>
    code.includes('getIcon') ||
    code.includes('getColor') ||
    code.includes('getLabel') ||
    code.includes('getRating'),

  // Validation patterns
  hasValidationPattern: (code: string): boolean =>
    code.includes('isValid') ||
    code.includes('validate') ||
    code.includes('checkValid') ||
    code.includes('isEmail') ||
    code.includes('isPhone') ||
    code.includes('isUrl') ||
    code.includes('isNumeric') ||
    code.includes('isAlpha') ||
    code.includes('isAlphanumeric') ||
    code.includes('isEmpty') ||
    code.includes('isNotEmpty') ||
    code.includes('isRequired') ||
    code.includes('isOptional'),

  // Singleton patterns
  hasSingletonGetter: (code: string): boolean =>
    /(?:export\s+)?(?:async\s+)?function\s+get[A-Z][a-zA-Z0-9]*\s*\(/.test(
      code
    ) ||
    /(?:export\s+)?const\s+get[A-Z][a-zA-Z0-9]*\s*=\s*(?:async\s+)?\(\)\s*=>/.test(
      code
    ),

  hasSingletonPattern: (code: string): boolean =>
    (code.includes('if (!') &&
      code.includes('instance') &&
      code.includes(' = ')) ||
    (code.includes('if (!_') && code.includes(' = new ')) ||
    (code.includes('if (') &&
      code.includes(' === null') &&
      code.includes(' = new ')),

  // Re-export patterns
  hasReExportPattern: (code: string): boolean => {
    const lines = code.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return false;
    const reExportLines = lines.filter(
      (l) =>
        /^export\s+(\{[^}]+\}|\*)\s+from\s+/.test(l.trim()) ||
        /^export\s+\*\s+as\s+\w+\s+from\s+/.test(l.trim())
    ).length;
    return reExportLines > 0 && reExportLines / lines.length > 0.5;
  },
};
