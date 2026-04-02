/**
 * File detection utilities - consolidates .endsWith() and .includes() checks
 * Reduces 15+ LOC of repetitive file path pattern detection
 */

export const FileDetectors = {
  isIndexFile: (file: string): boolean =>
    file.endsWith('/index.ts') ||
    file.endsWith('/index.js') ||
    file.endsWith('/index.tsx') ||
    file.endsWith('/index.jsx'),

  isTypeFile: (file: string): boolean =>
    file.endsWith('.d.ts') || file.includes('/types/'),

  isUtilFile: (file: string): boolean =>
    file.endsWith('.util.ts') ||
    file.endsWith('.helper.ts') ||
    file.endsWith('.utils.ts'),

  isHookFile: (file: string): boolean =>
    file.includes('/hooks/') ||
    file.endsWith('.hook.ts') ||
    file.endsWith('.hook.tsx'),

  isHelperFile: (file: string): boolean =>
    file.includes('/utils/') ||
    file.includes('/helpers/') ||
    file.endsWith('.util.ts'),

  isVizFile: (file: string): boolean =>
    file.includes('/visualizer/') ||
    file.includes('/charts/') ||
    file.includes('GraphCanvas') ||
    file.includes('ForceDirected'),

  isApiFile: (file: string): boolean =>
    file.includes('/api/') ||
    file.includes('/lib/') ||
    file.includes('/utils/') ||
    file.endsWith('.ts'),

  isPackageOrApp: (file: string): boolean =>
    file.includes('/packages/') ||
    file.includes('/apps/') ||
    file.includes('/core/'),

  getPackageName: (file: string): string | null => {
    const match = file.match(/\/(packages|apps|core)\/([^/]+)\//);
    return match?.[2] || null;
  },
};
