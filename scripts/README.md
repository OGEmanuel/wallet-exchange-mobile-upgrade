# Module Generator Script

This script generates a complete module folder structure following the project's architecture pattern.

## Usage

### Using npm script (recommended):
```bash
npm run generate-module <module-name>
```

### Using node directly:
```bash
node scripts/generate-module.js <module-name>
```

## Examples

```bash
# Generate a user profile module
npm run generate-module user-profile

# Generate an authentication module
npm run generate-module auth-service

# Generate a payment module
npm run generate-module payment-gateway
```

## Generated Structure

The script creates the following folder structure:

```
src/modules/<module-name>/
├── data/
│   ├── <module-name>-repo-impl.ts           # Repository implementation
│   ├── local/
│   │   ├── <module-name>-local-datasource.ts
│   │   └── <module-name>-local-datasource-impl.ts
│   └── remote/
│       ├── <module-name>-remote-datasource.ts
│       └── <module-name>-remote-datasource-impl.ts
├── domain/
│   ├── <module-name>-repo.ts                # Repository interface
│   ├── entities/
│   │   ├── models/              # Empty directory for entity models
│   │   └── params/              # Empty directory for parameter types
│   └── usecases/
│       └── <module-name>-usecases.ts
└── presentation/
    ├── components/              # Empty directory for UI components
    ├── hooks/                   # Empty directory for custom hooks
    ├── screens/                 # Empty directory for screen components
    └── state/
        └── <module-name>-slice.ts
```

## Generated Files

### 1. Repository Interface (`domain/<module-name>-repo.ts`)
- Abstract class defining the repository contract
- Contains method signatures for data operations
- Located directly in domain folder to show connection with data layer

### 2. Local Data Source (`data/local/<module-name>-local-datasource.ts`)
- Abstract class defining local data source contract
- Contains method signatures for local storage operations

### 3. Local Data Source Implementation (`data/local/<module-name>-local-datasource-impl.ts`)
- Concrete implementation of the local data source
- Uses `expo-secure-store` for secure local storage
- Implements caching, storing, and clearing operations

### 4. Remote Data Source (`data/remote/<module-name>-remote-datasource.ts`)
- Abstract class defining remote data source contract
- Contains method signatures for API calls

### 5. Remote Data Source Implementation (`data/remote/<module-name>-remote-datasource-impl.ts`)
- Concrete implementation of the remote data source
- Implements actual API calls using the base service

### 6. Repository Implementation (`data/<module-name>-repo-impl.ts`)
- Concrete implementation of the repository
- Uses the remote data source to fulfill repository contract
- Located directly in the `data/` folder

### 7. Use Cases (`domain/usecases/<module-name>-usecases.ts`)
- Contains business logic and orchestration
- Uses the repository to execute operations

### 8. Redux Slice (`presentation/state/<module-name>-slice.ts`)
- Redux slice for state management
- Contains module-specific state logic
- Ready for Redux Toolkit integration

## Naming Convention

- Module names should be in **kebab-case** (e.g., `user-profile`, `auth-service`)
- Class names are automatically converted to **PascalCase** (e.g., `UserProfile`, `AuthService`)
- File names follow the pattern: `<module-name>-<type>.ts`

## Requirements

- Node.js (comes with npm)
- Module name must be in kebab-case format
- Module name cannot already exist in `src/modules/`

## Error Handling

The script includes validation for:
- Missing module name
- Invalid naming format (must be kebab-case)
- File system errors during creation

## Next Steps

After generating a module:

1. **Add entity models** in `domain/entities/models/`
2. **Add parameter types** in `domain/entities/params/`
3. **Implement repository methods** in `domain/repo/<module-name>-repo.ts`
4. **Implement local data source methods** in `data/local/<module-name>-local-datasource-impl.ts`
5. **Implement remote data source methods** in `data/remote/<module-name>-remote-datasource-impl.ts`
6. **Implement use case methods** in `domain/usecases/<module-name>-usecases.ts`
7. **Add UI components** in `presentation/`

### Local Storage Features

The generated local data source includes:
- **Secure Storage**: Uses `expo-secure-store` for encrypted local storage
- **Caching Methods**: `getCachedData()`, `setCachedData()`, `clearCachedData()`
- **Error Handling**: Proper try-catch blocks with console logging
- **JSON Serialization**: Automatic JSON parsing and stringification
