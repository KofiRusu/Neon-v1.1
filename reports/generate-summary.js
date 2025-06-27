const fs = require('fs');
const path = require('path');

const dir = path.resolve('.');
const files = fs.readdirSync(dir).filter(f => f.endsWith('-eslint.json'));

let md = `# 🚨 NeonHub ESLint Analysis Report\n\n`;
md += `_Generated on ${new Date().toLocaleString()}_\n\n`;
md += `## 📊 Executive Summary\n\n`;

let globalTotal = 0;
const globalRules = {};
const moduleStats = [];

// Process each module
for (const file of files) {
  const module = file.replace('-eslint.json', '');
  console.log(`Processing ${file}...`);

  try {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));

    let total = 0;
    const rules = {};
    const filesMap = {};
    let errorCount = 0;
    let warningCount = 0;

    for (const result of data) {
      if (!result.messages || result.messages.length === 0) continue;

      const rel = result.filePath ? result.filePath.replace(`${process.cwd()  }/`, '') : 'unknown';
      const count = result.messages.length;

      total += count;
      globalTotal += count;
      filesMap[rel] = (filesMap[rel] || 0) + count;

      for (const message of result.messages) {
        const rule = message.ruleId || 'no-rule';
        rules[rule] = (rules[rule] || 0) + 1;
        globalRules[rule] = (globalRules[rule] || 0) + 1;

        if (message.severity === 2) errorCount++;
        else if (message.severity === 1) warningCount++;
      }
    }

    moduleStats.push({
      name: module,
      total,
      errors: errorCount,
      warnings: warningCount,
      files: Object.keys(filesMap).length,
      topRules: Object.entries(rules)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topFiles: Object.entries(filesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    });
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
    moduleStats.push({
      name: module,
      total: 0,
      errors: 0,
      warnings: 0,
      files: 0,
      topRules: [],
      topFiles: [],
    });
  }
}

// Sort modules by total issues
moduleStats.sort((a, b) => b.total - a.total);

// Generate summary table
md += `| Module | Total Issues | Errors | Warnings | Files |\n`;
md += `|--------|-------------|--------|----------|-------|\n`;

for (const stat of moduleStats) {
  md += `| **${stat.name}** | ${stat.total} | ${stat.errors} | ${stat.warnings} | ${stat.files} |\n`;
}

md += `| **TOTAL** | **${globalTotal}** | **${moduleStats.reduce((sum, s) => sum + s.errors, 0)}** | **${moduleStats.reduce((sum, s) => sum + s.warnings, 0)}** | **${moduleStats.reduce((sum, s) => sum + s.files, 0)}** |\n\n`;

// Global top rules
const topGlobalRules = Object.entries(globalRules)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);
md += `## 🎯 Top 15 Rule Violations (Platform-wide)\n\n`;
for (const [rule, count] of topGlobalRules) {
  md += `- **${rule}**: ${count} occurrences\n`;
}

// Detailed module reports
md += `\n## 📦 Detailed Module Reports\n\n`;

for (const stat of moduleStats) {
  if (stat.total === 0) continue; // Skip modules with no issues

  md += `### 🔍 ${stat.name}\n\n`;
  md += `- **Total Issues**: ${stat.total}\n`;
  md += `- **Errors**: ${stat.errors}\n`;
  md += `- **Warnings**: ${stat.warnings}\n`;
  md += `- **Files Affected**: ${stat.files}\n\n`;

  if (stat.topRules.length > 0) {
    md += `**Top Rule Violations**:\n`;
    for (const [rule, count] of stat.topRules) {
      md += `- \`${rule}\`: ${count}\n`;
    }
    md += `\n`;
  }

  if (stat.topFiles.length > 0) {
    md += `**Most Problematic Files**:\n`;
    for (const [file, count] of stat.topFiles) {
      const shortFile = file.length > 80 ? `...${  file.slice(-77)}` : file;
      md += `- \`${shortFile}\`: ${count} issues\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
}

// Quality assessment
md += `## 🎖️ Code Quality Assessment\n\n`;

if (globalTotal === 0) {
  md += `🎉 **EXCELLENT**: No lint issues found across the platform!\n\n`;
} else if (globalTotal < 10) {
  md += `✅ **VERY GOOD**: Minimal issues found (${globalTotal} total)\n\n`;
} else if (globalTotal < 50) {
  md += `⚠️ **GOOD**: Some issues to address (${globalTotal} total)\n\n`;
} else if (globalTotal < 200) {
  md += `🔧 **NEEDS ATTENTION**: Multiple issues requiring fixes (${globalTotal} total)\n\n`;
} else if (globalTotal < 1000) {
  md += `🚨 **CRITICAL**: High number of issues requiring immediate attention (${globalTotal} total)\n\n`;
} else {
  md += `🔥 **EMERGENCY**: Extremely high number of issues - requires coordinated cleanup effort (${globalTotal} total)\n\n`;
}

// Priority recommendations
md += `## 🚨 Priority Actions\n\n`;

if (globalTotal > 100) {
  md += `### Immediate Actions (This Week)\n`;
  md += `1. **Focus on Errors First**: ${moduleStats.reduce((sum, s) => sum + s.errors, 0)} errors need immediate attention\n`;
  md += `2. **Top 3 Modules**: Address ${moduleStats
    .slice(0, 3)
    .map(s => s.name)
    .join(', ')} first\n`;
  md += `3. **Auto-fix Rules**: Run automated fixes for rules like unused variables, formatting issues\n\n`;

  md += `### Medium Term (Next 2 Weeks)\n`;
  md += `1. **Systematic Cleanup**: Work through remaining ${moduleStats.reduce((sum, s) => sum + s.warnings, 0)} warnings\n`;
  md += `2. **Code Review Process**: Implement stricter pre-commit hooks\n`;
  md += `3. **ESLint Configuration**: Review and adjust rules for team consistency\n\n`;
}

// Recommendations
md += `## 💡 Detailed Recommendations\n\n`;

if (globalTotal > 0) {
  md += `1. **Priority Focus**: Address the top rule violations listed above\n`;
  md += `2. **File-by-File**: Start with the most problematic files in each module\n`;
  md += `3. **Automated Fixes**: Run \`npm run lint:fix\` where possible\n`;
  md += `4. **Code Reviews**: Implement stricter pre-commit hooks\n`;
  md += `5. **Configuration**: Consider adjusting ESLint rules for consistency\n`;
  md += `6. **CI/CD Integration**: Add lint checks to prevent new violations\n`;
  md += `7. **Team Training**: Ensure all developers understand the coding standards\n\n`;
}

md += `## 🛠️ Quick Fix Commands\n\n`;
md += `\`\`\`bash\n`;
md += `# Fix auto-fixable issues across all workspaces\n`;
md += `npm run lint:fix\n\n`;
md += `# Check specific modules\n`;
md += `cd apps/api && npm run lint\n`;
md += `cd apps/dashboard && npx eslint . --fix\n`;
md += `cd packages/core-agents && npm run lint\n`;
md += `cd packages/data-model && npm run lint\n\n`;
md += `# Type check all modules\n`;
md += `npm run type-check\n\n`;
md += `# Run tests to ensure fixes don't break functionality\n`;
md += `npm run test\n`;
md += `\`\`\`\n\n`;

// Module-specific recommendations
md += `## 🎯 Module-Specific Action Plans\n\n`;

for (const stat of moduleStats.slice(0, 3)) {
  // Top 3 problematic modules
  if (stat.total === 0) continue;

  md += `### ${stat.name}\n`;
  md += `**Status**: ${stat.total} issues (${stat.errors} errors, ${stat.warnings} warnings)\n\n`;
  md += `**Immediate Actions**:\n`;

  if (stat.topRules.length > 0) {
    md += `- Fix \`${stat.topRules[0][0]}\` violations (${stat.topRules[0][1]} occurrences)\n`;
    if (stat.topRules[1])
      md += `- Address \`${stat.topRules[1][0]}\` issues (${stat.topRules[1][1]} occurrences)\n`;
  }

  if (stat.topFiles.length > 0) {
    const topFile = stat.topFiles[0][0].split('/').pop();
    md += `- Start with \`${topFile}\` (${stat.topFiles[0][1]} issues)\n`;
  }

  md += `\n`;
}

md += `---\n`;
md += `*Report generated by NeonHub Comprehensive Lint Analysis Tool*\n`;
md += `*Analysis completed at ${new Date().toISOString()}*\n`;

fs.writeFileSync(path.join(dir, 'ESLint-Summary.md'), md);
console.log('✅ ESLint-Summary.md generated successfully');
console.log(
  `📊 Analysis complete: ${globalTotal} total issues found across ${moduleStats.length} modules`
);
