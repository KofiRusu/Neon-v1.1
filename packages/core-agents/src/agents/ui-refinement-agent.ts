import { AbstractAgent, AgentPayload, AgentResult } from '../base-agent';
import { promises as fs } from 'fs';
import path from 'path';

export interface ContrastIssue {
  file: string;
  line: number;
  element: string;
  currentBg: string;
  currentText: string;
  suggestedBg?: string;
  suggestedText?: string;
  contrastRatio: number;
  severity: 'low' | 'medium' | 'high';
}

export interface UIIssue {
  file: string;
  line: number;
  type: 'contrast' | 'spacing' | 'accessibility' | 'responsive' | 'theme';
  description: string;
  currentValue: string;
  suggestedValue: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UIRefinementResult {
  issues: UIIssue[];
  fixedIssues: UIIssue[];
  warnings: string[];
  filesModified: string[];
}

export class UIRefinementAgent extends AbstractAgent {
  private readonly logPath = path.join(process.cwd(), 'logs', 'ui-refinements.log');
  
  // WCAG contrast ratio thresholds
  private readonly CONTRAST_THRESHOLDS = {
    AA_NORMAL: 4.5,
    AA_LARGE: 3.0,
    AAA_NORMAL: 7.0,
    AAA_LARGE: 4.5
  };

  // Common contrast-safe color mappings
  private readonly CONTRAST_FIXES = {
    'bg-neutral-900': {
      'text-neutral-700': 'text-neutral-100',
      'text-neutral-600': 'text-neutral-100',
      'text-neutral-500': 'text-neutral-200',
      'text-gray-700': 'text-gray-100',
      'text-gray-600': 'text-gray-100',
    },
    'bg-dark-900': {
      'text-dark-700': 'text-dark-100',
      'text-dark-600': 'text-dark-100',
      'text-dark-500': 'text-dark-200',
    },
    'bg-slate-900': {
      'text-slate-700': 'text-slate-100',
      'text-slate-600': 'text-slate-100',
      'text-slate-500': 'text-slate-200',
    }
  };

  constructor(id: string, name: string) {
    super(id, name, 'ui-refinement', [
      'check_contrast',
      'fix_contrast_issues',
      'validate_accessibility',
      'check_responsive_layout',
      'fix_theme_consistency',
      'audit_ui_patterns',
      'auto_fix_ui_issues'
    ]);
  }

  async execute(payload: AgentPayload): Promise<AgentResult> {
    return this.executeWithErrorHandling(payload, async () => {
      const { task, context } = payload;
      
      switch (task) {
        case 'check_contrast':
          return await this.checkContrast(context);
        case 'fix_contrast_issues':
          return await this.fixContrastIssues(context);
        case 'validate_accessibility':
          return await this.validateAccessibility(context);
        case 'check_responsive_layout':
          return await this.checkResponsiveLayout(context);
        case 'fix_theme_consistency':
          return await this.fixThemeConsistency(context);
        case 'audit_ui_patterns':
          return await this.auditUIPatterns(context);
        case 'auto_fix_ui_issues':
          return await this.autoFixUIIssues(context);
        default:
          throw new Error(`Unknown task: ${task}`);
      }
    });
  }

  private async checkContrast(context: any): Promise<UIRefinementResult> {
    const { targetDir = 'apps/dashboard/src' } = context;
    const issues: UIIssue[] = [];
    
    const tsxFiles = await this.findTSXFiles(targetDir);
    
    for (const filePath of tsxFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const contrastIssues = this.detectContrastIssues(line, filePath, index + 1);
        issues.push(...contrastIssues);
      });
    }

    await this.logActivity(`Contrast check completed. Found ${issues.length} issues.`);
    
    return {
      issues,
      fixedIssues: [],
      warnings: [],
      filesModified: []
    };
  }

  private async fixContrastIssues(context: any): Promise<UIRefinementResult> {
    const { targetDir = 'apps/dashboard/src', autoFix = true } = context;
    const issues: UIIssue[] = [];
    const fixedIssues: UIIssue[] = [];
    const filesModified: string[] = [];
    
    const tsxFiles = await this.findTSXFiles(targetDir);
    
    for (const filePath of tsxFiles) {
      let content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const contrastIssues = this.detectContrastIssues(line, filePath, i + 1);
        issues.push(...contrastIssues);
        
        if (autoFix && contrastIssues.length > 0) {
          const fixedLine = this.applyContrastFixes(line);
          if (fixedLine !== line) {
            lines[i] = fixedLine;
            fixedIssues.push(...contrastIssues.map(issue => ({
              ...issue,
              suggestedValue: fixedLine.trim()
            })));
          }
        }
      }
      
      const newContent = lines.join('\n');
      if (newContent !== originalContent) {
        if (autoFix) {
          await fs.writeFile(filePath, newContent, 'utf-8');
          filesModified.push(filePath);
        }
      }
    }

    if (filesModified.length > 0) {
      await this.logActivity(`Fixed contrast issues in ${filesModified.length} files: ${filesModified.join(', ')}`);
    }
    
    return {
      issues,
      fixedIssues,
      warnings: [],
      filesModified
    };
  }

  private async validateAccessibility(context: any): Promise<UIRefinementResult> {
    const { targetDir = 'apps/dashboard/src' } = context;
    const issues: UIIssue[] = [];
    
    const tsxFiles = await this.findTSXFiles(targetDir);
    
    for (const filePath of tsxFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for missing alt attributes on images
        if (line.includes('<img') && !line.includes('alt=')) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'accessibility',
            description: 'Image missing alt attribute',
            currentValue: line.trim(),
            suggestedValue: line.replace('<img', '<img alt=""'),
            severity: 'medium'
          });
        }
        
        // Check for buttons without accessible text
        if (line.includes('<button') && !line.includes('aria-label') && !line.includes('>')) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'accessibility',
            description: 'Button may need aria-label or visible text',
            currentValue: line.trim(),
            suggestedValue: line.replace('<button', '<button aria-label="Button description"'),
            severity: 'medium'
          });
        }
        
        // Check for form inputs without labels
        if (line.includes('<input') && !line.includes('aria-label') && !line.includes('id=')) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'accessibility',
            description: 'Input should have label or aria-label',
            currentValue: line.trim(),
            suggestedValue: line.replace('<input', '<input aria-label="Input description"'),
            severity: 'high'
          });
        }
      });
    }

    await this.logActivity(`Accessibility validation completed. Found ${issues.length} issues.`);
    
    return {
      issues,
      fixedIssues: [],
      warnings: [],
      filesModified: []
    };
  }

  private async checkResponsiveLayout(context: any): Promise<UIRefinementResult> {
    const { targetDir = 'apps/dashboard/src' } = context;
    const issues: UIIssue[] = [];
    
    const tsxFiles = await this.findTSXFiles(targetDir);
    
    for (const filePath of tsxFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for fixed widths that might not be responsive
        if (line.includes('w-[') && /w-\[\d+px\]/.test(line)) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'responsive',
            description: 'Fixed pixel width may not be responsive',
            currentValue: line.trim(),
            suggestedValue: 'Consider using responsive width classes like w-full, w-1/2, etc.',
            severity: 'low'
          });
        }
        
        // Check for potential overflow issues
        if (line.includes('overflow-hidden') && !line.includes('text-ellipsis')) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'responsive',
            description: 'Hidden overflow without text-ellipsis may cut off content',
            currentValue: line.trim(),
            suggestedValue: line.replace('overflow-hidden', 'overflow-hidden text-ellipsis'),
            severity: 'medium'
          });
        }
      });
    }

    await this.logActivity(`Responsive layout check completed. Found ${issues.length} issues.`);
    
    return {
      issues,
      fixedIssues: [],
      warnings: [],
      filesModified: []
    };
  }

  private async fixThemeConsistency(context: any): Promise<UIRefinementResult> {
    const { targetDir = 'apps/dashboard/src' } = context;
    const issues: UIIssue[] = [];
    const fixedIssues: UIIssue[] = [];
    const filesModified: string[] = [];
    
    const tsxFiles = await this.findTSXFiles(targetDir);
    
    for (const filePath of tsxFiles) {
      let content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;
      
      // Replace inconsistent color usage with theme tokens
      const colorFixes = {
        'bg-gray-900': 'bg-dark-900',
        'bg-gray-800': 'bg-dark-800',
        'bg-gray-700': 'bg-dark-700',
        'text-gray-300': 'text-dark-300',
        'text-gray-200': 'text-dark-200',
        'text-gray-100': 'text-dark-100',
        'border-gray-700': 'border-dark-700',
        'border-gray-600': 'border-dark-600',
      };
      
      Object.entries(colorFixes).forEach(([oldColor, newColor]) => {
        if (content.includes(oldColor)) {
          const regex = new RegExp(oldColor, 'g');
          content = content.replace(regex, newColor);
          
          issues.push({
            file: filePath,
            line: 0,
            type: 'theme',
            description: `Replaced inconsistent color ${oldColor} with theme color ${newColor}`,
            currentValue: oldColor,
            suggestedValue: newColor,
            severity: 'low'
          });
          
          fixedIssues.push({
            file: filePath,
            line: 0,
            type: 'theme',
            description: `Fixed theme consistency: ${oldColor} → ${newColor}`,
            currentValue: oldColor,
            suggestedValue: newColor,
            severity: 'low'
          });
        }
      });
      
      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf-8');
        filesModified.push(filePath);
      }
    }

    if (fixedIssues.length > 0) {
      await this.logActivity(`Fixed ${fixedIssues.length} theme consistency issues in ${filesModified.length} files.`);
    }
    
    return {
      issues,
      fixedIssues,
      warnings: [],
      filesModified
    };
  }

  private async auditUIPatterns(context: any): Promise<UIRefinementResult> {
    const { targetDir = 'apps/dashboard/src' } = context;
    const issues: UIIssue[] = [];
    
    const tsxFiles = await this.findTSXFiles(targetDir);
    
    for (const filePath of tsxFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for inconsistent card patterns
        if (line.includes('className=') && 
            (line.includes('bg-') && line.includes('rounded-') && line.includes('p-')) &&
            !line.includes('card')) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'theme',
            description: 'Consider using card component class for consistency',
            currentValue: line.trim(),
            suggestedValue: 'Replace with card or card-glow class',
            severity: 'low'
          });
        }
        
        // Check for inconsistent button patterns
        if (line.includes('<button') && !line.includes('btn-')) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'theme',
            description: 'Consider using btn-primary or btn-secondary classes',
            currentValue: line.trim(),
            suggestedValue: 'Use btn-primary, btn-secondary, or btn-pill classes',
            severity: 'low'
          });
        }
      });
    }

    await this.logActivity(`UI pattern audit completed. Found ${issues.length} pattern inconsistencies.`);
    
    return {
      issues,
      fixedIssues: [],
      warnings: [],
      filesModified: []
    };
  }

  private async autoFixUIIssues(context: any): Promise<UIRefinementResult> {
    const { targetDir = 'apps/dashboard/src' } = context;
    
    // Run all checks and fixes
    const contrastResult = await this.fixContrastIssues({ ...context, autoFix: true });
    const themeResult = await this.fixThemeConsistency(context);
    const accessibilityResult = await this.validateAccessibility(context);
    const responsiveResult = await this.checkResponsiveLayout(context);
    
    const allIssues = [
      ...contrastResult.issues,
      ...themeResult.issues,
      ...accessibilityResult.issues,
      ...responsiveResult.issues
    ];
    
    const allFixedIssues = [
      ...contrastResult.fixedIssues,
      ...themeResult.fixedIssues
    ];
    
    const allFilesModified = [
      ...new Set([
        ...contrastResult.filesModified,
        ...themeResult.filesModified
      ])
    ];

    await this.logActivity(`Auto-fix completed. Fixed ${allFixedIssues.length} issues across ${allFilesModified.length} files.`);
    
    return {
      issues: allIssues,
      fixedIssues: allFixedIssues,
      warnings: [],
      filesModified: allFilesModified
    };
  }

  private detectContrastIssues(line: string, file: string, lineNumber: number): UIIssue[] {
    const issues: UIIssue[] = [];
    
    // Check for common contrast problems
    Object.entries(this.CONTRAST_FIXES).forEach(([bg, textFixes]) => {
      if (line.includes(bg)) {
        Object.entries(textFixes).forEach(([problematicText, fixedText]) => {
          if (line.includes(problematicText)) {
            issues.push({
              file,
              line: lineNumber,
              type: 'contrast',
              description: `Poor contrast: ${problematicText} on ${bg}`,
              currentValue: line.trim(),
              suggestedValue: line.replace(problematicText, fixedText),
              severity: 'high'
            });
          }
        });
      }
    });
    
    return issues;
  }

  private applyContrastFixes(line: string): string {
    let fixedLine = line;
    
    Object.entries(this.CONTRAST_FIXES).forEach(([bg, textFixes]) => {
      if (fixedLine.includes(bg)) {
        Object.entries(textFixes).forEach(([problematicText, fixedText]) => {
          if (fixedLine.includes(problematicText)) {
            fixedLine = fixedLine.replace(problematicText, fixedText);
          }
        });
      }
    });
    
    return fixedLine;
  }

  private async findTSXFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this.findTSXFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, skip
    }
    
    return files;
  }

  private async logActivity(message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] UIRefinementAgent: ${message}\n`;
    
    try {
      await fs.mkdir(path.dirname(this.logPath), { recursive: true });
      await fs.appendFile(this.logPath, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}