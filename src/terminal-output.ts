import chalk from 'chalk';
import {
  getSeverityBadge,
  getSeverityValue,
  printTerminalHeader,
  getTerminalDivider,
} from '@aiready/core';
import { getPatternIcon } from './cli-output';
import type { PatternType } from './detector';

/**
 * Prints the analysis summary to the terminal.
 *
 * @param resultsLength - Number of files analyzed
 * @param totalIssues - Total number of AI confusion patterns detected
 * @param totalTokenCost - Total token cost wasted
 * @param elapsedTime - Time taken for analysis in seconds
 */
export function printAnalysisSummary(
  resultsLength: number,
  totalIssues: number,
  totalTokenCost: number,
  elapsedTime: string
) {
  printTerminalHeader('PATTERN ANALYSIS SUMMARY');

  console.log(chalk.white(`📁 Files analyzed: ${chalk.bold(resultsLength)}`));
  console.log(
    chalk.yellow(
      `⚠  AI confusion patterns detected: ${chalk.bold(totalIssues)}`
    )
  );
  console.log(
    chalk.red(
      `💰 Token cost (wasted): ${chalk.bold(totalTokenCost.toLocaleString())}`
    )
  );
  console.log(chalk.gray(`⏱  Analysis time: ${chalk.bold(elapsedTime + 's')}`));
}

/**
 * Prints the pattern type breakdown.
 *
 * @param patternsByType - Map of pattern types to their counts
 */
export function printPatternBreakdown(patternsByType: Record<string, number>) {
  const sortedTypes = Object.entries(patternsByType)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  if (sortedTypes.length > 0) {
    console.log('\n' + getTerminalDivider());
    console.log(chalk.bold.white('  PATTERNS BY TYPE'));
    console.log(getTerminalDivider() + '\n');

    sortedTypes.forEach(([type, count]) => {
      const icon = getPatternIcon(type as PatternType);
      console.log(
        `${icon} ${chalk.white(type.padEnd(15))} ${chalk.bold(count)}`
      );
    });
  }
}

/**
 * Prints grouped duplicate pairs.
 *
 * @param groups - Array of duplicate groups
 * @param maxResults - Maximum number of results to display
 */
export function printDuplicateGroups(groups: any[], maxResults: number) {
  if (groups.length === 0) return;

  console.log('\n' + getTerminalDivider());
  console.log(
    chalk.bold.white(`  📦 DUPLICATE GROUPS (${groups.length} file pairs)`)
  );
  console.log(getTerminalDivider() + '\n');

  const topGroups = groups
    .sort((a, b) => {
      const bVal = getSeverityValue(b.severity);
      const aVal = getSeverityValue(a.severity);
      const severityDiff = bVal - aVal;
      if (severityDiff !== 0) return severityDiff;
      return b.totalTokenCost - a.totalTokenCost;
    })
    .slice(0, maxResults);

  topGroups.forEach((group, idx) => {
    const severityBadge = getSeverityBadge(group.severity);
    const [file1, file2] = group.filePair.split('::');
    const file1Name = file1.split('/').pop() || file1;
    const file2Name = file2.split('/').pop() || file2;

    console.log(
      `${idx + 1}. ${severityBadge} ${chalk.bold(file1Name)} ↔ ${chalk.bold(file2Name)}`
    );
    console.log(
      `   Occurrences: ${chalk.bold(group.occurrences)} | Total tokens: ${chalk.bold(group.totalTokenCost.toLocaleString())} | Avg similarity: ${chalk.bold(Math.round(group.averageSimilarity * 100) + '%')}`
    );

    const displayRanges = group.lineRanges.slice(0, 3);
    displayRanges.forEach((range: any) => {
      console.log(
        `   ${chalk.gray(file1)}:${chalk.cyan(`${range.file1.start}-${range.file1.end}`)} ↔ ${chalk.gray(file2)}:${chalk.cyan(`${range.file2.start}-${range.file2.end}`)}`
      );
    });

    if (group.lineRanges.length > 3) {
      console.log(
        `   ${chalk.gray(`... and ${group.lineRanges.length - 3} more ranges`)}`
      );
    }
    console.log();
  });

  if (groups.length > topGroups.length) {
    console.log(
      chalk.gray(
        `   ... and ${groups.length - topGroups.length} more file pairs`
      )
    );
  }
}

/**
 * Prints refactor clusters.
 */
export function printRefactorClusters(clusters: any[]) {
  if (clusters.length === 0) return;

  console.log('\n' + getTerminalDivider());
  console.log(
    chalk.bold.white(`  🎯 REFACTOR CLUSTERS (${clusters.length} patterns)`)
  );
  console.log(getTerminalDivider() + '\n');

  clusters
    .sort((a, b) => b.totalTokenCost - a.totalTokenCost)
    .forEach((cluster, idx) => {
      const severityBadge = getSeverityBadge(cluster.severity);
      console.log(`${idx + 1}. ${severityBadge} ${chalk.bold(cluster.name)}`);
      console.log(
        `   Total tokens: ${chalk.bold(cluster.totalTokenCost.toLocaleString())} | Avg similarity: ${chalk.bold(Math.round(cluster.averageSimilarity * 100) + '%')} | Duplicates: ${chalk.bold(cluster.duplicateCount)}`
      );

      const displayFiles = cluster.files.slice(0, 5);
      console.log(
        `   Files (${cluster.files.length}): ${displayFiles.map((f: string) => chalk.gray(f.split('/').pop() || f)).join(', ')}`
      );
      if (cluster.files.length > 5) {
        console.log(
          `   ${chalk.gray(`... and ${cluster.files.length - 5} more files`)}`
        );
      }

      if (cluster.reason) {
        console.log(`   ${chalk.italic.gray(cluster.reason)}`);
      }
      if (cluster.suggestion) {
        console.log(
          `   ${chalk.cyan('→')} ${chalk.italic(cluster.suggestion)}`
        );
      }
      console.log();
    });
}

/**
 * Prints raw duplicate patterns.
 *
 * @param duplicates - Array of duplicate pattern results
 * @param maxResults - Maximum number of results to display
 */
export function printRawDuplicates(duplicates: any[], maxResults: number) {
  if (duplicates.length === 0) return;

  console.log('\n' + getTerminalDivider());
  console.log(chalk.bold.white('  TOP DUPLICATE PATTERNS'));
  console.log(getTerminalDivider() + '\n');

  const topDuplicates = duplicates
    .sort((a, b) => {
      const bVal = getSeverityValue(b.severity);
      const aVal = getSeverityValue(a.severity);
      const severityDiff = bVal - aVal;
      if (severityDiff !== 0) return severityDiff;
      return b.similarity - a.similarity;
    })
    .slice(0, maxResults);

  topDuplicates.forEach((dup) => {
    const severityBadge = getSeverityBadge(dup.severity);
    const file1Name = dup.file1.split('/').pop() || dup.file1;
    const file2Name = dup.file2.split('/').pop() || dup.file2;

    console.log(
      `${severityBadge} ${chalk.bold(file1Name)} ↔ ${chalk.bold(file2Name)}`
    );
    console.log(
      `   Similarity: ${chalk.bold(Math.round(dup.similarity * 100) + '%')} | Pattern: ${dup.patternType} | Tokens: ${chalk.bold(dup.tokenCost.toLocaleString())}`
    );
    console.log(
      `   ${chalk.gray(dup.file1)}:${chalk.cyan(dup.line1 + '-' + dup.endLine1)}`
    );
    console.log(
      `   ${chalk.gray(dup.file2)}:${chalk.cyan(dup.line2 + '-' + dup.endLine2)}`
    );

    if (dup.reason) {
      console.log(`   ${chalk.italic.gray(dup.reason)}`);
    }
    if (dup.suggestion) {
      console.log(`   ${chalk.cyan('→')} ${chalk.italic(dup.suggestion)}`);
    }
    console.log();
  });

  if (duplicates.length > topDuplicates.length) {
    console.log(
      chalk.gray(
        `   ... and ${duplicates.length - topDuplicates.length} more duplicates`
      )
    );
  }
}

/**
 * Prints critical issues (>95% similarity).
 */
export function printCriticalIssues(issues: any[]) {
  if (issues.length === 0) return;

  console.log(getTerminalDivider());
  console.log(chalk.bold.white('  CRITICAL ISSUES (>95% similar)'));
  console.log(getTerminalDivider() + '\n');

  issues.slice(0, 5).forEach((issue) => {
    console.log(
      chalk.red('● ') + chalk.white(`${issue.file}:${issue.location.line}`)
    );
    console.log(`  ${chalk.dim(issue.message)}`);
    console.log(`  ${chalk.green('→')} ${chalk.italic(issue.suggestion)}\n`);
  });
}
