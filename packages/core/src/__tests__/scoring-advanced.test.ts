import { describe, it, expect } from 'vitest';
import {
  getProjectSizeTier,
  getRecommendedThreshold,
  getRatingWithContext,
} from '../scoring';

describe('Advanced Scoring Logic', () => {
  describe('getProjectSizeTier', () => {
    it('should classify project sizes correctly', () => {
      expect(getProjectSizeTier(10)).toBe('xs');
      expect(getProjectSizeTier(100)).toBe('small');
      expect(getProjectSizeTier(300)).toBe('medium');
      expect(getProjectSizeTier(1000)).toBe('large');
      expect(getProjectSizeTier(5000)).toBe('enterprise');
    });
  });

  describe('getRecommendedThreshold', () => {
    it('should recommend higher thresholds for smaller projects', () => {
      const xsThreshold = getRecommendedThreshold(10);
      const largeThreshold = getRecommendedThreshold(1000);
      expect(xsThreshold).toBeGreaterThan(largeThreshold);
    });

    it('should adjust based on model tier', () => {
      const standard = getRecommendedThreshold(100, 'standard');
      const frontier = getRecommendedThreshold(100, 'frontier');
      // Frontier models handle more complexity, so threshold can be lower
      expect(frontier).toBeLessThan(standard);
    });
  });

  describe('getRatingWithContext', () => {
    it('should adjust rating based on project context', () => {
      // Score of 70 on a huge project might be "Good"
      const enterpriseRating = getRatingWithContext(70, 5000, 'frontier');
      // Score of 70 on a tiny project might be "Fair" or "Needs Work"
      const xsRating = getRatingWithContext(70, 10, 'compact');

      expect(enterpriseRating).not.toBe(xsRating);
    });
  });
});
