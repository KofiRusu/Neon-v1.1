#!/bin/bash

# NeonHub Repository Analysis Script
# Analyzes build/test/lint status and dependency mapping

set -e

echo "🚀 NeonHub Multi-Repository Analysis Script"
echo "============================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Analysis results
declare -A BUILD_STATUS
declare -A TEST_STATUS
declare -A LINT_STATUS
declare -A DEPENDENCY_STATUS

# Function to analyze a single repository
analyze_repo() {
    local repo_path="$1"
    local repo_name="$2"
    
    echo -e "${BLUE}📁 Analyzing: $repo_name${NC}"
    echo "   Path: $repo_path"
    
    if [ ! -d "$repo_path" ]; then
        echo -e "   ${RED}❌ Repository not found${NC}"
        BUILD_STATUS[$repo_name]="❌ Not Found"
        TEST_STATUS[$repo_name]="❌ Not Found"
        LINT_STATUS[$repo_name]="❌ Not Found"
        DEPENDENCY_STATUS[$repo_name]="❌ Not Found"
        return
    fi
    
    cd "$repo_path"
    
    # Check for package.json
    if [ ! -f "package.json" ]; then
        echo -e "   ${YELLOW}⚠️  No package.json found${NC}"
        BUILD_STATUS[$repo_name]="⚠️ No package.json"
        TEST_STATUS[$repo_name]="⚠️ No package.json"
        LINT_STATUS[$repo_name]="⚠️ No package.json"
        DEPENDENCY_STATUS[$repo_name]="⚠️ No package.json"
        return
    fi
    
    # Check dependencies
    echo "   🔍 Checking dependencies..."
    if npm list --depth=0 >/dev/null 2>&1; then
        DEPENDENCY_STATUS[$repo_name]="✅ Installed"
        echo -e "   ${GREEN}✅ Dependencies installed${NC}"
    else
        DEPENDENCY_STATUS[$repo_name]="❌ Missing"
        echo -e "   ${RED}❌ Dependencies missing/broken${NC}"
        
        # Try to install
        echo "   📦 Attempting to install dependencies..."
        if npm ci --silent 2>/dev/null; then
            DEPENDENCY_STATUS[$repo_name]="✅ Installed (Fixed)"
            echo -e "   ${GREEN}✅ Dependencies installed successfully${NC}"
        else
            echo -e "   ${RED}❌ Failed to install dependencies${NC}"
            BUILD_STATUS[$repo_name]="❌ Deps Failed"
            TEST_STATUS[$repo_name]="❌ Deps Failed"
            LINT_STATUS[$repo_name]="❌ Deps Failed"
            return
        fi
    fi
    
    # Run lint
    echo "   🔍 Running lint..."
    if npm run lint >/dev/null 2>&1; then
        LINT_STATUS[$repo_name]="✅ Clean"
        echo -e "   ${GREEN}✅ Lint passed${NC}"
    else
        # Check if lint script exists
        if grep -q '"lint"' package.json; then
            LINT_STATUS[$repo_name]="❌ Failed"
            echo -e "   ${RED}❌ Lint failed${NC}"
        else
            LINT_STATUS[$repo_name]="⚠️ No Script"
            echo -e "   ${YELLOW}⚠️  No lint script${NC}"
        fi
    fi
    
    # Run tests
    echo "   🧪 Running tests..."
    if npm run test >/dev/null 2>&1; then
        TEST_STATUS[$repo_name]="✅ Passed"
        echo -e "   ${GREEN}✅ Tests passed${NC}"
    else
        # Check if test script exists
        if grep -q '"test"' package.json; then
            TEST_STATUS[$repo_name]="❌ Failed"
            echo -e "   ${RED}❌ Tests failed${NC}"
        else
            TEST_STATUS[$repo_name]="⚠️ No Script"
            echo -e "   ${YELLOW}⚠️  No test script${NC}"
        fi
    fi
    
    # Run build
    echo "   🏗️  Running build..."
    if npm run build >/dev/null 2>&1; then
        BUILD_STATUS[$repo_name]="✅ Success"
        echo -e "   ${GREEN}✅ Build successful${NC}"
    else
        # Check if build script exists
        if grep -q '"build"' package.json; then
            BUILD_STATUS[$repo_name]="❌ Failed"
            echo -e "   ${RED}❌ Build failed${NC}"
        else
            BUILD_STATUS[$repo_name]="⚠️ No Script"
            echo -e "   ${YELLOW}⚠️  No build script${NC}"
        fi
    fi
    
    echo ""
}

# Function to extract dependencies from package.json
extract_dependencies() {
    local repo_path="$1"
    local repo_name="$2"
    
    if [ -f "$repo_path/package.json" ]; then
        echo "## $repo_name Dependencies"
        echo "### Dependencies:"
        cat "$repo_path/package.json" | grep -A 20 '"dependencies"' | grep -E '".*":\s*".*"' | head -10 || echo "None listed"
        echo ""
        echo "### DevDependencies:"
        cat "$repo_path/package.json" | grep -A 20 '"devDependencies"' | grep -E '".*":\s*".*"' | head -10 || echo "None listed"
        echo ""
        echo "### Workspaces:"
        cat "$repo_path/package.json" | grep -A 10 '"workspaces"' | head -5 || echo "None listed"
        echo ""
        echo "---"
        echo ""
    fi
}

# Function to generate markdown report
generate_report() {
    cat > PROJECT_READINESS_MATRIX_RESULTS.md << EOF
# NeonHub Project Readiness Matrix - Analysis Results

**Generated:** $(date)  
**Analysis Scope:** Multi-repository codebase assessment  
**Status:** Complete for available repositories

## 📋 Repository Status Summary

### Found Repositories:
EOF

    for repo in "${!BUILD_STATUS[@]}"; do
        echo "- **$repo** - Build: ${BUILD_STATUS[$repo]} | Test: ${TEST_STATUS[$repo]} | Lint: ${LINT_STATUS[$repo]} | Deps: ${DEPENDENCY_STATUS[$repo]}" >> PROJECT_READINESS_MATRIX_RESULTS.md
    done

    cat >> PROJECT_READINESS_MATRIX_RESULTS.md << EOF

## 🏗️ Detailed Status Matrix

| Repository | Dependencies | Build Status | Test Status | Lint Status | Notes |
|------------|--------------|--------------|-------------|-------------|--------|
EOF

    for repo in "${!BUILD_STATUS[@]}"; do
        echo "| **$repo** | ${DEPENDENCY_STATUS[$repo]} | ${BUILD_STATUS[$repo]} | ${TEST_STATUS[$repo]} | ${LINT_STATUS[$repo]} | Analysis complete |" >> PROJECT_READINESS_MATRIX_RESULTS.md
    done

    cat >> PROJECT_READINESS_MATRIX_RESULTS.md << EOF

## 📦 Dependencies Analysis

EOF

    # Add dependency analysis for each repo
    for repo in "${!BUILD_STATUS[@]}"; do
        case $repo in
            "Neon-v0.2")
                extract_dependencies "/Users/kofirusu/Neon-v0.2/Neon-v0.2" "$repo" >> PROJECT_READINESS_MATRIX_RESULTS.md
                ;;
            "Neon-v2.1")
                extract_dependencies "/Users/kofirusu/Neon-v0.2/Neon-v2.1" "$repo" >> PROJECT_READINESS_MATRIX_RESULTS.md
                ;;
            "Neon-v1.1")
                extract_dependencies "/Users/kofirusu/Neon-v0.2/Neon-v0.2/Neon-v1.1" "$repo" >> PROJECT_READINESS_MATRIX_RESULTS.md
                ;;
        esac
    done

    cat >> PROJECT_READINESS_MATRIX_RESULTS.md << EOF

## 🎯 Consolidation Recommendations

### Critical Issues Found:
EOF

    # Add critical issues
    for repo in "${!BUILD_STATUS[@]}"; do
        if [[ "${BUILD_STATUS[$repo]}" == *"Failed"* ]]; then
            echo "- **$repo**: Build failures detected" >> PROJECT_READINESS_MATRIX_RESULTS.md
        fi
        if [[ "${TEST_STATUS[$repo]}" == *"Failed"* ]]; then
            echo "- **$repo**: Test failures detected" >> PROJECT_READINESS_MATRIX_RESULTS.md
        fi
        if [[ "${DEPENDENCY_STATUS[$repo]}" == *"Missing"* ]]; then
            echo "- **$repo**: Dependency issues detected" >> PROJECT_READINESS_MATRIX_RESULTS.md
        fi
    done

    cat >> PROJECT_READINESS_MATRIX_RESULTS.md << EOF

### Recommended Actions:
1. **Fix Build Issues**: Resolve TypeScript compilation errors
2. **Dependency Management**: Standardize package versions across repos
3. **Testing Strategy**: Implement consistent testing patterns
4. **Monorepo Migration**: Consider consolidating into single repository
5. **Missing Repositories**: Clone and analyze remaining repos

### Quick Wins:
- Standardize eslint configurations
- Implement shared dependency versions
- Create unified build/test scripts
- Establish consistent package.json structure

## 📊 Summary Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| Repositories Analyzed | ${#BUILD_STATUS[@]} | 50% (3/6 requested) |
| Successful Builds | $(echo "${BUILD_STATUS[@]}" | grep -o "✅ Success" | wc -l | tr -d ' ') | TBD |
| Passing Tests | $(echo "${TEST_STATUS[@]}" | grep -o "✅ Passed" | wc -l | tr -d ' ') | TBD |
| Clean Lint | $(echo "${LINT_STATUS[@]}" | grep -o "✅ Clean" | wc -l | tr -d ' ') | TBD |

## 📋 Next Steps for Missing Repositories

To complete the analysis, you need to:

1. **Clone missing repositories:**
   \`\`\`bash
   git clone <url> NeonHub-v0.1
   git clone <url> Neon-v0.3  
   git clone <url> ContentCreator-0.1
   \`\`\`

2. **Run this analysis script again:**
   \`\`\`bash
   ./repo-analysis-script.sh
   \`\`\`

3. **Review dependency conflicts and plan consolidation**

---

*Analysis complete. Review results and address critical issues before proceeding with consolidation.*
EOF

    echo -e "${GREEN}📄 Report generated: PROJECT_READINESS_MATRIX_RESULTS.md${NC}"
}

# Main execution
echo "Starting analysis of available repositories..."
echo ""

# Analyze available repositories
analyze_repo "/Users/kofirusu/Neon-v0.2/Neon-v0.2" "Neon-v0.2"
analyze_repo "/Users/kofirusu/Neon-v0.2/Neon-v2.1" "Neon-v2.1"  
analyze_repo "/Users/kofirusu/Neon-v0.2/Neon-v0.2/Neon-v1.1" "Neon-v1.1"

# Generate comprehensive report
echo "📊 Generating comprehensive report..."
generate_report

echo ""
echo -e "${GREEN}🎉 Analysis Complete!${NC}"
echo -e "📄 Results saved to: ${BLUE}PROJECT_READINESS_MATRIX_RESULTS.md${NC}"
echo ""
echo "Missing repositories that need to be cloned:"
echo "- NeonHub-v0.1"
echo "- Neon-v0.3"
echo "- ContentCreator-0.1"
echo ""
echo "Run this script again after cloning missing repositories for complete analysis." 