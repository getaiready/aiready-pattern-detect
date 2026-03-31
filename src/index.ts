import { ToolRegistry, Severity } from '@aiready/core';
import { PATTERN_DETECT_PROVIDER } from './provider';

// Register with global registry
ToolRegistry.register(PATTERN_DETECT_PROVIDER);

export * from './analyzer';
export * from './detector';
export * from './grouping';
export * from './scoring';
export * from './context-rules';
export { PATTERN_DETECT_PROVIDER, Severity };
