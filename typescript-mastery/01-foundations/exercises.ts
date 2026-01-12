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
type Book = {};

// TODO: Create a book instance using the type above
const myBook: Book = {};

// ==================== EXERCISE 2: FUNCTION TYPES ====================

// TODO: Create a type for a function that:
// - Takes a user ID (number) and options object (optional)
// - Options should have: includeProfile (boolean), timeout (number)
// - Returns a Promise of User or null

// Your solution here:
type UserFetcher = {};

// TODO: Implement the function using the type above
const fetchUserById: UserFetcher = async (id, options) => {
  // Implementation here
  return null;
};

// ==================== EXERCISE 3: INTERFACE VS TYPE ====================

// TODO: Create an interface for a Vehicle with:
// - id (string)
// - make (string)  
// - model (string)
// - year (number)

interface Vehicle {
  // Your solution here
}

// TODO: Create a Car interface that extends Vehicle and adds:
// - doors (number)
// - fuelType ("gas" | "electric" | "hybrid")

interface Car {
  // Your solution here
}

// TODO: Create a type alias for motorcycle that combines Vehicle with:
// - hasWindshield (boolean)
// - engineSize (number)

type Motorcycle = {};

// ==================== EXERCISE 4: UNION TYPES ====================

// TODO: Create a type for API response status
type ApiStatus = {}; // Should be "loading" | "success" | "error"

// TODO: Create a discriminated union for different API states
type ApiState = {};
// Should handle: loading (no extra props), success (data prop), error (message prop)

// TODO: Create a function that handles the API state
function handleApiResponse(state: ApiState): string {
  // Your implementation here
  return "";
}

// ==================== EXERCISE 5: TYPE GUARDS ====================

// TODO: Create a type guard function to check if a value is a string array
function isStringArray(value: unknown): value is string[] {
  // Your implementation here
  return false;
}

// TODO: Create a type guard for the Book type you created earlier
function isBook(value: unknown): value is Book {
  // Your implementation here
  return false;
}

// TODO: Create an assertion function that throws if value is not a number
function assertIsNumber(value: unknown): asserts value is number {
  // Your implementation here
}

// ==================== EXERCISE 6: GENERIC FUNCTIONS ====================

// TODO: Create a generic function that returns the first element of an array
function getFirstElement<T>(array: T[]): T | undefined {
  // Your implementation here
  return undefined;
}

// TODO: Create a generic function that filters array by a predicate
function filterArray<T>(array: T[], predicate: (item: T) => boolean): T[] {
  // Your implementation here
  return [];
}

// TODO: Create a generic function that maps object properties
function mapObject<T, R>(
  obj: Record<string, T>,
  mapper: (value: T) => R
): Record<string, R> {
  // Your implementation here
  return {};
}

// ==================== EXERCISE 7: REAL-WORLD SCENARIO ====================

// TODO: Create types for a simple e-commerce system:

// Product type with id, name, price, category, inStock
type Product = {};

// Order type with id, userId, items (array of {productId, quantity, price}), total, status
type Order = {};

// User type with id, name, email, orders (array of order IDs)
type User = {};

// TODO: Create a shopping cart type
type ShoppingCart = {};

// TODO: Create function types for:
// - Adding item to cart
type AddToCart = {};

// - Calculating cart total
type CalculateTotal = {};

// - Processing checkout
type ProcessCheckout = {};

// ==================== EXERCISE 8: ADVANCED PATTERNS ====================

// TODO: Create a utility type that makes all properties of T optional except for K
type PartialExcept<T, K extends keyof T> = {};

// TODO: Create a utility type that picks properties from T that are of type U
type PickByType<T, U> = {};

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

// ==================== EXERCISE 9: ERROR HANDLING ====================

// TODO: Create custom error types
class ValidationError extends Error {
  // Add field property and constructor
}

class NetworkError extends Error {
  // Add statusCode property and constructor
}

// TODO: Create a Result type that can be either success with data or error
type Result<T, E = Error> = {};

// TODO: Create a function that returns a Result
function parseNumber(input: string): Result<number, ValidationError> {
  // Your implementation here
}

// ==================== EXERCISE 10: EVENT SYSTEM ====================

// TODO: Create an event map for a user management system
type UserEventMap = {
  // userCreated event with user data
  // userUpdated event with userId and changes
  // userDeleted event with userId
  // userLoggedIn event with userId and timestamp
};

// TODO: Create an event emitter class
class UserEventEmitter {
  // Implement event listener management
}

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
  Result,
  UserEventMap
};