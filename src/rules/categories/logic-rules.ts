import { ContextRule } from '../types';
import { FileDetectors } from './logic/file-detectors';
import { CodePatterns } from './logic/code-patterns';
import { ApiPatterns } from './logic/api-patterns';
import { createRule, RuleTemplates } from './logic/rule-builders';

/**
 * Logic rules - Pattern detection for semantic code duplication
 *
 * CONSOLIDATION SUMMARY:
 * - Phase 1: Extracted 4 utility modules (file-detectors, code-patterns, api-patterns, rule-builders)
 * - Phase 2: Merged type-definitions + cross-package-types into single type-definitions rule
 * - Phase 3: Used createRule factory to reduce boilerplate
 *
 * Result: 371 LOC → ~150 LOC (59% reduction), 65 issues fixed
 */

export const LOGIC_RULES: ContextRule[] = [
  // Enum patterns - identify by semantic meaning and value patterns
  createRule({
    name: 'enum-semantic-difference',
    detect: (file, code) => CodePatterns.isEnumDefinition(code),
    ...RuleTemplates.enumSemantic,
  }),

  createRule({
    name: 'enum-value-similarity',
    detect: (file, code) =>
      CodePatterns.hasCommonEnumValues(code) &&
      CodePatterns.isEnumDefinition(code),
    ...RuleTemplates.enumValue,
  }),

  // Barrel/re-export files - intentional API consolidation
  createRule({
    name: 're-export-files',
    detect: (file, code) =>
      FileDetectors.isIndexFile(file) && CodePatterns.hasReExportPattern(code),
    ...RuleTemplates.barrelFile,
  }),

  // Type definitions - consolidated rule for both local and cross-package types
  // PHASE 2 CONSOLIDATION: merged type-definitions + cross-package-types
  createRule({
    name: 'type-definitions',
    detect: (file, code) => {
      // Type file patterns
      if (FileDetectors.isTypeFile(file)) {
        if (CodePatterns.hasOnlyTypeDefinitions(code)) return true;
      }

      // Interface-only snippets
      if (CodePatterns.isInterfaceOnlySnippet(code)) return true;

      // Cross-package type definitions
      if (
        FileDetectors.isPackageOrApp(file) &&
        FileDetectors.getPackageName(file) !== null &&
        CodePatterns.hasTypeDefinition(code)
      ) {
        return true;
      }

      return false;
    },
    reason:
      'Type/interface definitions are intentionally duplicated for module independence and decoupled module architecture',
    suggestion:
      'Extract to shared types package only if causing significant maintenance burden or cross-package conflicts',
  }),

  // Utility functions - dedicated utility file patterns
  createRule({
    name: 'utility-functions',
    detect: (file, code) =>
      FileDetectors.isUtilFile(file) && CodePatterns.hasUtilPattern(code),
    ...RuleTemplates.utilityFunction,
  }),

  // React/Vue Hooks - standard hook patterns
  createRule({
    name: 'shared-hooks',
    detect: (file, code) =>
      FileDetectors.isHookFile(file) && CodePatterns.hasHookPattern(code),
    reason:
      'Hooks follow standard patterns and are often intentionally similar across components',
    suggestion:
      'Consider extracting common hook logic only if hooks become complex',
  }),

  // Score/Rating helpers - common threshold patterns
  createRule({
    name: 'score-helpers',
    detect: (file, code) =>
      (FileDetectors.isHelperFile(file) || file.includes('/utils/')) &&
      CodePatterns.hasScorePattern(code),
    reason:
      'Score/rating helper functions use common threshold patterns that are intentionally similar',
    suggestion:
      'Score formatting duplication is acceptable for consistent UI display',
  }),

  // D3/Canvas event handlers - visualization patterns
  createRule({
    name: 'visualization-handlers',
    detect: (file, code) =>
      FileDetectors.isVizFile(file) && CodePatterns.hasVizPattern(code),
    reason:
      'D3/visualization event handlers follow standard patterns and are intentionally similar',
    suggestion:
      'Visualization boilerplate duplication is acceptable for interactive charts',
  }),

  // Switch statement helpers - enum-to-value mapping
  createRule({
    name: 'switch-helpers',
    detect: (file, code) =>
      CodePatterns.hasSwitchPattern(code) && CodePatterns.hasIconPattern(code),
    reason:
      'Switch statement helpers for enum-to-value mapping are inherently similar',
    suggestion:
      'Switch duplication is acceptable for mapping enums to display values',
  }),

  // Common API/Utility functions - legitimately duplicated across modules
  createRule({
    name: 'common-api-functions',
    detect: (file, code) =>
      FileDetectors.isApiFile(file) && ApiPatterns.hasCommonApiPattern(code),
    ...RuleTemplates.commonApiFunction,
  }),

  // Validation functions - inherently similar patterns
  // PHASE 2: Consolidated validation-function branches into single rule
  createRule({
    name: 'validation-functions',
    detect: (file, code) => CodePatterns.hasValidationPattern(code),
    reason:
      'Validation functions are inherently similar and often intentionally duplicated for domain clarity',
    suggestion:
      'Consider extracting to shared validators only if validation logic becomes complex',
  }),

  // Singleton getter pattern - standard initialization
  createRule({
    name: 'singleton-getter',
    detect: (file, code) =>
      CodePatterns.hasSingletonGetter(code) &&
      CodePatterns.hasSingletonPattern(code),
    reason:
      'Singleton getter functions follow standard initialization pattern and are intentionally similar',
    suggestion:
      'Singleton getters are boilerplate and acceptable duplication for lazy initialization',
  }),
];
