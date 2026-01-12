/**
 * BASIC GENERICS - Foundation of Generic Programming
 * 
 * Learn the fundamentals of generic programming in TypeScript.
 * Generics allow you to create reusable code that works with multiple types
 * while maintaining type safety.
 */

// ==================== GENERIC FUNCTIONS ====================

// Basic generic function
function identity<T>(arg: T): T {
  return arg;
}

// Usage with explicit type
const stringIdentity = identity<string>("hello");
const numberIdentity = identity<number>(42);

// Usage with type inference (preferred)
const inferredString = identity("hello"); // TypeScript infers T as string
const inferredNumber = identity(42); // TypeScript infers T as number

// Generic function with multiple parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const stringNumberPair = pair("hello", 42); // [string, number]
const booleanDatePair = pair(true, new Date()); // [boolean, Date]

// Generic function with array
function getFirstElement<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

const firstString = getFirstElement(["a", "b", "c"]); // string | undefined
const firstNumber = getFirstElement([1, 2, 3]); // number | undefined

// Generic function with object
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "John", age: 30, email: "john@example.com" };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number

// ==================== GENERIC INTERFACES ====================

// Generic interface for API response
interface ApiResponse<TData> {
  success: boolean;
  data?: TData;
  error?: string;
  timestamp: Date;
}

// Usage with different data types
const userResponse: ApiResponse<User> = {
  success: true,
  data: { id: "1", name: "John", email: "john@example.com" },
  timestamp: new Date()
};

const productsResponse: ApiResponse<Product[]> = {
  success: true,
  data: [
    { id: "1", name: "Laptop", price: 999.99 },
    { id: "2", name: "Mouse", price: 29.99 }
  ],
  timestamp: new Date()
};

// Generic interface with multiple type parameters
interface KeyValuePair<TKey, TValue> {
  key: TKey;
  value: TValue;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
  };
}

const stringNumberPairKV: KeyValuePair<string, number> = {
  key: "count",
  value: 42,
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Generic interface extending other interfaces
interface Repository<TEntity> {
  findById(id: string): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  create(entity: Omit<TEntity, 'id'>): Promise<TEntity>;
  update(id: string, updates: Partial<TEntity>): Promise<TEntity | null>;
  delete(id: string): Promise<boolean>;
}

// ==================== GENERIC CLASSES ====================

// Generic class for data container
class Container<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  remove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  getAll(): T[] {
    return [...this.items];
  }

  get count(): number {
    return this.items.length;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }
}

// Usage
const stringContainer = new Container<string>();
stringContainer.add("hello");
stringContainer.add("world");
console.log(stringContainer.getAll()); // ["hello", "world"]

const numberContainer = new Container<number>();
numberContainer.add(1);
numberContainer.add(2);
console.log(numberContainer.count); // 2

// Generic class with constraints
class Validator<T extends object> {
  private rules: Array<(item: T) => string | null> = [];

  addRule(rule: (item: T) => string | null): this {
    this.rules.push(rule);
    return this;
  }

  validate(item: T): { isValid: boolean; errors: string[] } {
    const errors = this.rules
      .map(rule => rule(item))
      .filter((error): error is string => error !== null);

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Usage
const userValidator = new Validator<User>()
  .addRule(user => user.name.trim() === "" ? "Name is required" : null)
  .addRule(user => !user.email.includes("@") ? "Invalid email" : null);

// ==================== GENERIC TYPE ALIASES ====================

// Generic type for event handler
type EventHandler<TEvent> = (event: TEvent) => void;

type ClickHandler = EventHandler<MouseEvent>;
type SubmitHandler = EventHandler<SubmitEvent>;

// Generic type for async function
type AsyncFunction<TArgs extends any[], TReturn> = (...args: TArgs) => Promise<TReturn>;

type UserFetcher = AsyncFunction<[string], User | null>;
type ProductCreator = AsyncFunction<[Omit<Product, 'id'>], Product>;

// Generic type for state management
type State<TData> = {
  data: TData;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
};

type UserState = State<User>;
type ProductsState = State<Product[]>;

// Generic type for form field
type FormField<TValue> = {
  value: TValue;
  error?: string;
  touched: boolean;
  dirty: boolean;
  validate?: (value: TValue) => string | null;
};

type StringField = FormField<string>;
type NumberField = FormField<number>;
type BooleanField = FormField<boolean>;

// ==================== GENERIC UTILITY FUNCTIONS ====================

// Generic array utilities
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function unique<T>(array: T[], getKey?: (item: T) => any): T[] {
  if (!getKey) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function groupBy<T, K extends string | number | symbol>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of array) {
    const key = getKey(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }
  return groups;
}

// Generic object utilities
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// Generic promise utilities
function delay<T>(ms: number, value?: T): Promise<T | void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}

async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        await delay(delayMs * attempt);
      }
    }
  }

  throw lastError!;
}

// ==================== GENERIC EVENT SYSTEM ====================

class EventEmitter<TEvents extends Record<string, any>> {
  private listeners: {
    [K in keyof TEvents]?: Array<(data: TEvents[K]) => void>;
  } = {};

  on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    return this;
  }

  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// Usage with typed events
interface AppEvents {
  userLogin: { userId: string; timestamp: Date };
  userLogout: { userId: string; duration: number };
  dataUpdate: { table: string; recordId: string };
  error: { message: string; code: string };
}

const appEmitter = new EventEmitter<AppEvents>();

appEmitter.on("userLogin", ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${timestamp.toISOString()}`);
});

appEmitter.emit("userLogin", {
  userId: "123",
  timestamp: new Date()
});

// ==================== REAL-WORLD EXAMPLE: API CLIENT ====================

class ApiClient<TBaseUrl extends string = string> {
  constructor(private baseUrl: TBaseUrl) {}

  async get<TResponse>(endpoint: string): Promise<ApiResponse<TResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date()
      };
    }
  }

  async post<TRequest, TResponse>(
    endpoint: string, 
    body: TRequest
  ): Promise<ApiResponse<TResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date()
      };
    }
  }
}

// Usage
const apiClient = new ApiClient("https://api.example.com");

// Type-safe API calls
const userResult = await apiClient.get<User>("/users/1");
const createResult = await apiClient.post<Omit<User, 'id'>, User>("/users", {
  name: "John Doe",
  email: "john@example.com"
});

// Helper interfaces for examples
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export {
  identity,
  pair,
  getFirstElement,
  getProperty,
  ApiResponse,
  KeyValuePair,
  Repository,
  Container,
  Validator,
  EventHandler,
  AsyncFunction,
  State,
  FormField,
  chunk,
  unique,
  groupBy,
  pick,
  omit,
  delay,
  retry,
  EventEmitter,
  ApiClient,
  User,
  Product
};