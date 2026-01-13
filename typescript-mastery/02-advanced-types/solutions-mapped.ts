/**
 * Mapped Types Solutions
 * Complete implementations for mapped type exercises
 */

// ==================== BASIC MAPPED TYPES ====================

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Solution 5: PartialBy - Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UserWithOptionalEmail = PartialBy<User, 'email'>; // email is optional

// Solution 6: Getters - Create getter functions for properties
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>; // getId, getName, getEmail, getAge

// Solution 7: PickByType - Pick properties by their type
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type UserStrings = PickByType<User, string>; // { name: string; email: string; }
type UserNumbers = PickByType<User, number>; // { id: number; age: number; }

// Solution 8: EventHandlers - Create event handlers for property changes
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (
    newValue: T[K],
    oldValue: T[K]
  ) => void;
};

type UserEventHandlers = EventHandlers<User>; // onIdChange, onNameChange, etc.

// ==================== ADVANCED MAPPED TYPES ====================

// RequiredBy - Make specific properties required
type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

type UserWithRequiredEmail = RequiredBy<Partial<User>, 'email'>;

// Setters - Create setter functions
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type UserSetters = Setters<User>; // setId, setName, setEmail, setAge

// Nullify specific properties
type Nullify<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

type UserNullEmail = Nullify<User, 'email'>; // email becomes string | null

// Deep partial implementation
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedUser {
  id: number;
  profile: {
    name: string;
    contact: {
      email: string;
      phone?: string;
    };
  };
}

type DeepPartialUser = DeepPartial<NestedUser>; // All properties optional recursively

// ==================== UTILITY MAPPED TYPES ====================

// Transform to functions
type Functionify<T> = {
  [K in keyof T]: (value: T[K]) => void;
};

type UserFunctions = Functionify<User>;

// Transform to validators
type Validators<T> = {
  [K in keyof T]: (value: T[K]) => boolean | string;
};

type UserValidators = Validators<User>;

// Transform to default values
type Defaults<T> = {
  [K in keyof T]: T[K] | (() => T[K]);
};

type UserDefaults = Defaults<User>;

// ==================== FORM-RELATED MAPPED TYPES ====================

// Form field configuration
interface FormField<T> {
  label: string;
  required: boolean;
  validator?: (value: T) => string | null;
}

type FormConfig<T> = {
  [K in keyof T]: FormField<T[K]>;
};

type UserFormConfig = FormConfig<Pick<User, 'name' | 'email' | 'age'>>;

// Form state management
type FormState<T> = {
  [K in keyof T]: {
    value: T[K];
    error?: string;
    touched: boolean;
    dirty: boolean;
  };
};

type UserFormState = FormState<Pick<User, 'name' | 'email'>>;

// Form field errors
type FormErrors<T> = {
  [K in keyof T]?: string;
};

type UserFormErrors = FormErrors<User>;

// ==================== API-RELATED MAPPED TYPES ====================

// API endpoints from model
type ApiEndpoints<T> = {
  [K in keyof T as `${string & K}Endpoint`]: string;
};

type UserApiEndpoints = ApiEndpoints<{
  users: User[];
  posts: any[];
  comments: any[];
}>;

// Transform to API response format
type ApiResponse<T> = {
  [K in keyof T]: {
    data: T[K];
    status: 'success' | 'error';
    message?: string;
  };
};

type UserApiResponse = ApiResponse<Pick<User, 'name' | 'email'>>;

// Query builder conditions
type QueryCondition<T> = T extends string
  ? { contains?: string; startsWith?: string; endsWith?: string }
  : T extends number
  ? { gt?: number; lt?: number; gte?: number; lte?: number }
  : {};

type QueryBuilder<T> = {
  [K in keyof T]?: T[K] | QueryCondition<T[K]>;
};

type UserQuery = QueryBuilder<User>; // Type-safe query conditions

// ==================== DATABASE MAPPED TYPES ====================

// Column type mapping
type ColumnType<T> = T extends string
  ? 'VARCHAR' | 'TEXT'
  : T extends number
  ? 'INT' | 'DECIMAL'
  : T extends boolean
  ? 'BOOLEAN'
  : T extends Date
  ? 'DATETIME'
  : 'JSON';

// Database column configuration
type ColumnConfig<T> = {
  [K in keyof T]: {
    type: ColumnType<T[K]>;
    nullable: T[K] extends undefined ? true : false;
    primaryKey?: boolean;
    unique?: boolean;
    defaultValue?: T[K];
  };
};

type UserTableConfig = ColumnConfig<User>;

// Migration types
type TableMigration<T> = {
  [K in keyof T as `add_${string & K}`]: () => string;
} & {
  [K in keyof T as `drop_${string & K}`]: () => string;
};

type UserMigration = TableMigration<User>;

// ==================== EXAMPLE IMPLEMENTATIONS ====================

// Example user form configuration
const userFormConfig: UserFormConfig = {
  name: {
    label: 'Full Name',
    required: true,
    validator: (value) => value.length < 2 ? 'Name must be at least 2 characters' : null
  },
  email: {
    label: 'Email Address',
    required: true,
    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email format'
  },
  age: {
    label: 'Age',
    required: true,
    validator: (value) => value >= 0 && value <= 120 ? null : 'Age must be between 0 and 120'
  }
};

// Example query builder usage
const userQuery: UserQuery = {
  name: { contains: 'John' },
  age: { gt: 18, lt: 65 },
  email: 'john@example.com'
};

// Example table configuration
const userTableConfig: UserTableConfig = {
  id: { type: 'INT', nullable: false, primaryKey: true },
  name: { type: 'VARCHAR', nullable: false },
  email: { type: 'VARCHAR', nullable: false, unique: true },
  age: { type: 'INT', nullable: false }
};

// Example user with optional email
const userWithOptionalEmail: UserWithOptionalEmail = {
  id: 1,
  name: 'John Doe',
  age: 30
  // email is optional
};

console.log('Mapped types solutions loaded successfully!');
console.log('Form config:', Object.keys(userFormConfig));
console.log('Query example:', userQuery);
console.log('Table config:', Object.keys(userTableConfig));
console.log('User example:', userWithOptionalEmail);

export {
  PartialBy,
  Getters,
  PickByType,
  EventHandlers,
  RequiredBy,
  Setters,
  Nullify,
  DeepPartial,
  Functionify,
  Validators,
  Defaults,
  FormConfig,
  FormState,
  FormErrors,
  ApiEndpoints,
  ApiResponse,
  QueryBuilder,
  ColumnConfig,
  TableMigration
};