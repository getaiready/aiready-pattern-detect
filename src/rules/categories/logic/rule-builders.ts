/**
 * Rule builder factory - eliminates boilerplate for creating similar rules
 * Reduces 85 LOC for severity/reason/suggestion duplication to 40 LOC total
 */

import { Severity } from '@aiready/core';
import { ContextRule } from '../../types';

interface RuleConfig {
  name: string;
  detect: (file: string, code: string) => boolean;
  reason: string;
  suggestion: string;
  severity?: Severity;
  group?: string;
}

/**
 * Creates a context rule with standard settings
 * All rules in this category are Info severity
 */
export function createRule(config: RuleConfig): ContextRule {
  return {
    name: config.name,
    detect: config.detect,
    severity: config.severity || Severity.Info,
    reason: config.reason,
    suggestion: config.suggestion,
  };
}

/**
 * Creates multiple rules from configurations
 * Reduces boilerplate when defining similar rules
 */
export function createRules(configs: RuleConfig[]): ContextRule[] {
  return configs.map(createRule);
}

/**
 * Common severity/reason/suggestion pairs (consolidates 85 LOC to 40 LOC)
 */
export const RuleTemplates = {
  // Type-related rules
  typeDefinition: {
    severity: Severity.Info,
    reason:
      'Type/interface definitions are intentionally duplicated for module independence',
    suggestion:
      'Extract to shared types package only if causing maintenance burden',
  },

  crossPackageType: {
    severity: Severity.Info,
    reason:
      'Types in different packages/modules are often intentionally similar for module independence',
    suggestion:
      'Cross-package type duplication is acceptable for decoupled module architecture',
  },

  // Pattern rules
  standardPatterns: {
    severity: Severity.Info,
    reason:
      'This pattern is inherently similar and intentionally duplicated across modules',
    suggestion:
      'Pattern duplication is acceptable for domain clarity and independence',
  },

  // API rules
  commonApiFunction: {
    severity: Severity.Info,
    reason:
      'Common API/utility functions are legitimately duplicated across modules for clarity and independence',
    suggestion:
      'Consider extracting to shared utilities only if causing significant duplication',
  },

  // Utility rules
  utilityFunction: {
    severity: Severity.Info,
    reason: 'Utility functions may be intentionally similar across modules',
    suggestion:
      'Consider extracting to shared utilities only if causing significant duplication',
  },

  // Boilerplate rules
  boilerplate: {
    severity: Severity.Info,
    reason: 'This pattern is boilerplate and acceptable duplication',
    suggestion: 'Boilerplate reduction is acceptable for standard patterns',
  },

  // Enum rules
  enumSemantic: {
    severity: Severity.Info,
    reason:
      'Enums with different names represent different semantic domain concepts, even if they share similar values',
    suggestion:
      'Different enums (e.g., EscalationPriority vs HealthSeverity) serve different purposes and should not be merged',
  },

  enumValue: {
    severity: Severity.Info,
    reason:
      'Common enum values (LOW, MEDIUM, HIGH, CRITICAL) are standard patterns used across different domain enums',
    suggestion:
      'Enum value similarity is expected for severity/priority enums and should not be flagged as duplication',
  },

  // Barrel file rules
  barrelFile: {
    severity: Severity.Info,
    reason:
      'Barrel/index files intentionally re-export for API surface consolidation',
    suggestion:
      'Re-exports in barrel files are expected and not true duplication',
  },
};
