import { Severity } from '@aiready/core';
import { ContextRule } from '../types';

export const WEB_RULES: ContextRule[] = [
  // Email/Document Templates - Often intentionally similar for consistency
  {
    name: 'templates',
    detect: (file, code) => {
      const isTemplate =
        file.includes('/templates/') ||
        file.includes('-template') ||
        file.includes('/email-templates/') ||
        file.includes('/emails/');

      const hasTemplateContent =
        (code.includes('return') || code.includes('export')) &&
        (code.includes('html') ||
          code.includes('subject') ||
          code.includes('body'));

      return isTemplate && hasTemplateContent;
    },
    severity: Severity.Info,
    reason:
      'Template duplication may be intentional for maintainability and branding consistency',
    suggestion:
      'Extract shared structure only if templates become hard to maintain',
  },
  // Common UI Event Handlers - Very specific patterns only
  {
    name: 'common-ui-handlers',
    detect: (file, code) => {
      const isUIFile =
        file.includes('/components/') ||
        file.includes('.tsx') ||
        file.includes('.jsx') ||
        file.includes('/hooks/');

      // Only match very specific common handler patterns that are truly boilerplate
      const hasCommonHandler =
        (code.includes('handleClickOutside') &&
          code.includes('dropdownRef.current') &&
          code.includes('!dropdownRef.current.contains')) ||
        (code.includes('handleEscape') &&
          code.includes('event.key') &&
          code.includes("=== 'Escape'")) ||
        (code.includes('handleClickInside') &&
          code.includes('event.stopPropagation'));

      return isUIFile && hasCommonHandler;
    },
    severity: Severity.Info,
    reason:
      'Common UI event handlers are boilerplate patterns that repeat across components',
    suggestion:
      'Consider extracting to shared hooks (useClickOutside, useEscapeKey) only if causing maintenance issues',
  },
  // Next.js Route Handler Patterns - Boilerplate API route patterns
  {
    name: 'nextjs-route-handlers',
    detect: (file, code) => {
      const isRouteFile =
        file.includes('/api/') &&
        (file.endsWith('/route.ts') || file.endsWith('/route.js'));

      const hasRoutePattern =
        code.includes('export async function POST') ||
        code.includes('export async function GET') ||
        code.includes('export async function PUT') ||
        code.includes('export async function DELETE') ||
        code.includes('NextResponse.json') ||
        code.includes('NextRequest');

      return isRouteFile && hasRoutePattern;
    },
    severity: Severity.Info,
    reason:
      'Next.js route handlers follow standard patterns and are intentionally similar across endpoints',
    suggestion:
      'Route handler duplication is acceptable for API endpoint boilerplate',
  },
];
