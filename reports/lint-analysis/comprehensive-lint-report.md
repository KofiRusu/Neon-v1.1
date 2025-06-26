# 🚨 NeonHub ESLint Analysis Report

_Generated on 6/26/2025, 5:55:06 PM_

## 📋 Executive Summary

| Workspace | Total Issues | Errors | Warnings | Files Affected |
|-----------|--------------|---------|----------|----------------|
| api | 26 | 0 | 26 | 7 |
| core-agents | 465 | 431 | 34 | 19 |
| dashboard | 139 | 5 | 134 | 31 |
| data-model | 21 | 14 | 7 | 2 |
| reasoning-engine | 7 | 5 | 2 | 1 |
| types | 0 | 0 | 0 | 0 |
| utils | 8 | 3 | 5 | 4 |

**Overall Statistics:**
- **Total Issues**: 666
- **Total Errors**: 458
- **Total Warnings**: 208
- **Files with Issues**: 64

## 🎯 Most Common Rule Violations (Platform-wide)

1. **@typescript-eslint/no-explicit-any**: 386 occurrences (58.0%)
1. **@typescript-eslint/no-unused-vars**: 172 occurrences (25.8%)
1. **@typescript-eslint/no-empty-object-type**: 24 occurrences (3.6%)
1. **@typescript-eslint/no-non-null-assertion**: 23 occurrences (3.5%)
1. **no-console**: 21 occurrences (3.2%)
1. **@typescript-eslint/explicit-function-return-type**: 18 occurrences (2.7%)
1. **prefer-template**: 7 occurrences (1.1%)
1. **@typescript-eslint/no-require-imports**: 6 occurrences (0.9%)
1. **react/no-unescaped-entities**: 4 occurrences (0.6%)
1. **@next/next/no-img-element**: 2 occurrences (0.3%)
1. **react-hooks/exhaustive-deps**: 2 occurrences (0.3%)
1. **@typescript-eslint/no-unsafe-function-type**: 1 occurrences (0.2%)

## 💡 Recommendations

### 🚨 Priority 1: Fix Errors (458 total)
Errors must be resolved as they can break the build or cause runtime issues.

### ⚠️ Priority 2: Address Warnings (208 total)
Warnings indicate potential issues or code quality concerns.

### 🔧 Priority 3: Configure Rules
Consider updating ESLint configuration to address the most common violations:

- **@typescript-eslint/no-explicit-any**: Consider if this rule should be disabled, configured differently, or if code should be updated
- **@typescript-eslint/no-unused-vars**: Consider if this rule should be disabled, configured differently, or if code should be updated
- **@typescript-eslint/no-empty-object-type**: Consider if this rule should be disabled, configured differently, or if code should be updated

## 🛠️ Next Steps

1. **Run individual fixes**: `npm run lint:fix --workspace=<workspace-name>`
2. **Focus on high-impact files**: Start with files that have the most issues
3. **Review rule configuration**: Consider adjusting ESLint rules based on patterns
4. **Set up pre-commit hooks**: Prevent future lint issues with automated checks


## 📦 Detailed Workspace Reports

### 🔧 api

- **Total Issues**: 26
- **Errors**: 0
- **Warnings**: 26
- **Files Affected**: 7

**🔴 Top Rules Violated:**
- **@typescript-eslint/no-explicit-any**: 13 occurrences
- **@typescript-eslint/no-unused-vars**: 13 occurrences

**📁 Most Problematic Files:**
- `apps/api/src/server/routers/trends.ts`: 9 issues
- `apps/api/src/server/routers/outreach.ts`: 7 issues
- `apps/api/src/server/__test__/helpers/mock-context.ts`: 4 issues
- `apps/api/src/app/api/trpc/[trpc]/route.ts`: 2 issues
- `apps/api/src/server/routers/agent.test.ts`: 2 issues
- `apps/api/src/server/routers/agent.ts`: 1 issues
- `apps/api/src/server/routers/seo.ts`: 1 issues

### 🔧 core-agents

- **Total Issues**: 465
- **Errors**: 431
- **Warnings**: 34
- **Files Affected**: 19

**🔴 Top Rules Violated:**
- **@typescript-eslint/no-explicit-any**: 314 occurrences
- **@typescript-eslint/no-unused-vars**: 103 occurrences
- **@typescript-eslint/no-non-null-assertion**: 22 occurrences
- **@typescript-eslint/explicit-function-return-type**: 8 occurrences
- **@typescript-eslint/no-require-imports**: 6 occurrences
- **prefer-template**: 6 occurrences
- **no-console**: 4 occurrences
- **@typescript-eslint/no-unsafe-function-type**: 1 occurrences
- **@typescript-eslint/no-empty-object-type**: 1 occurrences

**📁 Most Problematic Files:**
- `packages/core-agents/src/agents/insight-agent.ts`: 124 issues
- `packages/core-agents/src/agents/social-agent.ts`: 82 issues
- `packages/core-agents/src/agents/email-agent.ts`: 38 issues
- `packages/core-agents/src/agents/whatsapp-agent.ts`: 38 issues
- `packages/core-agents/src/agents/support-agent.ts`: 37 issues
- `packages/core-agents/src/agents/ad-agent.ts`: 25 issues
- `packages/core-agents/src/agents/brand-voice-agent.test.ts`: 24 issues
- `packages/core-agents/src/agents/design-agent.ts`: 20 issues
- `packages/core-agents/src/agents/trend-agent.ts`: 20 issues
- `packages/core-agents/src/agents/brand-voice-agent.ts`: 15 issues

### 🔧 dashboard

- **Total Issues**: 139
- **Errors**: 5
- **Warnings**: 134
- **Files Affected**: 31

**🔴 Top Rules Violated:**
- **@typescript-eslint/no-unused-vars**: 56 occurrences
- **@typescript-eslint/no-explicit-any**: 37 occurrences
- **@typescript-eslint/no-empty-object-type**: 23 occurrences
- **no-console**: 13 occurrences
- **react/no-unescaped-entities**: 4 occurrences
- **@next/next/no-img-element**: 2 occurrences
- **react-hooks/exhaustive-deps**: 2 occurrences
- **@typescript-eslint/no-non-null-assertion**: 1 occurrences
- **prefer-template**: 1 occurrences

**📁 Most Problematic Files:**
- `apps/dashboard/src/components/CampaignCreationModal.tsx`: 20 issues
- `apps/dashboard/src/app/analytics/page.tsx`: 10 issues
- `apps/dashboard/src/components/SEOAgentTab.tsx`: 10 issues
- `apps/dashboard/src/components/SocialAgentTab.tsx`: 10 issues
- `apps/dashboard/src/app/page.tsx`: 9 issues
- `apps/dashboard/src/components/ui/form.tsx`: 8 issues
- `apps/dashboard/src/app/brand-voice/page.tsx`: 7 issues
- `apps/dashboard/src/components/ui/card.tsx`: 6 issues
- `apps/dashboard/src/components/ui/dialog.tsx`: 6 issues
- `apps/dashboard/src/__tests__/a11y/accessibility.test.tsx`: 5 issues

### 🔧 data-model

- **Total Issues**: 21
- **Errors**: 14
- **Warnings**: 7
- **Files Affected**: 2

**🔴 Top Rules Violated:**
- **@typescript-eslint/no-explicit-any**: 14 occurrences
- **@typescript-eslint/explicit-function-return-type**: 7 occurrences

**📁 Most Problematic Files:**
- `packages/data-model/src/optimized-client.ts`: 18 issues
- `packages/data-model/src/optimized-client.test.ts`: 3 issues

### 🔧 reasoning-engine

- **Total Issues**: 7
- **Errors**: 5
- **Warnings**: 2
- **Files Affected**: 1

**🔴 Top Rules Violated:**
- **@typescript-eslint/no-explicit-any**: 5 occurrences
- **@typescript-eslint/explicit-function-return-type**: 2 occurrences

**📁 Most Problematic Files:**
- `packages/reasoning-engine/src/index.ts`: 7 issues

### 🔧 types

- **Total Issues**: 0
- **Errors**: 0
- **Warnings**: 0
- **Files Affected**: 0

### 🔧 utils

- **Total Issues**: 8
- **Errors**: 3
- **Warnings**: 5
- **Files Affected**: 4

**🔴 Top Rules Violated:**
- **no-console**: 4 occurrences
- **@typescript-eslint/no-explicit-any**: 3 occurrences
- **@typescript-eslint/explicit-function-return-type**: 1 occurrences

**📁 Most Problematic Files:**
- `packages/utils/src/lead-scraper.ts`: 4 issues
- `packages/utils/src/social-api-client.ts`: 2 issues
- `packages/utils/src/logger.ts`: 1 issues
- `packages/utils/src/pdf-generator.ts`: 1 issues

