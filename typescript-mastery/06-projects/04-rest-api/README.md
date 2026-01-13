# REST API with Authentication & Authorization

A comprehensive TypeScript REST API demonstrating authentication, authorization, and enterprise API design patterns.

## Architecture Overview

This REST API showcases professional TypeScript patterns for building secure, scalable web APIs:

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: Fine-grained permissions and role management
- **Express.js Integration**: Type-safe Express middleware and controllers
- **Repository Pattern**: Clean data access layer abstraction
- **Validation & Error Handling**: Comprehensive input validation and error responses
- **Security Best Practices**: Helmet, CORS, rate limiting, password hashing

## Key TypeScript Features Demonstrated

### 1. Extended Express Types
```typescript
interface AuthenticatedRequest extends Request {
  user: User;
  permissions: Permission[];
}

// Type-safe middleware
static requireAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await authService.verifyAccessToken(token);
    (req as AuthenticatedRequest).user = user;
    next();
  };
}
```

### 2. Generic Repository Pattern
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  findMany(filters?: QueryFilters): Promise<PaginatedResult<T>>;
}
```

### 3. Type-Safe API Responses
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: ResponseMeta;
}

function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T>;
```

### 4. JWT Payload Types
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}
```

## Core Components

### Authentication Service (`AuthService`)
- **User Registration**: Email validation, password strength, uniqueness checks
- **Login/Logout**: Credential verification and session management
- **Token Management**: JWT generation, refresh, and verification
- **Password Security**: bcrypt hashing with salt rounds

### Authorization Service (`AuthorizationService`)
- **Permission Checking**: Resource and action-based permissions
- **Role Validation**: Hierarchical role system
- **Middleware Factory**: Reusable authorization middleware

### Controllers
- **AuthController**: Registration, login, profile management
- **UserController**: CRUD operations with proper authorization
- **Error Handling**: Consistent error response format

### Repository Layer
- **Generic Interface**: Type-safe data operations
- **Query Filtering**: Search, pagination, sorting
- **Mock Implementation**: In-memory storage for development

## API Endpoints

### Authentication
```bash
POST /api/auth/register     # Register new user
POST /api/auth/login        # User login
POST /api/auth/refresh      # Refresh access token
POST /api/auth/logout       # User logout
GET  /api/auth/profile      # Get current user profile
```

### Users
```bash
GET  /api/users            # List users (admin/moderator only)
GET  /api/users/:id        # Get user by ID
PUT  /api/users/:id        # Update user (own profile or admin)
```

### System
```bash
GET  /api/health           # Health check endpoint
```

## Usage Examples

### User Registration
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'johndoe',
    password: 'SecurePass123!'
  })
});

const result: ApiResponse<{
  user: Omit<User, 'passwordHash'>;
  tokens: AuthTokens;
}> = await response.json();
```

### Authenticated Request
```typescript
const response = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const profile: ApiResponse<User> = await response.json();
```

### Admin Operations
```typescript
const response = await fetch('/api/users?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const users: ApiResponse<PaginatedResult<User>> = await response.json();
```

## Security Features

### Password Security
- **bcrypt Hashing**: Industry-standard password hashing
- **Salt Rounds**: Configurable computational cost
- **Strength Validation**: Regex-based password requirements

### JWT Security
- **Short-lived Access Tokens**: 15-minute expiration
- **Refresh Token Rotation**: 7-day refresh tokens
- **Secure Headers**: Proper token validation

### Request Security
- **Helmet**: Security headers middleware
- **CORS**: Cross-origin request configuration
- **Rate Limiting**: IP-based request throttling
- **Input Validation**: Comprehensive request validation

## Authorization System

### Roles
- **admin**: Full system access
- **moderator**: User management and content moderation
- **user**: Basic user operations
- **guest**: Limited read-only access

### Permissions
```typescript
interface Permission {
  resource: string;          // 'users', 'posts', 'comments'
  actions: string[];         // ['create', 'read', 'update', 'delete']
}
```

### Middleware Usage
```typescript
app.get('/api/users',
  AuthorizationService.requireAuth(),
  AuthorizationService.requireRole('admin', 'moderator'),
  userController.getAllUsers
);

app.put('/api/users/:id',
  AuthorizationService.requireAuth(),
  AuthorizationService.requirePermission('profile', 'update'),
  userController.updateUser
);
```

## Error Handling

### Custom Error Classes
```typescript
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class ValidationError extends Error {
  constructor(message: string, public errors: ValidationError[]) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Consistent Response Format
```typescript
// Success response
{
  "success": true,
  "data": { /* user data */ },
  "message": "User created successfully",
  "meta": {
    "timestamp": "2023-07-20T10:30:00Z",
    "requestId": "abc123",
    "version": "1.0.0"
  }
}

// Error response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_EMAIL"
    }
  ]
}
```

## Running the Application

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Watch TypeScript compilation
npm run watch
```

### Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables
```env
JWT_SECRET=your-super-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
PORT=3000
NODE_ENV=development
```

## Testing

### Unit Tests
```typescript
describe('AuthService', () => {
  it('should register a new user', async () => {
    const result = await authService.register(
      'test@example.com',
      'testuser',
      'Password123!'
    );
    
    expect(result.user.email).toBe('test@example.com');
    expect(result.tokens.accessToken).toBeDefined();
  });
});
```

### Integration Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Performance Considerations

1. **Connection Pooling**: Database connection management
2. **Caching**: Redis for session and user data
3. **Pagination**: Limit response sizes
4. **Compression**: Gzip response compression
5. **Rate Limiting**: Prevent abuse and DoS

## Security Best Practices

1. **Input Validation**: Sanitize all user inputs
2. **SQL Injection**: Use parameterized queries
3. **XSS Protection**: Content Security Policy headers
4. **HTTPS**: Enforce secure connections in production
5. **Audit Logging**: Track security-related events

## Extension Ideas

1. **OAuth Integration**: Google, GitHub, Facebook login
2. **Email Verification**: Account activation workflow
3. **Password Reset**: Secure password recovery
4. **Two-Factor Authentication**: TOTP or SMS verification
5. **API Versioning**: Multiple API versions support
6. **OpenAPI Documentation**: Swagger/OpenAPI specs

## Learning Outcomes

This project demonstrates:
- Express.js with TypeScript integration
- JWT authentication and authorization
- Middleware design patterns
- Repository pattern implementation
- Error handling strategies
- Security best practices
- API design principles
- Type-safe request/response handling