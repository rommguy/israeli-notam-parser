#!/bin/bash

# Script to set up the pre-commit hook for the project

echo "🔧 Setting up pre-commit hook..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy the pre-commit hook
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
echo "Now tests will run automatically before each commit."
echo ""
echo "To skip the hook temporarily (not recommended), use:"
echo "  git commit --no-verify"
