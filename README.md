# Picks Leagues

Free, ad-free, independent NFL pick'em pools. See [docs/product-vision.md](docs/product-vision.md) for the why.

## Docs

- [Product vision](docs/product-vision.md)
- [MVP spec](docs/picks-leagues-mvp-spec.md)
- [Game types](docs/game-types.md)
- [Code standards](docs/code-standards.md)
- [UI design standards](docs/ui-design-standards.md)
- [Backlog](docs/backlog/)

## Getting started

**Install**

```sh
pnpm install
```

**Build**

```sh
pnpm -r build
```

**Dev**

```sh
pnpm dev
```

**Test**

```sh
pnpm -r test
```

**Lint**

```sh
pnpm lint
```

Auto-fix lint violations (formatting violations are handled by `format`, not this):

```sh
pnpm lint:fix
```

**Format**

Check formatting (run in CI):

```sh
pnpm format:check
```

Auto-format the codebase (run locally before committing):

```sh
pnpm format
```
