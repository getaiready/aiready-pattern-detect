import { describe, it, expect } from 'vitest';
import { Language, LANGUAGE_EXTENSIONS, ParseError } from '../types/language';

describe('Language Definitions', () => {
  it('should map extensions to languages correctly', () => {
    expect(LANGUAGE_EXTENSIONS['.ts']).toBe(Language.TypeScript);
    expect(LANGUAGE_EXTENSIONS['.py']).toBe(Language.Python);
    expect(LANGUAGE_EXTENSIONS['.go']).toBe(Language.Go);
  });

  it('should create ParseError with correct properties', () => {
    const error = new ParseError('msg', 'file.ts', { line: 1, column: 1 });
    expect(error.message).toBe('msg');
    expect(error.filePath).toBe('file.ts');
    expect(error.loc?.line).toBe(1);
  });
});
