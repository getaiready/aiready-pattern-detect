import chalk from 'chalk';
import { getSeverityValue, getTerminalDivider } from '@aiready/core';
import {
  printAnalysisSummary,
  printPatternBreakdown,
  printDuplicateGroups,
  printRefactorClusters,
  printRawDuplicates,
  printCriticalIssues,
} from './terminal-output';

/**
 * Renders the full terminal report.
 */
export function renderTerminalOutput(
  fileCount: number,
  totalIssues: number,
  summary: any,
  elapsedTime: string,
  options: any,
  groups: any[] | undefined,
  clusters: any[] | undefined,
  filteredDuplicates: any[]
) {
  printAnalysisSummary(
    fileCount,
    totalIssues,
    summary.totalTokenCost,
    elapsedTime
  );
  printPatternBreakdown(summary.patternsByType);

  if (!options.showRawDuplicates && groups && groups.length > 0) {
    printDuplicateGroups(groups, options.maxResults);
  }

  if (!options.showRawDuplicates && clusters && clusters.length > 0) {
    printRefactorClusters(clusters);
  }

  if (
    totalIssues > 0 &&
    (options.showRawDuplicates || !groups || groups.length === 0)
  ) {
    printRawDuplicates(filteredDuplicates, options.maxResults);
  }

  // Passing summary for additional context if needed
  const criticalIssues = resultsToCriticalIssues(filteredDuplicates);
  printCriticalIssues(criticalIssues);

  if (totalIssues === 0) {
    printSuccessMessage();
  } else if (totalIssues < 5) {
    printGuidance();
  }

  console.log(getTerminalDivider());
  if (totalIssues > 0) {
    console.log(
      chalk.white(
        `\n💡 Run with ${chalk.bold('--output json')} or ${chalk.bold('--output html')} for detailed reports`
      )
    );
  }
  printFooter();
}

/**
 * Helper to extract critical issues from results.
 */
function resultsToCriticalIssues(duplicates: any[]) {
  return duplicates
    .filter((d) => getSeverityValue(d.severity) === 4)
    .map((d) => ({
      file: d.file1,
      location: { line: d.line1 },
      message: `${d.patternType} pattern highly similar to ${d.file2}`,
      suggestion: d.suggestion,
      severity: d.severity,
    }));
}

function printSuccessMessage() {
  console.log(chalk.green('\n✨ Great! No duplicate patterns detected.\n'));
  console.log(
    chalk.yellow(
      '💡 If you expected to find duplicates, try adjusting parameters:'
    )
  );
  console.log(chalk.dim('   • Lower similarity threshold: --similarity 0.3'));
  console.log(chalk.dim('   • Reduce minimum lines: --min-lines 3'));
  console.log(chalk.dim('   • Include test files: --include-tests'));
  console.log(
    chalk.dim('   • Lower shared tokens threshold: --min-shared-tokens 5\n')
  );
}

function printGuidance() {
  console.log(
    chalk.yellow('\n💡 Few results found. To find more duplicates, try:')
  );
  console.log(chalk.dim('   • Lower similarity threshold: --similarity 0.3'));
  console.log(chalk.dim('   • Reduce minimum lines: --min-lines 3'));
  console.log(chalk.dim('   • Include test files: --include-tests\n'));
}

function printFooter() {
  console.log(
    chalk.dim(
      '\n⭐ Like AIReady? Star us on GitHub: https://github.com/getaiready/aiready-pattern-detect'
    )
  );
  console.log(
    chalk.dim(
      '🐛 Found a bug? Report it: https://github.com/getaiready/aiready-pattern-detect/issues\n'
    )
  );
}
