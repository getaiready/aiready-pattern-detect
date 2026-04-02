/**
 * API function pattern detection utilities
 * Consolidates 11 similar API/utility function checks into single utility
 */

interface ApiPattern {
  functions: string[];
  keywords: string[];
}

const API_PATTERNS: Record<string, ApiPattern> = {
  stripe: {
    functions: ['getStripe'],
    keywords: ['process.env.STRIPE_SECRET_KEY'],
  },
  userManagement: {
    functions: ['getUserByEmail'],
    keywords: ['queryItems'],
  },
  userUpdate: {
    functions: ['updateUser'],
    keywords: ['buildUpdateExpression'],
  },
  repositoryListing: {
    functions: ['listUserRepositories', 'listTeamRepositories'],
    keywords: ['queryItems'],
  },
  remediationQueries: {
    functions: ['getRemediation'],
    keywords: ['queryItems'],
  },
  keyFormatting: {
    functions: ['formatBreakdownKey'],
    keywords: ['.replace(/([A-Z])/g'],
  },
  dynamoDbQueries: {
    functions: ['queryItems'],
    keywords: ['KeyConditionExpression'],
  },
  itemOperations: {
    functions: ['putItem'],
    keywords: ['createdAt'],
  },
  itemUpdates: {
    functions: ['updateItem'],
    keywords: ['buildUpdateExpression'],
  },
};

export const ApiPatterns = {
  /**
   * Check if code contains a common API pattern
   * Reduces from 11 separate || conditions to single call
   */
  hasCommonApiPattern: (code: string): boolean => {
    for (const pattern of Object.values(API_PATTERNS)) {
      const hasFunctions = pattern.functions.some((fn) => code.includes(fn));
      const hasKeywords = pattern.keywords.some((kw) => code.includes(kw));
      if (hasFunctions && hasKeywords) {
        return true;
      }
    }
    return false;
  },

  /**
   * Get all API patterns (useful for documentation/analysis)
   */
  getPatterns: () => API_PATTERNS,

  /**
   * Check if code matches a specific API pattern by name
   */
  matchesPattern: (code: string, patternName: string): boolean => {
    const pattern = API_PATTERNS[patternName];
    if (!pattern) return false;
    const hasFunctions = pattern.functions.some((fn) => code.includes(fn));
    const hasKeywords = pattern.keywords.some((kw) => code.includes(kw));
    return hasFunctions && hasKeywords;
  },
};
