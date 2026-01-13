/**
 * PICK & OMIT - Property Selection and Exclusion
 * 
 * Learn how to create new types by selecting specific properties (Pick)
 * or excluding properties (Omit) from existing types.
 */

// ==================== BASIC PICK USAGE ====================

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Pick specific properties for public API
type PublicUser = Pick<User, "id" | "username" | "firstName" | "lastName">;

// Pick for login credentials
type LoginCredentials = Pick<User, "username" | "password">;

// Pick for profile updates
type ProfileUpdate = Pick<User, "firstName" | "lastName" | "email">;

// Usage examples
const publicUser: PublicUser = {
  id: "1",
  username: "john_doe",
  firstName: "John",
  lastName: "Doe"
};

const loginData: LoginCredentials = {
  username: "john_doe",
  password: "secret123"
};

// Example usage
console.log(`Welcome ${publicUser.firstName}`);
console.log(`Login attempt for: ${loginData.username}`);

// ==================== BASIC OMIT USAGE ====================

// Omit sensitive information
type SafeUser = Omit<User, "password">;

// Omit auto-generated fields for creation
type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;

// Omit multiple properties
type UserSummary = Omit<User, "password" | "dateOfBirth" | "createdAt" | "updatedAt">;

// Usage examples
const safeUser: SafeUser = {
  id: "1",
  username: "john_doe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: new Date("1990-01-01"),
  createdAt: new Date(),
  updatedAt: new Date()
  // password is omitted
};

const createInput: CreateUserInput = {
  username: "jane_doe",
  email: "jane@example.com", 
  password: "secret456",
  firstName: "Jane",
  lastName: "Doe",
  dateOfBirth: new Date("1992-05-15")
  // id, createdAt, updatedAt are omitted
};

// Example usage
console.log(`Safe user data: ${safeUser.firstName} ${safeUser.lastName}`);
console.log(`Creating user: ${createInput.username}`);

// ==================== ADVANCED PATTERNS ====================

// API endpoint type generation
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sku: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Different API shapes
type ProductListItem = Pick<Product, "id" | "name" | "price" | "isActive">;
type ProductDetails = Omit<Product, "createdAt" | "updatedAt">;
type ProductCreate = Omit<Product, "id" | "createdAt" | "updatedAt">;
type ProductUpdate = Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>;

// Usage in API functions
async function getProducts(): Promise<ProductListItem[]> {
  // Returns minimal product data for lists
  console.log('Fetching products...');
  return [];
}

async function getProduct(id: string): Promise<ProductDetails | null> {
  // Returns full product details without timestamps
  console.log(`Fetching product ${id}`);
  return null;
}

async function createProduct(data: ProductCreate): Promise<Product> {
  // Accepts product data without auto-generated fields
  console.log(`Creating product: ${data.name}`);
  return {} as Product;
}

async function updateProduct(id: string, data: ProductUpdate): Promise<Product | null> {
  // Accepts partial updates
  console.log(`Updating product ${id}`, data);
  return null;
}

// Example usage of API functions
(async () => {
  const products = await getProducts();
  const product = await getProduct("1");
  const newProduct = await createProduct({ name: "Test", description: "Test", price: 99.99, categoryId: "1", sku: "TEST", stock: 10, isActive: true });
  const updated = await updateProduct("1", { name: "Updated Test" });
  console.log({ products, product, newProduct, updated });
})().catch(console.error);

// ==================== FORM HANDLING PATTERNS ====================

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  agreedToTerms: boolean;
  subscribedToNewsletter: boolean;
  preferredContact: "email" | "phone";
  source: "website" | "referral" | "advertising";
}

// Form field configurations
type RequiredFields = Pick<ContactForm, "name" | "email" | "message" | "agreedToTerms">;
type OptionalFields = Omit<ContactForm, keyof RequiredFields>;
type ContactPreferences = Pick<ContactForm, "subscribedToNewsletter" | "preferredContact">;

// Form validation types
type FormErrors = Partial<Record<keyof ContactForm, string>>;
type FormTouched = Partial<Record<keyof ContactForm, boolean>>;

// Form state
interface FormState {
  values: Partial<ContactForm>;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  isValid: boolean;
}

// Validation functions for specific field groups
function validateRequired(values: Partial<ContactForm>): Partial<Record<keyof RequiredFields, string>> {
  const errors: Partial<Record<keyof RequiredFields, string>> = {};
  
  if (!values.name?.trim()) errors.name = "Name is required";
  if (!values.email?.trim()) errors.email = "Email is required";
  if (!values.message?.trim()) errors.message = "Message is required";
  if (!values.agreedToTerms) errors.agreedToTerms = "You must agree to terms";
  
  return errors;
}

// ==================== DATABASE PATTERNS ====================

interface DatabaseRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface BlogPost extends DatabaseRecord {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  viewCount: number;
  likeCount: number;
}

// Repository pattern types
type CreateBlogPost = Omit<BlogPost, keyof DatabaseRecord>;
type UpdateBlogPost = Partial<Omit<BlogPost, keyof DatabaseRecord>>;
type BlogPostSummary = Pick<BlogPost, "id" | "title" | "slug" | "excerpt" | "status" | "createdAt">;

// Repository interface
interface BlogPostRepository {
  create(data: CreateBlogPost, userId: string): Promise<BlogPost>;
  update(id: string, data: UpdateBlogPost, userId: string): Promise<BlogPost | null>;
  findById(id: string): Promise<BlogPost | null>;
  findAll(): Promise<BlogPostSummary[]>;
  findByStatus(status: BlogPost["status"]): Promise<BlogPostSummary[]>;
  search(query: string): Promise<BlogPostSummary[]>;
}

// ==================== COMPONENT PROPS PATTERNS ====================

interface BaseComponentProps {
  className?: string;
  style?: Record<string, any>;
  testId?: string;
  children?: string | Element | Element[];
}

// Option 1: React Button Props (extends React's ButtonHTMLAttributes)
// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
//   size?: "xs" | "sm" | "md" | "lg" | "xl";
//   loading?: boolean;
//   icon?: string;
//   iconPosition?: "left" | "right";
//   fullWidth?: boolean;
//   rounded?: boolean;
//   outlined?: boolean;
// }

// Option 2: Vanilla TypeScript (extends HTMLButtonElement interface)
interface ButtonProps extends Omit<Partial<HTMLButtonElement>, 'children'> {
  // Event handlers (these need to be added separately)
  onClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  
  // ARIA attributes
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  
  // Data attributes
  'data-testid'?: string;
  'data-cy'?: string;
  
  // Your custom properties
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  children?: string | Element | Element[];
}

// Additional element interface examples
interface ImageProps extends Partial<HTMLImageElement> {
  alt: string; // Required for accessibility
  loading?: "eager" | "lazy";
}

interface SelectProps extends Omit<Partial<HTMLSelectElement>, 'options'> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

// Option 3: Using Pick to get specific HTMLButtonElement properties + custom props
interface PickedButtonProps extends Partial<Pick<HTMLButtonElement, 
  'accessKey' | 'autofocus' | 'className' | 'dir' | 'disabled' | 'form' | 
  'formAction' | 'formEnctype' | 'formMethod' | 'formNoValidate' | 'formTarget' |
  'hidden' | 'id' | 'lang' | 'name' | 'style' | 'tabIndex' | 'title' | 'type' | 'value'
>> {
  // Event handlers (these are separate from HTMLButtonElement properties)
  onClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  
  // ARIA attributes
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  
  // Data attributes
  'data-testid'?: string;
  'data-cy'?: string;
  
  // Your custom properties
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  children?: string | Element | Element[];
}

// Different button variations using Pick/Omit
type SubmitButton = Pick<ButtonProps, "variant" | "size" | "loading" | "disabled" | "form" | "formAction" | "children">;
type IconOnlyButton = Omit<ButtonProps, "children"> & { "aria-label": string };
type LinkStyleButton = Omit<ButtonProps, "type" | "form" | "formAction"> & { href?: string };

// Usage examples - extending HTMLButtonElement automatically gives you all native props
const completeButton: ButtonProps = {
  // Native HTML button properties (automatically inherited from HTMLButtonElement)
  type: "submit",
  disabled: false,
  className: "my-custom-button",
  id: "submit-btn",
  title: "Click to submit form",
  tabIndex: 0,
  autofocus: true,
  // form: "my-form", // This would need to be an HTMLFormElement reference
  formAction: "/submit",
  formMethod: "POST",
  
  // Event handlers
  onClick: (event: MouseEvent) => console.log('Button clicked!', event),
  onFocus: (event: FocusEvent) => console.log('Button focused'),
  onBlur: (event: FocusEvent) => console.log('Button blurred'),
  onKeyDown: (event: KeyboardEvent) => {
    if (event.key === 'Enter') console.log('Enter pressed');
  },
  
  // ARIA attributes
  "aria-label": "Submit the form",
  "aria-describedby": "submit-help",
  "aria-expanded": false,
  
  // Data attributes for testing
  "data-testid": "submit-button",
  "data-cy": "submit-btn",
  
  // Your custom properties
  variant: "primary",
  size: "lg",
  loading: false,
  icon: "check",
  iconPosition: "left",
  fullWidth: false,
  rounded: true,
  outlined: false,
  children: "Submit Form"
} as ButtonProps; // Type assertion to handle HTMLElement property conflicts

const pickedButton: PickedButtonProps = {
  // Selected HTMLButtonElement properties + custom props
  type: "button",
  disabled: false,
  className: "picked-btn",
  variant: "secondary",
  size: "md",
  onClick: (event: MouseEvent) => console.log('Picked button clicked'),
  "aria-label": "Custom button",
  "data-testid": "picked-btn"
};

const iconButton: IconOnlyButton = {
  variant: "secondary",
  size: "md",
  icon: "trash",
  className: "icon-btn",
  disabled: false, // Now properly typed from HTMLButtonElement
  type: "button",  // Native HTML button property
  onClick: (event: MouseEvent) => console.log('Delete clicked'),
  "aria-label": "Delete item", // Required for icon-only buttons
  "data-testid": "delete-btn"
};

// Usage example (commented out to avoid compilation issues)
// const MyButton = (props: ButtonProps) => {
//   const { variant, size, loading, icon, iconPosition, children, ...nativeProps } = props;
//   return (
//     <button 
//       {...nativeProps}
//       className={`btn btn-${variant} btn-${size} ${loading ? 'loading' : ''} ${nativeProps.className || ''}`}
//       disabled={nativeProps.disabled || loading}
//     >
//       {icon && iconPosition === 'left' && <span className={`icon-${icon}`} />}
//       {loading ? 'Loading...' : children}
//       {icon && iconPosition === 'right' && <span className={`icon-${icon}`} />}
//     </button>
//   );
// };

// Usage examples:
// <MyButton variant="primary" size="lg" onClick={() => console.log('clicked')}>
//   Click me
// </MyButton>
//
// <MyButton 
//   variant="danger" 
//   size="sm" 
//   icon="trash" 
//   iconPosition="left"
//   aria-label="Delete item"
//   data-testid="delete-btn"
//   onClick={handleDelete}
// >
//   Delete
// </MyButton>

// ==================== API CLIENT PATTERNS ====================

interface ApiEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  body?: any;
  auth?: boolean;
}

// Different endpoint configurations
type GetEndpoint = Pick<ApiEndpoint, "path" | "query" | "headers" | "auth"> & { method: "GET" };
type PostEndpoint = Pick<ApiEndpoint, "path" | "body" | "headers" | "auth"> & { method: "POST" };
type PutEndpoint = Pick<ApiEndpoint, "path" | "body" | "headers" | "auth"> & { method: "PUT" };
type DeleteEndpoint = Pick<ApiEndpoint, "path" | "headers" | "auth"> & { method: "DELETE" };

// API client methods
class ApiClient {
  async get<T>(config: Omit<GetEndpoint, "method">): Promise<T> {
    // GET request implementation
    console.log(`GET ${config.path}`);
    return {} as T;
  }
  
  async post<T>(config: Omit<PostEndpoint, "method">): Promise<T> {
    // POST request implementation
    console.log(`POST ${config.path}`, config.body);
    return {} as T;
  }
  
  async put<T>(config: Omit<PutEndpoint, "method">): Promise<T> {
    // PUT request implementation
    console.log(`PUT ${config.path}`, config.body);
    return {} as T;
  }
  
  async delete<T>(config: Omit<DeleteEndpoint, "method">): Promise<T> {
    // DELETE request implementation
    console.log(`DELETE ${config.path}`);
    return {} as T;
  }
}

// ==================== CONFIGURATION PATTERNS ====================

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    apiKey: string;
  };
  features: {
    authentication: boolean;
    analytics: boolean;
    darkMode: boolean;
    notifications: boolean;
  };
  ui: {
    theme: "light" | "dark" | "auto";
    language: string;
    dateFormat: string;
    timezone: string;
  };
  security: {
    encryptionKey: string;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
}

// Environment-specific configurations
type PublicConfig = Omit<AppConfig, "security">;
type ApiConfig = Pick<AppConfig, "api">;
type FeatureFlags = Pick<AppConfig, "features">;
type UiConfig = Pick<AppConfig, "ui">;

// Configuration builders
function createDevelopmentConfig(): AppConfig {
  return {
    api: {
      baseUrl: "http://localhost:3000",
      timeout: 10000,
      retries: 3,
      apiKey: "dev-key"
    },
    features: {
      authentication: true,
      analytics: false,
      darkMode: true,
      notifications: true
    },
    ui: {
      theme: "auto",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timezone: "UTC"
    },
    security: {
      encryptionKey: "dev-encryption-key",
      sessionTimeout: 3600000, // 1 hour
      maxLoginAttempts: 5
    }
  };
}

function createProductionConfig(secrets: Pick<AppConfig["security"], "encryptionKey">): AppConfig {
  const baseConfig = createDevelopmentConfig();
  return {
    ...baseConfig,
    api: {
      ...baseConfig.api,
      baseUrl: "https://api.production.com",
      apiKey: "production-api-key" // In real app, use process.env.API_KEY
    },
    features: {
      ...baseConfig.features,
      analytics: true
    },
    security: {
      ...baseConfig.security,
      ...secrets
    }
  };
}

// ==================== UTILITY COMBINATIONS ====================

// Examples of combining Pick and Omit with other utilities
// type PartialUser = Partial<Pick<User, "firstName" | "lastName" | "email">>;
// type RequiredProfile = Required<Pick<User, "firstName" | "lastName">>;
// type ReadonlyUser = Readonly<Omit<User, "password">>;

// Creating update types
type UserUpdate = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;
type ProductUpdateType = Partial<Omit<Product, "id" | "sku" | "createdAt" | "updatedAt">>;

// Example usage of update types
const userUpdate: UserUpdate = {
  firstName: "Updated Name",
  email: "newemail@example.com"
};

const productUpdate: ProductUpdateType = {
  name: "Updated Product",
  price: 199.99
};

console.log('Update examples:', { userUpdate, productUpdate });

// Nested object selection
interface Order {
  id: string;
  customer: Pick<User, "id" | "email" | "firstName" | "lastName">;
  items: Pick<Product, "id" | "name" | "price">[];
  shipping: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  total: number;
  status: "pending" | "shipped" | "delivered";
}

type OrderSummary = Pick<Order, "id" | "customer" | "total" | "status">;
type ShippingInfo = Pick<Order, "shipping">;

export {
  User,
  PublicUser,
  LoginCredentials,
  ProfileUpdate,
  SafeUser,
  CreateUserInput,
  UserSummary,
  Product,
  ProductListItem,
  ProductDetails,
  ProductCreate,
  ProductUpdate,
  ContactForm,
  RequiredFields,
  OptionalFields,
  ContactPreferences,
  FormState,
  BlogPost,
  CreateBlogPost,
  UpdateBlogPost,
  BlogPostSummary,
  BlogPostRepository,
  ButtonProps,
  ImageProps,
  SelectProps,
  PickedButtonProps,
  SubmitButton,
  IconOnlyButton,
  LinkStyleButton,
  ApiEndpoint,
  GetEndpoint,
  PostEndpoint,
  PutEndpoint,
  DeleteEndpoint,
  ApiClient,
  AppConfig,
  PublicConfig,
  ApiConfig,
  FeatureFlags,
  UiConfig,
  Order,
  OrderSummary,
  ShippingInfo,
  UserUpdate,
  ProductUpdateType,
  validateRequired,
  createDevelopmentConfig,
  createProductionConfig,
  getProducts,
  getProduct,
  createProduct,
  updateProduct
};