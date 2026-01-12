/**
 * TYPE ASSERTIONS & TYPE GUARDS - Safe Type Narrowing
 * 
 * Type assertions and guards help you work with dynamic types safely.
 * These are essential for handling external data and runtime type checking.
 */

// ==================== TYPE ASSERTIONS ====================

// Basic type assertion with 'as'
const userInput = document.getElementById("user-input") as HTMLInputElement;
const mockResponse = '{"id": 1, "name": "John", "email": "john@example.com"}';
const jsonData = JSON.parse(mockResponse) as UserData;

// Angle bracket syntax (less common, avoid in JSX)
const element = <HTMLButtonElement>document.getElementById("button");

// Mock function for demonstration
function getUser(): UserData | null {
  return { id: 1, name: "John", email: "john@example.com" };
}

// Non-null assertion operator (!)
const userElement = document.querySelector(".user")!; // Assert it's not null
const user = getUser()!; // Assert function doesn't return null/undefined

// Const assertions
const colors = ["red", "green", "blue"] as const;
type Color = typeof colors[number]; // "red" | "green" | "blue"

const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} as const;
// Makes all properties readonly

// ==================== TYPE GUARDS ====================

// Built-in type guards
function processValue(value: string | number | boolean): void {
  if (typeof value === "string") {
    // TypeScript knows value is string here
    console.log(value.toUpperCase());
  } else if (typeof value === "number") {
    // TypeScript knows value is number here
    console.log(value.toFixed(2));
  } else {
    // TypeScript knows value is boolean here
    console.log(value ? "true" : "false");
  }
}

// instanceof type guard
class Dog {
  bark(): void {
    console.log("Woof!");
  }
}

class Cat {
  meow(): void {
    console.log("Meow!");
  }
}

function makeSound(animal: Dog | Cat): void {
  if (animal instanceof Dog) {
    animal.bark(); // TypeScript knows it's a Dog
  } else {
    animal.meow(); // TypeScript knows it's a Cat
  }
}

// 'in' operator type guard
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function moveAnimal(animal: Bird | Fish): void {
  if ("fly" in animal) {
    animal.fly(); // TypeScript knows it's a Bird
  } else {
    animal.swim(); // TypeScript knows it's a Fish
  }
}

// ==================== CUSTOM TYPE GUARDS ====================

// User-defined type guard functions
interface User {
  id: number;
  name: string;
  email: string;
}

interface Admin extends User {
  permissions: string[];
  role: "admin";
}

// Type predicate function
function isAdmin(user: User | Admin): user is Admin {
  return (user as Admin).role === "admin";
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as User).id === "number" &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string"
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

// Using custom type guards
function handleUserData(userData: unknown): void {
  if (isUser(userData)) {
    // TypeScript knows userData is User here
    console.log(`User: ${userData.name} (${userData.email})`);
    
    if (isAdmin(userData)) {
      // TypeScript knows userData is Admin here
      console.log(`Admin permissions: ${userData.permissions.join(", ")}`);
    }
  } else {
    console.log("Invalid user data");
  }
}

// ==================== ASSERTION FUNCTIONS ====================

// Assertion functions throw if condition is not met
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new Error(`Expected number, got ${typeof value}`);
  }
}

function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error("Invalid user object");
  }
}

// Usage - after assertion, TypeScript knows the type
function processUserData(data: unknown): void {
  assertIsUser(data);
  // TypeScript now knows 'data' is User
  console.log(data.name.toUpperCase());
}

// ==================== DISCRIMINATED UNIONS ====================

// Using literal types as discriminators
interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: any;
}

interface ErrorState {
  status: "error";
  error: string;
}

type ApiState = LoadingState | SuccessState | ErrorState;

function handleApiState(state: ApiState): void {
  switch (state.status) {
    case "loading":
      // TypeScript knows this is LoadingState
      console.log("Loading...");
      break;
    case "success":
      // TypeScript knows this is SuccessState
      console.log("Data:", state.data);
      break;
    case "error":
      // TypeScript knows this is ErrorState
      console.error("Error:", state.error);
      break;
  }
}

// More complex discriminated union
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

// ==================== NULLISH CHECKS ====================

// Handling null and undefined
function processOptionalUser(user: User | null | undefined): void {
  // Null/undefined check
  if (user == null) {
    console.log("No user provided");
    return;
  }
  
  // TypeScript knows user is User here
  console.log(`Processing user: ${user.name}`);
}

// Optional chaining with type guards
function getNestedProperty(obj: any): string | undefined {
  if (
    obj &&
    typeof obj === "object" &&
    "user" in obj &&
    obj.user &&
    typeof obj.user === "object" &&
    "profile" in obj.user &&
    obj.user.profile &&
    typeof obj.user.profile === "object" &&
    "name" in obj.user.profile &&
    typeof obj.user.profile.name === "string"
  ) {
    return obj.user.profile.name;
  }
  return undefined;
}

// Better approach with optional chaining (modern JavaScript)
function getNestedPropertySafe(obj: any): string | undefined {
  return obj?.user?.profile?.name;
}

// ==================== REAL-WORLD PATTERNS ====================

// API response validation
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as ApiResponse<T>).success === "boolean"
  );
}

function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

// Form validation with type guards
type FormField = {
  value: string;
  error?: string;
};

type ContactForm = {
  name: FormField;
  email: FormField;
  message: FormField;
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateContactForm(form: ContactForm): ContactForm {
  const result = { ...form };
  
  // Validate name
  if (!form.name.value.trim()) {
    result.name.error = "Name is required";
  } else {
    delete result.name.error;
  }
  
  // Validate email
  if (!form.email.value.trim()) {
    result.email.error = "Email is required";
  } else if (!isValidEmail(form.email.value)) {
    result.email.error = "Invalid email format";
  } else {
    delete result.email.error;
  }
  
  // Validate message
  if (!form.message.value.trim()) {
    result.message.error = "Message is required";
  } else if (form.message.value.length < 10) {
    result.message.error = "Message must be at least 10 characters";
  } else {
    delete result.message.error;
  }
  
  return result;
}

// Error boundary pattern
class ApplicationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ApplicationError";
  }
}

class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError;
}

function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

function handleError(error: unknown): void {
  if (isApplicationError(error)) {
    console.error(`App Error [${error.code}]: ${error.message}`);
  } else if (isValidationError(error)) {
    console.error(`Validation Error in ${error.field}: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Unknown Error: ${error.message}`);
  } else {
    console.error("Unknown error occurred:", error);
  }
}

// ==================== ADVANCED PATTERNS ====================

// Branded types for additional type safety
type UserId = string & { readonly brand: unique symbol };
type Email = string & { readonly brand: unique symbol };

function createUserId(id: string): UserId {
  // Add validation logic here
  if (!id || id.length < 3) {
    throw new Error("Invalid user ID");
  }
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }
  return email as Email;
}

// These prevent mixing up different string types
function sendEmail(to: Email, from: Email, subject: string): void {
  // Implementation
}

// This would cause a compile error:
// sendEmail("user@example.com", "admin@example.com", "Hello"); // Error!

// Must use branded constructors:
const userEmail = createEmail("user@example.com");
const adminEmail = createEmail("admin@example.com");
sendEmail(userEmail, adminEmail, "Hello"); // OK!

// ==================== BEST PRACTICES ====================

// 1. Prefer type guards over assertions when possible
function processUnknownData(data: unknown): void {
  // ✅ Good - type guard
  if (isUser(data)) {
    console.log(data.name);
  }
  
  // ❌ Avoid - type assertion (unsafe)
  // console.log((data as User).name);
}

// 2. Use assertion functions for critical validations
function handleCriticalUserData(data: unknown): void {
  assertIsUser(data); // Throws if not valid
  // Now we can safely use data as User
  processCriticalOperation(data);
}

function processCriticalOperation(user: User): void {
  // Critical business logic
}

// 3. Combine type guards for complex validation
function isValidUserWithProfile(value: unknown): value is User & { profile: { age: number } } {
  return (
    isUser(value) &&
    "profile" in value &&
    typeof (value as any).profile === "object" &&
    typeof (value as any).profile?.age === "number"
  );
}

interface UserData {
  id: number;
  name: string;
  email: string;
}

export {
  User,
  Admin,
  ApiState,
  Shape,
  ApiResponse,
  FormField,
  ContactForm,
  ApplicationError,
  ValidationError,
  UserId,
  Email,
  isAdmin,
  isUser,
  isString,
  isArray,
  assertIsNumber,
  assertIsUser,
  isApiResponse,
  isSuccessResponse,
  isValidEmail,
  validateContactForm,
  isApplicationError,
  isValidationError,
  handleError,
  createUserId,
  createEmail,
  isValidUserWithProfile
};