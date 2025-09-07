# Auth Service API

## Introduction & Overview

**API Name**: Auth Service API  

**Description**:  
The Auth Service API provides authentication and user management functionalities.  
It supports user registration, login, JWT token issuance, token refresh, logout, and access control management.  
This service addresses the authentication layer within a microservices architecture. 

**Current Version**: `v0.0.1`  

**Status**: `In Development`  

---

## Getting Started

### Requirements
- Node.js >= 20  
- NestJS >= 11  
- PostgreSQL >= 17  
- Redis >= 7  
- Dependencies listed in `package.json`  

### Installation
Install dependencies:

```bash
pnpm install
```

### ENV
env for development (local)
```
.env.development
```

env for test (local - CI/CD)
```
.env.test
```


env for production (deployment)
```
.env.production
```

### Script
Local start
```shell
pnpm run start
```

Local start dev mode
```shell
pnpm run start:dev
```

Prettier format code
```shell
pnpm run format
```

Prettier check format code
```shell
pnpm run format:check
```

Check eslint
```shell
pnpm run lint
```

End to end testing
```shell
pnpm run test:e2e
```

### API document
http://127.0.0.1:3000/auth/swagger