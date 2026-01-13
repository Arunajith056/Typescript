# E-commerce API Project

A comprehensive TypeScript project demonstrating enterprise-level patterns and practices.

## Features

- **Domain-Driven Design**: Clean separation of concerns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **Type-Safe Queries**: Advanced query builder with TypeScript
- **API Responses**: Standardized response types
- **Error Handling**: Comprehensive error management
- **Audit Logging**: Activity tracking
- **Email Service**: Notification system

## Architecture

```
├── models/          # Domain models and types
├── repositories/    # Data access layer
├── services/        # Business logic layer
├── types/          # Shared type definitions
└── utils/          # Utility functions
```

## Key TypeScript Patterns Demonstrated

### 1. Generic Repository Pattern
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(options?: QueryOptions<T>): Promise<PaginatedResponse<T>>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
```

### 2. Advanced Query Builder
```typescript
const users = await new QueryBuilder<User>()
  .where('name', 'contains', 'John')
  .where('age', 'gte', 18)
  .orderBy('createdAt', 'desc')
  .page(1, 20)
  .build();
```

### 3. Type-Safe API Responses
```typescript
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: { code: string; message: string; };
};
```

### 4. Conditional Types for Filtering
```typescript
type FilterCondition<T> = {
  [K in keyof T]?: {
    [Op in FilterOperator]?: T[K] extends string 
      ? Op extends 'contains' | 'startsWith' ? string : T[K]
      : T[K] extends number
      ? Op extends 'gt' | 'gte' | 'lt' | 'lte' ? number : T[K]
      : T[K];
  };
};
```

## Usage Examples

### Creating a User Service
```typescript
const userRepo = new UserRepository();
const emailService = new EmailServiceImpl();
const auditService = new AuditServiceImpl();
const userService = new UserServiceImpl(userRepo, emailService, auditService);

// Create user with type safety
const result = await userService.createUser({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'customer',
  profile: {
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        sms: false
      }
    }
  }
});
```

### Type-Safe Querying
```typescript
const searchOptions = new QueryBuilder<User>()
  .where('role', 'eq', 'customer')
  .where('createdAt', 'gte', new Date('2023-01-01'))
  .orderBy('name', 'asc')
  .page(1, 50)
  .build();

const users = await userRepository.findMany(searchOptions);
```

## Running the Project

```bash
# Install dependencies
npm install

# Run the example
npx ts-node index.ts

# Run with development server
npm run dev
```

## Learning Objectives

After studying this project, you'll understand:

- ✅ Enterprise TypeScript architecture
- ✅ Advanced generic patterns
- ✅ Type-safe database operations
- ✅ Service layer design
- ✅ Error handling strategies
- ✅ Dependency injection
- ✅ Repository pattern implementation
- ✅ Query builder design
- ✅ API response standardization