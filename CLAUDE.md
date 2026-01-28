# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an E2E (end-to-end) feature flags service that integrates with Aftermath (an external feature flag management system) to provide flag configuration to applications. The service consists of two main components:
- **Server**: An Express.js API that serves feature flags to clients
- **Cron**: A scheduled job that syncs flags from Aftermath to Redis storage

## Development Commands

### Building and Running
```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript (using esbuild)
npm run build

# Run the server (port 3000 by default)
npm run start

# Run the cron job
npm run start-cron

# Development mode with TypeScript watch
npm run watch-mode

# Run TypeScript directly (for development)
npm run start-ts
```

### Testing and Quality
```bash
# Run all tests
npm test

# Run a specific test file
npx jest path/to/test.spec.ts

# Lint the codebase
npm run lint
```

### Docker Operations
```bash
# Build Docker image (AMD64 architecture)
npm run docker-build

# Push to ECR
npm run docker-push
```

## Architecture

### Core Services

1. **Server Service** (`src/services/server/`)
   - Entry point: `index.ts` - Initializes storage providers and starts the server
   - Main logic: `main.ts` - Express server with API endpoints
   - Flag retrieval: `get-flags.ts` - Handles flag fetching logic with fallback mechanisms

2. **Cron Service** (`src/services/cron/`)
   - Entry point: `index.ts` - Starts the cron job
   - Task runner: `cron-with-secret.ts` - Manages flag synchronization with Aftermath
   - Task logic: `cron-task.ts` - Actual sync implementation

### Storage Architecture

The system uses a **redundant storage pattern** with two layers:
- **Primary**: Redis (`RedisStorage`) - External persistent storage
- **Fallback**: Local memory (`LocalStorage`) - In-memory cache
- **Coordinator**: `StorageRedundancy` - Manages both storage layers with automatic fallback

### Flag Provider

`AftermathFlagsProvider` interfaces with the Aftermath API to:
- Fetch feature flags based on their lifecycle stage (0-7)
- Filter flags by status (active, deprecated, beforeDeployment)
- Transform flag data into a nested object structure using dot notation paths

### API Endpoints

- **GET /get-flags**: Returns all active flags (v1, stages 1-5)
- **GET /v2/get-flags**: Returns flags including pre-deployment (stages 0-7)
- **POST /is-registered**: Validates if provided flag keys exist
- **GET /init**: Generates and stores a hash for current flag state
- **GET /v2/init**: V2 version with branch-specific logic
- **GET /hash**: Retrieves flags by hash with fallback to fresh fetch
- **GET /v2/hash**: V2 version of hash endpoint

### Environment Variables

Required environment variables:
- `AFTERMATH_SECRET`: API key for Aftermath service (required)
- `AFTERMATH_FEATURES_URL`: Aftermath API endpoint (required)
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: localhost)
- `REDIS_URL`: Redis connection string (for production)

### Flag Lifecycle Stages

Flags in Aftermath have stages (0-7) that determine their availability:
- Stage 0: Before deployment (only in v2 endpoints with beforeDeployment flag)
- Stages 1-7: Active flags
- Stages > 5: Can be considered deprecated
- Paused/Cancelled status: Excluded from results

### Deployment

The service is containerized and deployed to Kubernetes:
- Multi-stage Docker build for optimized image size
- Helm charts for Kubernetes deployment (`helm-charts/`)
- AWS ECR for container registry
- Supports both server and cron deployments