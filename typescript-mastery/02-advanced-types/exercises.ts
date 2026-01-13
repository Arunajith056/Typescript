/**
 * Advanced Types Exercises
 * Practice problems for conditional types, mapped types, and template literals
 */

// ==================== CONDITIONAL TYPES EXERCISES ====================

// Exercise 1: Create a type that extracts the element type from an array
// TODO: Implement ArrayElement<T> that returns the element type of T if T is an array, never otherwise
type ArrayElement<T> = any; // Replace with your implementation

// Test cases
type StringArrayElement = ArrayElement<string[]>; // Should be: string
type NumberArrayElement = ArrayElement<number[]>; // Should be: number
type NotAnArray = ArrayElement<string>; // Should be: never

// Exercise 2: Create a NonNullable type that removes null and undefined
// TODO: Implement NonNullable<T> that excludes null and undefined from T
type NonNullable<T> = any; // Replace with your implementation

// Test cases
type NonNullString = NonNullable<string | null | undefined>; // Should be: string
type NonNullNumber = NonNullable<number | null>; // Should be: number

// Exercise 3: Create a type that returns the return type of a function
// TODO: Implement ReturnType<T> that extracts the return type from a function type
type ReturnType<T> = any; // Replace with your implementation

// Test cases
type StringReturn = ReturnType<() => string>; // Should be: string
type PromiseReturn = ReturnType<() => Promise<number>>; // Should be: Promise<number>

// Exercise 4: Create a deep readonly type
// TODO: Implement DeepReadonly<T> that makes all properties readonly recursively
type DeepReadonly<T> = any; // Replace with your implementation

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

type ReadonlyNested = DeepReadonly<NestedObject>; // All properties should be readonly

// ==================== MAPPED TYPES EXERCISES ====================

// Exercise 5: Create a type that makes specific properties optional
// TODO: Implement PartialBy<T, K> that makes properties K optional in T
type PartialBy<T, K extends keyof T> = any; // Replace with your implementation

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type UserWithOptionalEmail = PartialBy<User, 'email'>; // email should be optional

// Exercise 6: Create getters for all properties
// TODO: Implement Getters<T> that creates getter functions for all properties
type Getters<T> = any; // Replace with your implementation

type UserGetters = Getters<User>; // Should have getId, getName, getEmail, getAge methods

// Exercise 7: Create a type that picks properties by type
// TODO: Implement PickByType<T, U> that picks properties of type U from T
type PickByType<T, U> = any; // Replace with your implementation

type UserStrings = PickByType<User, string>; // Should be: { name: string; email: string; }
type UserNumbers = PickByType<User, number>; // Should be: { id: number; age: number; }

// Exercise 8: Create event handlers from properties
// TODO: Implement EventHandlers<T> that creates event handlers for property changes
type EventHandlers<T> = any; // Replace with your implementation

type UserEventHandlers = EventHandlers<User>; // Should have onIdChange, onNameChange, etc.

// ==================== TEMPLATE LITERAL EXERCISES ====================

// Exercise 9: Create a camelCase converter
// TODO: Implement CamelCase<T> that converts snake_case to camelCase
type CamelCase<T extends string> = any; // Replace with your implementation

type CamelName = CamelCase<'user_name'>; // Should be: 'userName'
type CamelUrl = CamelCase<'api_base_url'>; // Should be: 'apiBaseUrl'

// Exercise 10: Create kebab-case converter
// TODO: Implement KebabCase<T> that converts PascalCase to kebab-case
type KebabCase<T extends string> = any; // Replace with your implementation

type KebabName = KebabCase<'UserProfile'>; // Should be: 'user-profile'
type KebabMethod = KebabCase<'GetUserData'>; // Should be: 'get-user-data'

// Exercise 11: Create API endpoints
// TODO: Implement APIEndpoint<T> that creates REST API endpoints
type APIEndpoint<T extends string> = any; // Replace with your implementation

type UsersAPI = APIEndpoint<'users'>; // Should be: '/api/users'
type PostsAPI = APIEndpoint<'posts'>; // Should be: '/api/posts'

// Exercise 12: Create BEM CSS class names
// TODO: Implement BEM<B, E?, M?> for Block__Element--Modifier pattern
type BEM<
  B extends string,
  E extends string = never,
  M extends string = never
> = any; // Replace with your implementation

type ButtonBlock = BEM<'button'>; // Should be: 'button'
type ButtonIcon = BEM<'button', 'icon'>; // Should be: 'button__icon'
type ButtonPrimary = BEM<'button', never, 'primary'>; // Should be: 'button--primary'
type ButtonIconLarge = BEM<'button', 'icon', 'large'>; // Should be: 'button__icon--large'

// ==================== COMBINED EXERCISES ====================

// Exercise 13: Create a form configuration type
// TODO: Create FormConfig<T> that generates form configuration for each property
interface FormField<T> {
  label: string;
  required: boolean;
  validator?: (value: T) => string | null;
}

type FormConfig<T> = any; // Replace with your implementation

type UserFormConfig = FormConfig<Pick<User, 'name' | 'email' | 'age'>>; // Should create config for each field

// Exercise 14: Create a query builder type
// TODO: Create QueryBuilder<T> with type-safe query conditions
type QueryCondition<T> = T extends string
  ? { contains?: string; startsWith?: string; endsWith?: string }
  : T extends number
  ? { gt?: number; lt?: number; gte?: number; lte?: number }
  : {};

type QueryBuilder<T> = any; // Replace with your implementation

type UserQuery = QueryBuilder<User>; // Should allow querying with type-safe conditions

// Exercise 15: Create a state management type
// TODO: Create Redux-style actions and reducers
type ActionType<T extends string, A extends string> = any; // Replace with your implementation

type UserActions = 
  | ActionType<'USER', 'CREATE'>
  | ActionType<'USER', 'UPDATE'>
  | ActionType<'USER', 'DELETE'>; // Should be proper action type strings

// ==================== BONUS EXERCISES ====================

// Exercise 16: Create a type-safe router
// TODO: Create Router<T> that extracts parameters from route patterns
type RouteParams<T extends string> = any; // Replace with your implementation

type UserRouteParams = RouteParams<'/users/:id/posts/:postId'>; // Should be: { id: string; postId: string; }

// Exercise 17: Create a validation schema generator
// TODO: Create ValidationSchema<T> that generates validation rules based on property types
type ValidationSchema<T> = any; // Replace with your implementation

type UserValidationSchema = ValidationSchema<User>; // Should create appropriate validation for each property type

// Exercise 18: Create a database table generator
// TODO: Create TableSchema<T> that generates database column definitions
type ColumnType<T> = T extends string
  ? 'VARCHAR' | 'TEXT'
  : T extends number
  ? 'INT' | 'DECIMAL'
  : T extends boolean
  ? 'BOOLEAN'
  : T extends Date
  ? 'DATETIME'
  : 'JSON';

type TableSchema<T> = any; // Replace with your implementation

type UserTable = TableSchema<User>; // Should create table schema for User

// ==================== TEST HELPER FUNCTIONS ====================

// Helper functions to test your implementations
function testArrayElement() {
  // Test your ArrayElement implementation
  const stringEl: ArrayElement<string[]> = 'test';
  const numberEl: ArrayElement<number[]> = 42;
  // const invalid: ArrayElement<string> = 'test'; // Should error
  
  console.log('ArrayElement tests passed');
}

function testNonNullable() {
  // Test your NonNullable implementation
  const str: NonNullable<string | null> = 'test';
  const num: NonNullable<number | undefined> = 42;
  
  console.log('NonNullable tests passed');
}

function testPartialBy() {
  // Test your PartialBy implementation
  const user: UserWithOptionalEmail = {
    id: 1,
    name: 'John',
    age: 30
    // email is optional
  };
  
  console.log('PartialBy test passed:', user);
}

// Run tests
try {
  testArrayElement();
  testNonNullable();
  testPartialBy();
  console.log('All basic tests passed! 🎉');
} catch (error) {
  console.log('Some tests failed. Check your implementations.');
}

export {
  ArrayElement,
  NonNullable,
  ReturnType,
  DeepReadonly,
  PartialBy,
  Getters,
  PickByType,
  EventHandlers,
  CamelCase,
  KebabCase,
  APIEndpoint,
  BEM,
  FormConfig,
  QueryBuilder,
  ActionType,
  RouteParams,
  ValidationSchema,
  TableSchema
};