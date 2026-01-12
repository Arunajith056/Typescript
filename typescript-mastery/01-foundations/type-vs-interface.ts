/**
 * TYPE vs INTERFACE - Understanding the Differences
 * 
 * Both can describe object shapes, but they have different capabilities
 * and use cases. Understanding when to use each is crucial for clean code.
 */

// ==================== INTERFACE EXAMPLES ====================

// Basic interface definition
interface User {
  id: number;
  name: string;
  email: string;
}

// Interface with optional properties
interface UserSettings {
  theme?: "light" | "dark";
  notifications?: boolean;
  language?: string;
}

// Interface with methods
interface UserService {
  getUser(id: number): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
}

// Interface inheritance (extends)
interface AdminUser extends User {
  role: "admin";
  permissions: string[];
  lastLogin: Date;
}

// Multiple interface inheritance
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface UserWithTimestamps extends User, Timestamped {
  status: "active" | "inactive";
}

// Declaration merging (unique to interfaces!)
interface Window {
  customProperty: string;
}

// Later in another file or module, you can extend the same interface
interface Window {
  anotherProperty: number;
}

// Now Window has both customProperty and anotherProperty

// ==================== TYPE EXAMPLES ====================

// Basic type alias
type UserType = {
  id: number;
  name: string;
  email: string;
};

// Type with union types (cannot do this with interface easily)
type Status = "loading" | "success" | "error";
type ID = string | number;

// Type for primitives and complex combinations
type StringOrNumber = string | number;
type UserID = string;
type EventHandler = (event: Event) => void;

// Intersection types (combining types)
type UserWithRole = User & {
  role: string;
  permissions: string[];
};

// Conditional types (only available with type)
type NonNullable<T> = T extends null | undefined ? never : T;

// Mapped types (transforming existing types)
type PartialUser = {
  [K in keyof User]?: User[K];
};

// Utility type combinations
type UserUpdate = Partial<Pick<User, 'name' | 'email'>>;

// ==================== WHEN TO USE INTERFACE ====================

// ✅ Use Interface for:

// 1. Object shapes that might be extended
interface DatabaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Product extends DatabaseEntity {
  name: string;
  price: number;
}

// 2. Class contracts
interface PaymentProcessor {
  processPayment(amount: number): Promise<boolean>;
  refund(transactionId: string): Promise<boolean>;
}

class StripePaymentProcessor implements PaymentProcessor {
  async processPayment(amount: number): Promise<boolean> {
    // Stripe implementation
    return true;
  }
  
  async refund(transactionId: string): Promise<boolean> {
    // Stripe refund implementation  
    return true;
  }
}

// 3. Public APIs that consumers might extend
interface PluginInterface {
  name: string;
  version: string;
  initialize(): void;
  destroy(): void;
}

// 4. When you need declaration merging
interface GlobalConfig {
  apiUrl: string;
}

// ==================== WHEN TO USE TYPE ====================

// ✅ Use Type for:

// 1. Union types
type Theme = "light" | "dark" | "auto";
type Size = "small" | "medium" | "large";

// 2. Intersection types
type UserWithPreferences = User & UserSettings;

// 3. Computed/conditional types
type UserKeys = keyof User; // "id" | "name" | "email"
type UserValues = User[keyof User]; // number | string

// 4. Function types
type EventListener<T> = (event: T) => void;
type AsyncFunction<T, R> = (arg: T) => Promise<R>;

// 5. Complex type manipulations
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// 6. Primitive type aliases
type Milliseconds = number;
type UserId = string;
type Timestamp = number;

// ==================== PRACTICAL COMPARISON ====================

// Interface approach for extensible API
interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

interface AuthenticatedApiConfig extends ApiConfig {
  apiKey: string;
}

// Type approach for composition
type BaseApiConfig = {
  baseUrl: string;
  timeout: number;
};

type AuthConfig = {
  apiKey: string;
};

type AuthenticatedApiConfigType = BaseApiConfig & AuthConfig;

// ==================== REAL-WORLD EXAMPLES ====================

// E-commerce domain with interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
}

interface ProductVariant {
  color?: string;
  size?: string;
  sku: string;
  priceModifier: number;
}

// State management with types
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: any;
};

type ErrorState = {
  status: "error";
  error: string;
};

type ApiState = LoadingState | SuccessState | ErrorState;

// Form handling
type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
};

type LoginForm = {
  email: FormField<string>;
  password: FormField<string>;
};

// ==================== BEST PRACTICES ====================

// 1. Prefer interface for object shapes
interface UserPreferences {
  theme: Theme;
  language: string;
  notifications: boolean;
}

// 2. Use type for unions and intersections
type NotificationLevel = "info" | "warning" | "error";
type UserWithNotifications = User & {
  notificationLevel: NotificationLevel;
};

// 3. Interface for class contracts
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

// 4. Type for computed types
type EventMap = {
  click: MouseEvent;
  submit: SubmitEvent;
  change: ChangeEvent;
};

type EventHandler<K extends keyof EventMap> = (event: EventMap[K]) => void;

// ==================== MIGRATION PATTERNS ====================

// Converting from interface to type when needed
interface OldUserInterface {
  id: number;
  name: string;
}

// Converting to type for more flexibility
type NewUserType = {
  id: number;
  name: string;
} & (
  | { role: "admin"; permissions: string[] }
  | { role: "user"; preferences: UserSettings }
);

export {
  User,
  UserSettings,
  UserService,
  AdminUser,
  UserWithTimestamps,
  Theme,
  Size,
  ApiState,
  FormField,
  LoginForm,
  NotificationLevel,
  EventHandler,
  Serializable
};