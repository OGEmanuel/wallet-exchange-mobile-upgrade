#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate module folder structure
 * Usage: node scripts/generate-module.js <module-name>
 * Example: node scripts/generate-module.js user-profile
 */

function generateModuleStructure(moduleName) {
  const modulePath = path.join(__dirname, '..', 'src', 'modules', moduleName);
  
  // Define the folder structure
  const structure = {
    'data': {
      [`${moduleName}-repo-impl.ts`]: generateRemoteRepoImpl(moduleName),
      'local': {
        [`${moduleName}-local-datasource-impl.ts`]: generateLocalDataSourceImpl(moduleName),
        [`${moduleName}-local-datasource.ts`]: generateLocalDataSource(moduleName)
      },
      'remote': {
        [`${moduleName}-remote-datasource-impl.ts`]: generateRemoteDataSourceImpl(moduleName),
        [`${moduleName}-remote-datasource.ts`]: generateRemoteDataSource(moduleName)
      }
    },
    'domain': {
      [`${moduleName}-repo.ts`]: generateRepo(moduleName),
      'entities': {
        'models': {},
        'params': {}
      },
      'usecases': {
        [`${moduleName}-usecases.ts`]: generateUsecases(moduleName)
      }
    },
    'presentation': {
      'components': {},
      'hooks': {},
      'screens': {},
      'state': {
        [`${moduleName}-slice.ts`]: generateSlice(moduleName)
      }
    }
  };

  // Create the directory structure
  createDirectoryStructure(modulePath, structure);
  
  console.log(`✅ Module '${moduleName}' generated successfully!`);
  console.log(`📁 Location: src/modules/${moduleName}`);
  console.log(`\n📋 Generated files:`);
  console.log(`   - data/${moduleName}-repo-impl.ts`);
  console.log(`   - data/local/${moduleName}-local-datasource-impl.ts`);
  console.log(`   - data/local/${moduleName}-local-datasource.ts`);
  console.log(`   - data/remote/${moduleName}-remote-datasource-impl.ts`);
  console.log(`   - data/remote/${moduleName}-remote-datasource.ts`);
  console.log(`   - domain/${moduleName}-repo.ts`);
  console.log(`   - domain/usecases/${moduleName}-usecases.ts`);
  console.log(`   - presentation/state/${moduleName}-slice.ts`);
  console.log(`\n📁 Empty directories:`);
  console.log(`   - domain/entities/models/`);
  console.log(`   - domain/entities/params/`);
  console.log(`   - presentation/components/`);
  console.log(`   - presentation/hooks/`);
  console.log(`   - presentation/screens/`);
}

function createDirectoryStructure(basePath, structure) {
  for (const [name, content] of Object.entries(structure)) {
    const currentPath = path.join(basePath, name);
    
    if (typeof content === 'string') {
      // It's a file content
      fs.writeFileSync(currentPath, content);
    } else if (typeof content === 'object' && content !== null) {
      // It's a directory
      fs.mkdirSync(currentPath, { recursive: true });
      createDirectoryStructure(currentPath, content);
    }
  }
}

function generateRemoteDataSource(moduleName) {
  const className = toPascalCase(moduleName);
  return `import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";

export abstract class ${className}RemoteDataSource {
  // Add your remote data source methods here
  // Example:
  // abstract getData(payload: ApiRequest<unknown>): Promise<ApiResponse<unknown>>;
}
`;
}

function generateRemoteDataSourceImpl(moduleName) {
  const className = toPascalCase(moduleName);
  return `import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { ${className}RemoteDataSource } from "./${moduleName}-remote-datasource";

export class ${className}RemoteDataSourceImpl implements ${className}RemoteDataSource {
  // Implement your remote data source methods here
  // Example:
  // async getData(payload: ApiRequest<unknown>): Promise<ApiResponse<unknown>> {
  //   // Implementation here
  //   throw new Error("Method not implemented.");
  // }
}
`;
}

function generateRemoteRepoImpl(moduleName) {
  const className = toPascalCase(moduleName);
  return `import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { ${className}Repo } from "../domain/${moduleName}-repo";
import { ${className}RemoteDataSource } from "./remote/${moduleName}-remote-datasource";

export class ${className}RemoteRepoImpl implements ${className}Repo {
  constructor(private readonly remoteDataSource: ${className}RemoteDataSource) {}

  // Implement your repository methods here
  // Example:
  // async getData(payload: ApiRequest<unknown>): Promise<ApiResponse<unknown>> {
  //   return this.remoteDataSource.getData(payload);
  // }
}
`;
}

function generateRepo(moduleName) {
  const className = toPascalCase(moduleName);
  return `import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";

export abstract class ${className}Repo {
  // Add your repository methods here
  // Example:
  // abstract getData(payload: ApiRequest<unknown>): Promise<ApiResponse<unknown>>;
}
`;
}

function generateUsecases(moduleName) {
  const className = toPascalCase(moduleName);
  return `import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { ${className}Repo } from "../${moduleName}-repo";

export class ${className}Usecases {
  constructor(private readonly repo: ${className}Repo) {}

  // Add your use case methods here
  // Example:
  // async executeGetData(payload: ApiRequest<unknown>): Promise<ApiResponse<unknown>> {
  //   return this.repo.getData(payload);
  // }
}
`;
}

function generateLocalDataSource(moduleName) {
  const className = toPascalCase(moduleName);
  return `import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";

export abstract class ${className}LocalDataSource {
  // Add your local data source methods here
  // Example:
  // abstract getCachedData(key: string): Promise<unknown>;
  // abstract setCachedData(key: string, data: unknown): Promise<void>;
  // abstract clearCachedData(key: string): Promise<void>;
}
`;
}

function generateLocalDataSourceImpl(moduleName) {
  const className = toPascalCase(moduleName);
  return `import * as SecureStore from "expo-secure-store";
import { ApiRequest, ApiResponse } from "@/src/core/api/api-models";
import { ${className}LocalDataSource } from "./${moduleName}-local-datasource";

export class ${className}LocalDataSourceImpl implements ${className}LocalDataSource {
  // Implement your local data source methods here
  // Example:
  // async getCachedData(key: string): Promise<unknown> {
  //   try {
  //     const data = await SecureStore.getItemAsync(key);
  //     return data ? JSON.parse(data) : null;
  //   } catch (error) {
  //     console.error('Error getting cached data:', error);
  //     return null;
  //   }
  // }

  // async setCachedData(key: string, data: unknown): Promise<void> {
  //   try {
  //     await SecureStore.setItemAsync(key, JSON.stringify(data));
  //   } catch (error) {
  //     console.error('Error setting cached data:', error);
  //     throw error;
  //   }
  // }

  // async clearCachedData(key: string): Promise<void> {
  //   try {
  //     await SecureStore.deleteItemAsync(key);
  //   } catch (error) {
  //     console.error('Error clearing cached data:', error);
  //     throw error;
  //   }
  // }
}
`;
}


function generateSlice(moduleName) {
  const className = toPascalCase(moduleName);
  return `// Redux slice for ${moduleName} module
// Add your state management logic here
`;
}

function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: Module name is required');
    console.log('\nUsage: node scripts/generate-module.js <module-name>');
    console.log('Example: node scripts/generate-module.js user-profile');
    process.exit(1);
  }

  const moduleName = args[0];
  
  // Validate module name (kebab-case)
  if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(moduleName)) {
    console.error('❌ Error: Module name must be in kebab-case (e.g., user-profile, auth-service)');
    process.exit(1);
  }

  try {
    generateModuleStructure(moduleName);
  } catch (error) {
    console.error('❌ Error generating module:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
