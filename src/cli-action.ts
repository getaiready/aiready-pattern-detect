import { analyzePatterns, generateSummary } from './analyzer';
import { filterBySeverity } from './context-rules';
import chalk from 'chalk';
import { resolvePatternConfig } from './config-resolver';
import { handleJsonOutput, handleHtmlOutput } from './output-handlers';
import { renderTerminalOutput } from './terminal-renderer';

/**
 * Main CLI action handler for pattern detection.
 */
export async function patternActionHandler(directory: string, options: any) {
  console.log(chalk.blue('🔍 Analyzing patterns...\n'));

  const startTime = Date.now();

  // 1. Resolve configuration
  const finalOptions = await resolvePatternConfig(directory, options);

  // 2. Execute analysis
  const {
    results,
    duplicates: rawDuplicates,
    groups,
    clusters,
  } = await analyzePatterns(finalOptions);

  // 3. Post-processing
  let filteredDuplicates = rawDuplicates;
  if (finalOptions.minSeverity) {
    filteredDuplicates = filterBySeverity(
      filteredDuplicates,
      finalOptions.minSeverity
    );
  }

  if (finalOptions.excludeTestFixtures) {
    filteredDuplicates = filteredDuplicates.filter(
      (d) => d.matchedRule !== 'test-fixtures'
    );
  }

  if (finalOptions.excludeTemplates) {
    filteredDuplicates = filteredDuplicates.filter(
      (d) => d.matchedRule !== 'templates'
    );
  }

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const summary = generateSummary(results || []);

  const totalIssues = (results || []).reduce(
    (sum, r) => sum + (r.issues?.length || 0),
    0
  );

  // 4. Output generation
  if (options.output === 'json') {
    handleJsonOutput(options.outputFile, directory, {
      summary,
      results,
      duplicates: rawDuplicates,
      groups: groups || [],
      clusters: clusters || [],
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (options.output === 'html') {
    handleHtmlOutput(options.outputFile, directory, summary, results);
    return;
  }

  // 5. Console output
  renderTerminalOutput(
    results.length,
    totalIssues,
    summary,
    elapsedTime,
    finalOptions,
    groups,
    clusters,
    filteredDuplicates
  );
}
