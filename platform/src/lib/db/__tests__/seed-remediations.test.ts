import { describe, it, expect, vi } from 'vitest';
import { seedInitialRemediations } from '../seed-remediations';
import { createRemediation } from '../remediation';

vi.mock('../remediation', () => ({
  createRemediation: vi.fn().mockResolvedValue({}),
}));

describe('Seed Remediations', () => {
  it('should seed remediations for a repository', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await seedInitialRemediations('repo-1', 'user-1');

    expect(createRemediation).toHaveBeenCalledTimes(4);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Created 4 initial remediations')
    );
    consoleSpy.mockRestore();
  });
});
