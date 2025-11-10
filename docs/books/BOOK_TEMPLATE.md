# Book of <Feature / Domain> — Mobile

**Keeper**: <Name> | **Last Review**: <Date> | **Status**: Active

## I. Mission
- <1–3 bullets: what this module exists to do>
- <Core responsibilities>
- <Key user flows supported>

## II. Architecture

### High-Level Flow
```
[ASCII diagram showing main data flow]
User Action → Component → Hook → Service → SDK → Backend
```

### Key Packages / Services
- **Core Services**: `src/core/`
- **Feature Modules**: `src/modules/`
- **UI Components**: `components/`
- **State Management**: `state/`
- **Custom Hooks**: `hooks/`

### External Dependencies
- **SDK**: `@zap/blockchain-sdk`
- **Navigation**: `@react-navigation/native`
- **State**: `@reduxjs/toolkit`
- **Storage**: `expo-secure-store`
- **UI**: `@shopify/restyle`

## III. Public Surface

### Screens & Navigation
| Screen | Route | Props | Purpose |
|--------|-------|-------|---------|
| `<ScreenName>` | `/<path>` | `{...props}` | `<description>` |

### Hooks & Services
| Hook/Service | Parameters | Returns | Purpose |
|--------------|------------|---------|---------|
| `useHookName` | `{param1, param2}` | `{data, loading, error}` | `<description>` |

### Events & Webhooks
| Event | Trigger | Payload | Handler |
|-------|---------|---------|---------|
| `<eventName>` | `<trigger>` | `{...data}` | `<handler>` |

## IV. Data & State

### Redux Store Structure
```typescript
interface State {
  // Store structure
}
```

### Local Storage
- **SecureStore Keys**: `<list of keys>`
- **AsyncStorage**: `<list of keys>`
- **Cache**: `<cache strategy>`

### State Invariants
- <Invariant 1>
- <Invariant 2>
- <Invariant 3>

## V. Security

### Authentication
- **Wallet Auth**: `<auth method>`
- **Exchange Auth**: `<auth method>`
- **Biometric**: `<biometric integration>`

### Sensitive Data
- **Private Keys**: `<storage method>`
- **Seed Phrases**: `<storage method>`
- **Auth Tokens**: `<storage method>`

### Threat Model
- **Key Extraction**: `<mitigation>`
- **Man-in-the-Middle**: `<mitigation>`
- **Device Compromise**: `<mitigation>`

## VI. Ops

### Environment Variables
```bash
# Required environment variables
API_BASE_URL=
WEBSOCKET_URL=
```

### Build & Deploy
```bash
# Development
npm run start

# Production
npm run build
```

### Observability
- **Logging**: `<logging strategy>`
- **Error Tracking**: `<error tracking>`
- **Analytics**: `<analytics integration>`

## VII. Tests

### Test Coverage
- **Unit Tests**: `<coverage>`
- **Integration Tests**: `<coverage>`
- **E2E Tests**: `<coverage>`

### Critical Test Cases
- `<test case 1>`
- `<test case 2>`
- `<test case 3>`

## VIII. Changelog & Owners

### Current Owner(s)
- **Primary**: <Name> (<email>)
- **Secondary**: <Name> (<email>)

### Recent Changes
- **YYYY-MM-DD**: <change description>
- **YYYY-MM-DD**: <change description>

### TODO / Open Questions
- [ ] <todo item 1>
- [ ] <todo item 2>
- [ ] <todo item 3>

---

**Note**: This template should be filled with code-derived facts only. If behavior is not evident from code, mark as "TBD by owner."
