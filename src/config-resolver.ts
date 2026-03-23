import { loadConfig, mergeConfigWithDefaults, Severity } from '@aiready/core';
import {
  DEFAULT_MIN_SIMILARITY,
  DEFAULT_MIN_LINES,
  DEFAULT_BATCH_SIZE,
  DEFAULT_MIN_SHARED_TOKENS,
  DEFAULT_MAX_CANDIDATES_PER_BLOCK,
  DEFAULT_MAX_RESULTS,
  DEFAULT_MIN_CLUSTER_TOKEN_COST,
  DEFAULT_MIN_CLUSTER_FILES,
} from './constants';

/**
 * Resolves pattern detection configuration by merging defaults, file-based config, and CLI overrides.
 */
export async function resolvePatternConfig(directory: string, options: any) {
  const fileConfig = await loadConfig(directory);

  const defaults = {
    minSimilarity: DEFAULT_MIN_SIMILARITY,
    minLines: DEFAULT_MIN_LINES,
    batchSize: DEFAULT_BATCH_SIZE,
    approx: true,
    minSharedTokens: DEFAULT_MIN_SHARED_TOKENS,
    maxCandidatesPerBlock: DEFAULT_MAX_CANDIDATES_PER_BLOCK,
    streamResults: true,
    include: undefined,
    exclude: undefined,
    excludePatterns: undefined,
    confidenceThreshold: 0,
    ignoreWhitelist: undefined,
    minSeverity: Severity.Minor,
    excludeTestFixtures: false,
    excludeTemplates: false,
    includeTests: false,
    maxResults: DEFAULT_MAX_RESULTS,
    groupByFilePair: true,
    createClusters: true,
    minClusterTokenCost: DEFAULT_MIN_CLUSTER_TOKEN_COST,
    minClusterFiles: DEFAULT_MIN_CLUSTER_FILES,
    showRawDuplicates: false,
  };

  const mergedConfig = mergeConfigWithDefaults(fileConfig, defaults);

  const finalOptions = {
    rootDir: directory,
    minSimilarity: options.similarity
      ? parseFloat(options.similarity)
      : mergedConfig.minSimilarity,
    minLines: options.minLines
      ? parseInt(options.minLines)
      : mergedConfig.minLines,
    batchSize: options.batchSize
      ? parseInt(options.batchSize)
      : mergedConfig.batchSize,
    approx: options.approx !== false && mergedConfig.approx,
    minSharedTokens: options.minSharedTokens
      ? parseInt(options.minSharedTokens)
      : mergedConfig.minSharedTokens,
    maxCandidatesPerBlock: options.maxCandidates
      ? parseInt(options.maxCandidates)
      : mergedConfig.maxCandidatesPerBlock,
    streamResults:
      options.streamResults !== false && mergedConfig.streamResults,
    include: options.include?.split(',') || mergedConfig.include,
    exclude: options.exclude?.split(',') || mergedConfig.exclude,
    excludePatterns:
      options.excludePatterns?.split(',') || mergedConfig.excludePatterns,
    confidenceThreshold: options.confidenceThreshold
      ? parseFloat(options.confidenceThreshold)
      : mergedConfig.confidenceThreshold,
    ignoreWhitelist:
      options.ignoreWhitelist?.split(',') || mergedConfig.ignoreWhitelist,
    minSeverity: (options.minSeverity || mergedConfig.minSeverity) as Severity,
    excludeTestFixtures:
      options.excludeTestFixtures || mergedConfig.excludeTestFixtures,
    excludeTemplates: options.excludeTemplates || mergedConfig.excludeTemplates,
    includeTests: options.includeTests || mergedConfig.includeTests,
    maxResults: options.maxResults
      ? parseInt(options.maxResults)
      : mergedConfig.maxResults,
    groupByFilePair:
      options.groupByFilePair !== false && mergedConfig.groupByFilePair,
    createClusters:
      options.createClusters !== false && mergedConfig.createClusters,
    minClusterTokenCost: options.minClusterTokens
      ? parseInt(options.minClusterTokens)
      : mergedConfig.minClusterTokenCost,
    minClusterFiles: options.minClusterFiles
      ? parseInt(options.minClusterFiles)
      : mergedConfig.minClusterFiles,
    showRawDuplicates:
      options.showRawDuplicates || mergedConfig.showRawDuplicates,
  };

  // Adjust for test inclusion if requested
  if (finalOptions.includeTests && finalOptions.exclude) {
    const testPatterns = [
      '**/*.test.*',
      '**/*.spec.*',
      '**/__tests__/**',
      '**/test/**',
      '**/tests/**',
    ];
    finalOptions.exclude = finalOptions.exclude.filter(
      (pattern: string) => !testPatterns.includes(pattern)
    );
  }

  return finalOptions;
}
