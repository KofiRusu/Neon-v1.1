# Python Virtual Environment Setup for Neon v0.2

## Overview

This project now includes a Python virtual environment named `neon-v0.2-venv` to isolate Python dependencies and provide a containerized Python development environment alongside the main Node.js/TypeScript project.

## Quick Start

### 1. Activate the Virtual Environment

**Option A: Using the provided script (recommended)**
```bash
source activate_venv.sh
```

**Option B: Manual activation**
```bash
source neon-v0.2-venv/bin/activate
```

### 2. Install Python Dependencies

Once activated, install dependencies from requirements.txt:
```bash
pip install -r requirements.txt
```

### 3. Deactivate When Done

```bash
deactivate
```

## Project Structure

```
Neon-v0.2/
├── neon-v0.2-venv/          # Python virtual environment (git-ignored)
├── activate_venv.sh         # Convenient activation script
├── requirements.txt         # Python dependencies
├── PYTHON_VENV_README.md    # This file
├── apps/                    # Node.js applications
├── packages/                # TypeScript packages
└── ... (rest of Node.js project)
```

## Usage Examples

### Adding New Python Dependencies

1. Activate the virtual environment:
   ```bash
   source activate_venv.sh
   ```

2. Install new packages:
   ```bash
   pip install requests pandas numpy
   ```

3. Update requirements.txt:
   ```bash
   pip freeze > requirements.txt
   ```

### Development Workflow

1. **Start working**: `source activate_venv.sh`
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Work on Python scripts/tools**
4. **When done**: `deactivate`

## Git Integration

The virtual environment directory (`neon-v0.2-venv/`) is automatically ignored by git, so you won't accidentally commit the large virtual environment files.

## Troubleshooting

### Virtual Environment Not Found
If you get an error about the virtual environment not existing:
```bash
python3 -m venv neon-v0.2-venv
```

### Permission Issues
Make sure the activation script is executable:
```bash
chmod +x activate_venv.sh
```

### Python Version
This environment uses Python 3.12.4. To check your active Python version:
```bash
python --version
which python
```

## Integration with Node.js Project

This Python virtual environment complements the existing Node.js/TypeScript project structure. You can use Python for:
- Data processing scripts
- Build automation tools
- Testing utilities
- API integration tools
- Machine learning components

The Node.js and Python environments can coexist and be used together as needed for different aspects of the Neon v0.2 project. 