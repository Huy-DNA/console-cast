# ConsoleCast

![image](https://github.com/user-attachments/assets/466ea067-aa67-4db7-abcd-2ec5b42b4dfe)
## Techstack

* Fullstack framework: `nuxt`
* DBMS: `PostgreSQL`
* Runtime: `bun`
* Code quality assurance: `eslint`
* Devops: Github Action, `docker`

## Development guide

### Setup

```
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
