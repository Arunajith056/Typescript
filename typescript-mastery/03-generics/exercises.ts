/**
 * Generic Exercises
 * Practice problems for generic types and constraints
 */

// ==================== BASIC GENERIC EXERCISES ====================

// Exercise 1: Create a generic function that swaps two values
// TODO: Implement swap<T>(a: T, b: T): [T, T]
function swap<T>(a: any, b: any): any {
  // Your implementation here
  return [a, b];
}

// Test cases
const [x, y] = swap(1, 2); // Should be [2, 1]
const [a, b] = swap("hello", "world"); // Should be ["world", "hello"]

// Exercise 2: Create a generic cache class
// TODO: Implement Cache<T> with get, set, and has methods
class Cache<T> {
  // Your implementation here
  private data = new Map<string, any>();

  get(key: string): any {
    return undefined;
  }

  set(key: string, value: any): void {
    // Implementation
  }

  has(key: string): boolean {
    return false;
  }
}

// Test the cache
const stringCache = new Cache<string>();
const numberCache = new Cache<number>();

// Exercise 3: Create a generic Result type for error handling
// TODO: Implement Result<T, E> that can be either Success<T> or Error<E>
type Result<T, E> = any; // Replace with your implementation

// Exercise 4: Generic array utilities
// TODO: Implement these generic utility functions

function first<T>(arr: T[]): T | undefined {
  // Return first element or undefined
  return arr.length > 0 ? arr[0] : undefined;
}

function last<T>(arr: T[]): T | undefined {
  // Return last element or undefined
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

function take<T>(arr: T[], count: number): T[] {
  // Return first 'count' elements
  return arr.slice(0, count);
}

function drop<T>(arr: T[], count: number): T[] {
  // Return array without first 'count' elements
  return arr.slice(count);
}

// ==================== CONSTRAINT EXERCISES ====================

// Exercise 5: Create a function that works with objects having an id property
// TODO: Implement findById<T>(items: T[], id: ???): T | undefined
function findById<T extends { id: string | number }>(items: T[], id: T['id']): T | undefined {
  // Your implementation here
  return items.find(item => item.id === id);
}

// Exercise 6: Create a merge function for objects
// TODO: Implement merge<T, U>(obj1: T, obj2: U): T & U
function merge(obj1: any, obj2: any): any {
  // Your implementation here
}

// Exercise 7: Create a function that sorts objects by a specific property
// TODO: Implement sortBy<T, K>(items: T[], key: K): T[]
function sortBy<T, K extends keyof T>(items: T[], key: K): T[] {
  // Your implementation here
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });
}

// ==================== ADVANCED GENERIC EXERCISES ====================

// Exercise 8: Create a generic event emitter
// TODO: Implement EventEmitter<T> where T is an event map
class EventEmitter<T> {
  // Your implementation here
  
  on(event: any, listener: any): void {
    // Implementation
  }
  
  emit(event: any, data?: any): void {
    // Implementation
  }
  
  off(event: any, listener: any): void {
    // Implementation
  }
}

interface UserEvents {
  login: { userId: string; timestamp: Date };
  logout: { userId: string };
  update: { userId: string; changes: object };
}

const userEmitter = new EventEmitter<UserEvents>();

// Exercise 9: Create a generic state manager
// TODO: Implement StateManager<T> with getState, setState, and subscribe
class StateManager<T> {
  // Your implementation here
  
  getState(): any {
    return undefined;
  }
  
  setState(newState: any): void {
    // Implementation
  }
  
  subscribe(listener: any): any {
    // Return unsubscribe function
    return () => {};
  }
}

// Exercise 10: Create a generic validator
// TODO: Implement Validator<T> that can validate objects of type T
type ValidationRule<T> = any; // Define this type

class Validator<T> {
  // Your implementation here
  
  addRule(field: any, rule: any): void {
    // Implementation
  }
  
  validate(data: any): any {
    // Return validation result
  }
}

// ==================== UTILITY TYPE EXERCISES ====================

// Exercise 11: Create a Deep partial type
// TODO: Implement DeepPartial<T> that makes all properties optional recursively
type DeepPartial<T> = any; // Replace with your implementation

interface NestedUser {
  id: number;
  profile: {
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  };
  settings: {
    theme: string;
    notifications: boolean;
  };
}

type PartialNestedUser = DeepPartial<NestedUser>; // All properties should be optional

// Exercise 12: Create a type that picks properties by type
// TODO: Implement PickByType<T, U> that picks all properties of type U from T
type PickByType<T, U> = any; // Replace with your implementation

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  active: boolean;
}

type UserStrings = PickByType<User, string>; // Should be { name: string; email: string; }
type UserNumbers = PickByType<User, number>; // Should be { id: number; age: number; }

// Exercise 13: Create a function overloader type
// TODO: Implement Overload<T> that creates overloaded function types
type Overload<T> = any; // Replace with your implementation

// Example usage:
// type MyOverload = Overload<{
//   (x: string): string;
//   (x: number): number;
//   (x: boolean): boolean;
// }>;

// ==================== API DESIGN EXERCISES ====================

// Exercise 14: Create a type-safe API client
// TODO: Design ApiClient<T> for type-safe HTTP requests
interface ApiEndpoint {
  method: string;
  path: string;
  body?: any;
  response: any;
}

type ApiClient<T> = any; // Replace with your implementation

interface BlogApi {
  getPosts: {
    method: 'GET';
    path: '/posts';
    response: Array<{ id: number; title: string; content: string }>;
  };
  createPost: {
    method: 'POST';
    path: '/posts';
    body: { title: string; content: string };
    response: { id: number; title: string; content: string };
  };
}

type BlogApiClient = ApiClient<BlogApi>;

// Exercise 15: Create a database query builder
// TODO: Implement QueryBuilder<T> with type-safe query methods
interface QueryBuilder<T> {
  // Define the interface
}

// Exercise 16: Create a form builder type
// TODO: Implement FormBuilder<T> that creates form configurations
type FormField<T> = any; // Define form field type
type FormBuilder<T> = any; // Replace with your implementation

interface ContactForm {
  name: string;
  email: string;
  age: number;
  subscribe: boolean;
}

type ContactFormBuilder = FormBuilder<ContactForm>;

// ==================== TESTING HELPERS ====================

// Test your implementations
function testSwap() {
  const [swapped1, swapped2] = swap(1, 2);
  console.assert(swapped1 === 2 && swapped2 === 1, 'Swap test failed');
}

function testCache() {
  const cache = new Cache<string>();
  cache.set('key1', 'value1');
  console.assert(cache.get('key1') === 'value1', 'Cache test failed');
  console.assert(cache.has('key1') === true, 'Cache has test failed');
}

function testArrayUtils() {
  const arr = [1, 2, 3, 4, 5];
  console.assert(first(arr) === 1, 'First test failed');
  console.assert(last(arr) === 5, 'Last test failed');
  console.assert(take(arr, 2).length === 2, 'Take test failed');
  console.assert(drop(arr, 2).length === 3, 'Drop test failed');
}

function testMerge() {
  const obj1 = { a: 1, b: 2 };
  const obj2 = { c: 3, d: 4 };
  const merged = merge(obj1, obj2);
  console.assert('a' in merged && 'c' in merged, 'Merge test failed');
}

// Run tests (uncomment when implementations are ready)
// testSwap();
// testCache();
// testArrayUtils();
// testMerge();

console.log('Generic exercises loaded. Complete the implementations and run tests!');

export {
  swap,
  Cache,
  first,
  last,
  take,
  drop,
  findById,
  merge,
  sortBy,
  EventEmitter,
  StateManager,
  Validator
};

export type {
  Result,
  DeepPartial,
  PickByType,
  Overload,
  ApiEndpoint,
  ApiClient,
  QueryBuilder,
  FormField,
  FormBuilder,
  ValidationRule
};