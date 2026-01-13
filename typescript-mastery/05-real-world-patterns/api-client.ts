/**
 * Type-Safe API Client
 * Real-world example of TypeScript in API communication
 */

// ==================== API TYPES DEFINITION ====================

// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Response wrapper
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

// Error response
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  status: number;
}

// Request configuration
interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
}

// ==================== ENDPOINT DEFINITIONS ====================

// User types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  role?: 'user' | 'moderator';
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'moderator';
}

// Post types
interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
  published?: boolean;
}

// API endpoint definitions
interface ApiEndpoints {
  // User endpoints
  'GET /users': {
    response: User[];
    params?: { page?: number; limit?: number; role?: User['role'] };
  };
  'GET /users/:id': {
    response: User;
    params: { id: number };
  };
  'POST /users': {
    body: CreateUserRequest;
    response: User;
  };
  'PUT /users/:id': {
    params: { id: number };
    body: UpdateUserRequest;
    response: User;
  };
  'DELETE /users/:id': {
    params: { id: number };
    response: { success: boolean };
  };
  
  // Post endpoints
  'GET /posts': {
    response: Post[];
    params?: { authorId?: number; published?: boolean };
  };
  'GET /posts/:id': {
    response: Post;
    params: { id: number };
  };
  'POST /posts': {
    body: CreatePostRequest;
    response: Post;
  };
  'PUT /posts/:id': {
    params: { id: number };
    body: Partial<CreatePostRequest>;
    response: Post;
  };
  'DELETE /posts/:id': {
    params: { id: number };
    response: { success: boolean };
  };
}

// ==================== TYPE-SAFE API CLIENT ====================

// Extract method and path from endpoint string
type ExtractMethod<T extends keyof ApiEndpoints> = T extends `${infer M} ${string}` ? M : never;
type ExtractPath<T extends keyof ApiEndpoints> = T extends `${string} ${infer P}` ? P : never;

// API client class
class TypeSafeApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  // Generic request method
  private async request<T extends keyof ApiEndpoints>(
    endpoint: T,
    config: {
      params?: ApiEndpoints[T] extends { params: infer P } ? P : never;
      body?: ApiEndpoints[T] extends { body: infer B } ? B : never;
      headers?: Record<string, string>;
    } = {}
  ): Promise<ApiEndpoints[T] extends { response: infer R } ? R : never> {
    const method = ExtractMethod<T> as HttpMethod;
    const pathTemplate = ExtractPath<T> as string;
    
    // Replace path parameters
    let path = pathTemplate;
    if (config.params && typeof config.params === 'object') {
      Object.entries(config.params).forEach(([key, value]) => {
        if (path.includes(`:${key}`)) {
          path = path.replace(`:${key}`, String(value));
        }
      });
    }

    // Add query parameters for GET requests
    const queryParams = new URLSearchParams();
    if (method === 'GET' && config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (!pathTemplate.includes(`:${key}`) && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${this.baseUrl}${path}${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const requestConfig: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...config.headers
      }
    };

    if (config.body && method !== 'GET') {
      requestConfig.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new ApiClientError(errorData.error.message, response.status, errorData);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError('Network error', 0, { error: { code: 'NETWORK_ERROR', message: String(error) }, status: 0 });
    }
  }

  // Type-safe convenience methods
  async getUsers(params?: { page?: number; limit?: number; role?: User['role'] }) {
    return this.request('GET /users', { params });
  }

  async getUser(id: number) {
    return this.request('GET /users/:id', { params: { id } });
  }

  async createUser(userData: CreateUserRequest) {
    return this.request('POST /users', { body: userData });
  }

  async updateUser(id: number, userData: UpdateUserRequest) {
    return this.request('PUT /users/:id', { params: { id }, body: userData });
  }

  async deleteUser(id: number) {
    return this.request('DELETE /users/:id', { params: { id } });
  }

  async getPosts(params?: { authorId?: number; published?: boolean }) {
    return this.request('GET /posts', { params });
  }

  async getPost(id: number) {
    return this.request('GET /posts/:id', { params: { id } });
  }

  async createPost(postData: CreatePostRequest) {
    return this.request('POST /posts', { body: postData });
  }

  async updatePost(id: number, postData: Partial<CreatePostRequest>) {
    return this.request('PUT /posts/:id', { params: { id }, body: postData });
  }

  async deletePost(id: number) {
    return this.request('DELETE /posts/:id', { params: { id } });
  }

  // Batch operations
  async batchCreateUsers(users: CreateUserRequest[]): Promise<User[]> {
    const results = await Promise.all(
      users.map(user => this.createUser(user))
    );
    return results;
  }

  // Advanced query builder
  users() {
    return new UserQueryBuilder(this);
  }

  posts() {
    return new PostQueryBuilder(this);
  }
}

// ==================== ERROR HANDLING ====================

class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public apiError: ApiError
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isValidationError(): boolean {
    return this.status === 422;
  }

  getErrorCode(): string {
    return this.apiError.error.code;
  }
}

// ==================== QUERY BUILDERS ====================

class UserQueryBuilder {
  private filters: Record<string, any> = {};

  constructor(private client: TypeSafeApiClient) {}

  whereRole(role: User['role']) {
    this.filters.role = role;
    return this;
  }

  page(pageNum: number) {
    this.filters.page = pageNum;
    return this;
  }

  limit(limitNum: number) {
    this.filters.limit = limitNum;
    return this;
  }

  async execute(): Promise<User[]> {
    return this.client.getUsers(this.filters);
  }
}

class PostQueryBuilder {
  private filters: Record<string, any> = {};

  constructor(private client: TypeSafeApiClient) {}

  whereAuthor(authorId: number) {
    this.filters.authorId = authorId;
    return this;
  }

  wherePublished(published: boolean = true) {
    this.filters.published = published;
    return this;
  }

  async execute(): Promise<Post[]> {
    return this.client.getPosts(this.filters);
  }
}

// ==================== USAGE EXAMPLES ====================

// Initialize client
const apiClient = new TypeSafeApiClient('https://api.example.com', {
  'Authorization': 'Bearer your-token-here'
});

// Example usage with proper error handling
export async function demonstrateApiClient() {
  try {
    // Get all users
    const users = await apiClient.getUsers({ page: 1, limit: 10 });
    console.log('Users:', users);

    // Create a new user
    const newUser = await apiClient.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    });
    console.log('Created user:', newUser);

    // Get user by ID
    const user = await apiClient.getUser(newUser.id);
    console.log('Retrieved user:', user);

    // Update user
    const updatedUser = await apiClient.updateUser(newUser.id, {
      name: 'John Smith'
    });
    console.log('Updated user:', updatedUser);

    // Query builder example
    const adminUsers = await apiClient.users()
      .whereRole('admin')
      .page(1)
      .limit(5)
      .execute();
    console.log('Admin users:', adminUsers);

    // Get posts by author
    const userPosts = await apiClient.posts()
      .whereAuthor(newUser.id)
      .wherePublished(true)
      .execute();
    console.log('User posts:', userPosts);

  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error('API Error:', {
        message: error.message,
        status: error.status,
        code: error.getErrorCode(),
        isUnauthorized: error.isUnauthorized(),
        isValidationError: error.isValidationError()
      });
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Example with response caching
class CachedApiClient extends TypeSafeApiClient {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${JSON.stringify(params || {})}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  async getUser(id: number): Promise<User> {
    const cacheKey = this.getCacheKey('getUser', { id });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    const user = await super.getUser(id);
    this.cache.set(cacheKey, { data: user, timestamp: Date.now() });
    return user;
  }

  invalidateUserCache(id: number) {
    const cacheKey = this.getCacheKey('getUser', { id });
    this.cache.delete(cacheKey);
  }
}

console.log('Type-safe API client loaded successfully!');

export {
  TypeSafeApiClient,
  CachedApiClient,
  ApiClientError,
  UserQueryBuilder,
  PostQueryBuilder
};

export type {
  User,
  Post,
  CreateUserRequest,
  UpdateUserRequest,
  CreatePostRequest,
  ApiResponse,
  ApiError,
  ApiEndpoints,
  HttpMethod
};