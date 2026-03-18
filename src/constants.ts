/**
 * Default configuration values for pattern detection.
 * Extracted to constants to improve AI signal clarity and maintainability.
 */

export const DEFAULT_MIN_SIMILARITY = 0.4;
export const DEFAULT_MIN_LINES = 5;
export const DEFAULT_BATCH_SIZE = 100;
export const DEFAULT_MIN_SHARED_TOKENS = 8;
export const DEFAULT_MAX_CANDIDATES_PER_BLOCK = 100;
export const DEFAULT_MAX_RESULTS = 10;
export const DEFAULT_MIN_CLUSTER_TOKEN_COST = 1000;
export const DEFAULT_MIN_CLUSTER_FILES = 3;

export const COMMAND_NAME = 'aiready-patterns';
export const COMMAND_VERSION = '0.1.0';
export const DEFAULT_OUTPUT_FORMAT = 'console';

export const HELP_TEXT_AFTER = `
CONFIGURATION:
  Supports config files: aiready.json, aiready.config.json, .aiready.json, .aireadyrc.json, aiready.config.js, .aireadyrc.js
  CLI options override config file settings

PARAMETER TUNING:
  If you get too few results: decrease --similarity, --min-lines, or --min-shared-tokens
  If analysis is too slow: increase --min-lines, --min-shared-tokens, or decrease --max-candidates
  If you get too many false positives: increase --similarity or --min-lines

EXAMPLES:
  aiready-patterns .                                    # Basic analysis with smart defaults
  aiready-patterns . --similarity 0.3 --min-lines 3     # More sensitive detection
  aiready-patterns . --max-candidates 50 --no-approx    # Slower but more thorough
  aiready-patterns . --output json > report.json       # JSON export`;
