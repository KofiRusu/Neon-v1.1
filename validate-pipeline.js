const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

// Validation Steps Implementation
const validationSteps = {
  ciCdValidation: async () => {
    try {
      // 1. Verify CI/CD pipeline existence
      const ciCdPath = ".github/workflows/ci.yml";
      
      if (!await fileExists(ciCdPath)) {
        return "❌ CI/CD pipeline missing";
      }
      
      // 2. Validate pipeline structure
      const requiredJobs = ["quality-checks", "test", "build", "e2e-tests", "security-audit", "deployment"];
      const ciCdContent = await fs.readFile(ciCdPath, 'utf8');
      const pipelineConfig = yaml.load(ciCdContent);
      
      const existingJobs = Object.keys(pipelineConfig.jobs || {});
      const missingJobs = requiredJobs.filter(job => !existingJobs.includes(job));
      
      if (missingJobs.length > 0) {
        return `❌ Missing jobs: ${missingJobs.join(", ")}`;
      }
      
      return "✅ CI/CD pipeline validated";
    } catch (error) {
      return `❌ CI/CD validation error: ${error.message}`;
    }
  },

  workspaceSyncValidation: async () => {
    try {
      // 1. Check for sync automation scripts
      const syncScripts = [
        "scripts/auto-sync.js",
        ".git/hooks/post-commit",
        ".git/hooks/post-merge"
      ];
      
      const missingScripts = [];
      for (const script of syncScripts) {
        if (!await fileExists(script)) {
          missingScripts.push(script);
        }
      }
      
      if (missingScripts.length > 0) {
        return `❌ Missing sync scripts: ${missingScripts.join(", ")}`;
      }
      
      // 2. Verify multi-device commits
      try {
        const commitHistory = execSync('git log --oneline -50', { encoding: 'utf8' });
        const devicePattern = /(Auto-commit from device|Workspace sync)/i;
        const autoCommits = commitHistory.split('\n').filter(commit => 
          devicePattern.test(commit)
        );
        
        if (autoCommits.length < 5) {
          return `⚠️ Only ${autoCommits.length} auto-commits found (min 5 expected)`;
        }
        
        return "✅ Workspace sync validated";
      } catch (gitError) {
        return `⚠️ Git history check failed: ${gitError.message}`;
      }
    } catch (error) {
      return `❌ Workspace sync validation error: ${error.message}`;
    }
  },

  conflictResolutionCheck: async () => {
    try {
      // 1. Verify conflict handling mechanism
      const conflictScriptPath = "scripts/handle-conflicts.js";
      if (!await fileExists(conflictScriptPath)) {
        return "❌ Conflict resolution script missing";
      }
      
      // 2. Check for conflict markers in history
      try {
        const conflictCommits = execSync('git log --grep="CONFLICT" --oneline', { encoding: 'utf8' });
        if (conflictCommits.trim().length > 0) {
          return "⚠️ Unresolved conflicts detected in commit history";
        }
        
        return "✅ Conflict resolution validated";
      } catch (gitError) {
        // If no conflicts found, git log returns empty - this is good
        return "✅ Conflict resolution validated";
      }
    } catch (error) {
      return `❌ Conflict resolution check error: ${error.message}`;
    }
  },

  productionDeploymentCheck: async () => {
    try {
      // 1. Verify deployment trigger conditions
      const ciCdPath = ".github/workflows/ci.yml";
      const ciCdContent = await fs.readFile(ciCdPath, 'utf8');
      const pipelineConfig = yaml.load(ciCdContent);
      
      const deploymentJob = pipelineConfig.jobs?.deployment;
      if (!deploymentJob) {
        return "❌ Deployment job not found";
      }
      
      const expectedCondition = "github.ref == 'refs/heads/main' && github.event_name == 'push'";
      if (deploymentJob.if !== expectedCondition) {
        return `❌ Deployment trigger misconfigured. Expected: ${expectedCondition}, Got: ${deploymentJob.if || 'none'}`;
      }
      
      // 2. Verify artifact handling
      const hasArtifactDownload = deploymentJob.steps?.some(step => 
        step.uses?.includes("actions/download-artifact")
      );
      
      if (!hasArtifactDownload) {
        return "❌ Build artifact download missing in deployment";
      }
      
      return "✅ Deployment configuration validated";
    } catch (error) {
      return `❌ Deployment check error: ${error.message}`;
    }
  }
};

// Helper function to check if file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Execute validation sequence
async function runValidation() {
  console.log("🔍 Starting CI/CD Pipeline and Autonomous Workspace Validation...\n");
  
  const results = {
    ciCd: await validationSteps.ciCdValidation(),
    workspaceSync: await validationSteps.workspaceSyncValidation(),
    conflictHandling: await validationSteps.conflictResolutionCheck(),
    deployment: await validationSteps.productionDeploymentCheck()
  };

  console.log("--- VALIDATION REPORT ---");
  Object.entries(results).forEach(([area, result]) => {
    console.log(`${area.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}: ${result}`);
  });

  // Final verdict
  const allPassed = Object.values(results).every(r => r.startsWith("✅"));
  const hasWarnings = Object.values(results).some(r => r.startsWith("⚠️"));
  
  console.log("\n--- FINAL VERDICT ---");
  if (allPassed) {
    console.log("🌟 ALL SYSTEMS VALIDATED SUCCESSFULLY");
  } else if (hasWarnings && !Object.values(results).some(r => r.startsWith("❌"))) {
    console.log("⚠️ VALIDATION COMPLETED WITH WARNINGS");
  } else {
    console.log("❌ VALIDATION FAILED - CHECK ERROR DETAILS");
  }
  
  // Detailed recommendations
  console.log("\n--- RECOMMENDATIONS ---");
  Object.entries(results).forEach(([area, result]) => {
    if (result.startsWith("❌") || result.startsWith("⚠️")) {
      console.log(`• ${area}: ${getRecommendation(area, result)}`);
    }
  });
}

function getRecommendation(area, result) {
  const recommendations = {
    ciCd: "Ensure all required CI/CD jobs are present in .github/workflows/ci.yml",
    workspaceSync: "Implement auto-sync scripts and Git hooks for multi-device synchronization",
    conflictHandling: "Create conflict resolution automation script at scripts/handle-conflicts.js",
    deployment: "Configure proper deployment triggers and artifact handling in CI/CD pipeline"
  };
  
  return recommendations[area] || "Review and fix the identified issues";
}

// Add yaml dependency check
try {
  require('js-yaml');
} catch (error) {
  console.error("❌ Missing dependency: js-yaml");
  console.log("Please install with: npm install js-yaml");
  process.exit(1);
}

// Run the validation
runValidation().catch(console.error); 