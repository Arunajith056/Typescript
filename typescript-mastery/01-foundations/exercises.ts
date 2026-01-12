/**
 * TYPESCRIPT FOUNDATIONS - EXERCISES
 * 
 * Complete these exercises to test your understanding of TypeScript foundations.
 * Try to solve them before looking at the solutions!
 */

// ==================== EXERCISE 1: BASIC TYPES ====================

// TODO: Create a type for a book with the following properties:
// - id (number)
// - title (string)
// - author (string)
// - publishedYear (number)
// - isAvailable (boolean, optional)
// - genres (array of strings)

// Your solution here:
type Book = {
  id: number;
  title: string;
  author: string;
  publishedYear: number;
  isAvailable?: boolean;
  genres: string[];
};

// TODO: Create a book instance using the type above
const myBook: Book = {
  id: 1,
  title: "Sample Book",
  author: "Sample Author", 
  publishedYear: 2024,
  isAvailable: true,
  genres: ["Fiction"]
};

// Example usage to avoid unused warning
console.log(`Book: ${myBook.title} by ${myBook.author}`);

// ==================== EXERCISE 2: FUNCTION TYPES ====================

// TODO: Create a type for a function that:
// - Takes a user ID (number) and options object (optional)
// - Options should have: includeProfile (boolean), timeout (number)
// - Returns a Promise of User or null

// Your solution here:
type UserFetcherOptions = {
  includeProfile?: boolean;
  timeout?: number;
};

type UserFetcher = (id: number, options?: UserFetcherOptions) => Promise<User | null>;

// TODO: Implement the function using the type above
const fetchUserById: UserFetcher = async (id: number, options?: UserFetcherOptions) => {
  // Implementation here
  console.log(`Fetching user ${id}`, options);
  return { id: id.toString(), name: 'Sample User', email: 'user@example.com', orders: [] };
};

// Example usage to avoid unused warning
fetchUserById(1, { includeProfile: true }).then(user => console.log('Fetched user:', user));

// ==================== EXERCISE 3: INTERFACE VS TYPE ====================

// TODO: Create an interface for a Vehicle with:
// - id (string)
// - make (string)  
// - model (string)
// - year (number)

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
}

// TODO: Create a Car interface that extends Vehicle and adds:
// - doors (number)
// - fuelType ("gas" | "electric" | "hybrid")

interface Car extends Vehicle {
  doors: number;
  fuelType: "gas" | "electric" | "hybrid";
}

// TODO: Create a type alias for motorcycle that combines Vehicle with:
// - hasWindshield (boolean)
// - engineSize (number)

type Motorcycle = Vehicle & {
  hasWindshield: boolean;
  engineSize: number;
};

// ==================== EXERCISE 4: UNION TYPES ====================

// TODO: Create a type for API response status
type ApiStatus = "loading" | "success" | "error";

// TODO: Create a discriminated union for different API states
type ApiState = 
  | { status: "loading" }
  | { status: "success"; data: any }
  | { status: "error"; message: string };

// TODO: Create a function that handles the API state
function handleApiResponse(state: ApiState): string {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return `Success: ${JSON.stringify(state.data)}`;
    case "error":
      return `Error: ${state.message}`;
    default:
      const _exhaustive: never = state;
      return _exhaustive;
  }
}

// Example usage
const loadingState: ApiState = { status: "loading" };
const result = handleApiResponse(loadingState);
console.log('API Response:', result);

// ==================== EXERCISE 5: TYPE GUARDS ====================

// TODO: Create a type guard function to check if a value is a string array
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// TODO: Create a type guard for the Book type you created earlier
function isBook(value: unknown): value is Book {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Book).id === 'number' &&
    typeof (value as Book).title === 'string' &&
    typeof (value as Book).author === 'string'
  );
}

// TODO: Create an assertion function that throws if value is not a number
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error(`Expected number, got ${typeof value}`);
  }
}

// Example usage
const testArray = ['hello', 'world'];
if (isStringArray(testArray)) {
  console.log('Valid string array:', testArray);
}

if (isBook(myBook)) {
  console.log('Valid book:', myBook.title);
}

try {
  assertIsNumber(42);
  console.log('Number assertion passed');
} catch (e) {
  console.error('Number assertion failed:', e);
}

// ==================== EXERCISE 6: GENERIC FUNCTIONS ====================

// TODO: Create a generic function that returns the first element of an array
function getFirstElement<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

// TODO: Create a generic function that filters array by a predicate
function filterArray<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

// TODO: Create a generic function that maps object properties
function mapObject<T, R>(
  obj: Record<string, T>,
  mapper: (value: T) => R
): Record<string, R> {
  const result: Record<string, R> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = mapper(value);
  }
  return result;
}

// Example usage
const numbers = [1, 2, 3, 4, 5];
const firstNumber = getFirstElement(numbers);
const evenNumbers = filterArray(numbers, n => n % 2 === 0);
const stringifiedNumbers = mapObject({ a: 1, b: 2 }, n => n.toString());

console.log('First element:', firstNumber);
console.log('Even numbers:', evenNumbers);
console.log('Stringified:', stringifiedNumbers);

// ==================== EXERCISE 7: REAL-WORLD SCENARIO ====================

// TODO: Create types for a simple e-commerce system:

// Product type with id, name, price, category, inStock
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
};

// Order type with id, userId, items (array of {productId, quantity, price}), total, status
type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
};

// User type with id, name, email, orders (array of order IDs)
type User = {
  id: string; // Changed to string to match usage
  name: string;
  email: string;
  orders: string[];
};

// TODO: Create a shopping cart type
type ShoppingCart = {
  userId: string;
  items: OrderItem[];
  total: number;
};

// TODO: Create function types for:
// - Adding item to cart
type AddToCart = (cart: ShoppingCart, productId: string, quantity: number, price: number) => ShoppingCart;

// - Calculating cart total
type CalculateTotal = (cart: ShoppingCart) => number;

// - Processing checkout
type ProcessCheckout = (cart: ShoppingCart) => Promise<Order>;

// Example implementations
const addToCart: AddToCart = (cart, productId, quantity, price) => {
  const existingItem = cart.items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, price });
  }
  cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  return cart;
};

const calculateTotal: CalculateTotal = (cart) => {
  return cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
};

const processCheckout: ProcessCheckout = async (cart) => {
  return {
    id: 'order-' + Date.now(),
    userId: cart.userId,
    items: [...cart.items],
    total: cart.total,
    status: 'pending'
  };
};

// Example usage
const sampleCart: ShoppingCart = {
  userId: 'user-1',
  items: [],
  total: 0
};

const updatedCart = addToCart(sampleCart, 'product-1', 2, 29.99);
const total = calculateTotal(updatedCart);
processCheckout(updatedCart).then(order => {
  console.log('Order created:', order.id);
});

console.log('E-commerce functions implemented:', { total });

// ==================== EXERCISE 8: ADVANCED PATTERNS ====================

// TODO: Create a utility type that makes all properties of T optional except for K
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// TODO: Create a utility type that picks properties from T that are of type U
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

// TODO: Use your utility types
interface DatabaseRecord {
  id: string;
  name: string;
  age: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Make all properties optional except id
type DatabaseRecordUpdate = PartialExcept<DatabaseRecord, 'id'>;

// Pick only string properties
type DatabaseRecordStrings = PickByType<DatabaseRecord, string>;

// Example usage
const dbUpdate: DatabaseRecordUpdate = {
  id: '123', // Required
  name: 'Updated Name', // Optional
};

const dbStrings: DatabaseRecordStrings = {
  id: '123',
  name: 'John',
  email: 'john@example.com'
};

console.log('Database utility types:', { dbUpdate, dbStrings });

// ==================== EXERCISE 9: ERROR HANDLING ====================

// TODO: Create custom error types
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NetworkError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

// TODO: Create a Result type that can be either success with data or error
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// TODO: Create a function that returns a Result
function parseNumber(input: string): Result<number, ValidationError> {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { 
      success: false, 
      error: new ValidationError('Input cannot be empty', 'input') 
    };
  }
  const parsed = Number(trimmed);
  if (isNaN(parsed)) {
    return { 
      success: false, 
      error: new ValidationError('Invalid number format', 'input') 
    };
  }
  return { success: true, data: parsed };
}

// Example usage
const numberResult = parseNumber('42');
if (numberResult.success) {
  console.log('Parsed number:', numberResult.data);
} else {
  console.error('Parse error:', numberResult.error.message);
}

// ==================== EXERCISE 10: EVENT SYSTEM ====================

// TODO: Create an event map for a user management system
type UserEventMap = {
  userCreated: { user: User };
  userUpdated: { userId: string; changes: Partial<User> };
  userDeleted: { userId: string };
  userLoggedIn: { userId: string; timestamp: Date };
};

// TODO: Create an event emitter class
class UserEventEmitter {
  private listeners: {
    [K in keyof UserEventMap]?: Array<(data: UserEventMap[K]) => void>;
  } = {};

  on<K extends keyof UserEventMap>(
    event: K, 
    listener: (data: UserEventMap[K]) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof UserEventMap>(event: K, data: UserEventMap[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

// Example usage
const userEmitter = new UserEventEmitter();
userEmitter.on('userCreated', ({ user }) => {
  console.log('User created:', user.name);
});

userEmitter.emit('userCreated', {
  user: { id: '1', name: 'John Doe', email: 'john@example.com', orders: [] }
});

console.log('Event system implemented successfully');

// ==================== TEST YOUR KNOWLEDGE ====================

// Try to answer these questions:

// 1. When would you use `interface` vs `type`?
// Answer: 

// 2. What's the difference between `unknown` and `any`?
// Answer:

// 3. When should you use type assertions vs type guards?
// Answer:

// 4. What are discriminated unions and why are they useful?
// Answer:

// 5. How do generics improve type safety?
// Answer:

export {
  Book,
  UserFetcher,
  Vehicle,
  Car,
  Motorcycle,
  ApiStatus,
  ApiState,
  Product,
  Order,
  User,
  ShoppingCart,
  AddToCart,
  CalculateTotal,
  ProcessCheckout,
  PartialExcept,
  PickByType,
  DatabaseRecordUpdate,
  DatabaseRecordStrings,
  ValidationError,
  NetworkError,
  Result,
  UserEventMap,
  UserEventEmitter,
  fetchUserById,
  handleApiResponse,
  isStringArray,
  isBook,
  assertIsNumber,
  getFirstElement,
  filterArray,
  mapObject,
  parseNumber,
  addToCart,
  calculateTotal,
  processCheckout
};