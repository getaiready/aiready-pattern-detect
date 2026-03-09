import { describe, it, expect } from 'vitest';
import { GLOBAL_INFRA_OPTIONS, COMMON_FINE_TUNING_OPTIONS } from '../types';

describe('Global Types', () => {
  it('should have expected infrastructure options', () => {
    expect(GLOBAL_INFRA_OPTIONS).toContain('rootDir');
    expect(GLOBAL_INFRA_OPTIONS).toContain('tools');
  });

  it('should have common fine-tuning options', () => {
    expect(COMMON_FINE_TUNING_OPTIONS).toContain('maxDepth');
    expect(COMMON_FINE_TUNING_OPTIONS).toContain('minSimilarity');
  });
});
