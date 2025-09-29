# HTTP Request Utility

A comprehensive HTTP request utility built with Axios that provides a clean interface for making API calls in your React Native application.

## Features

- ✅ **TypeScript Support**: Full type safety with generic types
- ✅ **Multiple HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- ✅ **Error Handling**: Comprehensive error handling with custom error types
- ✅ **Retry Mechanism**: Automatic retry for failed requests
- ✅ **Request/Response Interceptors**: Built-in logging and auth token handling
- ✅ **File Upload/Download**: Support for file operations
- ✅ **Customizable**: Configurable timeouts, retries, and headers
- ✅ **Multiple Instances**: Support for different API endpoints

## Quick Start

```typescript
import { httpRequest, get, post, put, del } from "./httpRequest"

// Using the default instance
const response = await httpRequest.get<User[]>("/users")

// Using individual methods
const users = await get<User[]>("/users")
const newUser = await post<User>("/users", { name: "John", email: "john@example.com" })
```

## API Reference

### Basic Methods

#### GET Request

```typescript
const response: ApiResponse<User[]> = await httpRequest.get<User[]>("/users")
```

#### POST Request

```typescript
const userData = { name: "John", email: "john@example.com" }
const response: ApiResponse<User> = await httpRequest.post<User>("/users", userData)
```

#### PUT Request

```typescript
const updatedData = { name: "John Smith" }
const response: ApiResponse<User> = await httpRequest.put<User>("/users/1", updatedData)
```

#### PATCH Request

```typescript
const partialData = { email: "newemail@example.com" }
const response: ApiResponse<User> = await httpRequest.patch<User>("/users/1", partialData)
```

#### DELETE Request

```typescript
const response: ApiResponse<void> = await httpRequest.delete<void>("/users/1")
```

### File Operations

#### Upload File

```typescript
const formData = new FormData()
formData.append("file", file)
const response: ApiResponse<UploadResult> = await httpRequest.uploadFile<UploadResult>(
  "/upload",
  formData,
)
```

#### Download File

```typescript
const blob = await httpRequest.downloadFile("/files/123/download")
```

### Custom Configuration

#### Create Custom Instance

```typescript
const customHttp = new HttpRequest("https://api.example.com/v1", {
  timeout: 15000,
  headers: {
    "X-API-Key": "your-api-key",
  },
})
```

#### Request with Query Parameters

```typescript
const params = {
  page: 1,
  limit: 10,
  search: "example",
}
const response = await httpRequest.get("/data", params)
```

#### Request with Custom Config

```typescript
const response = await httpRequest.get("/data", undefined, {
  timeout: 30000,
  retries: 5,
  retryDelay: 2000,
  headers: {
    "Custom-Header": "value",
  },
})
```

#### Request with Query Parameters and Custom Config

```typescript
const params = { page: 1, limit: 10 }
const response = await httpRequest.get("/data", params, {
  timeout: 30000,
  retries: 5,
})
```

### Authentication

#### Set Auth Token

```typescript
httpRequest.setAuthToken("your-jwt-token")
```

#### Remove Auth Token

```typescript
httpRequest.removeAuthToken()
```

### Error Handling

```typescript
try {
  const response = await httpRequest.get("/users")
  return response.data
} catch (error) {
  const apiError = error as ApiError
  console.error("Error:", apiError.message, "Status:", apiError.status)

  switch (apiError.status) {
    case 401:
      // Handle unauthorized
      break
    case 404:
      // Handle not found
      break
    case 500:
      // Handle server error
      break
  }
}
```

## Types

### ApiResponse<T>

```typescript
interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
  success: boolean
}
```

### ApiError

```typescript
interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}
```

### RequestConfig

```typescript
interface RequestConfig extends AxiosRequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
}
```

## Configuration Options

- `timeout`: Request timeout in milliseconds (default: 10000)
- `retries`: Number of retry attempts (default: 3)
- `retryDelay`: Delay between retries in milliseconds (default: 1000)
- `baseURL`: Base URL for all requests
- `headers`: Default headers for all requests

## Development Features

- **Request Logging**: Automatically logs requests and responses in development mode
- **Error Logging**: Comprehensive error logging with stack traces
- **Retry Logic**: Automatic retry for network errors and server errors (5xx)
- **Type Safety**: Full TypeScript support with generic types

## Examples

See `example.ts` for comprehensive usage examples including:

- Basic CRUD operations
- File upload/download
- Custom instances
- Error handling
- Retry configuration
