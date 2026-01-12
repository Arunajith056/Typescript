/**
 * FUNCTION TYPES - Mastering Function Typing in TypeScript
 * 
 * Functions are first-class citizens in JavaScript/TypeScript.
 * Proper typing ensures type safety and better developer experience.
 */

// ==================== BASIC FUNCTION TYPES ====================

// Function with typed parameters and return type
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Function with optional parameters
function createUser(name: string, email: string, age?: number): User {
  return {
    id: Math.random(),
    name,
    email,
    age: age || 0
  };
}

// Function with default parameters
function formatCurrency(amount: number, currency: string = "USD"): string {
  return `${amount.toFixed(2)} ${currency}`;
}

// Function with rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// ==================== FUNCTION TYPE EXPRESSIONS ====================

// Type alias for function signature
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;
const divide: MathOperation = (a, b) => {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
};

// Array of functions with same signature
const operations: MathOperation[] = [add, multiply, divide];

// ==================== HIGHER-ORDER FUNCTIONS ====================

// Function that takes another function as parameter
function processArray<T, R>(
  array: T[], 
  processor: (item: T, index: number) => R
): R[] {
  return array.map(processor);
}

// Function that returns a function
function createMultiplier(factor: number): (value: number) => number {
  return (value: number) => value * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

// ==================== FUNCTION OVERLOADS ====================

// Function with multiple signatures
function processData(data: string): string;
function processData(data: number): number;
function processData(data: boolean): boolean;
function processData(data: any[]): any[];
function processData(data: unknown): unknown {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
  if (typeof data === "number") {
    return data * 2;
  }
  if (typeof data === "boolean") {
    return !data;
  }
  if (Array.isArray(data)) {
    return data.reverse();
  }
  return data;
}

// Usage with perfect type inference
const stringResult = processData("hello"); // string
const numberResult = processData(42); // number
const booleanResult = processData(true); // boolean

// ==================== ASYNC FUNCTION TYPES ====================

// Async function with Promise return type
async function fetchUser(id: number): Promise<User | null> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id,
      name: "John Doe",
      email: "john@example.com"
    };
  } catch {
    return null;
  }
}

// Type for async functions
type AsyncUserFetcher = (id: number) => Promise<User | null>;

const getUserFromAPI: AsyncUserFetcher = async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

// ==================== CALLBACK FUNCTIONS ====================

// Event handler types
type EventHandler<T = Event> = (event: T) => void;
type ClickHandler = EventHandler<MouseEvent>;
type SubmitHandler = EventHandler<SubmitEvent>;

// API callback patterns
type ApiCallback<T> = (error: Error | null, data?: T) => void;
type SuccessCallback<T> = (data: T) => void;
type ErrorCallback = (error: Error) => void;

function apiCall<T>(
  url: string,
  onSuccess: SuccessCallback<T>,
  onError: ErrorCallback
): void {
  fetch(url)
    .then(response => response.json())
    .then(onSuccess)
    .catch(onError);
}

// ==================== GENERIC FUNCTIONS ====================

// Generic function with type parameter
function identity<T>(arg: T): T {
  return arg;
}

// Generic function with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Generic function with multiple type parameters
function combine<T, U>(first: T, second: U): T & U {
  return { ...first as any, ...second as any };
}

// Usage examples
const user = { name: "John", age: 30 };
const settings = { theme: "dark", notifications: true };
const userWithSettings = combine(user, settings);

// ==================== UTILITY FUNCTION PATTERNS ====================

// Validation functions
type Validator<T> = (value: unknown) => value is T;

const isString: Validator<string> = (value): value is string => {
  return typeof value === "string";
};

const isNumber: Validator<number> = (value): value is number => {
  return typeof value === "number" && !isNaN(value);
};

const isUser: Validator<User> = (value): value is User => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value
  );
};

// Transform functions
type Transformer<T, R> = (input: T) => R;

const userToDisplayName: Transformer<User, string> = (user) => {
  return `${user.name} (${user.email})`;
};

const usersToMap: Transformer<User[], Map<number, User>> = (users) => {
  return new Map(users.map(user => [user.id, user]));
};

// ==================== REAL-WORLD EXAMPLES ====================

// Repository pattern with functions
type Repository<T> = {
  findById: (id: string) => Promise<T | null>;
  findAll: () => Promise<T[]>;
  create: (data: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
};

// Form validation
type FieldValidator = (value: string) => string | null;

const emailValidator: FieldValidator = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : "Invalid email format";
};

const passwordValidator: FieldValidator = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return "Password must contain uppercase, lowercase, and number";
  }
  return null;
};

// Event system
type EventMap = {
  userLogin: { userId: string; timestamp: Date };
  userLogout: { userId: string; duration: number };
  pageView: { page: string; userId?: string };
};

type EventListener<K extends keyof EventMap> = (data: EventMap[K]) => void;

class EventEmitter {
  private listeners: Partial<{
    [K in keyof EventMap]: EventListener<K>[];
  }> = {};

  on<K extends keyof EventMap>(event: K, listener: EventListener<K>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

// Middleware pattern
type Middleware<T> = (data: T) => T | Promise<T>;
type MiddlewareStack<T> = Middleware<T>[];

async function executeMiddleware<T>(
  data: T,
  middlewares: MiddlewareStack<T>
): Promise<T> {
  let result = data;
  for (const middleware of middlewares) {
    result = await middleware(result);
  }
  return result;
}

// ==================== PERFORMANCE OPTIMIZATIONS ====================

// Memoization
function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const cache = new Map<string, Return>();
  
  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Debouncing
function debounce<Args extends any[]>(
  fn: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  
  return (...args: Args): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttling
function throttle<Args extends any[]>(
  fn: (...args: Args) => void,
  limit: number
): (...args: Args) => void {
  let inThrottle: boolean;
  
  return (...args: Args): void => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Helper types for this module
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

export {
  MathOperation,
  EventHandler,
  ClickHandler,
  SubmitHandler,
  ApiCallback,
  Validator,
  Transformer,
  Repository,
  FieldValidator,
  EventMap,
  EventListener,
  EventEmitter,
  Middleware,
  MiddlewareStack,
  memoize,
  debounce,
  throttle
};