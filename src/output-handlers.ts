import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import chalk from 'chalk';
import { resolveOutputPath } from '@aiready/core';
import { generateHTMLReport } from './cli-output';

/**
 * Handles JSON report persistence.
 */
export function handleJsonOutput(
  outputFile: string,
  directory: string,
  data: any
) {
  const outputPath = resolveOutputPath(
    outputFile,
    `pattern-report-${new Date().toISOString().split('T')[0]}.json`,
    directory
  );

  const dir = dirname(outputPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(chalk.green(`\n✓ JSON report saved to ${outputPath}`));
}

/**
 * Handles HTML report persistence.
 */
export function handleHtmlOutput(
  outputFile: string,
  directory: string,
  summary: any,
  results: any
) {
  const html = generateHTMLReport(summary, results);
  const outputPath = resolveOutputPath(
    outputFile,
    `pattern-report-${new Date().toISOString().split('T')[0]}.html`,
    directory
  );

  const dir = dirname(outputPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(outputPath, html);
  console.log(chalk.green(`\n✓ HTML report saved to ${outputPath}`));
}
