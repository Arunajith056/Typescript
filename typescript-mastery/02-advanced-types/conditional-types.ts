/**
 * Conditional Types in TypeScript
 * Advanced type manipulation based on conditions
 */

// ==================== BASIC CONDITIONAL TYPES ====================

// Basic conditional type syntax: T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;   // true
type Test2 = IsString<number>;   // false
type Test3 = IsString<"hello">;  // true

// More complex conditional types
type NonNullable<T> = T extends null | undefined ? never : T;

type CleanString = NonNullable<string | null>;     // string
type CleanNumber = NonNullable<number | undefined>; // number
type CleanAny = NonNullable<any>;                  // any

// ==================== DISTRIBUTIVE CONDITIONAL TYPES ====================

// When applied to union types, conditional types distribute
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumberArray = ToArray<string | number>;
// Result: string[] | number[] (not (string | number)[])

// Disable distribution with brackets
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;

type UnionArray = ToArrayNonDistributive<string | number>;
// Result: (string | number)[]

// ==================== INFER KEYWORD ====================

// Extract return type from function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type FuncReturn = ReturnType<() => string>;        // string
type AsyncReturn = ReturnType<() => Promise<number>>; // Promise<number>

// Extract array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ArrayElement<string[]>;   // string
type NumberArrayElement = ArrayElement<number[]>;   // number

// Extract promise value type
type PromiseValue<T> = T extends Promise<infer U> ? U : T;

type StringPromise = PromiseValue<Promise<string>>;  // string
type DirectString = PromiseValue<string>;           // string

// ==================== MAPPED TYPES WITH CONDITIONS ====================

// Make properties optional based on condition
type PartialBy<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | undefined : T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type UserPartialEmail = PartialBy<User, 'email'>;
// { id: number; name: string; email: string | undefined; age: number; }

// Make properties required based on condition
type RequiredBy<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

type UserRequiredEmail = RequiredBy<Partial<User>, 'email'>;
// { id?: number; name?: string; email: string; age?: number; }

// ==================== TEMPLATE LITERAL TYPES ====================

// Generate event names
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<"click">;     // "onClick"
type HoverEvent = EventName<"hover">;     // "onHover"

// Generate API endpoints
type ApiEndpoint<T extends string> = `/api/${T}`;

type UserEndpoint = ApiEndpoint<"users">;     // "/api/users"
type PostEndpoint = ApiEndpoint<"posts">;     // "/api/posts"

// Combine template literals with conditionals
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint<M extends HttpMethod, P extends string> = 
  M extends "GET" | "DELETE" 
    ? `${M} ${P}` 
    : `${M} ${P} (with body)`;

type GetUsers = Endpoint<"GET", "/users">;      // "GET /users"
type CreateUser = Endpoint<"POST", "/users">;   // "POST /users (with body)"

// ==================== RECURSIVE CONDITIONAL TYPES ====================

// Deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P];
};

interface NestedData {
  user: {
    profile: {
      name: string;
      settings: {
        theme: string;
      };
    };
  };
}

type ReadonlyNestedData = DeepReadonly<NestedData>;
// All properties are readonly, including nested ones

// Flatten nested types
type Flatten<T> = T extends (infer U)[] 
  ? Flatten<U> 
  : T;

type NestedArray = string[][][];
type FlatString = Flatten<NestedArray>; // string

// ==================== UTILITY TYPE IMPLEMENTATIONS ====================

// Custom Pick implementation
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Custom Omit implementation
type MyOmit<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? never : T[P];
}[keyof T];

// Custom Exclude implementation
type MyExclude<T, U> = T extends U ? never : T;

// Custom Extract implementation
type MyExtract<T, U> = T extends U ? T : never;

// ==================== REAL-WORLD EXAMPLES ====================

// Form field validation
type ValidationRule<T> = {
  required?: boolean;
  validator?: (value: T) => boolean | string;
};

type FormFieldConfig<T> = T extends string 
  ? ValidationRule<T> & { minLength?: number; maxLength?: number; }
  : T extends number 
  ? ValidationRule<T> & { min?: number; max?: number; }
  : T extends boolean 
  ? ValidationRule<T>
  : ValidationRule<T>;

interface ContactForm {
  name: string;
  age: number;
  subscribe: boolean;
}

type ContactFormConfig = {
  [K in keyof ContactForm]: FormFieldConfig<ContactForm[K]>;
};

// API response handling
type ApiResponse<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };

type UnwrapApiResponse<T> = T extends ApiResponse<infer U> ? U : never;

type UserResponse = ApiResponse<User>;
type UserData = UnwrapApiResponse<UserResponse>; // User

// Event system with type safety
type EventMap = {
  'user:created': { user: User };
  'user:updated': { user: User; changes: Partial<User> };
  'user:deleted': { userId: number };
};

type EventListener<K extends keyof EventMap> = 
  (data: EventMap[K]) => void;

type EventEmitter = {
  on<K extends keyof EventMap>(event: K, listener: EventListener<K>): void;
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
};

// Database query builder types
type WhereClause<T> = {
  [K in keyof T]?: T[K] extends string 
    ? string | { contains?: string; startsWith?: string; endsWith?: string }
    : T[K] extends number 
    ? number | { gt?: number; lt?: number; gte?: number; lte?: number }
    : T[K];
};

type QueryBuilder<T> = {
  where(clause: WhereClause<T>): QueryBuilder<T>;
  select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>>;
  orderBy<K extends keyof T>(field: K, direction?: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  execute(): Promise<T[]>;
};

// Example usage
const userQuery: QueryBuilder<User> = {} as QueryBuilder<User>;
const result = userQuery
  .where({ age: { gt: 18 }, name: { contains: 'John' } })
  .select('id', 'name', 'email')
  .orderBy('name', 'asc')
  .limit(10)
  .execute();

// Type-safe configuration
type Environment = 'development' | 'staging' | 'production';

type DatabaseConfig<E extends Environment> = E extends 'development'
  ? { host: 'localhost'; ssl?: false; debug: true }
  : E extends 'staging'
  ? { host: string; ssl: true; debug?: boolean }
  : { host: string; ssl: true; debug: false };

type AppConfig<E extends Environment> = {
  environment: E;
  database: DatabaseConfig<E>;
  api: {
    baseUrl: string;
    timeout: number;
  };
};

// Usage with proper type inference
const devConfig: AppConfig<'development'> = {
  environment: 'development',
  database: {
    host: 'localhost',
    debug: true
    // ssl and debug have correct types based on environment
  },
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000
  }
};

console.log('Conditional types examples loaded successfully');

export {
  IsString,
  NonNullable,
  ToArray,
  ReturnType,
  ArrayElement,
  PromiseValue,
  PartialBy,
  RequiredBy,
  EventName,
  ApiEndpoint,
  DeepReadonly,
  Flatten,
  FormFieldConfig,
  ApiResponse,
  EventMap,
  QueryBuilder,
  AppConfig
};