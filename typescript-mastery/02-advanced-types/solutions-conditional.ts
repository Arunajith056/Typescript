/**
 * Conditional Types Solutions
 * Complete implementations for conditional type exercises
 */

// ==================== BASIC CONDITIONAL TYPES ====================

// Solution 1: ArrayElement - Extract element type from array
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Test cases
type StringArrayElement = ArrayElement<string[]>; // string
type NumberArrayElement = ArrayElement<number[]>; // number
type NotAnArray = ArrayElement<string>; // never

// Solution 2: NonNullable - Remove null and undefined
type NonNullable<T> = T extends null | undefined ? never : T;

// Test cases
type NonNullString = NonNullable<string | null | undefined>; // string
type NonNullNumber = NonNullable<number | null>; // number

// Solution 3: ReturnType - Extract function return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Test cases
type StringReturn = ReturnType<() => string>; // string
type PromiseReturn = ReturnType<() => Promise<number>>; // Promise<number>

// Solution 4: DeepReadonly - Recursive readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface NestedObject {
  user: {
    name: string;
    profile: {
      age: number;
      settings: {
        theme: string;
      };
    };
  };
}

type ReadonlyNested = DeepReadonly<NestedObject>; // All properties readonly

// ==================== ADVANCED CONDITIONAL TYPES ====================

// Flatten nested arrays
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

type NestedArray = string[][][];
type FlatString = Flatten<NestedArray>; // string

// Extract promise value type
type PromiseValue<T> = T extends Promise<infer U> ? U : T;

type StringPromise = PromiseValue<Promise<string>>; // string
type DirectString = PromiseValue<string>; // string

// Function parameters extractor
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type FuncParams = Parameters<(a: string, b: number) => void>; // [string, number]

// Awaited type (like built-in Awaited)
type MyAwaited<T> = T extends Promise<infer U> 
  ? U extends Promise<any> 
    ? MyAwaited<U> 
    : U 
  : T;

type AwaitedString = MyAwaited<Promise<Promise<string>>>; // string

// ==================== DISTRIBUTIVE CONDITIONAL TYPES ====================

// Exclude implementation
type MyExclude<T, U> = T extends U ? never : T;

type WithoutString = MyExclude<string | number | boolean, string>; // number | boolean

// Extract implementation
type MyExtract<T, U> = T extends U ? T : never;

type OnlyString = MyExtract<string | number | boolean, string>; // string

// Filter nullable values
type NonNullableUnion<T> = T extends null | undefined ? never : T;

type CleanUnion = NonNullableUnion<string | null | number | undefined>; // string | number

// ==================== UTILITY TYPE IMPLEMENTATIONS ====================

// Pick implementation
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit implementation  
type MyOmit<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? never : T[P];
}[keyof T];

// Record implementation
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

// Required implementation
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

// Partial implementation
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// ==================== REAL-WORLD EXAMPLES ====================

// API Response unwrapper
type ApiResponse<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };

type UnwrapApiResponse<T> = T extends ApiResponse<infer U> ? U : never;

type UserResponse = ApiResponse<{ id: number; name: string }>;
type UserData = UnwrapApiResponse<UserResponse>; // { id: number; name: string }

// Error handling types
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

type UnwrapResult<T> = T extends Result<infer U, any> ? U : never;

type StringResult = Result<string, string>;
type UnwrappedString = UnwrapResult<StringResult>; // string

// Function overload resolver
type OverloadedFunction = {
  (x: string): string;
  (x: number): number;
  (x: boolean): boolean;
};

type OverloadReturnType<T> = T extends {
  (x: string): infer R1;
  (x: number): infer R2;
  (x: boolean): infer R3;
} ? R1 | R2 | R3 : never;

type OverloadReturns = OverloadReturnType<OverloadedFunction>; // string | number | boolean

// Example usage
const examples = {
  arrayElement: 'test' as StringArrayElement,
  nonNull: 'test' as NonNullString,
  returnType: 'test' as StringReturn,
  flattened: 'test' as FlatString,
  promiseValue: 'test' as StringPromise,
  awaited: 'test' as AwaitedString,
  excluded: 42 as WithoutString,
  extracted: 'test' as OnlyString,
  unwrapped: { id: 1, name: 'John' } as UserData
};

console.log('Conditional types solutions loaded:', Object.keys(examples));

export {
  ArrayElement,
  NonNullable,
  ReturnType,
  DeepReadonly,
  Flatten,
  PromiseValue,
  Parameters,
  MyAwaited,
  MyExclude,
  MyExtract,
  NonNullableUnion,
  MyPick,
  MyOmit,
  MyRecord,
  MyRequired,
  MyPartial,
  ApiResponse,
  UnwrapApiResponse,
  Result,
  UnwrapResult,
  OverloadReturnType
};