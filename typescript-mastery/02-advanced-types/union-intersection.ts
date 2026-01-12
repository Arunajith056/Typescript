/**
 * UNION & INTERSECTION TYPES - Combining Types Effectively
 * 
 * Learn how to combine types using union (|) and intersection (&) operators
 * for flexible and powerful type definitions.
 */

// ==================== UNION TYPES ====================

// Basic union types
type Status = "idle" | "loading" | "success" | "error";
type ID = string | number;
type Theme = "light" | "dark" | "auto";

// Union with different shapes
type PaymentMethod = 
  | { type: "card"; cardNumber: string; expiryDate: string }
  | { type: "paypal"; email: string }
  | { type: "bank"; accountNumber: string; routingNumber: string };

// Function parameter unions
function formatId(id: string | number): string {
  return typeof id === "string" ? id : id.toString();
}

// Array element unions
type MixedArray = (string | number | boolean)[];
const mixedData: MixedArray = ["hello", 42, true, "world", 100];

// ==================== INTERSECTION TYPES ====================

// Basic intersection - combining object types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

type UserWithTimestamps = User & Timestamps;

const user: UserWithTimestamps = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Multiple intersections
interface Permissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

interface Role {
  roleName: string;
  roleLevel: number;
}

type UserWithRole = User & Timestamps & Permissions & Role;

// ==================== DISCRIMINATED UNIONS ====================

// Using discriminant property for type safety
interface LoadingState {
  status: "loading";
  progress?: number;
}

interface SuccessState {
  status: "success";
  data: any;
  metadata: {
    fetchTime: number;
    source: string;
  };
}

interface ErrorState {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

type RequestState = LoadingState | SuccessState | ErrorState;

// Type-safe state handling
function handleRequestState(state: RequestState): string {
  switch (state.status) {
    case "loading":
      const progress = state.progress ? ` (${state.progress}%)` : "";
      return `Loading${progress}...`;
    
    case "success":
      return `Success! Data loaded from ${state.metadata.source}`;
    
    case "error":
      return `Error ${state.error.code}: ${state.error.message}`;
    
    default:
      // Exhaustiveness check
      const _exhaustive: never = state;
      return _exhaustive;
  }
}

// ==================== COMPLEX UNION PATTERNS ====================

// Form field types with validation
type FormFieldBase = {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
};

type TextField = FormFieldBase & {
  type: "text";
  placeholder?: string;
  maxLength?: number;
  pattern?: string;
};

type NumberField = FormFieldBase & {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
};

type SelectField = FormFieldBase & {
  type: "select";
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  multiple?: boolean;
};

type CheckboxField = FormFieldBase & {
  type: "checkbox";
  checked?: boolean;
};

type DateField = FormFieldBase & {
  type: "date";
  minDate?: Date;
  maxDate?: Date;
};

type FormField = TextField | NumberField | SelectField | CheckboxField | DateField;

// Type-safe form field renderer
function renderFormField(field: FormField): string {
  switch (field.type) {
    case "text":
      return `<input type="text" name="${field.name}" placeholder="${field.placeholder || ''}" />`;
    
    case "number":
      return `<input type="number" name="${field.name}" min="${field.min || ''}" max="${field.max || ''}" />`;
    
    case "select":
      const options = field.options
        .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
        .join("");
      return `<select name="${field.name}" ${field.multiple ? 'multiple' : ''}>${options}</select>`;
    
    case "checkbox":
      return `<input type="checkbox" name="${field.name}" ${field.checked ? 'checked' : ''} />`;
    
    case "date":
      return `<input type="date" name="${field.name}" />`;
  }
}

// ==================== API RESPONSE PATTERNS ====================

// Different API response shapes
type ApiResponse<T> = 
  | { success: true; data: T; pagination?: PaginationInfo }
  | { success: false; error: ApiError };

type PaginationInfo = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type ApiError = {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
};

// Type-safe API response handler
function handleApiResponse<T>(response: ApiResponse<T>): T | null {
  if (response.success) {
    console.log("Success:", response.data);
    if (response.pagination) {
      console.log(`Page ${response.pagination.page} of ${response.pagination.totalPages}`);
    }
    return response.data;
  } else {
    console.error(`API Error [${response.error.code}]: ${response.error.message}`);
    if (response.error.field) {
      console.error(`Field: ${response.error.field}`);
    }
    return null;
  }
}

// ==================== EVENT SYSTEM WITH UNIONS ====================

// Different event types
type MouseEventData = {
  type: "mouse";
  eventType: "click" | "hover" | "leave";
  x: number;
  y: number;
  target: string;
};

type KeyboardEventData = {
  type: "keyboard";
  eventType: "keydown" | "keyup" | "keypress";
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

type NetworkEventData = {
  type: "network";
  eventType: "request" | "response" | "error";
  url: string;
  method?: string;
  statusCode?: number;
};

type CustomEventData = {
  type: "custom";
  eventName: string;
  payload: any;
};

type EventData = MouseEventData | KeyboardEventData | NetworkEventData | CustomEventData;

// Event handler with type discrimination
function handleEvent(event: EventData): void {
  switch (event.type) {
    case "mouse":
      console.log(`Mouse ${event.eventType} at (${event.x}, ${event.y}) on ${event.target}`);
      break;
    
    case "keyboard":
      const modifiers = [
        event.ctrlKey && "Ctrl",
        event.shiftKey && "Shift", 
        event.altKey && "Alt"
      ].filter(Boolean).join("+");
      
      console.log(`Keyboard ${event.eventType}: ${event.key} ${modifiers ? `(${modifiers})` : ""}`);
      break;
    
    case "network":
      if (event.eventType === "response") {
        console.log(`HTTP ${event.method} ${event.url} - Status: ${event.statusCode}`);
      } else {
        console.log(`Network ${event.eventType}: ${event.url}`);
      }
      break;
    
    case "custom":
      console.log(`Custom event: ${event.eventName}`, event.payload);
      break;
  }
}

// ==================== CONDITIONAL UNIONS ====================

// Union based on configuration
type DatabaseConfig<T extends "sql" | "nosql"> = T extends "sql"
  ? {
      type: "sql";
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
      ssl?: boolean;
    }
  : {
      type: "nosql";
      connectionString: string;
      database: string;
      collection: string;
    };

function connectToDatabase<T extends "sql" | "nosql">(
  config: DatabaseConfig<T>
): void {
  if (config.type === "sql") {
    // TypeScript knows this is SQL config
    console.log(`Connecting to SQL database at ${config.host}:${config.port}`);
  } else {
    // TypeScript knows this is NoSQL config  
    console.log(`Connecting to NoSQL database: ${config.connectionString}`);
  }
}

// ==================== INTERSECTION WITH MIXINS ====================

// Mixin pattern with intersections
type Loggable = {
  log(message: string): void;
  logError(error: Error): void;
};

type Validatable = {
  validate(): boolean;
  getValidationErrors(): string[];
};

type Serializable = {
  serialize(): string;
  deserialize(data: string): void;
};

// Combine behaviors
type Entity = {
  id: string;
  name: string;
};

type FullEntity = Entity & Loggable & Validatable & Serializable;

// Implementation helpers
function createLoggable(): Loggable {
  return {
    log(message: string): void {
      console.log(`[${new Date().toISOString()}] ${message}`);
    },
    logError(error: Error): void {
      console.error(`[${new Date().toISOString()}] ERROR: ${error.message}`);
    }
  };
}

function createValidatable(rules: Record<string, (value: any) => boolean>): Validatable {
  return {
    validate(): boolean {
      return this.getValidationErrors().length === 0;
    },
    getValidationErrors(): string[] {
      const errors: string[] = [];
      for (const [field, rule] of Object.entries(rules)) {
        if (!rule((this as any)[field])) {
          errors.push(`Invalid ${field}`);
        }
      }
      return errors;
    }
  };
}

// ==================== UTILITY PATTERNS ====================

// Extract union member by discriminant
type ExtractByType<T, K extends T extends { type: infer U } ? U : never> = 
  T extends { type: K } ? T : never;

type ClickEvent = ExtractByType<EventData, "mouse">;
type KeyEvent = ExtractByType<EventData, "keyboard">;

// Union to intersection helper
type UnionToIntersection<U> = 
  (U extends any ? (x: U) => void : never) extends ((x: infer I) => void) ? I : never;

// Example usage
type Combined = UnionToIntersection<{ a: string } | { b: number }>; // { a: string } & { b: number }

// Exclude null/undefined from union
type NonNullable<T> = T extends null | undefined ? never : T;

type SafeString = NonNullable<string | null | undefined>; // string

// ==================== REAL-WORLD EXAMPLES ====================

// E-commerce product variants
type ProductVariant = 
  | { type: "simple"; price: number }
  | { 
      type: "configurable"; 
      basePrice: number;
      options: Array<{
        name: string;
        values: string[];
        priceModifier: number;
      }>;
    }
  | { 
      type: "bundle"; 
      products: Array<{
        productId: string;
        quantity: number;
        discount: number;
      }>;
    };

// Authentication states
type AuthState = 
  | { status: "anonymous" }
  | { status: "authenticating"; provider: "google" | "github" | "email" }
  | { 
      status: "authenticated"; 
      user: User;
      token: string;
      expiresAt: Date;
    }
  | { 
      status: "error"; 
      error: string;
      retryCount: number;
    };

// Theme configuration
type ThemeConfig = {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
} & (
  | { mode: "light"; shadowIntensity: number }
  | { mode: "dark"; glowIntensity: number }
  | { mode: "auto"; lightThreshold: number; darkThreshold: number }
);

export {
  Status,
  ID,
  Theme,
  PaymentMethod,
  User,
  Timestamps,
  UserWithTimestamps,
  UserWithRole,
  RequestState,
  FormField,
  ApiResponse,
  EventData,
  DatabaseConfig,
  FullEntity,
  ExtractByType,
  UnionToIntersection,
  NonNullable,
  ProductVariant,
  AuthState,
  ThemeConfig,
  handleRequestState,
  renderFormField,
  handleApiResponse,
  handleEvent,
  connectToDatabase
};