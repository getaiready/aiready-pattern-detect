import { describe, it, expect } from 'vitest';
import { PATTERN_DETECT_PROVIDER } from '../provider';

describe('Pattern Detect Provider', () => {
  it('should have correct ID', () => {
    expect(PATTERN_DETECT_PROVIDER.id).toBe('pattern-detect');
  });

  it('should have alias', () => {
    expect(PATTERN_DETECT_PROVIDER.alias).toContain('duplicates');
  });
});
