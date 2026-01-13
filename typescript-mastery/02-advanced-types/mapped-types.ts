/**
 * Mapped Types in TypeScript
 * Transform existing types by mapping over their properties
 */

// ==================== BASIC MAPPED TYPES ====================

// Make all properties optional
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

// Make all properties readonly
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  id: number;
  name: string;
  email?: string;
  age: number;
}

type PartialUser = MyPartial<User>;
// { id?: number; name?: string; email?: string; age?: number; }

type RequiredUser = MyRequired<User>;
// { id: number; name: string; email: string; age: number; }

type ReadonlyUser = MyReadonly<User>;
// { readonly id: number; readonly name: string; readonly email?: string; readonly age: number; }

// ==================== KEY REMAPPING ====================

// Transform property names
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// {
//   getId: () => number;
//   getName: () => string;
//   getEmail: () => string | undefined;
//   getAge: () => number;
// }

// Filter properties by type
type StringProperties<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type UserStringProps = StringProperties<User>;
// { name: string; email?: string; }

// ==================== CONDITIONAL MAPPED TYPES ====================

// Nullify specific property types
type Nullify<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

type UserNullEmail = Nullify<User, 'email'>;
// { id: number; name: string; email: string | null | undefined; age: number; }

// Make specific properties optional
type PartialBy<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | undefined : T[P];
} & {
  [P in K]?: T[P];
};

type UserOptionalEmail = PartialBy<User, 'email' | 'age'>;
// { id: number; name: string; email?: string; age?: number; }

// ==================== NESTED MAPPED TYPES ====================

// Deep partial - make all nested properties optional
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
  settings: {
    theme: 'dark' | 'light';
    notifications: boolean;
  };
}

type DeepPartialUser = DeepPartial<NestedUser>;
// All properties at every level become optional

// Deep readonly - make all nested properties readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type DeepReadonlyUser = DeepReadonly<NestedUser>;
// All properties at every level become readonly

// ==================== UTILITY MAPPED TYPES ====================

// Pick with renaming
type PickAndRename<T, K extends keyof T, R extends Record<K, string>> = {
  [P in K as R[P]]: T[P];
};

type RenamedUser = PickAndRename<User, 'name' | 'email', {
  name: 'fullName';
  email: 'emailAddress';
}>;
// { fullName: string; emailAddress?: string; }

// Omit multiple properties
type OmitMultiple<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? never : T[P];
}[keyof T];

type UserWithoutIdAge = OmitMultiple<User, 'id' | 'age'>;
// { name: string; email?: string; }

// ==================== FUNCTION MAPPED TYPES ====================

// Transform properties into functions
type Functionify<T> = {
  [K in keyof T]: (value: T[K]) => void;
};

type UserSetters = Functionify<User>;
// {
//   id: (value: number) => void;
//   name: (value: string) => void;
//   email: (value: string | undefined) => void;
//   age: (value: number) => void;
// }

// Transform into event handlers
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (newValue: T[K], oldValue: T[K]) => void;
};

type UserEventHandlers = EventHandlers<User>;
// {
//   onIdChange: (newValue: number, oldValue: number) => void;
//   onNameChange: (newValue: string, oldValue: string) => void;
//   onEmailChange: (newValue: string | undefined, oldValue: string | undefined) => void;
//   onAgeChange: (newValue: number, oldValue: number) => void;
// }

// ==================== API MAPPED TYPES ====================

// Create API endpoints from model
type ApiEndpoints<T> = {
  [K in keyof T as `${string & K}Endpoint`]: string;
};

type UserApiEndpoints = ApiEndpoints<{
  users: User[];
  posts: any[];
  comments: any[];
}>;
// {
//   usersEndpoint: string;
//   postsEndpoint: string;
//   commentsEndpoint: string;
// }

// Transform to API response format
type ApiResponse<T> = {
  [K in keyof T]: {
    data: T[K];
    status: 'success' | 'error';
    message?: string;
  };
};

type UserApiResponse = ApiResponse<Pick<User, 'name' | 'email'>>;
// {
//   name: { data: string; status: 'success' | 'error'; message?: string; };
//   email: { data: string | undefined; status: 'success' | 'error'; message?: string; };
// }

// ==================== FORM MAPPED TYPES ====================

// Form field configuration
type FormConfig<T> = {
  [K in keyof T]: {
    label: string;
    required: boolean;
    validation?: (value: T[K]) => string | null;
  };
};

type UserFormConfig = FormConfig<Required<Pick<User, 'name' | 'email' | 'age'>>>;
// {
//   name: { label: string; required: boolean; validation?: (value: string) => string | null; };
//   email: { label: string; required: boolean; validation?: (value: string) => string | null; };
//   age: { label: string; required: boolean; validation?: (value: number) => string | null; };
// }

// Form state
type FormState<T> = {
  [K in keyof T]: {
    value: T[K];
    error?: string;
    touched: boolean;
  };
};

type UserFormState = FormState<Pick<User, 'name' | 'email'>>;
// {
//   name: { value: string; error?: string; touched: boolean; };
//   email: { value: string | undefined; error?: string; touched: boolean; };
// }

// ==================== DATABASE MAPPED TYPES ====================

// Database column configuration
type ColumnConfig<T> = {
  [K in keyof T]: {
    type: T[K] extends string ? 'VARCHAR' | 'TEXT'
         : T[K] extends number ? 'INT' | 'DECIMAL'
         : T[K] extends boolean ? 'BOOLEAN'
         : T[K] extends Date ? 'DATETIME'
         : 'JSON';
    nullable: T[K] extends undefined ? true : false;
    primaryKey?: boolean;
    unique?: boolean;
  };
};

type UserTableConfig = ColumnConfig<User>;
// Each property gets appropriate database configuration

// Query conditions
type QueryConditions<T> = {
  [K in keyof T]?: T[K] | {
    eq?: T[K];
    ne?: T[K];
    in?: T[K][];
    notIn?: T[K][];
  } & (T[K] extends string ? {
    contains?: string;
    startsWith?: string;
    endsWith?: string;
  } : {}) & (T[K] extends number ? {
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
  } : {});
};

type UserQueryConditions = QueryConditions<User>;
// Rich query interface for each property type

// ==================== STATE MANAGEMENT MAPPED TYPES ====================

// Redux-style actions
type Actions<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: {
    type: `SET_${Uppercase<string & K>}`;
    payload: T[K];
  };
}[keyof T];

type UserActions = Actions<User>;
// Union of action types:
// | { type: 'SET_ID'; payload: number; }
// | { type: 'SET_NAME'; payload: string; }
// | { type: 'SET_EMAIL'; payload: string | undefined; }
// | { type: 'SET_AGE'; payload: number; }

// Selectors
type Selectors<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: (state: { user: T }) => T[K];
};

type UserSelectors = Selectors<User>;
// {
//   getId: (state: { user: User; }) => number;
//   getName: (state: { user: User; }) => string;
//   getEmail: (state: { user: User; }) => string | undefined;
//   getAge: (state: { user: User; }) => number;
// }

// ==================== REAL-WORLD EXAMPLES ====================

// Component props from data model
type ComponentProps<T> = {
  [K in keyof T as `${string & K}Props`]: {
    value: T[K];
    onChange: (newValue: T[K]) => void;
    error?: string;
  };
};

type UserComponentProps = ComponentProps<Pick<User, 'name' | 'email'>>;

// Mock data generator types
type MockFactory<T> = {
  [K in keyof T]: () => T[K];
};

type UserMockFactory = MockFactory<User>;
// {
//   id: () => number;
//   name: () => string;
//   email: () => string | undefined;
//   age: () => number;
// }

// Example usage
const userMockFactory: UserMockFactory = {
  id: () => Math.floor(Math.random() * 1000),
  name: () => 'John Doe',
  email: () => 'john@example.com',
  age: () => 25
};

function createMockUser(): User {
  return {
    id: userMockFactory.id(),
    name: userMockFactory.name(),
    email: userMockFactory.email(),
    age: userMockFactory.age()
  };
}

// Example usage demonstration
const mockUser = createMockUser();
console.log('Created mock user:', mockUser);

// Validation schema from type
type ValidationSchema<T> = {
  [K in keyof T]: {
    required?: boolean;
    min?: T[K] extends number ? number : never;
    max?: T[K] extends number ? number : never;
    minLength?: T[K] extends string ? number : never;
    maxLength?: T[K] extends string ? number : never;
    pattern?: T[K] extends string ? RegExp : never;
  };
};

type UserValidationSchema = ValidationSchema<User>;

const userValidation: UserValidationSchema = {
  id: { required: true, min: 1 },
  name: { required: true, minLength: 2, maxLength: 50 },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  age: { required: true, min: 0, max: 120 }
};

console.log('Mapped types examples loaded successfully');

export {
  MyPartial,
  MyRequired,
  MyReadonly,
  Getters,
  StringProperties,
  Nullify,
  PartialBy,
  DeepPartial,
  DeepReadonly,
  PickAndRename,
  Functionify,
  EventHandlers,
  ApiEndpoints,
  FormConfig,
  FormState,
  ColumnConfig,
  QueryConditions,
  Actions,
  Selectors,
  ComponentProps,
  MockFactory,
  ValidationSchema
};