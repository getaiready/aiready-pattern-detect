import { Severity } from '@aiready/core';
import { ContextRule } from '../types';

export const TEST_RULES: ContextRule[] = [
  // Test Fixtures - Intentional duplication for test isolation
  {
    name: 'test-fixtures',
    detect: (file, code) => {
      const isTestFile =
        file.includes('.test.') ||
        file.includes('.spec.') ||
        file.includes('__tests__') ||
        file.includes('/test/') ||
        file.includes('/tests/');

      const hasTestFixtures =
        code.includes('beforeAll') ||
        code.includes('afterAll') ||
        code.includes('beforeEach') ||
        code.includes('afterEach') ||
        code.includes('setUp') ||
        code.includes('tearDown');

      return isTestFile && hasTestFixtures;
    },
    severity: Severity.Info,
    reason: 'Test fixture duplication is intentional for test isolation',
    suggestion:
      'Consider if shared test setup would improve maintainability without coupling tests',
  },
  // E2E/Integration Test Page Objects - Test independence
  {
    name: 'e2e-page-objects',
    detect: (file, code) => {
      const isE2ETest =
        file.includes('e2e/') ||
        file.includes('/e2e/') ||
        file.includes('.e2e.') ||
        file.includes('/playwright/') ||
        file.includes('playwright/') ||
        file.includes('/cypress/') ||
        file.includes('cypress/') ||
        file.includes('/integration/') ||
        file.includes('integration/');

      const hasPageObjectPatterns =
        code.includes('page.') ||
        code.includes('await page') ||
        code.includes('locator') ||
        code.includes('getBy') ||
        code.includes('selector') ||
        code.includes('click(') ||
        code.includes('fill(');

      return isE2ETest && hasPageObjectPatterns;
    },
    severity: Severity.Info,
    reason:
      'E2E test duplication ensures test independence and reduces coupling',
    suggestion:
      'Consider page object pattern only if duplication causes maintenance issues',
  },
  // Mock Data - Test data intentionally duplicated
  {
    name: 'mock-data',
    detect: (file, code) => {
      const isMockFile =
        file.includes('/mocks/') ||
        file.includes('/__mocks__/') ||
        file.includes('/fixtures/') ||
        file.includes('.mock.') ||
        file.includes('.fixture.');

      const hasMockData =
        code.includes('mock') ||
        code.includes('Mock') ||
        code.includes('fixture') ||
        code.includes('stub') ||
        code.includes('export const');

      return isMockFile && hasMockData;
    },
    severity: Severity.Info,
    reason: 'Mock data duplication is expected for comprehensive test coverage',
    suggestion: 'Consider shared factories only for complex mock generation',
  },
];
