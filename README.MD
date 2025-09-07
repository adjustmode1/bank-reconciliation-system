# Run with docker
```
docker compose -p bank_reconciliation up -d
```

# Api 

Login
```shell
curl --location 'http://127.0.0.1:2025/auth/auth/login' \
--header 'x-device-id: fffff' \
--header 'Content-Type: application/json' \
--data '{
    "username": "admin",
    "password": "admin"
}'
```

Logout
```shell
curl --location 'http://127.0.0.1:2025/auth/auth/login' \
--header 'x-device-id: fffff' \
--header 'Content-Type: application/json' \
--data '{
    "username": "admin",
    "password": "admin"
}'
```

Refresh token
```shell
curl --location --request POST 'http://127.0.0.1:3000/auth/auth/refresh-token' \
--header 'Authorization: Bearer token
```

Upload file transaction
```shell
curl --location 'http://127.0.0.1:2025/filestore/file/upload-transaction' \
--header 'x-device-id: fffff' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZGV2aWNlSWQiOiJmZmZmZiIsImlhdCI6MTc1NzI0OTUzMywiZXhwIjoxNzU3MzM1OTMzfQ.Y09nOvyDFNRZyHZcXG3U9GWhkTyknG8HLhqwstfkK3s' \
--form 'file=@"/C:/Users/adjus/Downloads/test-for-type.csv"'
```

Sync file transaction
```shell
curl --location 'http://127.0.0.1:2025/filestore/file/sync-transaction' \
--header 'x-device-id: fffff' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer token' \
--data '{
    "filePath": "bank://files/1757249547110-test-for-type.csv"
}'
```

# Diagram
```mermaid
flowchart LR
    %% Top layer: Kafka
    subgraph Kafka["Kafka Broker"]
        K[(Topic: file_uploaded)]
    end

    %% Middle layer: Client + Gateway + Services
    subgraph Client
        U[User]
    end

    subgraph Gateway["NGINX API Gateway"]
        direction TB
    end

    subgraph Services
        direction TB
        A[auth-service]
        F[filestore-service]
        T[transaction-service]
    end

    %% Bottom layer: Infrastructure
    subgraph Infra["Infrastructure"]
        direction TB
        R[(Redis - shared session store)]
        P[(PostgreSQL - user data)]
        M[(Minio)]
    end

    %% Flows
    U --> Gateway
    Gateway --> A
    Gateway --> F

    A --> P
    A <--> R
    F <--> R
    F <--> M
    T <--> P

    F -->|Publish event| K
    K -->|Subscribe| T

```