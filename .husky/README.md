# Husky Git Hooks

This project uses Husky to enforce code quality checks before commits and pushes.

## Hooks

### pre-commit
- Runs ESLint on staged files
- Automatically fixes fixable issues
- Prevents commit if there are unfixable ESLint errors

### pre-push
- Runs a full production build
- Prevents push if the build fails
- Ensures the code compiles successfully before pushing

## Bypassing Hooks (Use with caution!)

If you need to bypass hooks in an emergency:
- Skip pre-commit: `git commit --no-verify`
- Skip pre-push: `git push --no-verify`

**Note:** Only bypass hooks when absolutely necessary, as they help maintain code quality.
