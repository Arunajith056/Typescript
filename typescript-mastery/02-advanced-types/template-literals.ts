/**
 * Template Literal Types in TypeScript
 * Type-safe string manipulation and pattern matching
 */

// ==================== BASIC TEMPLATE LITERALS ====================

// Simple template literal types
type Greeting<T extends string> = `Hello, ${T}!`;

type PersonalGreeting = Greeting<"Alice">;  // "Hello, Alice!"
type GenericGreeting = Greeting<"World">;   // "Hello, World!"

// CSS property names
type CSSProperty<T extends string> = `--${T}`;

type ThemeColor = CSSProperty<"primary-color">;    // "--primary-color"
type FontSize = CSSProperty<"font-size">;          // "--font-size"

// ==================== STRING MANIPULATION UTILITIES ====================

// Capitalize first letter
type MyCapitalize<T extends string> = T extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : T;

type CapitalizedName = MyCapitalize<"john">;        // "John"
type CapitalizedWord = MyCapitalize<"typescript">;  // "Typescript"

// Convert to camelCase
type CamelCase<T extends string> = T extends `${infer First}_${infer Rest}`
  ? `${First}${CamelCase<MyCapitalize<Rest>>}`
  : T;

type CamelCased = CamelCase<"user_name">;          // "userName"
type NestedCamel = CamelCase<"api_base_url">;      // "apiBaseUrl"

// Convert to kebab-case
type KebabCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends Uppercase<First>
    ? `${Lowercase<First>}${KebabCase<Rest>}` extends `${infer Result}`
      ? Result extends `${string}-${string}`
        ? Result
        : `-${Result}`
      : never
    : `${First}${KebabCase<Rest>}`
  : T;

// Simple kebab case for common patterns
type SimpleKebab<T extends string> = T extends `${infer A}${infer B}`
  ? B extends Capitalize<B>
    ? `${Lowercase<A>}-${SimpleKebab<Lowercase<B>>}`
    : `${Lowercase<A>}${SimpleKebab<B>}`
  : Lowercase<T>;

type KebabName = SimpleKebab<"UserProfile">;       // "user-profile"
type KebabMethod = SimpleKebab<"getUserData">;     // "get-user-data"

// ==================== EVENT SYSTEM WITH TEMPLATE LITERALS ====================

// Generate event names
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<"click">;              // "onClick"
type ChangeEvent = EventName<"change">;            // "onChange"
type SubmitEvent = EventName<"submit">;            // "onSubmit"

// Generate event handler types
type EventHandler<T extends string, E = Event> = {
  [K in EventName<T>]: (event: E) => void;
};

type ButtonEvents = EventHandler<"click" | "hover">;
// { onClick: (event: Event) => void; onHover: (event: Event) => void; }

// More specific event types
interface CustomEvents {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'data:update': { table: string; id: number };
}

type CustomEventHandlers = {
  [K in keyof CustomEvents as `on${Capitalize<K>}`]: (data: CustomEvents[K]) => void;
};
// {
//   "onUser:login": (data: { userId: string; timestamp: Date }) => void;
//   "onUser:logout": (data: { userId: string }) => void;
//   "onData:update": (data: { table: string; id: number }) => void;
// }

// ==================== API ROUTING WITH TEMPLATE LITERALS ====================

// REST API endpoints
type APIEndpoint<Resource extends string, Action extends string = never> = 
  Action extends never
    ? `/api/${Resource}`
    : `/api/${Resource}/${Action}`;

type UsersEndpoint = APIEndpoint<"users">;                    // "/api/users"
type UserProfileEndpoint = APIEndpoint<"users", "profile">;   // "/api/users/profile"

// HTTP methods with endpoints
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type APIRoute<M extends HTTPMethod, E extends string> = `${M} ${E}`;

type GetUsers = APIRoute<"GET", "/api/users">;        // "GET /api/users"
type CreateUser = APIRoute<"POST", "/api/users">;     // "POST /api/users"

// Dynamic route parameters
type RouteWithParams<T extends string> = T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? `${Start}${string}/${RouteWithParams<Rest>}`
  : T extends `${infer Start}:${infer Param}`
  ? `${Start}${string}`
  : T;

type UserRoute = RouteWithParams<"/users/:id">;              // "/users/string"
type NestedRoute = RouteWithParams<"/users/:id/posts/:postId">; // "/users/string/posts/string"

// ==================== DATABASE COLUMN NAMING ====================

// Table naming conventions
type TableName<T extends string> = `${Lowercase<T>}_table`;

type UsersTable = TableName<"Users">;               // "users_table"
type PostsTable = TableName<"Posts">;               // "posts_table"

// Foreign key naming
type ForeignKey<T extends string> = `${Lowercase<T>}_id`;

type UserFK = ForeignKey<"User">;                   // "user_id"
type PostFK = ForeignKey<"Post">;                   // "post_id"

// Database query builders
type QueryMethod<T extends string> = `find${T}` | `create${T}` | `update${T}` | `delete${T}`;

type UserMethods = QueryMethod<"User">;
// "findUser" | "createUser" | "updateUser" | "deleteUser"

// ==================== CSS-IN-JS TEMPLATE LITERALS ====================

// CSS property validation
type CSSValue<P extends string> = 
  P extends 'color' ? string
  : P extends 'width' | 'height' | 'margin' | 'padding' ? `${number}px` | `${number}%` | 'auto'
  : P extends 'display' ? 'block' | 'inline' | 'flex' | 'grid' | 'none'
  : string;

// CSS class name generation
type BEMClass<Block extends string, Element extends string = never, Modifier extends string = never> =
  Element extends never
    ? Modifier extends never
      ? Block
      : `${Block}--${Modifier}`
    : Modifier extends never
      ? `${Block}__${Element}`
      : `${Block}__${Element}--${Modifier}`;

type ButtonClass = BEMClass<"button">;                           // "button"
type ButtonIcon = BEMClass<"button", "icon">;                   // "button__icon"
type ButtonPrimary = BEMClass<"button", never, "primary">;       // "button--primary"
type ButtonIconLarge = BEMClass<"button", "icon", "large">;      // "button__icon--large"

// Responsive breakpoints
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ResponsiveClass<T extends string, B extends Breakpoint> = `${T}-${B}`;

type ResponsiveWidth = ResponsiveClass<"w", "md">;              // "w-md"
type ResponsiveText = ResponsiveClass<"text", "lg">;            // "text-lg"

// ==================== FORM VALIDATION MESSAGES ====================

// Field validation error messages
type ValidationMessage<Field extends string, Rule extends string> = 
  `${Field} ${Rule}`;

type RequiredMessage = ValidationMessage<"email", "is required">;        // "email is required"
type FormatMessage = ValidationMessage<"email", "format is invalid">;    // "email format is invalid"

// Error message generator
type FieldError<T extends Record<string, any>> = {
  [K in keyof T as `${string & K}Error`]: string;
};

interface UserForm {
  name: string;
  email: string;
  age: number;
}

type UserFormErrors = FieldError<UserForm>;
// { nameError: string; emailError: string; ageError: string; }

// ==================== ENVIRONMENT CONFIGURATION ====================

// Environment variable names
type EnvVar<T extends string> = `${Uppercase<T>}_${string}`;

type DatabaseURL = EnvVar<"DATABASE">;              // "DATABASE_${string}"
type ApiKey = EnvVar<"API">;                        // "API_${string}"

// Configuration keys
type ConfigKey<Service extends string, Key extends string> = 
  `${Lowercase<Service>}.${Key}`;

type DatabaseConfig = ConfigKey<"Database", "url" | "port" | "name">;
// "database.url" | "database.port" | "database.name"

type RedisConfig = ConfigKey<"Redis", "host" | "port">;
// "redis.host" | "redis.port"

// ==================== LOCALIZATION KEYS ====================

// Translation key generation
type LocaleKey<Namespace extends string, Key extends string> = 
  `${Namespace}:${Key}`;

type CommonKeys = LocaleKey<"common", "submit" | "cancel" | "save">;
// "common:submit" | "common:cancel" | "common:save"

type UserKeys = LocaleKey<"user", "profile" | "settings" | "logout">;
// "user:profile" | "user:settings" | "user:logout"

// Nested translation keys
type NestedKey<T extends string> = T extends `${infer Namespace}.${infer Rest}`
  ? LocaleKey<Namespace, Rest>
  : T;

type NestedUserKey = NestedKey<"user.profile.edit">;           // "user:profile.edit"

// ==================== FILE PATH UTILITIES ====================

// File extension validation
type FileExtension = '.ts' | '.js' | '.json' | '.md' | '.css';
type FileName<T extends string, Ext extends FileExtension> = `${T}${Ext}`;

type TypeScriptFile = FileName<"component", ".ts">;            // "component.ts"
type ConfigFile = FileName<"package", ".json">;               // "package.json"

// Import path generation
type ImportPath<T extends string> = `./${T}` | `../${T}` | T;

type RelativeImport = ImportPath<"components/Button">;          // "./components/Button" | "../components/Button" | "components/Button"

// ==================== REAL-WORLD EXAMPLES ====================

// Component prop naming
interface ComponentBase {
  id: string;
  className?: string;
}

type ComponentProps<T extends string> = ComponentBase & {
  [K in `${T}Props` as 'data']: unknown;
  [K in `on${Capitalize<T>}` as 'onClick']: () => void;
};

// Redux action types
type ActionType<Feature extends string, Action extends string> = 
  `${Uppercase<Feature>}_${Uppercase<Action>}`;

type UserActionTypes = 
  | ActionType<"user", "login">
  | ActionType<"user", "logout">
  | ActionType<"user", "update">;
// "USER_LOGIN" | "USER_LOGOUT" | "USER_UPDATE"

// API versioning
type APIVersion = 'v1' | 'v2' | 'v3';
type VersionedEndpoint<V extends APIVersion, E extends string> = 
  `/api/${V}${E}`;

type V1UsersEndpoint = VersionedEndpoint<"v1", "/users">;       // "/api/v1/users"
type V2PostsEndpoint = VersionedEndpoint<"v2", "/posts">;       // "/api/v2/posts"

// Test case naming
type TestCase<Feature extends string, Case extends string> = 
  `${Feature} should ${Case}`;

type UserTestCases = 
  | TestCase<"User", "login successfully">
  | TestCase<"User", "handle invalid credentials">
  | TestCase<"User", "update profile">;
// "User should login successfully" | "User should handle invalid credentials" | "User should update profile"

// Example usage demonstrations
const exampleGreeting: PersonalGreeting = "Hello, Alice!";
const exampleCSSVar: ThemeColor = "--primary-color";
const exampleAPIRoute: GetUsers = "GET /api/users";
const exampleBEMClass: ButtonIconLarge = "button__icon--large";

console.log('Template literal examples:', {
  greeting: exampleGreeting,
  cssVar: exampleCSSVar,
  apiRoute: exampleAPIRoute,
  bemClass: exampleBEMClass
});

const testMessage: ValidationMessage<"password", "must be at least 8 characters"> = 
  "password must be at least 8 characters";

console.log('Validation message:', testMessage);

// Type-safe configuration object
type AppConfiguration = {
  [K in DatabaseConfig]: string;
} & {
  [K in RedisConfig]: string;
};

const appConfig: AppConfiguration = {
  'database.url': 'localhost:5432',
  'database.port': '5432',
  'database.name': 'myapp',
  'redis.host': 'localhost',
  'redis.port': '6379'
};

console.log('App configuration:', appConfig);

console.log('Template literal types examples loaded successfully');

export {
  Greeting,
  CSSProperty,
  MyCapitalize,
  CamelCase,
  SimpleKebab,
  EventName,
  EventHandler,
  APIEndpoint,
  APIRoute,
  RouteWithParams,
  TableName,
  ForeignKey,
  QueryMethod,
  BEMClass,
  ResponsiveClass,
  ValidationMessage,
  FieldError,
  ConfigKey,
  LocaleKey,
  FileName,
  ImportPath,
  ActionType,
  VersionedEndpoint,
  TestCase
};