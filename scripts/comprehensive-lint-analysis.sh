#!/bin/bash

# 🔧 NeonHub Comprehensive Lint-Error Analysis & Report
# Adapted for monorepo workspace structure

set -e

echo "🚀 Starting NeonHub Comprehensive Lint Analysis..."

# Define workspaces based on actual project structure
WORKSPACES=(
  "apps/api"
  "apps/dashboard"
  "packages/core-agents"
  "packages/data-model"
  "packages/reasoning-engine"
  "packages/types"
  "packages/utils"
)

# Create reports directory
mkdir -p reports/lint-analysis
echo "📁 Created reports directory"

# Function to check if directory exists and has package.json
check_workspace() {
  local workspace=$1
  if [[ ! -d "$workspace" ]]; then
    echo "⚠️  Workspace $workspace not found"
    return 1
  fi
  if [[ ! -f "$workspace/package.json" ]]; then
    echo "⚠️  No package.json found in $workspace"
    return 1
  fi
  return 0
}

# Function to install dependencies if needed
ensure_dependencies() {
  local workspace=$1
  echo "📦 Ensuring dependencies for $workspace..."
  
  cd "$workspace"
  
  # Check if node_modules exists and package-lock.json is newer
  if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
    echo "⬇️  Installing dependencies for $workspace..."
    npm install --silent --no-audit --no-fund
  else
    echo "✅ Dependencies up to date for $workspace"
  fi
  
  cd - > /dev/null
}

# Function to run ESLint for a workspace
run_eslint() {
  local workspace=$1
  local workspace_name=$(basename "$workspace")
  local output_file="$PWD/reports/lint-analysis/${workspace_name}-eslint.json"
  
  echo "🔍 Running ESLint for $workspace..."
  
  cd "$workspace"
  
  # Check if ESLint is available
  if ! npx eslint --version &> /dev/null; then
    echo "⚠️  ESLint not available in $workspace, skipping..."
    echo "[]" > "$output_file"
    cd - > /dev/null
    return
  fi
  
  # Run ESLint with JSON output, separate stdout from stderr  
  local eslint_output
  eslint_output=$(npx eslint . --format json --ext .ts,.tsx,.js,.jsx 2>/dev/null) || true
  
  # If no output or empty, create empty array
  if [[ -z "$eslint_output" ]]; then
    eslint_output="[]"
  fi
  
  # Write output to file
  echo "$eslint_output" > "$output_file"
  
  # Check if we got valid JSON output
  if [[ "$eslint_output" == "["* ]]; then
    echo "✅ ESLint completed for $workspace (results captured)"
  else
    echo "⚠️  ESLint output may be invalid for $workspace"
  fi
  
  cd - > /dev/null
}

# Scan each workspace
for workspace in "${WORKSPACES[@]}"; do
  echo ""
  echo "🔍 Processing workspace: $workspace"
  
  if check_workspace "$workspace"; then
    ensure_dependencies "$workspace"
    run_eslint "$workspace"
  else
    echo "❌ Skipped $workspace"
    # Create empty report for consistency
    workspace_name=$(basename "$workspace")
    echo "[]" > "$PWD/reports/lint-analysis/${workspace_name}-eslint.json"
  fi
done

# Generate comprehensive markdown report
echo ""
echo "📊 Generating comprehensive report..."

cat > "reports/lint-analysis/generate-report.js" << 'JS'
const fs = require("fs");
const path = require("path");

const reportsDir = path.resolve("reports/lint-analysis");
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith("-eslint.json"));

let totalErrors = 0;
let totalWarnings = 0;
let totalFiles = 0;
let globalRules = {};
let globalSeverities = { error: 0, warning: 0 };

let md = `# 🚨 NeonHub ESLint Analysis Report\n\n`;
md += `_Generated on ${new Date().toLocaleString()}_\n\n`;
md += `## 📋 Executive Summary\n\n`;

let summaryTable = `| Workspace | Total Issues | Errors | Warnings | Files Affected |\n`;
summaryTable += `|-----------|--------------|---------|----------|----------------|\n`;

let detailedReports = `\n## 📦 Detailed Workspace Reports\n\n`;

for (const file of files) {
  const workspaceName = file.replace("-eslint.json", "");
  const filePath = path.join(reportsDir, file);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let workspaceErrors = 0;
    let workspaceWarnings = 0;
    let workspaceFiles = 0;
    let workspaceRules = {};
    let filesWithIssues = {};
    
    for (const result of data) {
      if (result.messages && result.messages.length > 0) {
        workspaceFiles++;
        const relativePath = result.filePath.replace(process.cwd() + "/", "");
        filesWithIssues[relativePath] = result.messages.length;
        
        for (const message of result.messages) {
          if (message.severity === 2) {
            workspaceErrors++;
            globalSeverities.error++;
          } else {
            workspaceWarnings++;
            globalSeverities.warning++;
          }
          
          const ruleId = message.ruleId || 'unknown';
          workspaceRules[ruleId] = (workspaceRules[ruleId] || 0) + 1;
          globalRules[ruleId] = (globalRules[ruleId] || 0) + 1;
        }
      }
    }
    
    const totalIssues = workspaceErrors + workspaceWarnings;
    totalErrors += workspaceErrors;
    totalWarnings += workspaceWarnings;
    totalFiles += workspaceFiles;
    
    // Add to summary table
    summaryTable += `| ${workspaceName} | ${totalIssues} | ${workspaceErrors} | ${workspaceWarnings} | ${workspaceFiles} |\n`;
    
    // Add detailed report
    detailedReports += `### 🔧 ${workspaceName}\n\n`;
    detailedReports += `- **Total Issues**: ${totalIssues}\n`;
    detailedReports += `- **Errors**: ${workspaceErrors}\n`;
    detailedReports += `- **Warnings**: ${workspaceWarnings}\n`;
    detailedReports += `- **Files Affected**: ${workspaceFiles}\n\n`;
    
    if (totalIssues > 0) {
      // Top rules
      const topRules = Object.entries(workspaceRules)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      if (topRules.length > 0) {
        detailedReports += `**🔴 Top Rules Violated:**\n`;
        for (const [rule, count] of topRules) {
          detailedReports += `- **${rule}**: ${count} occurrences\n`;
        }
        detailedReports += `\n`;
      }
      
      // Top files
      const topFiles = Object.entries(filesWithIssues)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      if (topFiles.length > 0) {
        detailedReports += `**📁 Most Problematic Files:**\n`;
        for (const [file, count] of topFiles) {
          detailedReports += `- \`${file}\`: ${count} issues\n`;
        }
        detailedReports += `\n`;
      }
    }
    
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
    summaryTable += `| ${workspaceName} | ERROR | - | - | - |\n`;
    detailedReports += `### ❌ ${workspaceName}\n\nError processing lint results.\n\n`;
  }
}

// Complete executive summary
md += summaryTable;
md += `\n**Overall Statistics:**\n`;
md += `- **Total Issues**: ${totalErrors + totalWarnings}\n`;
md += `- **Total Errors**: ${totalErrors}\n`;
md += `- **Total Warnings**: ${totalWarnings}\n`;
md += `- **Files with Issues**: ${totalFiles}\n\n`;

// Global top rules
const globalTopRules = Object.entries(globalRules)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

if (globalTopRules.length > 0) {
  md += `## 🎯 Most Common Rule Violations (Platform-wide)\n\n`;
  for (const [rule, count] of globalTopRules) {
    const percentage = ((count / (totalErrors + totalWarnings)) * 100).toFixed(1);
    md += `1. **${rule}**: ${count} occurrences (${percentage}%)\n`;
  }
  md += `\n`;
}

// Recommendations
md += `## 💡 Recommendations\n\n`;

if (totalErrors > 0) {
  md += `### 🚨 Priority 1: Fix Errors (${totalErrors} total)\n`;
  md += `Errors must be resolved as they can break the build or cause runtime issues.\n\n`;
}

if (totalWarnings > 0) {
  md += `### ⚠️ Priority 2: Address Warnings (${totalWarnings} total)\n`;
  md += `Warnings indicate potential issues or code quality concerns.\n\n`;
}

if (globalTopRules.length > 0) {
  md += `### 🔧 Priority 3: Configure Rules\n`;
  md += `Consider updating ESLint configuration to address the most common violations:\n\n`;
  
  const topThreeRules = globalTopRules.slice(0, 3);
  for (const [rule, count] of topThreeRules) {
    md += `- **${rule}**: Consider if this rule should be disabled, configured differently, or if code should be updated\n`;
  }
  md += `\n`;
}

md += `## 🛠️ Next Steps\n\n`;
md += `1. **Run individual fixes**: \`npm run lint:fix --workspace=<workspace-name>\`\n`;
md += `2. **Focus on high-impact files**: Start with files that have the most issues\n`;
md += `3. **Review rule configuration**: Consider adjusting ESLint rules based on patterns\n`;
md += `4. **Set up pre-commit hooks**: Prevent future lint issues with automated checks\n\n`;

md += detailedReports;

// Write the comprehensive report
fs.writeFileSync(path.join(reportsDir, "comprehensive-lint-report.md"), md);
console.log("✅ Comprehensive report generated: reports/lint-analysis/comprehensive-lint-report.md");

// Also create a JSON summary for programmatic access
const summary = {
  timestamp: new Date().toISOString(),
  totalIssues: totalErrors + totalWarnings,
  totalErrors,
  totalWarnings,
  totalFiles,
  workspaces: files.map(f => f.replace("-eslint.json", "")),
  topRules: globalTopRules.slice(0, 10),
  severity: globalSeverities
};

fs.writeFileSync(path.join(reportsDir, "lint-summary.json"), JSON.stringify(summary, null, 2));
console.log("✅ JSON summary generated: reports/lint-analysis/lint-summary.json");
JS

# Run the report generator
node "reports/lint-analysis/generate-report.js"

# Clean up
rm "reports/lint-analysis/generate-report.js"

echo ""
echo "🎉 Lint analysis complete!"
echo "📊 View the comprehensive report: reports/lint-analysis/comprehensive-lint-report.md"
echo "📋 JSON summary available: reports/lint-analysis/lint-summary.json"
echo ""
echo "🚀 To fix issues automatically, run:"
echo "   npm run lint:fix --workspace=<workspace-name>"
echo ""
echo "🔍 To view the report:"
echo "   cat reports/lint-analysis/comprehensive-lint-report.md"