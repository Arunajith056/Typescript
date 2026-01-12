/**
 * TYPESCRIPT FOUNDATIONS - SOLUTIONS
 * 
 * Complete solutions to all foundation exercises.
 * Study these to understand best practices and patterns.
 */

// ==================== SOLUTION 1: BASIC TYPES ====================

type Book = {
  id: number;
  title: string;
  author: string;
  publishedYear: number;
  isAvailable?: boolean;
  genres: string[];
};

const myBook: Book = {
  id: 1,
  title: "Clean Code",
  author: "Robert C. Martin",
  publishedYear: 2008,
  isAvailable: true,
  genres: ["Programming", "Software Engineering"]
};

// Example usage
console.log('My book:', myBook.title);

// ==================== SOLUTION 2: FUNCTION TYPES ====================

type UserFetcherOptions = {
  includeProfile?: boolean;
  timeout?: number;
};

type User = {
  id: string; // Changed to string for consistency
  name: string;
  email: string;
  orders: string[]; // Added orders property
  profile?: {
    age: number;
    bio: string;
  };
};

type UserFetcher = (
  id: number, 
  options?: UserFetcherOptions
) => Promise<User | null>;

const fetchUserById: UserFetcher = async (id, options) => {
  try {
    // Simulate API call with timeout
    const timeout = options?.timeout || 5000;
    const response = await Promise.race([
      fetch(`/api/users/${id}`),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
    
    const user = await response.json();
    
    // Include profile if requested
    if (options?.includeProfile) {
      const profileResponse = await fetch(`/api/users/${id}/profile`);
      user.profile = await profileResponse.json();
    }
    
    return user;
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error);
    return null;
  }
};

// Example usage to avoid unused warning
fetchUserById(1, { includeProfile: true }).then(user => {
  console.log('Fetched user:', user?.name || 'User not found');
});

// ==================== SOLUTION 3: INTERFACE VS TYPE ====================

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface Car extends Vehicle {
  doors: number;
  fuelType: "gas" | "electric" | "hybrid";
}

type Motorcycle = Vehicle & {
  hasWindshield: boolean;
  engineSize: number;
};

// Example usage
const myCar: Car = {
  id: "car-1",
  make: "Toyota",
  model: "Prius",
  year: 2022,
  doors: 4,
  fuelType: "hybrid"
};

const myMotorcycle: Motorcycle = {
  id: "bike-1",
  make: "Harley-Davidson",
  model: "Street 750",
  year: 2021,
  hasWindshield: false,
  engineSize: 750
};

// Example usage
console.log('Vehicles:', { 
  car: `${myCar.make} ${myCar.model}`, 
  motorcycle: `${myMotorcycle.make} ${myMotorcycle.model}` 
});

// ==================== SOLUTION 4: UNION TYPES ====================

type ApiStatus = "loading" | "success" | "error";

type ApiState = 
  | { status: "loading" }
  | { status: "success"; data: any }
  | { status: "error"; message: string };

function handleApiResponse(state: ApiState): string {
  switch (state.status) {
    case "loading":
      return "Loading data...";
    case "success":
      return `Success! Received: ${JSON.stringify(state.data)}`;
    case "error":
      return `Error: ${state.message}`;
    default:
      // Exhaustiveness check - TypeScript will error if we miss a case
      const _exhaustive: never = state;
      return _exhaustive;
  }
}

// Example usage
const loadingState: ApiState = { status: "loading" };
const successState: ApiState = { status: "success", data: { users: [] } };
const errorState: ApiState = { status: "error", message: "Network error" };

console.log(handleApiResponse(loadingState));
console.log(handleApiResponse(successState));
console.log(handleApiResponse(errorState));

// ==================== SOLUTION 5: TYPE GUARDS ====================

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && 
    value.every(item => typeof item === "string")
  );
}

function isBook(value: unknown): value is Book {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Book).id === "number" &&
    typeof (value as Book).title === "string" &&
    typeof (value as Book).author === "string" &&
    typeof (value as Book).publishedYear === "number" &&
    ((value as Book).isAvailable === undefined || typeof (value as Book).isAvailable === "boolean") &&
    Array.isArray((value as Book).genres) &&
    (value as Book).genres.every(genre => typeof genre === "string")
  );
}

function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`Expected number, got ${typeof value}`);
  }
}

// Example usage
function processUnknownData(data: unknown): void {
  if (isStringArray(data)) {
    // TypeScript knows data is string[] here
    console.log(`String array with ${data.length} items:`, data.join(", "));
  }
  
  if (isBook(data)) {
    // TypeScript knows data is Book here
    console.log(`Book: ${data.title} by ${data.author}`);
  }
}

function processNumberInput(input: unknown): number {
  assertIsNumber(input);
  // TypeScript knows input is number here
  return input * 2;
}

// Example usage
processUnknownData(["hello", "world"]);
processUnknownData(myBook);

try {
  const result = processNumberInput(42);
  console.log('Processed number:', result);
} catch (error) {
  console.error('Number processing failed:', error);
}

// ==================== SOLUTION 6: GENERIC FUNCTIONS ====================

function getFirstElement<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

function filterArray<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

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
const strings = ["hello", "world"];

const firstNumber = getFirstElement(numbers); // number | undefined
const firstString = getFirstElement(strings); // string | undefined

const evenNumbers = filterArray(numbers, n => n % 2 === 0); // number[]
const longStrings = filterArray(strings, s => s.length > 4); // string[]

const userAges = { alice: 25, bob: 30, charlie: 35 };
const userAgeDescriptions = mapObject(userAges, age => `${age} years old`);

// Example usage
console.log('Generic function results:', {
  firstNumber,
  firstString,
  evenNumbers: evenNumbers.length,
  longStrings: longStrings.length,
  descriptions: Object.keys(userAgeDescriptions).length
});

// ==================== SOLUTION 7: REAL-WORLD SCENARIO ====================

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
};

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
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
};

// User type already defined above, remove this duplicate

type ShoppingCartItem = {
  product: Product;
  quantity: number;
};

type ShoppingCart = {
  userId: string;
  items: ShoppingCartItem[];
  total: number;
};

type AddToCart = (
  cart: ShoppingCart, 
  product: Product, 
  quantity: number
) => ShoppingCart;

type CalculateTotal = (cart: ShoppingCart) => number;

type ProcessCheckout = (
  cart: ShoppingCart,
  user: User
) => Promise<Order>;

// Implementations
const addToCart: AddToCart = (cart, product, quantity) => {
  const existingItem = cart.items.find(item => item.product.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product, quantity });
  }
  
  cart.total = calculateTotal(cart);
  return cart;
};

const calculateTotal: CalculateTotal = (cart) => {
  return cart.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

const processCheckout: ProcessCheckout = async (cart, user) => {
  // Validate cart
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }
  
  // Check stock
  for (const item of cart.items) {
    if (!item.product.inStock) {
      throw new Error(`Product ${item.product.name} is out of stock`);
    }
  }
  
  // Create order
  const order: Order = {
    id: `order-${Date.now()}`,
    userId: user.id, // user.id is already string type
    items: cart.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    })),
    total: cart.total,
    status: "pending"
  };
  
  // Process payment (mock)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return order;
};

// ==================== SOLUTION 8: ADVANCED PATTERNS ====================

type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

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
// Result: { id: string; name?: string; age?: number; email?: string; createdAt?: Date; updatedAt?: Date; }

// Pick only string properties
type DatabaseRecordStrings = PickByType<DatabaseRecord, string>;
// Result: { id: string; name: string; email: string; }

// Example usage
const updateRecord: DatabaseRecordUpdate = {
  id: "123", // Required
  name: "John Doe", // Optional
  // Other fields are optional
};

const stringFields: DatabaseRecordStrings = {
  id: "123",
  name: "John Doe", 
  email: "john@example.com"
  // age, createdAt, updatedAt are not included (wrong type)
};

// Example usage
console.log('Database utility examples:', {
  updateId: updateRecord.id,
  stringCount: Object.keys(stringFields).length
});

// ==================== SOLUTION 9: ERROR HANDLING ====================

class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class NetworkError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "NetworkError";
  }
}

type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function parseNumber(input: string): Result<number, ValidationError> {
  const trimmed = input.trim();
  
  if (trimmed === "") {
    return {
      success: false,
      error: new ValidationError("Input cannot be empty", "input")
    };
  }
  
  const parsed = Number(trimmed);
  
  if (isNaN(parsed)) {
    return {
      success: false,
      error: new ValidationError(`"${input}" is not a valid number`, "input")
    };
  }
  
  return {
    success: true,
    data: parsed
  };
}

// Example usage
function handleNumberParsing(input: string): void {
  const result = parseNumber(input);
  
  if (result.success) {
    console.log(`Parsed number: ${result.data}`);
  } else {
    console.error(`Validation error in ${result.error.field}: ${result.error.message}`);
  }
}

// ==================== SOLUTION 10: EVENT SYSTEM ====================

type UserEventMap = {
  userCreated: { user: User };
  userUpdated: { userId: string; changes: Partial<User> };
  userDeleted: { userId: string };
  userLoggedIn: { userId: string; timestamp: Date };
};

type EventListener<T> = (data: T) => void;

class UserEventEmitter {
  private listeners: {
    [K in keyof UserEventMap]?: EventListener<UserEventMap[K]>[];
  } = {};

  on<K extends keyof UserEventMap>(
    event: K, 
    listener: EventListener<UserEventMap[K]>
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof UserEventMap>(
    event: K, 
    listener: EventListener<UserEventMap[K]>
  ): void {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event]!.indexOf(listener);
    if (index > -1) {
      this.listeners[event]!.splice(index, 1);
    }
  }

  emit<K extends keyof UserEventMap>(
    event: K, 
    data: UserEventMap[K]
  ): void {
    if (!this.listeners[event]) return;
    
    this.listeners[event]!.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in ${String(event)} event listener:`, error);
      }
    });
  }

  once<K extends keyof UserEventMap>(
    event: K, 
    listener: EventListener<UserEventMap[K]>
  ): void {
    const onceListener: EventListener<UserEventMap[K]> = (data) => {
      this.off(event, onceListener);
      listener(data);
    };
    this.on(event, onceListener);
  }
}

// Example usage
const userEmitter = new UserEventEmitter();

// Add listeners
userEmitter.on('userCreated', ({ user }) => {
  console.log(`New user created: ${user.name}`);
});

userEmitter.on('userLoggedIn', ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${timestamp.toISOString()}`);
});

// Emit events
userEmitter.emit('userCreated', {
  user: { id: "1", name: "John", email: "john@example.com", orders: [] }
});

userEmitter.emit('userLoggedIn', {
  userId: "1",
  timestamp: new Date()
});

// ==================== KNOWLEDGE CHECK ANSWERS ====================

/*
1. When would you use `interface` vs `type`?
Answer: Use interface for object shapes that might be extended or when you need declaration merging. Use type for unions, intersections, computed types, and when you need more flexibility.

2. What's the difference between `unknown` and `any`?
Answer: `unknown` is type-safe - you must check the type before using it. `any` disables type checking completely. Always prefer `unknown` for truly dynamic content.

3. When should you use type assertions vs type guards?
Answer: Use type guards when you want to safely check and narrow types at runtime. Use type assertions only when you're certain of the type and TypeScript can't infer it correctly.

4. What are discriminated unions and why are they useful?
Answer: Discriminated unions use a common property (discriminant) to distinguish between union members. They enable exhaustive type checking and help TypeScript understand which variant you're working with.

5. How do generics improve type safety?
Answer: Generics allow you to create reusable components while maintaining type relationships. They provide type safety without sacrificing flexibility, enabling compile-time type checking for dynamic scenarios.
*/

export {
  Book,
  User,
  UserFetcher,
  Vehicle,
  Car,
  Motorcycle,
  ApiStatus,
  ApiState,
  Product,
  Order,
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
  handleApiResponse,
  isStringArray,
  isBook,
  assertIsNumber,
  getFirstElement,
  filterArray,
  mapObject,
  addToCart,
  calculateTotal,
  processCheckout,
  parseNumber,
  handleNumberParsing
};