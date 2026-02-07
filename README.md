# Pedie Docs

Docs-only repo for business, operations, and internal planning.

## Structure

- docs/business/ : business plans, strategy, market notes
- docs/ops/ : infrastructure, deployment, runbooks
- scripts/ : helper scripts
- package.json : formatting tools (prettier, husky)

## Conventions

- Use short, kebab-case names.
- Keep docs in Markdown and prefer one topic per file.
- Add new domains under docs/ (for example: policies, finance, product, marketing).

## Formatting

- Format: `bun run f`
- Check: `bun run f:check`
