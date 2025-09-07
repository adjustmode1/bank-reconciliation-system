# Transaction Service API

## Introduction & Overview

**API Name**: Transaction Service API  
**Description**:  
The Transaction Service API is responsible for receiving and processing transaction events via **Kafka** from the Filestore Service.  
It consumes uploaded transaction data, validates it, and inserts valid records into the database.  
Additionally, it ensures synchronization integrity by validating and confirming transaction consistency during the sync process.  

This service plays a critical role in maintaining accurate and reliable transaction data within the financial microservices ecosystem.  

**Current Version**: `v0.0.1`  

**Status**: `In Development`  

---

## Getting Started

### Requirements
- Node.js >= 20  
- NestJS >= 11  
- Kafka >= 4
- PostgreSQL >= 17  
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