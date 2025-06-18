# Example Usage

To build and run the example:

```bash
# From the project root (recommended)
pnpm example:build
pnpm example:run

# Or build with explicit project config
tsc --project example/tsconfig.json
node example/build/example/app.js
```

**⚠️ Important**: 
- Do NOT use `npx tsc app.ts` directly - it creates scattered build files
- Do NOT use `tsc` without `--project` flag from example directory
- Always use the provided npm scripts or explicit project config