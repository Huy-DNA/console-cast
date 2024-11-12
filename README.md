# ConsoleCast

<img width="1392" alt="image" src="https://github.com/user-attachments/assets/fc62361e-98af-425b-ae12-8aee50f18db5">

## Techstack

* Fullstack framework: `nuxt`
* DBMS: `PostgreSQL`
* Runtime: `bun`
* Code quality assurance: `eslint`
* Devops: Github Action, `docker`

## Development guide

### Setup

```
git config diff.lockb.textconv bun
git config diff.lockb.binary true

bun install
bun db:create
bun db:migrate
```

### Development

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

Linting:

```bash
bun run lint
bun run lint:fix
```

### Production

Build the application for production:

```bash
bun run build
```

Locally preview production build:

```bash
bun run preview
```
