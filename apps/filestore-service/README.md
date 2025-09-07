# Filestore Service API

## Introduction & Overview

**API Name**: Filestore Service API  

**Description**:  
The Filestore Service API provides file upload and transaction synchronization functionalities for banking systems.  
It allows users to upload transaction files in `.csv` and `.xlsx` formats.  
Uploaded files can then be processed and synchronized to other services via **Kafka** for further transaction handling and reconciliation.  

This service ensures secure file storage, validation, and efficient integration within a microservices-based financial system.  

**Current Version**: `v0.0.1`  

**Status**: `In Development`  

---

## Getting Started

### Requirements
- Node.js >= 20  
- NestJS >= 11  
- Minio >= RELEASE.2024-11-07T00-52-20Z
- Kafka >= 4
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