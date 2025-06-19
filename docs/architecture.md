# Neon0.2 Architecture

## Overview

Neon0.2 is a production-ready monorepo built with modern TypeScript tooling, comprehensive testing, and automated CI/CD. It follows strict code quality standards and modular architecture principles.

## Key Features

- **Monorepo** with `packages/` workspaces for modular development
- **TypeScript strict mode** across all modules with advanced compiler options
- **ESLint + Prettier** for consistent code style and quality enforcement
- **Jest** for comprehensive unit testing with coverage thresholds
- **Playwright** for reliable end-to-end testing across browsers
- **GitHub Actions CI** with lint → type-check → unit tests → E2E tests pipeline

## Directory Structure

```
Neon0.2/
├── packages/                 # Workspace packages
│   ├── core/                # Core business logic
│   ├── utils/               # Shared utilities
│   ├── types/               # TypeScript type definitions
│   └── api/                 # API layer
├── tests/
│   ├── e2e/                 # End-to-end tests
│   └── fixtures/            # Test fixtures and utilities
├── docs/                    # Documentation
├── .github/workflows/       # CI/CD pipelines
├── coverage/                # Test coverage reports
├── dist/                    # Compiled output
└── node_modules/            # Dependencies
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5+ with strict mode
- **Package Manager**: npm with workspaces
- **Testing**: Jest + Playwright
- **Code Quality**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Build System**: TypeScript Compiler (tsc)

## Development Workflow

1. **Development**: `npm run dev` - Build and test
2. **Code Quality**: `npm run lint` + `npm run format`
3. **Type Safety**: `npm run type-check`
4. **Testing**: `npm run test` (unit) + `npm run test:e2e`
5. **CI Pipeline**: Automated on push/PR

## Quality Standards

- ✅ **80%+ test coverage** requirement
- ✅ **Zero TypeScript errors** with strict mode
- ✅ **ESLint rules** enforced with error-level violations
- ✅ **Prettier formatting** applied consistently
- ✅ **No `any` types** allowed in production code
- ✅ **Comprehensive E2E testing** across browsers

## Package Architecture

Each package in `packages/` follows this structure:

```
packages/example/
├── src/
│   ├── index.ts           # Main entry point
│   ├── types.ts           # Type definitions
│   └── __tests__/         # Unit tests
├── package.json           # Package configuration
└── tsconfig.json          # Package-specific TS config
```

## CI/CD Pipeline

1. **Lint Check**: ESLint validation
2. **Type Check**: TypeScript compilation
3. **Unit Tests**: Jest with coverage
4. **Build**: TypeScript compilation
5. **E2E Tests**: Playwright across browsers
6. **Deploy**: Production deployment (if applicable)

## Getting Started

```bash
# Install dependencies
npm install

# Run development workflow
npm run dev

# Run specific checks
npm run lint
npm run type-check
npm run test
npm run test:e2e

# Build for production
npm run build
```

## Contributing

1. Follow the established code style (ESLint + Prettier)
2. Maintain test coverage above 80%
3. Add E2E tests for user-facing features
4. Update documentation for architectural changes
5. Ensure all CI checks pass before merging

---

*This architecture documentation is maintained alongside the codebase and should be updated with any structural changes.* 