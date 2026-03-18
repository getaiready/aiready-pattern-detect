import { Severity, FileContent } from '@aiready/core';

export type { FileContent };

export type PatternType =
  | 'api-handler'
  | 'validator'
  | 'utility'
  | 'class-method'
  | 'component'
  | 'function'
  | 'unknown';

export interface CodeBlock {
  file: string;
  startLine: number;
  endLine: number;
  code: string;
  tokens: number;
  patternType: PatternType;
  signature?: string;
  hash?: string;
}

export interface DuplicatePattern {
  file1: string;
  line1: number;
  endLine1: number;
  file2: string;
  line2: number;
  endLine2: number;
  code1: string;
  code2: string;
  similarity: number;
  confidence: number; // 0-1, heuristic confidence score
  patternType: PatternType;
  tokenCost: number;
  severity: Severity;
  reason?: string;
  suggestion?: string;
  matchedRule?: string;
}

export interface DetectionOptions {
  minSimilarity: number;
  minLines: number;
  batchSize: number;
  approx: boolean;
  minSharedTokens: number;
  maxCandidatesPerBlock: number;
  streamResults: boolean;
  excludePatterns?: string[];
  confidenceThreshold?: number;
  ignoreWhitelist?: string[];
  onProgress?: (processed: number, total: number, message: string) => void;
}
