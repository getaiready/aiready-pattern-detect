import { describe, it, expect } from 'vitest';
import { classifyFile } from '../index';
import { createNode } from './file-classification.fixtures';

describe('file classification core', () => {
  it('should classify barrel export files correctly', () => {
    const node = createNode({
      file: 'src/index.ts',
      imports: ['../module1', '../module2', '../module3'],
      exports: [
        { name: 'func1', type: 'function', inferredDomain: 'module1' },
        { name: 'func2', type: 'function', inferredDomain: 'module2' },
        { name: 'func3', type: 'function', inferredDomain: 'module3' },
      ],
      linesOfCode: 20,
    });

    const classification = classifyFile(node, 0.5, [
      'module1',
      'module2',
      'module3',
    ]);
    expect(classification).toBe('barrel-export');
  });

  // ... (keeping only a few core tests here)
});
