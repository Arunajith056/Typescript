/**
 * 01. BASIC TYPES - Foundation of TypeScript
 * 
 * Understanding primitive types, arrays, objects, and basic type annotations.
 * These are the building blocks for everything else in TypeScript.
 */

// ==================== PRIMITIVE TYPES ====================

// String - for text data
let username: string = "john_doe";
let welcomeMessage: string = `Welcome, ${username}!`;

// Number - for all numeric values (int, float, hex, binary, octal)
let age: number = 25;
let salary: number = 75000.50;
let hexColor: number = 0xFF00FF;

// Boolean - true/false values
let isActive: boolean = true;
let hasPermission: boolean = false;

// Undefined and Null
let undefinedValue: undefined = undefined;
let nullValue: null = null;

// ==================== ARRAYS ====================

// Array of strings
let hobbies: string[] = ["reading", "coding", "gaming"];
// Alternative syntax (less common)
let skills: Array<string> = ["TypeScript", "React", "Node.js"];

// Array of numbers
let scores: number[] = [85, 92, 78, 96];

// Mixed arrays using union types
let mixedData: (string | number)[] = ["John", 25, "Engineer", 75000];

// ==================== OBJECTS ====================

// Object with explicit type annotation
let user: {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
} = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  isActive: true
};

// Optional properties with ?
let product: {
  id: number;
  name: string;
  description?: string; // Optional property
  price: number;
} = {
  id: 1,
  name: "Laptop",
  price: 999.99
  // description is optional, so it's not required
};

// Readonly properties
let config: {
  readonly apiUrl: string;
  readonly version: string;
  features: string[];
} = {
  apiUrl: "https://api.example.com",
  version: "1.0.0",
  features: ["auth", "payments"]
};

// config.apiUrl = "new-url"; // Error: Cannot assign to 'apiUrl' because it is a read-only property

// ==================== ANY TYPE (Use Sparingly!) ====================

let dynamicValue: any = "Hello";
dynamicValue = 42;
dynamicValue = true;
dynamicValue = { name: "test" };

// While 'any' is flexible, it defeats the purpose of TypeScript
// Use it only when migrating from JavaScript or dealing with dynamic content

// ==================== UNKNOWN TYPE (Safer than any) ====================

let userInput: unknown = getUserInput();

// Must check type before using
if (typeof userInput === "string") {
  console.log(userInput.toUpperCase()); // Safe to use string methods
}

function getUserInput(): unknown {
  return "Some user input";
}

// ==================== VOID TYPE ====================

// Functions that don't return anything
function logMessage(message: string): void {
  console.log(message);
}

function processData(data: any[]): void {
  // Process data but don't return anything
  data.forEach(item => console.log(item));
}

// ==================== NEVER TYPE ====================

// Functions that never return (throw error or infinite loop)
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // This function never returns
  }
}

// ==================== TYPE INFERENCE ====================

// TypeScript can infer types in many cases
let inferredString = "Hello"; // TypeScript knows this is string
let inferredNumber = 42; // TypeScript knows this is number
let inferredArray = [1, 2, 3]; // TypeScript knows this is number[]

// Object type inference
let inferredUser = {
  name: "John",
  age: 30
}; 
// TypeScript infers: { name: string; age: number; }

// ==================== PRACTICAL EXAMPLES ====================

// User profile with comprehensive typing
type UserProfile = {
  readonly id: number;
  username: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    bio?: string;
    avatar?: string;
  };
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
    language: string;
  };
  createdAt: Date;
  lastLoginAt?: Date;
};

const johnProfile: UserProfile = {
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  profile: {
    firstName: "John",
    lastName: "Doe",
    bio: "Software Engineer passionate about TypeScript"
  },
  preferences: {
    theme: "dark",
    notifications: true,
    language: "en"
  },
  createdAt: new Date("2023-01-15"),
  lastLoginAt: new Date()
};

// Product catalog with variants
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  categories: string[];
  variants?: {
    color?: string[];
    size?: string[];
  };
  metadata: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
};

const laptop: Product = {
  id: "laptop-001",
  name: "MacBook Pro",
  description: "High-performance laptop for professionals",
  price: 1999.99,
  inStock: true,
  categories: ["electronics", "computers"],
  variants: {
    color: ["silver", "space-gray"],
  },
  metadata: {
    weight: 1.4,
    dimensions: {
      length: 30.41,
      width: 21.24,
      height: 1.55
    }
  }
};

// ==================== COMMON PATTERNS ====================

// Enum for constants
enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator"
}

// Using enum
let currentUserRole: UserRole = UserRole.ADMIN;

// Const assertions for immutable values
const themes = ["light", "dark", "auto"] as const;
type Theme = typeof themes[number]; // "light" | "dark" | "auto"

// Tuple types for fixed-length arrays
type Coordinates = [number, number];
let position: Coordinates = [10.5, 20.3];

// Index signatures for dynamic properties
type ApiResponse = {
  status: number;
  message: string;
  [key: string]: any; // Allow additional dynamic properties
};

export {
  UserProfile,
  Product,
  UserRole,
  Theme,
  Coordinates,
  ApiResponse
};