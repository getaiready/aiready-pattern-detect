#!/usr/bin/env node
/**
 * Build script to compile individual rule files into AGENTS.md
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Rule, Section, ImpactLevel, Metadata } from './types.js';
import { parseRuleFile, RuleFile } from './parser.js';
import { SKILL_CONFIG } from './config.js';

// Parse command line arguments
const args = process.argv.slice(2);
const upgradeVersion = args.includes('--upgrade-version');

/**
 * Increment a semver-style version string
 */
function incrementVersion(version: string): string {
  const parts = version.split('.');
  const patch = parseInt(parts[parts.length - 1] || '0');
  parts[parts.length - 1] = String(patch + 1);
  return parts.join('.');
}

/**
 * Slugify a string for markdown headers
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, ''); // Strip non-alphanumeric except dashes
}

/**
 * Generate markdown from rules
 */
function generateMarkdown(sections: Section[], metadata: Metadata): string {
  let md = `# ${SKILL_CONFIG.title}\n\n`;
  md += `**Version ${metadata.version}**  \n`;
  md += `${metadata.organization}  \n`;
  md += `${metadata.date}\n\n`;
  md += `> **Note:**  \n`;
  md += `> This document is for AI agents and LLMs to follow when writing,  \n`;
  md += `> maintaining, or refactoring ${SKILL_CONFIG.description}.  \n`;
  md += `> Humans may find it useful, but guidance here is optimized for  \n`;
  md += `> AI-assisted workflows and automated consistency.\n\n`;
  md += `> [!NOTE]\n`;
  md += `> This document is automatically generated from individual rules in the \`rules/\` directory.\n`;
  md += `> Contributors should modify the source rules rather than this compiled file.\n\n`;
  md += `---\n\n`;
  md += `## Abstract\n\n`;
  md += `${metadata.abstract}\n\n`;
  md += `---\n\n`;
  md += `## Table of Contents\n\n`;

  // Generate TOC
  sections.forEach((section) => {
    md += `${section.number}. [${section.title}](#${section.number}-${slugify(
      section.title
    )}) (${section.impact})\n`;
    section.rules.forEach((rule) => {
      md += `   - ${rule.id} [${rule.title}](#${rule.id.replace(
        '.',
        ''
      )}-${slugify(rule.title)})\n`;
    });
  });

  md += `\n---\n\n`;

  // Generate sections
  sections.forEach((section) => {
    md += `## ${section.number}. ${section.title}\n\n`;
    md += `**Impact: ${section.impact}**\n\n`;
    if (section.introduction) {
      md += `${section.introduction}\n\n`;
    }
    md += `---\n\n`;

    section.rules.forEach((rule) => {
      md += `### ${rule.id} ${rule.title}\n\n`;
      md += `**Impact: ${rule.impact}`;
      if (rule.impactDescription) {
        md += ` (${rule.impactDescription})`;
      }
      md += `**\n\n`;

      if (rule.tags && rule.tags.length > 0) {
        md += `_Tags: ${rule.tags.join(', ')}_\n\n`;
      }

      md += `${rule.explanation}\n\n`;

      rule.examples.forEach((example) => {
        const label = example.type === 'incorrect' ? 'Incorrect' : 'Correct';
        const desc = example.description ? ` (${example.description})` : '';
        md += `**${label}${desc}:**\n\n`;
        md += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
      });

      if (rule.references && rule.references.length > 0) {
        md += `Reference: ${rule.references
          .map((ref) => `[${ref}](${ref})`)
          .join(', ')}\n\n`;
      }
    });

    md += `---\n\n`;
  });

  // Add references section
  if (metadata.references && metadata.references.length > 0) {
    md += `## References\n\n`;
    metadata.references.forEach((ref, i) => {
      md += `${i + 1}. [${ref}](${ref})\n`;
    });
  }

  return md;
}

/**
 * Main build function
 */
async function build() {
  try {
    console.log('Building AGENTS.md from rules...');
    console.log(`  Rules directory: ${SKILL_CONFIG.rulesDir}`);
    console.log(`  Output file: ${SKILL_CONFIG.outputFile}`);

    // Read all rule files (exclude files starting with _ and README.md)
    const files = await readdir(SKILL_CONFIG.rulesDir);
    const ruleFiles = files
      .filter(
        (f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md'
      )
      .sort(); // Sort filenames for consistent ordering

    const ruleData: RuleFile[] = [];
    for (const file of ruleFiles) {
      const filePath = join(SKILL_CONFIG.rulesDir, file);
      try {
        const parsed = await parseRuleFile(filePath, SKILL_CONFIG.sectionMap);
        ruleData.push(parsed);
      } catch (error) {
        console.error(`  Error parsing ${file}:`, error);
      }
    }

    // Group rules by section
    const sectionsMap = new Map<number, Section>();

    ruleData.forEach(({ section, rule }) => {
      if (!sectionsMap.has(section)) {
        sectionsMap.set(section, {
          number: section,
          title: `Section ${section}`,
          impact: rule.impact,
          rules: [],
        });
      }
      sectionsMap.get(section)!.rules.push(rule);
    });

    // Sort rules within each section by title
    sectionsMap.forEach((section) => {
      section.rules.sort((a, b) =>
        a.title.localeCompare(b.title, 'en-US', { sensitivity: 'base' })
      );

      // Assign IDs based on sorted order
      section.rules.forEach((rule, index) => {
        rule.id = `${section.number}.${index + 1}`;
        rule.subsection = index + 1;
      });
    });

    // Convert to array and sort
    const sections = Array.from(sectionsMap.values()).sort(
      (a, b) => a.number - b.number
    );

    // Read section metadata from _sections.md
    const sectionsFile = join(SKILL_CONFIG.rulesDir, '_sections.md');
    try {
      const sectionsContent = await readFile(sectionsFile, 'utf-8');
      const sectionBlocks = sectionsContent
        .split(/(?=^## \d+\. )/m)
        .filter(Boolean);

      for (const block of sectionBlocks) {
        const numberMatch = block.match(/^## (\d+)\. (.+)/m);
        const impactMatch = block.match(
          /\*\*Impact:\*\*\s*(CRITICAL|HIGH|MEDIUM|LOW)/i
        );
        const descMatch = block.match(/\*\*Description:\*\*\s*(.+)/i);

        if (numberMatch) {
          const sectionNumber = parseInt(numberMatch[1]);
          const sectionTitle = numberMatch[2].trim();
          const impactLevel = (
            impactMatch ? impactMatch[1].toUpperCase() : 'MEDIUM'
          ) as ImpactLevel;
          const description = descMatch ? descMatch[1].trim() : '';

          const section = sections.find((s) => s.number === sectionNumber);
          if (section) {
            section.title = sectionTitle;
            section.impact = impactLevel;
            section.introduction = description;
          }
        }
      }
    } catch (error) {
      console.warn('  Warning: Could not read _sections.md, using defaults');
    }

    // Read metadata
    let metadata: Metadata;
    try {
      const metadataContent = await readFile(
        SKILL_CONFIG.metadataFile,
        'utf-8'
      );
      metadata = JSON.parse(metadataContent);
    } catch {
      metadata = {
        version: '0.1.0',
        organization: 'AIReady',
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        abstract: `Guidelines for writing ${SKILL_CONFIG.description} that AI coding assistants can understand and maintain effectively.`,
      };
    }

    // Upgrade version if flag is passed
    if (upgradeVersion) {
      const oldVersion = metadata.version;
      metadata.version = incrementVersion(oldVersion);
      console.log(`  Upgrading version: ${oldVersion} -> ${metadata.version}`);

      // Write updated metadata.json
      await writeFile(
        SKILL_CONFIG.metadataFile,
        JSON.stringify(metadata, null, 2) + '\n',
        'utf-8'
      );
      console.log(`  ✓ Updated metadata.json`);

      // Update SKILL.md frontmatter if it exists
      const skillFile = join(SKILL_CONFIG.skillDir, 'SKILL.md');
      try {
        const skillContent = await readFile(skillFile, 'utf-8');
        const updatedSkillContent = skillContent.replace(
          /^(---[\s\S]*?version:\s*)"[^"]*"([\s\S]*?---)$/m,
          `$1"${metadata.version}"$2`
        );
        await writeFile(skillFile, updatedSkillContent, 'utf-8');
        console.log(`  ✓ Updated SKILL.md`);
      } catch {
        // SKILL.md doesn't exist yet, skip
      }
    }

    // Generate markdown
    const markdown = generateMarkdown(sections, metadata);

    // Write output
    await writeFile(SKILL_CONFIG.outputFile, markdown, 'utf-8');

    console.log(
      `  ✓ Built AGENTS.md with ${sections.length} sections and ${ruleData.length} rules`
    );
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
