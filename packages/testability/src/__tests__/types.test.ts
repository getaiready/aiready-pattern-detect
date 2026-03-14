import { describe, it, expect } from 'vitest';
import type { TestabilityOptions, TestabilityReport } from '../types';

describe('Testability Types', () => {
  describe('TestabilityOptions', () => {
    it('should allow required rootDir', () => {
      const options: TestabilityOptions = {
        rootDir: '/test/project',
      };

      expect(options.rootDir).toBe('/test/project');
    });

    it('should allow optional minCoverageRatio', () => {
      const options: TestabilityOptions = {
        rootDir: '/test/project',
        minCoverageRatio: 0.5,
      };

      expect(options.minCoverageRatio).toBe(0.5);
    });

    it('should allow custom test patterns', () => {
      const options: TestabilityOptions = {
        rootDir: '/test/project',
        testPatterns: ['**/*.test.ts', '**/*.spec.ts', '**/*.e2e.ts'],
      };

      expect(options.testPatterns).toHaveLength(3);
    });
  });

  describe('TestabilityReport', () => {
    it('should structure summary correctly', () => {
      const report: TestabilityReport = {
        summary: {
          sourceFiles: 100,
          testFiles: 30,
          coverageRatio: 0.3,
          score: 60,
          rating: 'moderate',
          aiChangeSafetyRating: 'moderate-risk',
          dimensions: {
            testCoverageRatio: 30,
            purityScore: 70,
            dependencyInjectionScore: 50,
            interfaceFocusScore: 80,
            observabilityScore: 60,
          },
        },
        issues: [],
        rawData: {
          sourceFiles: 100,
          testFiles: 30,
          pureFunctions: 80,
          totalFunctions: 100,
          injectionPatterns: 5,
          totalClasses: 20,
          bloatedInterfaces: 10,
          totalInterfaces: 50,
          externalStateMutations: 15,
          hasTestFramework: true,
        },
        recommendations: ['Add more tests to reach 30% coverage'],
      };

      expect(report.summary.sourceFiles).toBe(100);
      expect(report.summary.coverageRatio).toBe(0.3);
      expect(report.rawData.hasTestFramework).toBe(true);
    });
  });
});
