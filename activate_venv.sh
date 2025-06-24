#!/bin/bash

# Neon v0.2 Python Virtual Environment Activation Script
# Usage: source activate_venv.sh

VENV_NAME="neon-v0.2-venv"
VENV_PATH="./${VENV_NAME}"

if [ -d "$VENV_PATH" ]; then
    echo "🐍 Activating Python virtual environment: $VENV_NAME"
    source "$VENV_PATH/bin/activate"
    echo "✅ Virtual environment activated!"
    echo "📦 Current Python: $(which python)"
    echo "📋 To deactivate, run: deactivate"
    echo ""
    echo "💡 To install dependencies: pip install -r requirements.txt"
else
    echo "❌ Virtual environment not found at: $VENV_PATH"
    echo "💡 To create it, run: python3 -m venv $VENV_NAME"
fi 