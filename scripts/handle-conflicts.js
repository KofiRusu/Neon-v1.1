#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Conflict Resolution Handler
 * Automatically detects and resolves common merge conflicts
 */

class ConflictHandler {
  constructor() {
    this.conflictMarkers = {
      start: '<<<<<<< HEAD',
      separator: '=======',
      end: '>>>>>>> '
    };
    this.logFile = path.join(process.cwd(), '.conflict-log.json');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    
    console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`);
    
    // Append to log file
    let logs = [];
    if (fs.existsSync(this.logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
      } catch (e) {
        logs = [];
      }
    }
    
    logs.push(logEntry);
    // Keep only last 50 entries
    if (logs.length > 50) {
      logs = logs.slice(-50);
    }
    
    fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
  }

  detectConflicts() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const conflictedFiles = status
        .split('\n')
        .filter(line => line.startsWith('UU ') || line.startsWith('AA '))
        .map(line => line.substring(3));
      
      return conflictedFiles;
    } catch (error) {
      this.log(`Failed to detect conflicts: ${error.message}`, 'error');
      return [];
    }
  }

  analyzeConflict(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const conflicts = [];
      
      let inConflict = false;
      let conflictStart = -1;
      let separatorIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith(this.conflictMarkers.start)) {
          inConflict = true;
          conflictStart = i;
        } else if (line.startsWith(this.conflictMarkers.separator) && inConflict) {
          separatorIndex = i;
        } else if (line.startsWith(this.conflictMarkers.end) && inConflict) {
          const conflictEnd = i;
          
          conflicts.push({
            start: conflictStart,
            separator: separatorIndex,
            end: conflictEnd,
            headContent: lines.slice(conflictStart + 1, separatorIndex),
            incomingContent: lines.slice(separatorIndex + 1, conflictEnd),
            branchName: line.substring(this.conflictMarkers.end.length)
          });
          
          inConflict = false;
          conflictStart = -1;
          separatorIndex = -1;
        }
      }
      
      return { conflicts, lines };
    } catch (error) {
      this.log(`Failed to analyze conflict in ${filePath}: ${error.message}`, 'error');
      return { conflicts: [], lines: [] };
    }
  }

  resolveConflict(filePath, strategy = 'smart') {
    const { conflicts, lines } = this.analyzeConflict(filePath);
    
    if (conflicts.length === 0) {
      this.log(`No conflicts found in ${filePath}`);
      return true;
    }
    
    this.log(`Resolving ${conflicts.length} conflicts in ${filePath} using ${strategy} strategy`);
    
    let resolvedLines = [...lines];
    
    // Process conflicts in reverse order to maintain line indices
    for (let i = conflicts.length - 1; i >= 0; i--) {
      const conflict = conflicts[i];
      const resolution = this.getResolution(conflict, strategy);
      
      // Replace conflict block with resolution
      resolvedLines.splice(
        conflict.start,
        conflict.end - conflict.start + 1,
        ...resolution
      );
    }
    
    try {
      fs.writeFileSync(filePath, resolvedLines.join('\n'));
      this.log(`Successfully resolved conflicts in ${filePath}`);
      return true;
    } catch (error) {
      this.log(`Failed to write resolved file ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  getResolution(conflict, strategy) {
    switch (strategy) {
      case 'head':
        return conflict.headContent;
      
      case 'incoming':
        return conflict.incomingContent;
      
      case 'both':
        return [...conflict.headContent, ...conflict.incomingContent];
      
      case 'smart':
      default:
        return this.smartResolve(conflict);
    }
  }

  smartResolve(conflict) {
    const headContent = conflict.headContent;
    const incomingContent = conflict.incomingContent;
    
    // If one side is empty, use the other
    if (headContent.length === 0) return incomingContent;
    if (incomingContent.length === 0) return headContent;
    
    // If both sides are identical, use one
    if (JSON.stringify(headContent) === JSON.stringify(incomingContent)) {
      return headContent;
    }
    
    // For package.json dependencies, merge them
    if (this.isPackageJsonDependencyConflict(headContent, incomingContent)) {
      return this.mergeDependencies(headContent, incomingContent);
    }
    
    // For imports, combine unique imports
    if (this.isImportConflict(headContent, incomingContent)) {
      return this.mergeImports(headContent, incomingContent);
    }
    
    // Default: prefer HEAD but add a comment about the conflict
    return [
      ...headContent,
      '// CONFLICT RESOLUTION: Combined changes from both branches',
      ...incomingContent.map(line => `// INCOMING: ${line}`)
    ];
  }

  isPackageJsonDependencyConflict(headContent, incomingContent) {
    const allLines = [...headContent, ...incomingContent];
    return allLines.some(line => 
      line.includes('"dependencies"') || 
      line.includes('"devDependencies"') ||
      line.match(/^\s*"[^"]+"\s*:\s*"[^"]+"\s*,?\s*$/)
    );
  }

  mergeDependencies(headContent, incomingContent) {
    // Simple merge for now - in practice, you'd want more sophisticated logic
    const merged = [...new Set([...headContent, ...incomingContent])];
    return merged.sort();
  }

  isImportConflict(headContent, incomingContent) {
    const allLines = [...headContent, ...incomingContent];
    return allLines.some(line => 
      line.trim().startsWith('import ') || 
      line.trim().startsWith('const ') ||
      line.trim().startsWith('require(')
    );
  }

  mergeImports(headContent, incomingContent) {
    // Combine and deduplicate imports
    const allImports = [...headContent, ...incomingContent];
    const uniqueImports = [...new Set(allImports.map(line => line.trim()))]
      .filter(line => line.length > 0)
      .map(line => line);
    
    return uniqueImports.sort();
  }

  async handleAllConflicts(strategy = 'smart') {
    this.log('Starting conflict resolution process...');
    
    const conflictedFiles = this.detectConflicts();
    
    if (conflictedFiles.length === 0) {
      this.log('No conflicts detected');
      return true;
    }
    
    this.log(`Found conflicts in ${conflictedFiles.length} files: ${conflictedFiles.join(', ')}`);
    
    let allResolved = true;
    
    for (const file of conflictedFiles) {
      const resolved = this.resolveConflict(file, strategy);
      if (!resolved) {
        allResolved = false;
      }
    }
    
    if (allResolved) {
      try {
        // Add resolved files to git
        execSync(`git add ${conflictedFiles.join(' ')}`, { encoding: 'utf8' });
        this.log('All conflicts resolved and files staged');
        
        // Create a commit for the conflict resolution
        const timestamp = new Date().toISOString();
        const commitMessage = `CONFLICT RESOLUTION: Auto-resolved conflicts at ${timestamp}

Resolved conflicts in:
${conflictedFiles.map(f => `- ${f}`).join('\n')}

Strategy: ${strategy}
Timestamp: ${timestamp}`;

        execSync(`git commit -m "${commitMessage}"`, { encoding: 'utf8' });
        this.log('Conflict resolution committed successfully');
        
        return true;
      } catch (error) {
        this.log(`Failed to commit conflict resolution: ${error.message}`, 'error');
        return false;
      }
    } else {
      this.log('Some conflicts could not be resolved automatically', 'warn');
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const handler = new ConflictHandler();
  const command = process.argv[2];
  const strategy = process.argv[3] || 'smart';
  
  switch (command) {
    case 'detect':
      const conflicts = handler.detectConflicts();
      console.log(`Found ${conflicts.length} conflicted files:`, conflicts);
      break;
    
    case 'resolve':
      handler.handleAllConflicts(strategy);
      break;
    
    case 'analyze':
      const file = process.argv[3];
      if (!file) {
        console.log('Usage: node handle-conflicts.js analyze <file>');
        process.exit(1);
      }
      const analysis = handler.analyzeConflict(file);
      console.log(`Found ${analysis.conflicts.length} conflicts in ${file}`);
      break;
    
    default:
      console.log(`
Usage: node handle-conflicts.js <command> [options]

Commands:
  detect           - Detect conflicted files
  resolve [strategy] - Resolve all conflicts (strategies: smart, head, incoming, both)
  analyze <file>   - Analyze conflicts in specific file

Examples:
  node scripts/handle-conflicts.js detect
  node scripts/handle-conflicts.js resolve smart
  node scripts/handle-conflicts.js analyze package.json
      `);
  }
}

module.exports = ConflictHandler; 