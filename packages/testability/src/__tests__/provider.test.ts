import { describe, it, expect } from 'vitest';
import { TESTABILITY_PROVIDER } from '../provider';

describe('Testability Provider', () => {
  it('should have correct ID', () => {
    expect(TESTABILITY_PROVIDER.id).toBe('testability-index');
  });

  it('should have alias', () => {
    expect(TESTABILITY_PROVIDER.alias).toContain('testability-index');
  });
});
