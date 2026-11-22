# AGENTS.md

i4n is a small, zero-dependency TypeScript i18n library published to npm. Stability and security come first.

## Rules

- Own the code end to end. A change is done only when it is implemented, tested, formatted, and passes typecheck and lint. Do not leave work half-done.
- Make the smallest change that solves the problem. No unrelated refactors.
- No breaking public API changes without a major or minor version bump and a CHANGELOG.md entry.
- Keep zero runtime dependencies. Add a new dependency only with a clear need.
- Every behaviour change gets a test. Use `testcases` arrays instead of duplicated test blocks.
- Install dependencies via `sfw`. Never approve dependency build scripts. esbuild builds are intentionally rejected.
- Never commit secrets.
- Publish only through the tag-triggered release workflow, using npm OIDC trusted publishing. Never publish manually.
- Do not commit, push, tag, or publish without the maintainer's explicit request.

## Facts and commands

- Development requires Node >=26 and pnpm 12.21.0 (pinned in `packageManager`, enforced by `devEngines`).
- Consumers need Node >=22. Do not use language or runtime features newer than Node 22 in `src/`.
- Scripts: `pnpm typecheck`, `pnpm lint`, `pnpm build` (tsup: ESM, CJS, and type declarations), `pnpm test` (node:test via tsx), `pnpm prettier:check`. `pnpm generate` exists but is a placeholder.
- Layout: `src/` library, `tests/` node:test suites, `examples/`, `skills/i4n/SKILL.md` agent skill.
- Release: bump `version` in package.json, add a CHANGELOG.md entry, push a `vX.Y.Z` tag. CI is `.github/workflows/ci.yml`, release is `.github/workflows/release.yml`.
