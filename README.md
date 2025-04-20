# OliBootstrap

## Setup

```
pnpm install
```

### Build

To build all apps and packages, run the following command:

```
docker compose build
```

### Develop

Start background services:

```sh
docker compose up
```

Then, to run all apps development mode, run:

```sh
pnpm dev
```

We develop the Typescript apps on the host machine, not in Docker.

#### Complete Docker setup

Run the entire app, including OliBootstrap services like this:

```sh
docker compose --profile all up
```

The "all" profile includes our own servers and is disabled by
default. Use for E2E style tests, etc.
