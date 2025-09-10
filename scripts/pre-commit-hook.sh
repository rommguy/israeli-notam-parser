#!/bin/bash

# Pre-commit hook script to run tests before allowing commits
# This ensures that only code with passing tests gets committed

echo "🧪 Running pre-commit tests..."

# Run tests
npm test

# Check if tests passed
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Commit rejected."
    echo "Please fix the failing tests before committing."
    exit 1
fi

echo "✅ All tests passed! Proceeding with commit."
exit 0
