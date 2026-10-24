# Project instructions

Public site of the IT / AI / Crypto news aggregator: Vue 3 + Vite with a hand-rolled SSR (Express, `server.js`),
Tailwind 4, TypeScript — the stack of `image-gallery-front`. Data: the read API of `agregator-backend`
(`/publications`, `/publications/{slug}`, `/search`). Look: `mockups/` in the `agregator` repo.
Spec: `../../PycharmProjects/agregator/it_ai_crypto_news_mvp.md` (§9).

## Commit messages: Conventional Commits, always

```
<type>(<optional scope>)<optional !>: <description>
```

- Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`.
- Scopes: `feed`, `story`, `search`, `ssr`, `api`, `seo`, `deploy`, `ci`.
- Header ≤ 150 chars, lower-case type, no trailing period.
- Breaking change: `!` after the type/scope **and** a `BREAKING CHANGE:` footer.
- No `Co-Authored-By` / "Generated with Claude" lines — the message only.

`fix`/`perf` → patch, `feat` → minor. Config, Docker, compose, CI or tooling changes are `build`, `ci` or `chore`.
`commitlint.config.mjs` checks them.

Commit or push only when the user explicitly asks for it.

## Dev server

The user keeps the dev server running. Never start `vite` / `npm run dev` / `npm run preview` yourself; ask for the URL
instead. Local API address: `http://localhost:8002` (agregator-backend's dev compose).
