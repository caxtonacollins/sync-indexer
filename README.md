# SyncPay Indexer

[![Apibara](https://img.shields.io/badge/Apibara-0052FF?style=flat&logo=starknet&logoColor=white)](https://apibara.com/)
[![StarkNet](https://img.shields.io/badge/StarkNet-0052FF?style=flat&logo=starknet&logoColor=white)](https://starknet.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-3982CE?style=flat&logo=postgresql&logoColor=white)](https://drizzle-orm.com/)

## Overview

SyncPay Indexer is a real-time data indexer built with Apibara for the Sync decentralized payment system. It continuously monitors and indexes blockchain events from StarkNet, focusing on liquidity pools, payment transactions, and related smart contract interactions. This indexer provides the backend services with up-to-date, queryable data for seamless fiat-to-crypto payment processing.

Key responsibilities include:
- Indexing liquidity pool events and balance changes.
- Tracking payment transactions and swaps on StarkNet.
- Storing indexed data in PostgreSQL for fast querying.
- Enabling real-time updates for the Sync ecosystem.

## Features

- **Real-time Indexing**: Uses Apibara's streaming capabilities to index StarkNet events as they occur.
- **Liquidity Monitoring**: Tracks changes in liquidity pools and automated funding events.
- **Payment Event Indexing**: Captures transaction data for fiat-to-crypto conversions and merchant payments.
- **Database Integration**: Stores indexed data using Drizzle ORM for efficient querying.
- **Type Safety**: Built with TypeScript for reliable data handling and transformations.

## Tech Stack

- **Framework**: Apibara (StarkNet data indexer)
- **Language**: TypeScript (ESM modules)
- **Blockchain Integration**: @apibara/starknet for StarkNet event streaming
- **Database**: PostgreSQL with Drizzle ORM for schema management and queries
- **Development Tools**: Drizzle Kit for migrations and schema generation

## Installation

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- PostgreSQL database
- Access to a StarkNet node or Apibara-compatible data source

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sync/syncpay-indexer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**

   Create a `.env` file with necessary configurations:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/indexer_db

   # StarkNet Configuration
   STARKNET_RPC_URL=your_starknet_rpc_url
   STARTING_BLOCK=0  # Block number to start indexing from

   # Apibara Settings (if needed)
   APIBARA_CONFIG_PATH=./apibara.config.ts
   ```

4. **Database Setup**

   Ensure PostgreSQL is running and create the database:
   ```bash
   createdb indexer_db
   ```

   Generate and run migrations:
   ```bash
   pnpm run drizzle:generate
   pnpm run drizzle:migrate
   ```

5. **Build the Indexer**
   ```bash
   pnpm run build
   ```

## Usage

### Development

- **Prepare Environment**: `pnpm run prepare` - Sets up Apibara configuration.
- **Run in Development Mode**: `pnpm run dev` - Starts the indexer with hot-reload for configuration changes.
- **Start Production Indexer**: `pnpm run start` - Runs the indexer in production mode.
- **Start Liquidity Indexer**: `pnpm run start:liquidity` - Specifically starts the liquidity-focused indexer.

### Configuration

The indexer uses `apibara.config.ts` for defining data sources, filters, and transformations. Key configurations include:
- **Data Sources**: StarkNet contracts for liquidity pools and payment events.
- **Event Filters**: Specify which events to index (e.g., transfers, swaps).
- **Transformers**: Define how raw blockchain data is processed and stored.

### Integration with Sync Ecosystem

- **Data Flow**: Indexes events from StarkNet and stores them in PostgreSQL for the Sync Backend to query.
- **Real-time Updates**: Provides live data for wallet balances, transaction history, and liquidity status.
- **Error Handling**: Robust retry mechanisms for network issues and data inconsistencies.

## Project Structure

```
syncpay-indexer/
├── src/                    # Source code for indexers and transformers
│   ├── indexers/          # Specific indexer implementations
│   │   └── liquidity.ts   # Liquidity pool indexer
│   ├── transformers/      # Data transformation logic
│   └── ...
├── apibara.config.ts      # Apibara configuration file
├── drizzle.config.ts      # Drizzle ORM configuration
├── schema/                # Database schema definitions
└── ...
```

## Development

### Adding New Indexers

1. Define the data source in `apibara.config.ts`.
2. Create transformer functions for event processing.
3. Update the database schema if needed using Drizzle.
4. Test with `pnpm run dev`.

### Type Checking

- Run `pnpm run typecheck` to ensure TypeScript compliance without emitting files.

## Deployment

- **Production Deployment**: Use `pnpm run start` in a containerized environment (e.g., Docker) with proper environment variables.
- **Monitoring**: Integrate with logging and monitoring tools to track indexing performance and errors.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-indexer`.
3. Implement the indexer logic and update configurations.
4. Test thoroughly with StarkNet testnet data.
5. Push to the branch: `git push origin feature/your-indexer`.
6. Open a pull request.

Ensure all new indexers include proper error handling and are optimized for performance.

## License

This project is part of the Sync ecosystem and follows the same licensing as the backend.

## Support

For issues or questions, please refer to the main Sync project documentation or contact the development team.

---

*Built with Apibara and StarkNet for real-time blockchain data indexing in the Sync payment ecosystem.*
