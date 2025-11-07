# ZAP Mobile Documentation Index

This directory contains the complete documentation for the ZAP Mobile application, organized by feature domain.

## 📚 Books by Domain

### 1. Wallet Core
- **Book of Wallet Login — Mobile** (`wallet-login-mobile.md`)
  - Wallet authentication and device fingerprinting
  - Login state management and routing
  - Device-based authentication flow
- **Book of User Wallet Groups Management — Mobile** (`user-wallet-groups-mobile.md`)
  - Wallet group CRUD operations
  - Wallet switching and state management
  - Credential storage and cleanup

### 2. Wallet Accounts & Addresses  
- **Book of Wallet Accounts — Mobile** (`wallet-accounts-mobile.md`)
  - Multi-chain address derivation
  - Address book management
  - Private key handling and security

### 3. Wallet Portfolio & Tokens
- **Book of Wallet Portfolio — Mobile** (`wallet-portfolio-mobile.md`)
  - Token list management and processing
  - Portfolio balance calculations
  - Token enable/disable functionality

### 4. Wallet Transactions
- **Book of Wallet Transactions — Mobile** (`wallet-transactions-mobile.md`)
  - Send token functionality
  - Transaction signing and broadcasting
  - Gas fee estimation

### 5. Exchange Core
- **Book of Exchange Core — Mobile** (`exchange-core-mobile.md`)
  - Exchange user authentication
  - KYC verification flows
  - 2FA management

### 6. Exchange Banking & Payments
- **Book of Exchange Banking — Mobile** (`exchange-banking-mobile.md`)
  - Bank account management
  - Fiat payment integration
  - Account resolution and validation

### 7. Exchange Market Data
- **Book of Exchange Market — Mobile** (`exchange-market-mobile.md`)
  - Market rates and pricing
  - Token details and metadata
  - Price alerts and watchlists

### 8. Exchange Orders & Processing
- **Book of Exchange Orders — Mobile** (`exchange-orders-mobile.md`)
  - Order creation and management
  - Real-time order status updates
  - Swap functionality and progress tracking

### 9. System & Security
- **Book of System & Security — Mobile** (`system-security-mobile.md`)
  - Device security and biometrics
  - Notification management
  - Error handling and logging

## 🏗️ Architecture Overview

```
Mobile App Structure:
├── app/                    # Expo Router screens
├── components/            # Reusable UI components
├── src/core/              # Core business logic
├── src/modules/           # Feature modules
├── state/                 # Redux state management
├── services/              # API and business services
└── hooks/                 # Custom React hooks
```

## 📋 Documentation Standards

Each Book follows the template structure:
- **Mission**: What the module exists to do
- **Architecture**: High-level flow and key components
- **Public Surface**: Exposed APIs and interfaces
- **Data & State**: Storage and state management
- **Security**: Authentication and threat model
- **Ops**: Environment and deployment
- **Tests**: Coverage and critical cases
- **Changelog**: Recent changes and owners

## 🔄 Maintenance

- **Auto-generation**: Books are generated from code analysis
- **Code-first**: Documentation reflects actual implementation
- **Owner-driven**: Each Book has a designated owner
- **CI Integration**: Changes trigger documentation updates

## 📝 Template

See `BOOK_TEMPLATE.md` for the standard structure used across all Books.

---

**Last Updated**: 2025-01-22  
**Maintainer**: Mobile Team  
**Status**: Active Development
