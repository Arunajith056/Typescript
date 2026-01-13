/**
 * Generic Constraints and Advanced Patterns
 * Learn how to constrain and manipulate generic types
 */

// ==================== BASIC GENERIC CONSTRAINTS ====================

// Constraining to specific types
function logLength<T extends { length: number }>(item: T): T {
  console.log(`Length is ${item.length}`);
  return item;
}

// Works with arrays, strings, but not numbers
const stringLength = logLength("Hello"); // string
const arrayLength = logLength([1, 2, 3]); // number[]
// const numberLength = logLength(42); // Error!

// Constraining to object keys
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "John", age: 30, email: "john@example.com" };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// const invalid = getProperty(person, "salary"); // Error!

// ==================== GENERIC CONSTRAINT PATTERNS ====================

// Exclude certain types
type NonFunction<T> = T extends Function ? never : T;

type StringType = NonFunction<string>; // string
type NumberType = NonFunction<number>; // number
type FunctionType = NonFunction<() => void>; // never

// Require certain properties
interface Identifiable {
  id: string | number;
}

function updateEntity<T extends Identifiable>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}

const user = { id: 1, name: "John", email: "john@example.com" };
const updatedUser = updateEntity(user, { name: "Jane" }); // Works

// const invalid = { name: "John" }; // Missing 'id'
// updateEntity(invalid, { name: "Jane" }); // Error!

// ==================== CONDITIONAL CONSTRAINTS ====================

// Different constraints based on conditions
type DataLoader<T> = T extends string
  ? { loadFromUrl: (url: string) => Promise<T> }
  : T extends number
  ? { loadFromId: (id: number) => Promise<T> }
  : { loadFromConfig: (config: object) => Promise<T> };

type StringLoader = DataLoader<string>;   // { loadFromUrl: ... }
type NumberLoader = DataLoader<number>;   // { loadFromId: ... }
type ObjectLoader = DataLoader<object>;   // { loadFromConfig: ... }

// ==================== RECURSIVE GENERIC CONSTRAINTS ====================

// Tree structure with type safety
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

function findInTree<T>(node: TreeNode<T>, predicate: (value: T) => boolean): T | null {
  if (predicate(node.value)) {
    return node.value;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const result = findInTree(child, predicate);
      if (result !== null) {
        return result;
      }
    }
  }
  
  return null;
}

const numberTree: TreeNode<number> = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4 }, { value: 5 }] },
    { value: 3, children: [{ value: 6 }] }
  ]
};

const found = findInTree(numberTree, (x) => x > 5); // number | null

// ==================== GENERIC CONSTRAINT UTILITIES ====================

// Ensure array type
type EnsureArray<T> = T extends any[] ? T : T[];

type StringArray = EnsureArray<string>;   // string[]
type NumberArray = EnsureArray<number[]>; // number[] (unchanged)

// Flatten one level
type Flatten<T> = T extends (infer U)[] ? U : T;

type FlatString = Flatten<string[][]>; // string[]
type FlatNumber = Flatten<number>;     // number

// Extract async return types
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

async function fetchUser(): Promise<{ id: number; name: string }> {
  return { id: 1, name: "John" };
}

type UserType = AsyncReturnType<typeof fetchUser>; // { id: number; name: string }

// ==================== REAL-WORLD CONSTRAINT EXAMPLES ====================

// API client with typed endpoints
interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
  response: any;
}

type ApiClient<T extends Record<string, ApiEndpoint>> = {
  [K in keyof T]: T[K]['method'] extends 'GET' | 'DELETE'
    ? () => Promise<T[K]['response']>
    : (body: T[K]['body']) => Promise<T[K]['response']>;
};

interface UserApi extends Record<string, ApiEndpoint> {
  getUser: {
    method: 'GET';
    path: '/users/:id';
    response: { id: number; name: string; email: string };
  };
  createUser: {
    method: 'POST';
    path: '/users';
    body: { name: string; email: string };
    response: { id: number; name: string; email: string };
  };
}

type UserApiClient = ApiClient<UserApi>;
// {
//   getUser: () => Promise<User>;
//   createUser: (body: { name: string; email: string }) => Promise<User>;
// }

// Form validation with constraints
type ValidationRule<T> = {
  validate: (value: T) => boolean | string;
  message: string;
};

type FormSchema<T extends Record<string, any>> = {
  [K in keyof T]: ValidationRule<T[K]>[];
};

interface ContactForm {
  name: string;
  email: string;
  age: number;
}

const contactSchema: FormSchema<ContactForm> = {
  name: [
    { validate: (v) => v.length >= 2, message: "Name must be at least 2 characters" },
    { validate: (v) => v.length <= 50, message: "Name must be less than 50 characters" }
  ],
  email: [
    { validate: (v) => v.includes("@"), message: "Email must contain @" },
    { validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Invalid email format" }
  ],
  age: [
    { validate: (v) => v >= 0, message: "Age must be positive" },
    { validate: (v) => v <= 120, message: "Age must be realistic" }
  ]
};

// Database query builder with constraints
interface QueryBuilder<T> {
  where<K extends keyof T>(field: K, operator: 'eq' | 'ne' | 'gt' | 'lt', value: T[K]): QueryBuilder<T>;
  select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>>;
  orderBy<K extends keyof T>(field: K, direction: 'asc' | 'desc'): QueryBuilder<T>;
  execute(): Promise<T[]>;
}

function createQueryBuilder<T>(): QueryBuilder<T> {
  return {
    where(field, operator, value) {
      console.log(`WHERE ${String(field)} ${operator} ${value}`);
      return this;
    },
    select(...fields) {
      console.log(`SELECT ${fields.map(String).join(', ')}`);
      return this as any;
    },
    orderBy(field, direction) {
      console.log(`ORDER BY ${String(field)} ${direction}`);
      return this;
    },
    async execute() {
      console.log('EXECUTE');
      return [] as any;
    }
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

const userQuery = createQueryBuilder<User>()
  .where('age', 'gt', 18)
  .select('id', 'name', 'email')
  .orderBy('name', 'asc');

// ==================== ADVANCED CONSTRAINT PATTERNS ====================

// Branded types for additional safety
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<number, 'UserId'>;
type PostId = Brand<number, 'PostId'>;

function getUser(id: UserId): User | null {
  console.log(`Getting user ${id}`);
  return null;
}

// const userId = 123; // Error: number is not assignable to UserId
const userId = 123 as UserId; // OK with assertion
getUser(userId); // OK

// Phantom types for compile-time validation
type Validated<T> = T & { __validated: true };

function validateEmail(email: string): Validated<string> | null {
  return email.includes('@') ? (email as Validated<string>) : null;
}

function sendEmail(to: Validated<string>, subject: string, body: string): void {
  console.log(`Sending email to ${to}: ${subject}`);
}

const rawEmail = "user@example.com";
// sendEmail(rawEmail, "Hello", "World"); // Error!

const validEmail = validateEmail(rawEmail);
if (validEmail) {
  sendEmail(validEmail, "Hello", "World"); // OK
}

console.log('Generic constraints examples loaded successfully');

export {
  logLength,
  getProperty,
  updateEntity,
  findInTree,
  createQueryBuilder,
  validateEmail,
  sendEmail
};

export type {
  NonFunction,
  Identifiable,
  DataLoader,
  TreeNode,
  EnsureArray,
  Flatten,
  AsyncReturnType,
  ApiEndpoint,
  ApiClient,
  ValidationRule,
  FormSchema,
  QueryBuilder,
  Brand,
  Validated,
  UserId,
  PostId
};