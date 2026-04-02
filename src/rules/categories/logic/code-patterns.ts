/**
 * Code pattern detection utilities - consolidates similar pattern checks
 * Uses pattern registry to reduce duplication
 */
import {
  VALIDATION_KEYWORDS,
  HOOK_KEYWORDS,
  VIZ_EVENT_KEYWORDS,
  VIZ_LIB_KEYWORDS,
  ICON_HELPER_KEYWORDS,
  UTIL_KEYWORDS,
} from './keyword-lists';
import {
  isEnumDefinition,
  hasSingletonGetter,
  hasSingletonPattern,
  hasReExportPattern,
  isInterfaceOnlySnippet,
} from './detectors';

// Common enum value patterns - register once, reuse everywhere
const COMMON_ENUM_PATTERNS = [
  ['LOW', ["'low'", '0', "'LOW'"]],
  ['HIGH', ["'high'", '2', "'HIGH'"]],
  ['MEDIUM', ["'medium'", '1', "'MEDIUM'"]],
] as const;

const hasEnumValue = (
  code: string,
  enumName: string,
  variants: readonly string[]
): boolean => variants.some((v) => code.includes(`${enumName} = ${v}`));

export const CodePatterns = {
  // Enum patterns
  hasCommonEnumValues: (code: string): boolean =>
    COMMON_ENUM_PATTERNS.every(([name, variants]) =>
      hasEnumValue(code, name, variants)
    ),

  isEnumDefinition,

  // Type patterns - helpers for checking type-only definitions
  hasTypeDefinition: (code: string): boolean =>
    code.includes('interface ') ||
    code.includes('type ') ||
    code.includes('enum '),

  isTypeOnlyFile: (code: string): boolean => {
    const hasTypes = CodePatterns.hasTypeDefinition(code);
    const hasNoImpl = ![
      'function ',
      'class ',
      'const ',
      'let ',
      'export default',
    ].some((kw) => code.includes(kw));
    return hasTypes && hasNoImpl;
  },

  hasOnlyTypeDefinitions: (code: string): boolean => {
    const hasTypes = CodePatterns.hasTypeDefinition(code);
    const hasNoImpl = ![
      'function ',
      'class ',
      'const ',
      'let ',
      'var ',
      'export default',
      'export {',
    ].some((kw) => code.includes(kw));
    return hasTypes && hasNoImpl;
  },

  // Utility patterns - function group patterns
  hasUtilPattern: (code: string): boolean =>
    CodePatterns.hasFunctionGroup(code, '') ||
    CodePatterns.hasKeywordGroup(code, UTIL_KEYWORDS),

  hasFunctionGroup: (code: string, prefix: string): boolean => {
    const regex = new RegExp(
      `${prefix}(format|parse|sanitize|normalize|convert)`,
      'i'
    );
    return regex.test(code);
  },

  // Pattern checkers using keyword lists
  hasKeywordGroup: (code: string, keywords: string[]): boolean =>
    keywords.some((kw) => code.includes(kw)),

  // Validation patterns - unified keyword check
  hasValidationPattern: (code: string): boolean =>
    CodePatterns.hasKeywordGroup(code, VALIDATION_KEYWORDS),

  // Hook patterns - React/Vue hooks
  hasHookPattern: (code: string): boolean =>
    CodePatterns.hasKeywordGroup(code, HOOK_KEYWORDS),

  // Score/Rating patterns
  hasScorePattern: (code: string): boolean =>
    (code.includes('if (score >=') || code.includes('if (score >')) &&
    code.includes('return') &&
    code.includes("'") &&
    code.split('if (score').length >= 3,

  // Visualization patterns - D3/Canvas
  hasVizPattern: (code: string): boolean =>
    CodePatterns.hasKeywordGroup(code, VIZ_EVENT_KEYWORDS) &&
    CodePatterns.hasKeywordGroup(code, VIZ_LIB_KEYWORDS),

  // Switch/Icon patterns
  hasSwitchPattern: (code: string): boolean =>
    code.includes('switch (') &&
    code.includes("case '") &&
    code.includes('return') &&
    code.split('case ').length >= 4,

  hasIconPattern: (code: string): boolean =>
    CodePatterns.hasKeywordGroup(code, ICON_HELPER_KEYWORDS),

  // Singleton patterns
  hasSingletonGetter,
  hasSingletonPattern,

  // Re-export patterns
  hasReExportPattern,

  // Interface-only snippets
  isInterfaceOnlySnippet,
};
