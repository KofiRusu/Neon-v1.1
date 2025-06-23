import { UIRefinementAgent } from './ui-refinement-agent';
import { promises as fs } from 'fs';

// Mock fs operations for testing
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
    mkdir: jest.fn(),
    appendFile: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

interface MockDirent {
  name: string;
  isFile: () => boolean;
  isDirectory: () => boolean;
}

interface MockUIIssue {
  type: string;
  description: string;
  severity: string;
}

describe('UIRefinementAgent', () => {
  let agent: UIRefinementAgent;

  beforeEach(() => {
    agent = new UIRefinementAgent('ui-refinement-1', 'UI Refinement Agent');
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Agent initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('ui-refinement-1');
      expect(agent.name).toBe('UI Refinement Agent');
      expect(agent.type).toBe('ui-refinement');
      expect(agent.capabilities).toContain('check_contrast');
      expect(agent.capabilities).toContain('fix_contrast_issues');
      expect(agent.capabilities).toContain('validate_accessibility');
    });
  });

  describe('Contrast checking', () => {
    it('should detect contrast issues', async () => {
      // Mock file system
      mockFs.readdir.mockResolvedValue([
        { name: 'test.tsx', isFile: () => true, isDirectory: () => false } as MockDirent,
      ] as MockDirent[]);
      
      mockFs.readFile.mockResolvedValue(`
        <div className="bg-neutral-900 text-neutral-700">
          <p>Social Media</p>
        </div>
      `);

      const result = await agent.execute({
        task: 'check_contrast',
        context: { targetDir: 'test' },
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.issues).toHaveLength(1);
      expect(result.data.issues[0].type).toBe('contrast');
      expect(result.data.issues[0].severity).toBe('high');
      expect(result.data.issues[0].description).toContain('Poor contrast');
    });

    it('should fix contrast issues automatically', async () => {
      // Mock file system
      mockFs.readdir.mockResolvedValue([
        { name: 'test.tsx', isFile: () => true, isDirectory: () => false } as MockDirent,
      ] as MockDirent[]);
      
      mockFs.readFile.mockResolvedValue(`
        <div className="bg-neutral-900 text-neutral-700">
          <p>Social Media</p>
        </div>
      `);

      const result = await agent.execute({
        task: 'fix_contrast_issues',
        context: { targetDir: 'test', autoFix: true },
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.fixedIssues).toHaveLength(1);
      expect(result.data.filesModified).toHaveLength(1);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('Accessibility validation', () => {
    it('should detect missing alt attributes', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'test.tsx', isFile: () => true, isDirectory: () => false } as MockDirent,
      ] as MockDirent[]);
      
      mockFs.readFile.mockResolvedValue(`
        <img src="image.jpg" />
        <button>Click me</button>
        <input type="text" />
      `);

      const result = await agent.execute({
        task: 'validate_accessibility',
        context: { targetDir: 'test' },
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.issues.length).toBeGreaterThan(0);
      expect(result.data.issues.some((issue: MockUIIssue) => 
        issue.description.includes('alt attribute')
      )).toBe(true);
    });
  });

  describe('Theme consistency', () => {
    it('should fix theme inconsistencies', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'test.tsx', isFile: () => true, isDirectory: () => false } as MockDirent,
      ] as MockDirent[]);
      
      mockFs.readFile.mockResolvedValue(`
        <div className="bg-gray-900 text-gray-300">
          <p>Content</p>
        </div>
      `);

      const result = await agent.execute({
        task: 'fix_theme_consistency',
        context: { targetDir: 'test' },
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.fixedIssues.length).toBeGreaterThan(0);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('Responsive layout checking', () => {
    it('should detect responsive issues', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'test.tsx', isFile: () => true, isDirectory: () => false } as MockDirent,
      ] as MockDirent[]);
      
      mockFs.readFile.mockResolvedValue(`
        <div className="w-[500px] overflow-hidden">
          <p>Fixed width content</p>
        </div>
      `);

      const result = await agent.execute({
        task: 'check_responsive_layout',
        context: { targetDir: 'test' },
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.issues.length).toBeGreaterThan(0);
      expect(result.data.issues.some((issue: MockUIIssue) => 
        issue.type === 'responsive'
      )).toBe(true);
    });
  });

  describe('UI pattern auditing', () => {
    it('should detect UI pattern inconsistencies', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'test.tsx', isFile: () => true, isDirectory: () => false } as MockDirent,
      ] as MockDirent[]);
      
      mockFs.readFile.mockResolvedValue(`
        <div className="bg-white rounded-lg p-4">
          <button className="bg-blue-500">Click</button>
        </div>
      `);

      const result = await agent.execute({
        task: 'audit_ui_patterns',
        context: { targetDir: 'test' },
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Auto-fix all issues', () => {
    it('should run all checks and fixes comprehensively', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'test.tsx', isFile: () => true, isDirectory: () => false } as MockDirent,
      ] as MockDirent[]);
      
      mockFs.readFile.mockResolvedValue(`
        <div className="bg-neutral-900 text-neutral-700 bg-gray-800">
          <img src="image.jpg" />
          <button>Click</button>
          <div className="w-[500px] overflow-hidden">Content</div>
        </div>
      `);

      const result = await agent.execute({
        task: 'auto_fix_ui_issues',
        context: { targetDir: 'test' },
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.issues.length).toBeGreaterThan(0);
      expect(result.data.fixedIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle unknown tasks', async () => {
      const result = await agent.execute({
        task: 'unknown_task',
        context: {},
        priority: 'medium',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown task');
    });

    it('should handle file system errors gracefully', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));

      const result = await agent.execute({
        task: 'check_contrast',
        context: { targetDir: 'nonexistent' },
        priority: 'medium',
      });

      expect(result.success).toBe(true); // Should still succeed with empty results
      expect(result.data.issues).toHaveLength(0);
    });
  });
});