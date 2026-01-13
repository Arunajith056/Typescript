/**
 * E-commerce API with Advanced TypeScript
 * Complete project demonstrating real-world TypeScript patterns
 */

// ==================== DOMAIN MODELS ====================

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'seller';
  profile?: UserProfile | undefined;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
  preferences: UserPreferences;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface UserPreferences {
  currency: 'USD' | 'EUR' | 'GBP';
  language: 'en' | 'es' | 'fr';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: Category;
  inventory: number;
  images: string[];
  attributes: ProductAttributes;
  sellerId: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

type ProductAttributes = Record<string, string | number | boolean>;

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  payment: PaymentInfo;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  attributes?: ProductAttributes;
}

type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

interface PaymentInfo {
  method: 'card' | 'paypal' | 'bank_transfer';
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

// ==================== API RESPONSES ====================

type ApiResponse<T> = {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
};

type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ==================== QUERY BUILDERS ====================

type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith';

type FilterCondition<T> = {
  [K in keyof T]?: {
    [Op in FilterOperator]?: T[K] extends string 
      ? Op extends 'contains' | 'startsWith' ? string : T[K]
      : T[K] extends number
      ? Op extends 'gt' | 'gte' | 'lt' | 'lte' ? number : T[K]
      : T[K];
  };
};

interface QueryOptions<T> {
  filter?: FilterCondition<T>;
  sort?: {
    [K in keyof T]?: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
  include?: string[];
}

class QueryBuilder<T> {
  private options: QueryOptions<T> = {};

  where<K extends keyof T>(field: K, operator: FilterOperator, value: any): this {
    if (!this.options.filter) this.options.filter = {};
    if (!this.options.filter[field]) this.options.filter[field] = {};
    (this.options.filter[field] as any)[operator] = value;
    return this;
  }

  orderBy<K extends keyof T>(field: K, direction: 'asc' | 'desc' = 'asc'): this {
    if (!this.options.sort) this.options.sort = {};
    this.options.sort[field] = direction;
    return this;
  }

  page(page: number, limit: number = 20): this {
    this.options.pagination = { page, limit };
    return this;
  }

  include(...relations: string[]): this {
    this.options.include = relations;
    return this;
  }

  build(): QueryOptions<T> {
    return this.options;
  }
}

// ==================== REPOSITORY PATTERN ====================

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(options?: QueryOptions<T>): Promise<PaginatedResponse<T>>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> {
    // Implementation would connect to database
    return null;
  }

  async findMany(options?: QueryOptions<User>): Promise<PaginatedResponse<User>> {
    // Implementation would apply filters and pagination
    return {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // Save to database
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Find and update user
    throw new Error('User not found');
  }

  async delete(id: string): Promise<boolean> {
    // Delete user
    return true;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findMany(
      new QueryBuilder<User>()
        .where('email', 'eq', email)
        .build()
    ).then(result => result.items[0] || null);
  }
}

// ==================== SERVICE LAYER ====================

interface UserService {
  getUser(id: string): Promise<ApiResponse<User>>;
  createUser(userData: CreateUserRequest): Promise<ApiResponse<User>>;
  updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>>;
  deleteUser(id: string): Promise<ApiResponse<boolean>>;
  searchUsers(query: string, options?: QueryOptions<User>): Promise<ApiResponse<PaginatedResponse<User>>>;
}

type CreateUserRequest = {
  email: string;
  name: string;
  password: string;
  role?: 'customer' | 'admin' | 'seller';
  profile?: Partial<UserProfile>;
};

type UpdateUserRequest = {
  name?: string;
  role?: 'customer' | 'admin' | 'seller';
  profile?: Partial<UserProfile>;
};

class UserServiceImpl implements UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private auditService: AuditService
  ) {}

  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        };
      }
      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
      };
    }
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          error: { code: 'USER_EXISTS', message: 'User already exists' }
        };
      }

      // Create user
      const createData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email: userData.email,
        name: userData.name,
        role: userData.role || 'customer',
        ...(userData.profile && { profile: userData.profile as UserProfile })
      };
      const user = await this.userRepository.create(createData);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(user);

      // Audit log
      await this.auditService.log('USER_CREATED', { userId: user.id });

      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: { code: 'CREATION_FAILED', message: 'Failed to create user' }
      };
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const updateData: Partial<User> = {
        ...(userData.name && { name: userData.name }),
        ...(userData.role && { role: userData.role }),
        ...(userData.profile && { profile: userData.profile as UserProfile })
      };
      const user = await this.userRepository.update(id, updateData);
      await this.auditService.log('USER_UPDATED', { userId: id, changes: userData });
      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to update user' }
      };
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.userRepository.delete(id);
      await this.auditService.log('USER_DELETED', { userId: id });
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DELETION_FAILED', message: 'Failed to delete user' }
      };
    }
  }

  async searchUsers(query: string, options?: QueryOptions<User>): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      const searchOptions = new QueryBuilder<User>()
        .where('name', 'contains', query)
        .page(options?.pagination?.page || 1, options?.pagination?.limit || 20)
        .build();

      const result = await this.userRepository.findMany(searchOptions);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: { code: 'SEARCH_FAILED', message: 'Search failed' }
      };
    }
  }
}

// ==================== SUPPORTING SERVICES ====================

interface EmailService {
  sendWelcomeEmail(user: User): Promise<void>;
  sendOrderConfirmation(order: Order): Promise<void>;
  sendPasswordReset(email: string, token: string): Promise<void>;
}

interface AuditService {
  log(action: string, data: Record<string, any>): Promise<void>;
}

class EmailServiceImpl implements EmailService {
  async sendWelcomeEmail(user: User): Promise<void> {
    console.log(`Sending welcome email to ${user.email}`);
  }

  async sendOrderConfirmation(order: Order): Promise<void> {
    console.log(`Sending order confirmation for ${order.id}`);
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    console.log(`Sending password reset to ${email}`);
  }
}

class AuditServiceImpl implements AuditService {
  async log(action: string, data: Record<string, any>): Promise<void> {
    console.log(`Audit: ${action}`, data);
  }
}

// ==================== UTILITIES ====================

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// ==================== EXAMPLE USAGE ====================

async function exampleUsage() {
  const userRepo = new UserRepository();
  const emailService = new EmailServiceImpl();
  const auditService = new AuditServiceImpl();
  const userService = new UserServiceImpl(userRepo, emailService, auditService);

  // Create a new user
  const createResult = await userService.createUser({
    email: 'john@example.com',
    name: 'John Doe',
    password: 'securePassword123!',
    role: 'customer',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      preferences: {
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    }
  });

  console.log('Create user result:', createResult);

  // Search users
  const searchResult = await userService.searchUsers('John');
  console.log('Search result:', searchResult);
}

export {
  UserRepository,
  UserServiceImpl,
  EmailServiceImpl,
  AuditServiceImpl,
  QueryBuilder,
  exampleUsage
};

export type {
  User,
  Product,
  Order,
  ApiResponse,
  QueryOptions,
  Repository,
  UserService,
  CreateUserRequest,
  UpdateUserRequest
};