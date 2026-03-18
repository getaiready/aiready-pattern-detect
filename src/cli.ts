#!/usr/bin/env node

import { Command } from 'commander';
import { patternActionHandler } from './cli-action';
import {
  COMMAND_NAME,
  COMMAND_VERSION,
  HELP_TEXT_AFTER,
  DEFAULT_MIN_SIMILARITY,
  DEFAULT_MIN_LINES,
  DEFAULT_BATCH_SIZE,
  DEFAULT_MIN_SHARED_TOKENS,
  DEFAULT_MAX_CANDIDATES_PER_BLOCK,
  DEFAULT_MAX_RESULTS,
  DEFAULT_MIN_CLUSTER_TOKEN_COST,
  DEFAULT_MIN_CLUSTER_FILES,
  DEFAULT_OUTPUT_FORMAT,
} from './constants';

const program = new Command();

program
  .name(COMMAND_NAME)
  .description('Detect duplicate patterns in your codebase')
  .version(COMMAND_VERSION)
  .addHelpText('after', HELP_TEXT_AFTER)
  .argument('<directory>', 'Directory to analyze')
  .option(
    '-s, --similarity <number>',
    `Minimum similarity score (0-1). Default: ${DEFAULT_MIN_SIMILARITY}`
  )
  .option(
    '-l, --min-lines <number>',
    `Minimum lines to consider. Default: ${DEFAULT_MIN_LINES}`
  )
  .option(
    '--batch-size <number>',
    `Batch size for comparisons. Default: ${DEFAULT_BATCH_SIZE}`
  )
  .option(
    '--no-approx',
    'Disable approximate candidate selection. Slower but more thorough on small repos'
  )
  .option(
    '--min-shared-tokens <number>',
    `Minimum shared tokens to consider a candidate. Default: ${DEFAULT_MIN_SHARED_TOKENS}`
  )
  .option(
    '--max-candidates <number>',
    `Maximum candidates per block. Default: ${DEFAULT_MAX_CANDIDATES_PER_BLOCK}`
  )
  .option(
    '--no-stream-results',
    'Disable incremental output (default: enabled)'
  )
  .option('--include <patterns>', 'File patterns to include (comma-separated)')
  .option('--exclude <patterns>', 'File patterns to exclude (comma-separated)')
  .option(
    '--exclude-patterns <regexes>',
    'Regex patterns to exclude specific code content (comma-separated)'
  )
  .option(
    '--confidence-threshold <number>',
    'Minimum confidence score (0-1). Default: 0'
  )
  .option(
    '--ignore-whitelist <patterns>',
    'List of file pairs or patterns to ignore (comma-separated)'
  )
  .option(
    '--min-severity <level>',
    'Minimum severity to show: critical|major|minor|info. Default: minor'
  )
  .option(
    '--exclude-test-fixtures',
    'Exclude test fixture duplication (beforeAll/afterAll)'
  )
  .option('--exclude-templates', 'Exclude template file duplication')
  .option(
    '--include-tests',
    'Include test files in analysis (excluded by default)'
  )
  .option(
    '--max-results <number>',
    `Maximum number of results to show in console output. Default: ${DEFAULT_MAX_RESULTS}`
  )
  .option('--no-group-by-file-pair', 'Disable grouping duplicates by file pair')
  .option('--no-create-clusters', 'Disable creating refactor clusters')
  .option(
    '--min-cluster-tokens <number>',
    `Minimum token cost for cluster reporting. Default: ${DEFAULT_MIN_CLUSTER_TOKEN_COST}`
  )
  .option(
    '--min-cluster-files <number>',
    `Minimum files for cluster reporting. Default: ${DEFAULT_MIN_CLUSTER_FILES}`
  )
  .option(
    '--show-raw-duplicates',
    'Show raw duplicates instead of grouped view'
  )
  .option(
    '-o, --output <format>',
    'Output format: console, json, html',
    DEFAULT_OUTPUT_FORMAT
  )
  .option('--output-file <path>', 'Output file path (for json/html)')
  .action(patternActionHandler);

program.parse();
