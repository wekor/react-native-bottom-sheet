# Contributing

## Development workflow

This is a Bun workspaces repository: the library lives at the root and
`example/` is an Expo app used to develop and verify the native code.

```sh
bun install
bun run check       # Biome lint + format check (`bun run fix` writes fixes)
bun run typecheck   # tsc for the library and the example
bun run prepare     # build lib/ with react-native-builder-bob
```

Run the example with `bun run --cwd example ios` or
`bun run --cwd example android`. See [TESTING.md](TESTING.md) for the Android
JVM and instrumentation tests.

The native code under `ios/`, `android/` and `common/` tracks
[software-mansion-labs/react-native-bottom-sheet](https://github.com/software-mansion-labs/react-native-bottom-sheet).
Keep it identical to upstream apart from the documented fork changes, so syncs
stay cheap.

## Commit message convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org):
`fix: …`, `feat: …`, `refactor: …`, `docs: …`, `test: …`, `chore: …`, `ci: …`,
with an optional scope such as `fix(ios): …`. Mark breaking changes with `!`
(`feat!: …`). A `commit-msg` hook (lefthook + commitlint) checks every commit.

## Pull requests

Every change reaches `main` through a squash-merged pull request:

```sh
git switch main && git pull
git switch -c fix/short-description      # or feat/…
# commit with a Conventional Commit message, e.g. "fix(android): …"
git push -u origin fix/short-description
gh pr create --fill
# wait for CI to pass, then "Squash and merge"
```

The squash commit takes the **PR title** as its message, so the title must
follow Conventional Commits too (the `PR title` check enforces it). Merging a PR
does not publish anything.

CI runs on pull requests only, split by platform so a PR only waits for what it
touches:

- `ci.yml` (every PR): Biome, type check and the library build.
- `android.yml` (when `android/` or a shared path changes): Android JVM tests
  and instrumentation tests on API 35 and 36 emulators.
- `ios.yml` (when `ios/`, the podspec or a shared path changes): an iOS build of
  the example, cached by Turbo across pushes to the same PR.

Shared paths are `src/`, `common/`, `example/`, `bun.lock`,
`react-native.config.js` and the CI setup; keep the lists in `android.yml` and
`ios.yml` in sync. A docs-only PR runs `ci.yml` alone.

## Publishing to npm

Releases are automated with
[release-please](https://github.com/googleapis/release-please). Every merge to
`main` opens (or updates) a release PR titled `chore(main): release X.Y.Z`,
which bumps the version in `package.json` and `example/app.json` and updates
`CHANGELOG.md` from the Conventional Commits since the last release: `fix` →
patch, `feat` → minor (breaking changes also bump minor while we're on 0.x).
`chore`, `docs`, `ci` and similar commits don't trigger a release.

To publish, merge that release PR. The `Release` workflow
(`.github/workflows/publish.yml`) then tags `vX.Y.Z`, creates the GitHub
release, and publishes to npm via Trusted Publishing. Nothing runs locally. No
CI runs on the release PR, since it only changes the version and changelog.
