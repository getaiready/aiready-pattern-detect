import { Severity } from '@aiready/core';

export interface ContextRule {
  name: string;
  detect: (file: string, code: string) => boolean;
  severity: Severity;
  reason: string;
  suggestion?: string;
}
