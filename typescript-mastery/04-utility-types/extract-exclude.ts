/**
 * EXTRACT & EXCLUDE - Union Type Filtering
 * 
 * Learn how to filter union types by extracting specific types (Extract)
 * or excluding types (Exclude) to create more precise type definitions.
 */

// ==================== BASIC EXTRACT USAGE ====================

// Union of different types
type AllTypes = string | number | boolean | Date | null | undefined;

// Extract only primitive types
type PrimitiveTypes = Extract<AllTypes, string | number | boolean>;
// Result: string | number | boolean

// Extract only object types
type ObjectTypes = Extract<AllTypes, object>;
// Result: Date

// Extract only nullable types
type NullableTypes = Extract<AllTypes, null | undefined>;
// Result: null | undefined

// ==================== BASIC EXCLUDE USAGE ====================

// Remove specific types from union
type NonNullableTypes = Exclude<AllTypes, null | undefined>;
// Result: string | number | boolean | Date

// Remove primitive types
type NonPrimitives = Exclude<AllTypes, string | number | boolean>;
// Result: Date | null | undefined

// Remove object types
type Primitives = Exclude<AllTypes, object>;
// Result: string | number | boolean | null | undefined

// ==================== DISCRIMINATED UNION FILTERING ====================

// Event system with different event types
interface MouseEvent {
  type: "mouse";
  eventType: "click" | "hover" | "leave";
  x: number;
  y: number;
}

interface KeyboardEvent {
  type: "keyboard";
  eventType: "keydown" | "keyup";
  key: string;
  modifiers: string[];
}

interface NetworkEvent {
  type: "network";
  eventType: "request" | "response" | "error";
  url: string;
  statusCode?: number;
}

interface CustomEvent {
  type: "custom";
  eventName: string;
  payload: any;
}

type AllEvents = MouseEvent | KeyboardEvent | NetworkEvent | CustomEvent;

// Extract specific event categories
type UserInteractionEvents = Extract<AllEvents, { type: "mouse" | "keyboard" }>;
// Result: MouseEvent | KeyboardEvent

type SystemEvents = Extract<AllEvents, { type: "network" | "custom" }>;
// Result: NetworkEvent | CustomEvent

// Extract by specific properties
type EventsWithPayload = Extract<AllEvents, { payload: any }>;
// Result: CustomEvent

type EventsWithCoordinates = Extract<AllEvents, { x: number }>;
// Result: MouseEvent

// Exclude certain event types
type NonCustomEvents = Exclude<AllEvents, { type: "custom" }>;
// Result: MouseEvent | KeyboardEvent | NetworkEvent

type InteractiveEvents = Exclude<AllEvents, { type: "network" | "custom" }>;
// Result: MouseEvent | KeyboardEvent

// ==================== API RESPONSE FILTERING ====================

interface LoadingResponse {
  status: "loading";
  progress?: number;
}

interface SuccessResponse<T> {
  status: "success";
  data: T;
  metadata: {
    timestamp: Date;
    source: string;
  };
}

interface ErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

interface CachedResponse<T> {
  status: "cached";
  data: T;
  cachedAt: Date;
  expiresAt: Date;
}

type ApiResponse<T> = LoadingResponse | SuccessResponse<T> | ErrorResponse | CachedResponse<T>;

// Extract successful responses
type SuccessfulResponses<T> = Extract<ApiResponse<T>, { data: any }>;
// Result: SuccessResponse<T> | CachedResponse<T>

// Extract error states
type ErrorStates = Extract<ApiResponse<any>, { status: "error" }>;
// Result: ErrorResponse

// Extract responses with data
type DataResponses<T> = Extract<ApiResponse<T>, { data: T }>;
// Result: SuccessResponse<T> | CachedResponse<T>

// Exclude loading states
type CompletedResponses<T> = Exclude<ApiResponse<T>, { status: "loading" }>;
// Result: SuccessResponse<T> | ErrorResponse | CachedResponse<T>

// Exclude error responses
type SuccessStates<T> = Exclude<ApiResponse<T>, { status: "error" }>;
// Result: LoadingResponse | SuccessResponse<T> | CachedResponse<T>

// ==================== FUNCTION TYPE FILTERING ====================

// Different function signatures
type AsyncFunction = () => Promise<any>;
type SyncFunction = () => any;
type VoidFunction = () => void;
type StringFunction = () => string;
type NumberFunction = () => number;

type AllFunctions = AsyncFunction | SyncFunction | VoidFunction | StringFunction | NumberFunction;

// Extract functions that return specific types
type FunctionsReturningString = Extract<AllFunctions, () => string>;
type FunctionsReturningVoid = Extract<AllFunctions, () => void>;
type FunctionsReturningPromise = Extract<AllFunctions, () => Promise<any>>;

// Exclude async functions
type SyncFunctions = Exclude<AllFunctions, () => Promise<any>>;

// More complex function filtering
type EventHandler<T> = (event: T) => void;
type DataProcessor<T, R> = (data: T) => R;
type AsyncProcessor<T, R> = (data: T) => Promise<R>;
type Validator<T> = (data: T) => boolean;

type ProcessorFunctions<T, R> = 
  | DataProcessor<T, R>
  | AsyncProcessor<T, R>
  | Validator<T>;

// Extract synchronous processors
type SyncProcessors<T, R> = Exclude<ProcessorFunctions<T, R>, AsyncProcessor<T, R>>;

// Extract validators
type ValidatorFunctions<T> = Extract<ProcessorFunctions<T, any>, Validator<T>>;

// ==================== FORM FIELD FILTERING ====================

interface TextInput {
  type: "text";
  value: string;
  placeholder?: string;
  maxLength?: number;
}

interface NumberInput {
  type: "number";
  value: number;
  min?: number;
  max?: number;
}

interface DateInput {
  type: "date";
  value: Date;
  minDate?: Date;
  maxDate?: Date;
}

interface SelectInput {
  type: "select";
  value: string | string[];
  options: Array<{ label: string; value: string }>;
  multiple?: boolean;
}

interface CheckboxInput {
  type: "checkbox";
  value: boolean;
  label: string;
}

interface FileInput {
  type: "file";
  value: File[];
  accept?: string;
  multiple?: boolean;
}

type FormInput = TextInput | NumberInput | DateInput | SelectInput | CheckboxInput | FileInput;

// Extract inputs by value type
type StringValueInputs = Extract<FormInput, { value: string | string[] }>;
// Result: TextInput | SelectInput

type BooleanValueInputs = Extract<FormInput, { value: boolean }>;
// Result: CheckboxInput

type NumberValueInputs = Extract<FormInput, { value: number }>;
// Result: NumberInput

// Extract inputs with specific capabilities
type MultiValueInputs = Extract<FormInput, { multiple?: boolean }>;
// Result: SelectInput | FileInput

type ValidatedInputs = Extract<FormInput, { min?: any } | { max?: any } | { maxLength?: any }>;
// Result: NumberInput | TextInput | DateInput

// Exclude complex inputs
type SimpleInputs = Exclude<FormInput, SelectInput | FileInput>;
// Result: TextInput | NumberInput | DateInput | CheckboxInput

// ==================== PERMISSION SYSTEM FILTERING ====================

interface ReadPermission {
  action: "read";
  resource: string;
  conditions?: string[];
}

interface WritePermission {
  action: "write";
  resource: string;
  conditions?: string[];
  requiredRole: string;
}

interface DeletePermission {
  action: "delete";
  resource: string;
  requiredRole: string;
  requiresApproval: boolean;
}

interface AdminPermission {
  action: "admin";
  resource: string;
  superAdminOnly: boolean;
}

type Permission = ReadPermission | WritePermission | DeletePermission | AdminPermission;

// Extract permissions by action type
type ReadPermissions = Extract<Permission, { action: "read" }>;
type WritePermissions = Extract<Permission, { action: "write" }>;
type DeletePermissions = Extract<Permission, { action: "delete" }>;
type AdminPermissions = Extract<Permission, { action: "admin" }>;

// Extract permissions requiring roles
type RoleBasedPermissions = Extract<Permission, { requiredRole: string }>;
// Result: WritePermission | DeletePermission

type ConditionalPermissions = Extract<Permission, { conditions?: string[] }>;
// Result: ReadPermission | WritePermission

// Exclude basic permissions
type RestrictedPermissions = Exclude<Permission, ReadPermission>;
// Result: WritePermission | DeletePermission | AdminPermission

// Extract high-security permissions
type HighSecurityPermissions = Extract<Permission, { requiresApproval: boolean } | { superAdminOnly: boolean }>;
// Result: DeletePermission | AdminPermission

// ==================== DATABASE OPERATION FILTERING ====================

interface CreateOperation<T> {
  type: "create";
  data: Omit<T, "id" | "createdAt" | "updatedAt">;
  userId: string;
}

interface ReadOperation {
  type: "read";
  id: string;
  includeDeleted?: boolean;
}

interface UpdateOperation<T> {
  type: "update";
  id: string;
  data: Partial<Omit<T, "id" | "createdAt">>;
  userId: string;
}

interface DeleteOperation {
  type: "delete";
  id: string;
  userId: string;
  soft?: boolean;
}

interface BulkOperation<T> {
  type: "bulk";
  operation: "create" | "update" | "delete";
  items: string[] | Partial<T>[];
  userId: string;
}

type DatabaseOperation<T> = 
  | CreateOperation<T>
  | ReadOperation
  | UpdateOperation<T>
  | DeleteOperation
  | BulkOperation<T>;

// Extract operations that modify data
type MutationOperations<T> = Exclude<DatabaseOperation<T>, ReadOperation>;
// Result: CreateOperation<T> | UpdateOperation<T> | DeleteOperation | BulkOperation<T>

// Extract operations requiring authentication
type AuthenticatedOperations<T> = Extract<DatabaseOperation<T>, { userId: string }>;
// Result: CreateOperation<T> | UpdateOperation<T> | DeleteOperation | BulkOperation<T>

// Extract single-record operations
type SingleRecordOperations<T> = Exclude<DatabaseOperation<T>, BulkOperation<T>>;
// Result: CreateOperation<T> | ReadOperation | UpdateOperation<T> | DeleteOperation

// Extract operations with data payload
type DataOperations<T> = Extract<DatabaseOperation<T>, { data: any }>;
// Result: CreateOperation<T> | UpdateOperation<T>

// ==================== UTILITY HELPER FUNCTIONS ====================

// Type-safe filtering functions
function filterSuccessResponses<T>(responses: ApiResponse<T>[]): SuccessfulResponses<T>[] {
  return responses.filter((response): response is SuccessfulResponses<T> => 
    response.status === "success" || response.status === "cached"
  );
}

function filterUserInteractionEvents(events: AllEvents[]): UserInteractionEvents[] {
  return events.filter((event): event is UserInteractionEvents =>
    event.type === "mouse" || event.type === "keyboard"
  );
}

function filterMutationOperations<T>(operations: DatabaseOperation<T>[]): MutationOperations<T>[] {
  return operations.filter((op): op is MutationOperations<T> =>
    op.type !== "read"
  );
}

// Generic filter helper
type FilteredType<T, U> = Extract<T, U>;

function createTypeFilter<T, U>(predicate: (item: T) => item is Extract<T, U>) {
  return function(items: T[]): Extract<T, U>[] {
    return items.filter(predicate);
  };
}

// ==================== ADVANCED PATTERNS ====================

// Conditional extraction based on environment
type DevelopmentFeatures = "debugging" | "hotReload" | "devTools";
type ProductionFeatures = "analytics" | "monitoring" | "optimization";
type UniversalFeatures = "authentication" | "routing" | "stateManagement";

type AllFeatures = DevelopmentFeatures | ProductionFeatures | UniversalFeatures;

type EnvironmentFeatures<T extends "development" | "production"> = 
  T extends "development" 
    ? Extract<AllFeatures, DevelopmentFeatures | UniversalFeatures>
    : Extract<AllFeatures, ProductionFeatures | UniversalFeatures>;

type DevFeatures = EnvironmentFeatures<"development">;
type ProdFeatures = EnvironmentFeatures<"production">;

// Extract types based on shape
type HasId = Extract<{ id: any }, { id: any }>;
type HasTimestamps = Extract<{ createdAt: any; updatedAt: any }, { createdAt: any; updatedAt: any }>;

// Complex conditional extraction
type ExtractByShape<T, Shape> = Extract<T, Shape>;

type EventsWithType<TType extends string> = Extract<AllEvents, { type: TType }>;
type MouseEvents = EventsWithType<"mouse">;
type NetworkEvents = EventsWithType<"network">;

export {
  AllTypes,
  PrimitiveTypes,
  ObjectTypes,
  NullableTypes,
  NonNullableTypes,
  AllEvents,
  UserInteractionEvents,
  SystemEvents,
  EventsWithPayload,
  EventsWithCoordinates,
  NonCustomEvents,
  InteractiveEvents,
  ApiResponse,
  SuccessfulResponses,
  ErrorStates,
  DataResponses,
  CompletedResponses,
  SuccessStates,
  FormInput,
  StringValueInputs,
  BooleanValueInputs,
  NumberValueInputs,
  MultiValueInputs,
  SimpleInputs,
  Permission,
  ReadPermissions,
  WritePermissions,
  RoleBasedPermissions,
  RestrictedPermissions,
  DatabaseOperation,
  MutationOperations,
  AuthenticatedOperations,
  SingleRecordOperations,
  DataOperations,
  filterSuccessResponses,
  filterUserInteractionEvents,
  filterMutationOperations,
  createTypeFilter,
  EnvironmentFeatures,
  ExtractByShape,
  EventsWithType
};