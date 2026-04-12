/**
 * Calculate Jaccard similarity between two token arrays.
 */

import { jaccardSimilarity as coreJaccardSimilarity } from '@aiready/core';

/**
 * Calculate Jaccard similarity between two token arrays.
 * Delegating to @aiready/core to reduce pattern duplication.
 *
 * @param tokens1 - First set of tokens.
 * @param tokens2 - Second set of tokens.
 * @returns Normalized similarity score (0-1).
 */
export function jaccardSimilarity(
  tokens1: string[],
  tokens2: string[]
): number {
  return coreJaccardSimilarity(tokens1, tokens2);
}
