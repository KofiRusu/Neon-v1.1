/**
 * Accessibility Test Suite
 * Validates WCAG 2.1 AA compliance across components
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dashboard from '@/app/page';
import EmailPage from '@/app/email/page';
import SocialPage from '@/app/social/page';
import SupportPage from '@/app/support/page';

expect.extend(toHaveNoViolations);

// Mock tRPC for testing
jest.mock('@/utils/trpc', () => ({
  api: {
    useQuery: () => ({ data: null, isLoading: false }),
    useMutation: () => ({ mutate: jest.fn() }),
  },
}));

describe('Accessibility Tests', () => {
  it('Dashboard has no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Email page has no accessibility violations', async () => {
    const { container } = render(<EmailPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Social page has no accessibility violations', async () => {
    const { container } = render(<SocialPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Support page has no accessibility violations', async () => {
    const { container } = render(<SupportPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('All interactive elements have proper ARIA labels', async () => {
    const { container } = render(<Dashboard />);
    
    // Check for buttons with aria-label
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(
        button.hasAttribute('aria-label') || 
        button.textContent?.trim() !== ''
      ).toBe(true);
    });
  });

  it('All images have alt text', async () => {
    const { container } = render(<Dashboard />);
    
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img.hasAttribute('alt')).toBe(true);
    });
  });

  it('Form elements have proper labels', async () => {
    const { container } = render(<Dashboard />);
    
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      const hasLabel = 
        input.hasAttribute('aria-label') ||
        input.hasAttribute('aria-labelledby') ||
        container.querySelector(`label[for="${input.id}"]`);
      
      expect(hasLabel).toBeTruthy();
    });
  });

  it('Focus is properly managed', async () => {
    const { container } = render(<Dashboard />);
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    expect(focusableElements.length).toBeGreaterThan(0);
  });
}); 