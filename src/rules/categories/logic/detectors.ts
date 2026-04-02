export const isEnumDefinition = (code: string): boolean =>
  /(?:export\s+)?(?:const\s+)?enum\s+/.test(code) ||
  (code.includes('enum ') && code.includes('{') && code.includes('}'));

export const hasSingletonGetter = (code: string): boolean =>
  /(?:export\s+)?(?:async\s+)?function\s+get[A-Z][a-zA-Z0-9]*\s*\(/.test(
    code
  ) ||
  /(?:export\s+)?const\s+get[A-Z][a-zA-Z0-9]*\s*=\s*(?:async\s+)?\(\)\s*=>/.test(
    code
  );

export const hasSingletonPattern = (code: string): boolean =>
  (code.includes('if (!') &&
    code.includes('instance') &&
    code.includes(' = ')) ||
  (code.includes('if (!_') && code.includes(' = new '));

export const hasReExportPattern = (code: string): boolean => {
  const lines = code.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return false;
  const reExportLines = lines.filter(
    (l) =>
      /^export\s+(\{[^}]+\}|\*)\s+from\s+/.test(l.trim()) ||
      /^export\s+\*\s+as\s+\w+\s+from\s+/.test(l.trim())
  ).length;
  return reExportLines > 0 && reExportLines / lines.length > 0.5;
};

export const isInterfaceOnlySnippet = (code: string): boolean => {
  const hasInterface = code.includes('interface ');
  const hasType = code.includes('type ');
  const hasEnum = code.includes('enum ');

  const hasNoImpl = ![
    'function ',
    'class ',
    'const ',
    'let ',
    'var ',
    'export default',
    'export {',
  ].some((kw) => code.includes(kw));

  return (hasInterface || hasType || hasEnum) && hasNoImpl;
};
