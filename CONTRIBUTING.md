# Contributing to Aqua Framework

## Pull Request Guidelines

### Merge Strategy
We use **squash merge only** for all pull requests. This means:
- Multiple commits in a PR will be squashed into a single commit when merged
- The PR title becomes the final commit message
- Individual commit messages within the PR are for development history only

### PR Title Format
Since we use squash merge, the **PR title must follow conventional commit format**:

```
<type>(<scope>): <description>
```

- `<type>`: Change type (required)
- `<scope>`: Change scope/workspace (optional)
- `<description>`: Change description (required)

#### Supported Types
Based on our changelogithub configuration:

- `feat`: 🚀 Features - New functionality
- `fix`: 🐞 Bug Fixes - Bug fixes
- `perf`: 🏎 Performance - Performance improvements
- `docs`: 📝 Documentation - Documentation changes
- `test`: ✅ Tests - Test additions or modifications
- `ci`: 🤖 CI - CI/CD changes
- `style`: 🎨 Styles - Code style changes (formatting, etc.)
- `build`: 📦 Build - Build system or dependency changes
- `refactor`: 🔨 Code Refactoring - Code refactoring without feature changes

#### Examples
- `feat: add interceptor system with decorator support`
- `feat(core): add server configuration options`
- `fix(example): prevent scattered build artifacts in example directory`
- `docs(api): add API documentation for controllers`
- `test(utils): add unit tests for functional utilities`
- `ci(github): update Node.js version to 24 in GitHub Actions`

### Changelog Generation
We use [changelogithub](https://github.com/antfu/changelogithub) to automatically generate changelogs from PR titles. Following the conventional commit format ensures proper categorization in the changelog.

### Development Workflow
1. Create a feature branch from main
2. Make your changes with descriptive commit messages (for development history)
3. Create a PR with a properly formatted title
4. The PR will be squash merged with the title as the final commit message

### Commit Message Format (for development)
While developing, use descriptive commit messages for your own reference. These will be squashed when merged, but help during code review:

```
Add authentication middleware
Fix TypeScript error in user controller
Update test cases for interceptor functionality
```

Remember: Only the PR title matters for the final commit message and changelog generation.