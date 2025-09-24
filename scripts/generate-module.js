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
      'local': {},
      'remote': {
        [`${moduleName}-remote-datasource-impl.ts`]: generateRemoteDataSourceImpl(moduleName),
        [`${moduleName}-remote-datasource.ts`]: generateRemoteDataSource(moduleName),
        [`${moduleName}-remote-repo-impl.ts`]: generateRemoteRepoImpl(moduleName)
      }
    },
    'domain': {
      'entities': {
        'models': {},
        'params': {}
      },
      'repo': {
        [`${moduleName}-repo.ts`]: generateRepo(moduleName)
      },
      'usecases': {
        [`${moduleName}-usecases.ts`]: generateUsecases(moduleName)
      }
    },
    'presentation': {}
  };

  // Create the directory structure
  createDirectoryStructure(modulePath, structure);
  
  console.log(`✅ Module '${moduleName}' generated successfully!`);
  console.log(`📁 Location: src/modules/${moduleName}`);
  console.log(`\n📋 Generated files:`);
  console.log(`   - data/remote/${moduleName}-remote-datasource-impl.ts`);
  console.log(`   - data/remote/${moduleName}-remote-datasource.ts`);
  console.log(`   - data/remote/${moduleName}-remote-repo-impl.ts`);
  console.log(`   - domain/repo/${moduleName}-repo.ts`);
  console.log(`   - domain/usecases/${moduleName}-usecases.ts`);
  console.log(`\n📁 Empty directories:`);
  console.log(`   - data/local/`);
  console.log(`   - domain/entities/models/`);
  console.log(`   - domain/entities/params/`);
  console.log(`   - presentation/`);
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
import { ${className}Repo } from "../../domain/repo/${moduleName}-repo";
import { ${className}RemoteDataSource } from "./${moduleName}-remote-datasource";

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
import { ${className}Repo } from "../repo/${moduleName}-repo";

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
