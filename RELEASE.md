# Releasing achkit

Both packages ship from CI on a single GitHub Release. Never publish from a laptop.

## One-time setup

**npm** (`js/`)
- Create an npm automation token on the `tiktools` account.
- Add it to the repo: Settings -> Secrets and variables -> Actions -> `NPM_TOKEN`.
- Provenance is enabled (`--provenance`); the repo must stay public.

**PyPI** (`py/`) - trusted publishing, no token
- On PyPI, add a Trusted Publisher for the `achkit` project:
  - Owner: `achkit`
  - Repository: `achkit`
  - Workflow: `publish-pypi.yml`
  - Environment: `pypi`
- Create a repo Environment named `pypi` (Settings -> Environments) so the
  workflow's `environment: pypi` matches. No secret required.

## Cutting a release

1. Bump the version in **both** `js/package.json` and `py/pyproject.toml` (keep
   them in lockstep).
2. Commit, tag `vX.Y.Z`, push.
3. Draft a GitHub Release for that tag and publish it.
4. `publish-npm` and `publish-pypi` run automatically: test -> build -> publish.

Every push and PR also runs `ci.yml` (build + test both packages across Python
3.8/3.11/3.13). A red CI blocks the merge; a red publish job blocks the release.
