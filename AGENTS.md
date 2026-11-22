# AGENTS.md

i4n is a small, zero-dependency TypeScript i18n library published to npm. Stability and security come first.

## Rules

- Own the code end to end. A change is done only when it is implemented, tested, formatted, and passes typecheck and lint. Do not leave work half-done.
- Make the smallest change that solves the problem. No unrelated refactors.
- No breaking public API changes without a major or minor version bump and a CHANGELOG.md entry.
- Keep zero runtime dependencies. Add a new dependency only with a clear need.
- Do not use language or runtime features newer than Node 22 in `src/`.
- Every behaviour change gets a test. Use `testcases` arrays instead of duplicated test blocks.
- Install dependencies via `sfw`. Never approve dependency build scripts.
- Never commit secrets.
- A release is a version bump, a CHANGELOG.md entry, and a `vX.Y.Z` tag. Publish only through the tag-triggered release workflow, using npm OIDC trusted publishing. Never publish manually.
- Do not commit, push, tag, or publish without the maintainer's explicit request.
