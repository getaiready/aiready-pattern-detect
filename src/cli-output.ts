import {
  getSeverityBadge,
  getSeverityValue,
  generateReportHead,
  generateStatCards,
  generateTable,
  generateReportFooter,
} from '@aiready/core';

/**
 * Get emoji icon representing a specific pattern type.
 *
 * @param type - The pattern type string.
 * @returns Emoji icon for the pattern.
 */
export function getPatternIcon(type: string): string {
  const icons: Record<string, string> = {
    'api-handler': '🔌',
    validator: '🛡️',
    utility: '⚙️',
    'class-method': '🏛️',
    component: '🧩',
    function: '𝑓',
    unknown: '❓',
  };
  return icons[type] || icons.unknown;
}

/**
 * Generate a complete HTML report for pattern detection results.
 *
 * @param results - The results object (may be single arg or part of a pair).
 * @param summary - Optional consolidated summary for legacy support.
 * @returns Self-contained HTML string.
 */
export function generateHTMLReport(results: any, summary?: any): string {
  // Handle both single-argument and legacy two-argument calls
  const data = summary
    ? { results, summary, metadata: { version: '0.11.22' } }
    : results;
  const { metadata } = data;
  const s = data.summary;

  const head = generateReportHead('AIReady - Pattern Detection Report');

  const scoreCard = `<div class="stat-card" style="margin-bottom: 2rem;">
    <div class="stat-label">AI Ready Score (Deduplication)</div>
    <div class="stat-value">${Math.max(0, 100 - Math.round(((s.duplicates?.length || 0) / (s.totalFiles || 1)) * 20))}%</div>
  </div>`;

  const stats = generateStatCards([
    { value: s.totalFiles, label: 'Files Analyzed' },
    { value: s.duplicates?.length || 0, label: 'Duplicate Clusters' },
    { value: s.totalIssues, label: 'Total Issues' },
  ]);

  const tableRows = (s.duplicates || []).map((dup: any) => [
    `<span class="${dup.similarity > 0.95 ? 'critical' : dup.similarity > 0.9 ? 'major' : 'minor'}">${Math.round(dup.similarity * 100)}%</span>`,
    dup.patternType,
    dup.files
      .map((f: any) => `<code>${f.path}:${f.startLine}-${f.endLine}</code>`)
      .join('<br>↔<br>'),
    dup.tokenCost.toLocaleString(),
  ]);

  const table = generateTable({
    headers: ['Similarity', 'Type', 'Locations', 'Tokens Wasted'],
    rows: tableRows,
  });

  const body = `${scoreCard}
${stats}
<div class="card">
  <h2>Duplicate Patterns</h2>
  ${table}
</div>`;

  const footer = generateReportFooter({
    title: 'Pattern Detection Report',
    packageName: 'pattern-detect',
    packageUrl: 'https://github.com/caopengau/aiready-pattern-detect',
    bugUrl: 'https://github.com/caopengau/aiready-pattern-detect/issues',
    version: metadata.version,
  });

  return `${head}
<body>
  <h1>Pattern Detection Report</h1>
  ${body}
  ${footer}
</body>
</html>`;
}

// These are now standardized in @aiready/core
export { getSeverityValue, getSeverityBadge };
