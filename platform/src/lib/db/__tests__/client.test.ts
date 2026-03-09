import { describe, it, expect } from 'vitest';
import { getTableName, doc } from '../client';

describe('DB Client', () => {
  it('should return default table name', () => {
    expect(getTableName()).toBeDefined();
  });

  it('should have a configured doc client', () => {
    expect(doc).toBeDefined();
  });
});
