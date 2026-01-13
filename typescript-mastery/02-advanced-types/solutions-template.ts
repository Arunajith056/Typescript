/**
 * Template Literal Types Solutions
 * Complete implementations for template literal type exercises
 */

// ==================== BASIC TEMPLATE LITERAL TYPES ====================

// Solution 9: CamelCase - Convert snake_case to camelCase
type CamelCase<T extends string> = T extends `${infer First}_${infer Rest}`
  ? `${First}${CamelCase<Capitalize<Rest>>}`
  : T;

type CamelName = CamelCase<'user_name'>; // 'userName'
type CamelUrl = CamelCase<'api_base_url'>; // 'apiBaseUrl'

// Solution 10: KebabCase - Convert PascalCase to kebab-case
type KebabCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends Uppercase<First>
    ? Rest extends ''
      ? Lowercase<First>
      : `${Lowercase<First>}-${KebabCase<Rest>}`
    : `${First}${KebabCase<Rest>}`
  : T;

type KebabName = KebabCase<'UserProfile'>; // 'user-profile'
type KebabMethod = KebabCase<'GetUserData'>; // 'get-user-data'

// Solution 11: APIEndpoint - Create REST API endpoints
type APIEndpoint<T extends string> = `/api/${T}`;

type UsersAPI = APIEndpoint<'users'>; // '/api/users'
type PostsAPI = APIEndpoint<'posts'>; // '/api/posts'

// Solution 12: BEM - Block__Element--Modifier CSS naming
type BEM<
  B extends string,
  E extends string = never,
  M extends string = never
> = E extends never
  ? M extends never
    ? B
    : `${B}--${M}`
  : M extends never
  ? `${B}__${E}`
  : `${B}__${E}--${M}`;

type ButtonBlock = BEM<'button'>; // 'button'
type ButtonIcon = BEM<'button', 'icon'>; // 'button__icon'
type ButtonPrimary = BEM<'button', never, 'primary'>; // 'button--primary'
type ButtonIconLarge = BEM<'button', 'icon', 'large'>; // 'button__icon--large'

// ==================== ADVANCED STRING MANIPULATION ====================

// Snake case converter
type SnakeCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends Uppercase<First>
    ? `_${Lowercase<First>}${SnakeCase<Rest>}`
    : `${First}${SnakeCase<Rest>}`
  : T;

type SnakeName = SnakeCase<'UserProfile'>; // '_user_profile' (needs trimming)

// Better snake case implementation
type ToSnakeCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? Rest extends ''
    ? Lowercase<First>
    : First extends Uppercase<First>
      ? `${Lowercase<First>}_${ToSnakeCase<Rest>}`
      : `${First}${ToSnakeCase<Rest>}`
  : T;

type BetterSnakeName = ToSnakeCase<'UserProfile'>; // 'user_profile'

// Constant case (SCREAMING_SNAKE_CASE)
type ConstantCase<T extends string> = Uppercase<ToSnakeCase<T>>;

type ConstantName = ConstantCase<'UserProfile'>; // 'USER_PROFILE'

// ==================== ROUTE PARAMETER EXTRACTION ====================

// Solution 16: RouteParams - Extract route parameters
type RouteParams<T extends string> = T extends `${infer _}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & RouteParams<Rest>
  : T extends `${infer _}:${infer Param}`
  ? { [K in Param]: string }
  : {};

type UserRouteParams = RouteParams<'/users/:id/posts/:postId'>; // { id: string; postId: string; }
type SimpleRouteParams = RouteParams<'/users/:id'>; // { id: string; }

// Query string parameter extraction
type QueryParams<T extends string> = T extends `${infer _}?${infer Query}`
  ? Query extends `${infer Key}=${infer Value}&${infer Rest}`
    ? { [K in Key]: string } & QueryParams<`?${Rest}`>
    : Query extends `${infer Key}=${infer Value}`
    ? { [K in Key]: string }
    : {}
  : {};

type SearchParams = QueryParams<'/search?q=typescript&category=tutorial'>; // { q: string; category: string; }

// ==================== EVENT SYSTEM TYPES ====================

// Event name generation
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<'click'>; // 'onClick'
type ChangeEvent = EventName<'change'>; // 'onChange'

// Event handler mapping
type EventMap = {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'data:update': { table: string; id: number };
};

type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (data: T[K]) => void;
};

type CustomEventHandlers = EventHandlers<EventMap>;

// ==================== API AND HTTP TYPES ====================

// HTTP method with endpoints
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type APIRoute<M extends HTTPMethod, E extends string> = `${M} ${E}`;

type GetUsers = APIRoute<'GET', '/api/users'>; // 'GET /api/users'
type CreateUser = APIRoute<'POST', '/api/users'>; // 'POST /api/users'
type UpdateUser = APIRoute<'PUT', '/api/users/:id'>; // 'PUT /api/users/:id'

// Versioned endpoints
type APIVersion = 'v1' | 'v2' | 'v3';
type VersionedEndpoint<V extends APIVersion, E extends string> = `/api/${V}${E}`;

type V1UsersEndpoint = VersionedEndpoint<'v1', '/users'>; // '/api/v1/users'
type V2PostsEndpoint = VersionedEndpoint<'v2', '/posts'>; // '/api/v2/posts'

// ==================== DATABASE AND SQL TYPES ====================

// Table naming conventions
type TableName<T extends string> = `${Lowercase<T>}_table`;

type UsersTable = TableName<'Users'>; // 'users_table'
type PostsTable = TableName<'Posts'>; // 'posts_table'

// Foreign key naming
type ForeignKey<T extends string> = `${Lowercase<T>}_id`;

type UserFK = ForeignKey<'User'>; // 'user_id'
type PostFK = ForeignKey<'Post'>; // 'post_id'

// SQL query method generation
type QueryMethod<T extends string> = 
  | `find${T}` 
  | `create${T}` 
  | `update${T}` 
  | `delete${T}` 
  | `list${T}s`;

type UserMethods = QueryMethod<'User'>;
// 'findUser' | 'createUser' | 'updateUser' | 'deleteUser' | 'listUsers'

// ==================== VALIDATION AND ERROR TYPES ====================

// Validation message generation
type ValidationMessage<Field extends string, Rule extends string> = 
  `${Field} ${Rule}`;

type RequiredMessage = ValidationMessage<'email', 'is required'>; // 'email is required'
type FormatMessage = ValidationMessage<'email', 'format is invalid'>; // 'email format is invalid'

// Error code generation
type ErrorCode<Domain extends string, Code extends string> = 
  `${Uppercase<Domain>}_${Uppercase<Code>}`;

type AuthErrors = 
  | ErrorCode<'auth', 'invalid_credentials'>
  | ErrorCode<'auth', 'token_expired'>
  | ErrorCode<'auth', 'access_denied'>;
// 'AUTH_INVALID_CREDENTIALS' | 'AUTH_TOKEN_EXPIRED' | 'AUTH_ACCESS_DENIED'

// ==================== COMPONENT AND UI TYPES ====================

// CSS class generation
type ResponsiveClass<T extends string, B extends 'sm' | 'md' | 'lg' | 'xl'> = 
  `${T}-${B}`;

type ResponsiveWidth = ResponsiveClass<'w', 'md'>; // 'w-md'
type ResponsiveText = ResponsiveClass<'text', 'lg'>; // 'text-lg'

// Component prop naming
type ComponentProp<T extends string> = `${T}Props`;

type ButtonProps = ComponentProp<'Button'>; // 'ButtonProps'
type InputProps = ComponentProp<'Input'>; // 'InputProps'

// ==================== REDUX/STATE MANAGEMENT TYPES ====================

// Solution 15: ActionType - Redux-style action types
type ActionType<T extends string, A extends string> = `${T}_${A}`;

type UserActions = 
  | ActionType<'USER', 'CREATE'>
  | ActionType<'USER', 'UPDATE'>
  | ActionType<'USER', 'DELETE'>; // 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE'

// Selector naming
type SelectorName<T extends string> = `get${Capitalize<T>}`;

type UserSelectors = 
  | SelectorName<'user'>
  | SelectorName<'users'>
  | SelectorName<'currentUser'>; // 'getUser' | 'getUsers' | 'getCurrentUser'

// ==================== TESTING TYPES ====================

// Test case naming
type TestCase<Feature extends string, Case extends string> = 
  `${Feature} should ${Case}`;

type UserTestCases = 
  | TestCase<'User', 'login successfully'>
  | TestCase<'User', 'handle invalid credentials'>
  | TestCase<'User', 'update profile'>;
// 'User should login successfully' | etc.

// Mock function naming
type MockFunction<T extends string> = `mock${Capitalize<T>}`;

type UserMocks = 
  | MockFunction<'getUser'>
  | MockFunction<'createUser'>
  | MockFunction<'deleteUser'>; // 'mockGetUser' | etc.

// ==================== EXAMPLE IMPLEMENTATIONS ====================

// Example route parameter extraction
function extractRouteParams<T extends string>(
  pattern: T,
  url: string
): RouteParams<T> {
  // Implementation would parse the actual URL
  return {} as RouteParams<T>;
}

// Example usage
const userParams = extractRouteParams('/users/:id/posts/:postId', '/users/123/posts/456');
// userParams has type { id: string; postId: string; }

// Example API endpoint generation
const endpoints = {
  users: '/api/users' as UsersAPI,
  posts: '/api/posts' as PostsAPI,
  v1Users: '/api/v1/users' as V1UsersEndpoint,
  v2Posts: '/api/v2/posts' as V2PostsEndpoint
};

// Example BEM class usage
const bemClasses = {
  button: 'button' as ButtonBlock,
  buttonIcon: 'button__icon' as ButtonIcon,
  buttonPrimary: 'button--primary' as ButtonPrimary,
  buttonIconLarge: 'button__icon--large' as ButtonIconLarge
};

// Example conversion utilities
const conversions = {
  camelCase: 'apiBaseUrl' as CamelCase<'api_base_url'>,
  kebabCase: 'user-profile' as KebabCase<'UserProfile'>,
  snakeCase: 'user_profile' as ToSnakeCase<'UserProfile'>,
  constantCase: 'USER_PROFILE' as ConstantCase<'UserProfile'>
};

console.log('Template literal solutions loaded successfully!');
console.log('Endpoints:', endpoints);
console.log('BEM classes:', bemClasses);
console.log('Conversions:', conversions);

export {
  CamelCase,
  KebabCase,
  APIEndpoint,
  BEM,
  ToSnakeCase,
  ConstantCase,
  RouteParams,
  QueryParams,
  EventName,
  EventHandlers,
  APIRoute,
  VersionedEndpoint,
  TableName,
  ForeignKey,
  QueryMethod,
  ValidationMessage,
  ErrorCode,
  ResponsiveClass,
  ComponentProp,
  ActionType,
  SelectorName,
  TestCase,
  MockFunction
};