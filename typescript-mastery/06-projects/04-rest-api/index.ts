/**
 * REST API with Authentication & Authorization
 * Demonstrates Express.js, JWT authentication, role-based access, and API design patterns
 */

// Type-only imports for demonstration (in real app, install these packages)
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';

// Mock types for demonstration
type Request = {
  headers: { authorization?: string };
  body: any;
  query: Record<string, string | string[] | undefined>;
  params: Record<string, string>;
};

type Response = {
  status: (code: number) => Response;
  json: (data: any) => void;
};

type NextFunction = () => void;

// Mock Node.js process
declare const process: {
  env: Record<string, string | undefined>;
};

// Mock implementations for JWT and bcrypt
const jwt = {
  sign: (payload: any, secret: string, options?: any): string => {
    return `mock-jwt-${JSON.stringify(payload)}-${secret}`;
  },
  verify: (token: string, secret: string): any => {
    if (token.startsWith('mock-jwt-')) {
      const payloadString = token.replace('mock-jwt-', '').split(`-${secret}`)[0];
      if (payloadString) {
        return JSON.parse(payloadString);
      }
    }
    throw new Error('Invalid token');
  }
};

const bcrypt = {
  hash: async (password: string, rounds: number): Promise<string> => {
    return `hashed-${password}-${rounds}`;
  },
  compare: async (password: string, hash: string): Promise<boolean> => {
    return hash === `hashed-${password}-12`;
  }
};

// ==================== CORE TYPES ====================

interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  permissions: Permission[];
  profile: UserProfile;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

interface Permission {
  resource: string;
  actions: string[]; // ['create', 'read', 'update', 'delete']
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

// Extended Request with user context
interface AuthenticatedRequest extends Request {
  user: User;
  permissions: Permission[];
  params: Record<string, string>;
  body: any;
}

interface ApiValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

type ValidationErrors = ApiValidationError[];

// ==================== API RESPONSE TYPES ====================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationErrors;
  meta?: ResponseMeta;
}

interface ResponseMeta {
  timestamp: Date;
  requestId: string;
  version: string;
  pagination?: PaginationMeta;
  rateLimit?: RateLimitMeta;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface RateLimitMeta {
  limit: number;
  remaining: number;
  reset: number;
}

// ==================== DATABASE INTERFACES ====================

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findByEmail(email: string): Promise<T | null>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  findMany(filters?: QueryFilters): Promise<PaginatedResult<T>>;
}

interface QueryFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

// ==================== AUTHENTICATION SERVICE ====================

class AuthService {
  constructor(
    private userRepository: Repository<User>,
    private jwtSecret: string,
    private refreshTokenSecret: string
  ) {}

  async register(
    email: string,
    username: string,
    password: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    // Validation
    await this.validateRegistration(email, username, password);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      username,
      passwordHash,
      role: 'user',
      permissions: [
        { resource: 'profile', actions: ['read', 'update'] },
        { resource: 'posts', actions: ['create', 'read', 'update'] }
      ],
      profile: {
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            marketing: false
          }
        }
      },
      isActive: true,
      emailVerified: false
    };

    const user = await this.userRepository.create(userData);
    const tokens = await this.generateTokens(user);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, tokens };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date()
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, this.refreshTokenSecret) as JWTPayload;
      const user = await this.userRepository.findById(payload.userId);
      
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    // In a real app, you'd add the refresh token to a blacklist
    // For now, we'll just validate it exists
    try {
      jwt.verify(refreshToken, this.refreshTokenSecret);
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async verifyAccessToken(token: string): Promise<User> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JWTPayload;
      const user = await this.userRepository.findById(payload.userId);
      
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid access token');
      }

      return user;
    } catch (error) {
      throw new AuthenticationError('Invalid access token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  }

  private async validateRegistration(
    email: string,
    username: string,
    password: string
  ): Promise<void> {
    const errors: ValidationErrors = [];

    // Email validation
    if (!this.isValidEmail(email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Check if email exists
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      errors.push({
        field: 'email',
        message: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Username validation
    if (username.length < 3 || username.length > 30) {
      errors.push({
        field: 'username',
        message: 'Username must be between 3 and 30 characters',
        code: 'INVALID_USERNAME_LENGTH'
      });
    }

    // Password validation
    if (!this.isStrongPassword(password)) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
        code: 'WEAK_PASSWORD'
      });
    }

    if (errors.length > 0) {
      throw new ValidationErrorException('Validation failed', errors);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}

// ==================== AUTHORIZATION MIDDLEWARE ====================

class AuthorizationService {
  static hasPermission(
    userPermissions: Permission[],
    resource: string,
    action: string
  ): boolean {
    return userPermissions.some(permission =>
      permission.resource === resource && permission.actions.includes(action)
    );
  }

  static hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  static requireAuth() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json(createErrorResponse('Authentication required'));
        }

        const token = authHeader.split(' ')[1];
        const authService = new AuthService(
          new UserRepository(), // Implement this
          process.env.JWT_SECRET!,
          process.env.REFRESH_TOKEN_SECRET!
        );

        if (!token) {
        throw new AuthenticationError('Access token is required');
      }

      const user = await authService.verifyAccessToken(token);
        (req as AuthenticatedRequest).user = user;
        (req as AuthenticatedRequest).permissions = user.permissions;

        next();
      } catch (error) {
        res.status(401).json(createErrorResponse('Invalid authentication'));
      }
    };
  }

  static requirePermission(resource: string, action: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const hasPermission = AuthorizationService.hasPermission(
        req.permissions,
        resource,
        action
      );

      if (!hasPermission) {
        return res.status(403).json(createErrorResponse('Insufficient permissions'));
      }

      next();
    };
  }

  static requireRole(...roles: UserRole[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const hasRole = AuthorizationService.hasRole(req.user.role, roles);

      if (!hasRole) {
        return res.status(403).json(createErrorResponse('Insufficient role'));
      }

      next();
    };
  }
}

// ==================== API CONTROLLERS ====================

class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, username, password } = req.body;
      const result = await this.authService.register(email, username, password);

      res.status(201).json(createSuccessResponse(result, 'User registered successfully'));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      res.json(createSuccessResponse(result, 'Login successful'));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);

      res.json(createSuccessResponse(tokens, 'Token refreshed successfully'));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);

      res.json(createSuccessResponse(null, 'Logout successful'));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { passwordHash: _, ...userWithoutPassword } = req.user;
      res.json(createSuccessResponse(userWithoutPassword, 'Profile retrieved'));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private handleError(error: any, res: Response): void {
    if (error instanceof AuthenticationError) {
      res.status(401).json(createErrorResponse(error.message));
    } else if (error instanceof ValidationErrorException) {
      res.status(400).json(createValidationErrorResponse(error.message, error.errors));
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json(createErrorResponse('Internal server error'));
    }
  }
}

class UserController {
  constructor(private userRepository: Repository<User>) {}

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: QueryFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
        search: req.query.search as string
      };

      const result = await this.userRepository.findMany(filters);
      
      // Remove password hashes from response
      const usersWithoutPasswords = result.items.map(({ passwordHash, ...user }) => user);

      res.json(createSuccessResponse(
        { ...result, items: usersWithoutPasswords },
        'Users retrieved successfully'
      ));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to retrieve users'));
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(createErrorResponse('User ID is required'));
        return;
      }
      
      const user = await this.userRepository.findById(id);

      if (!user) {
        return res.status(404).json(createErrorResponse('User not found'));
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(createSuccessResponse(userWithoutPassword, 'User retrieved'));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to retrieve user'));
    }
  };

  updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(createErrorResponse('User ID is required'));
        return;
      }
      
      const updates = req.body;

      // Users can only update their own profile unless they're admin
      if (id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json(createErrorResponse('Can only update your own profile'));
      }

      const updatedUser = await this.userRepository.update(id, updates);
      const { passwordHash: _, ...userWithoutPassword } = updatedUser;

      res.json(createSuccessResponse(userWithoutPassword, 'User updated successfully'));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to update user'));
    }
  };
}

// ==================== CUSTOM ERRORS ====================

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class ValidationErrorException extends Error {
  constructor(message: string, public errors: ValidationErrors) {
    super(message);
    this.name = 'ValidationErrorException';
  }
}

// ==================== RESPONSE HELPERS ====================

function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      timestamp: new Date(),
      requestId: generateRequestId(),
      version: '1.0.0'
    }
  };
}

function createErrorResponse(message: string): ApiResponse {
  return {
    success: false,
    message,
    meta: {
      timestamp: new Date(),
      requestId: generateRequestId(),
      version: '1.0.0'
    }
  };
}

function createValidationErrorResponse(
  message: string,
  errors: ValidationErrors
): ApiResponse {
  return {
    success: false,
    message,
    errors,
    meta: {
      timestamp: new Date(),
      requestId: generateRequestId(),
      version: '1.0.0'
    }
  };
}

function generateRequestId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// ==================== MOCK USER REPOSITORY ====================

class UserRepository implements Repository<User> {
  private users: User[] = [];
  private nextId = 1;

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      id: this.nextId.toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.nextId++;
    this.users.push(user);
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    } as User;

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return this.users.length < initialLength;
  }

  async findMany(filters?: QueryFilters): Promise<PaginatedResult<User>> {
    let filteredUsers = [...this.users];

    // Apply search filter
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (filters?.sortBy) {
      filteredUsers.sort((a, b) => {
        const aValue = (a as any)[filters.sortBy!];
        const bValue = (b as any)[filters.sortBy!];
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedUsers,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

// ==================== EXPRESS SETUP ====================

// Mock Express types for demonstration
interface ExpressApp {
  use: (middleware: any) => void;
  post: (path: string, ...handlers: any[]) => void;
  get: (path: string, ...handlers: any[]) => void;
  put: (path: string, ...handlers: any[]) => void;
  listen: (port: number, callback: () => void) => void;
}

// Mock implementations
function mockExpress(): ExpressApp {
  return {
    use: (middleware: any) => console.log('Middleware added'),
    post: (path: string, ...handlers: any[]) => console.log(`POST ${path} registered`),
    get: (path: string, ...handlers: any[]) => console.log(`GET ${path} registered`),
    put: (path: string, ...handlers: any[]) => console.log(`PUT ${path} registered`),
    listen: (port: number, callback: () => void) => {
      console.log(`Mock server would listen on port ${port}`);
      callback();
    }
  };
}

const mockHelmet = () => console.log('Helmet middleware');
const mockCors = () => console.log('CORS middleware');
const mockRateLimit = (options: any) => console.log('Rate limiting enabled');
const mockJsonParser = (options: any) => console.log('JSON parser enabled');
const mockUrlencoded = (options: any) => console.log('URL encoded parser enabled');

function createApp(): ExpressApp {
  const app = mockExpress();

  // Security middleware
  app.use(mockHelmet());
  app.use(mockCors());
  
  // Rate limiting
  const limiter = mockRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Body parsing
  app.use(mockJsonParser({ limit: '10mb' }));
  app.use(mockUrlencoded({ extended: true }));

  // Services
  const userRepository = new UserRepository();
  const authService = new AuthService(
    userRepository,
    'mock-jwt-secret',
    'mock-refresh-secret'
  );

  // Controllers
  const authController = new AuthController(authService);
  const userController = new UserController(userRepository);

  // Auth routes
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/refresh', authController.refreshToken);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/profile', 
    AuthorizationService.requireAuth(),
    authController.getProfile
  );

  // User routes
  app.get('/api/users',
    AuthorizationService.requireAuth(),
    AuthorizationService.requireRole('admin', 'moderator'),
    userController.getAllUsers
  );

  app.get('/api/users/:id',
    AuthorizationService.requireAuth(),
    userController.getUserById
  );

  app.put('/api/users/:id',
    AuthorizationService.requireAuth(),
    AuthorizationService.requirePermission('profile', 'update'),
    userController.updateUser
  );

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0'
    });
  });

  return app;
}

// ==================== SERVER STARTUP ====================

const app = createApp();
const PORT = 3000; // Mock port for demonstration

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
});

export {
  createApp,
  AuthService,
  AuthorizationService,
  AuthController,
  UserController,
  UserRepository
};

export type {
  User,
  UserRole,
  Permission,
  AuthTokens,
  JWTPayload,
  AuthenticatedRequest,
  ApiResponse,
  Repository,
  QueryFilters,
  PaginatedResult
};