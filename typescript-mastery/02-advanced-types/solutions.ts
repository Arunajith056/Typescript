/**
 * Advanced Types Solutions - Main Index
 * Import specific solution categories from focused files
 */

// Explicit imports to avoid conflicts
import {
  ArrayElement as ConditionalArrayElement,
  NonNullable as ConditionalNonNullable,
  ReturnType as ConditionalReturnType,
  DeepReadonly,
  ApiResponse as ConditionalApiResponse
} from './solutions-conditional';

import {
  PartialBy,
  Getters,
  PickByType,
  EventHandlers as MappedEventHandlers,
  FormConfig,
  QueryBuilder
} from './solutions-mapped';

import {
  CamelCase,
  KebabCase,
  APIEndpoint,
  BEM,
  RouteParams,
  ActionType
} from './solutions-template';

// Re-export with explicit names to avoid conflicts
export {
  ConditionalArrayElement as ArrayElement,
  ConditionalNonNullable as NonNullable,
  ConditionalReturnType as ReturnType,
  DeepReadonly,
  ConditionalApiResponse as ApiResponse,
  PartialBy,
  Getters,
  PickByType,
  MappedEventHandlers as EventHandlers,
  FormConfig,
  QueryBuilder,
  CamelCase,
  KebabCase,
  APIEndpoint,
  BEM,
  RouteParams,
  ActionType
};

// ==================== QUICK REFERENCE ====================

/*
Conditional Types Solutions (solutions-conditional.ts):
- ArrayElement<T> - Extract element type from arrays
- NonNullable<T> - Remove null/undefined
- ReturnType<T> - Extract function return types
- DeepReadonly<T> - Recursive readonly
- ApiResponse<T> unwrapping

Mapped Types Solutions (solutions-mapped.ts):
- PartialBy<T, K> - Make specific properties optional
- Getters<T> - Generate getter functions
- PickByType<T, U> - Pick properties by type
- EventHandlers<T> - Generate event handlers
- FormConfig<T> - Form configuration types
- QueryBuilder<T> - Type-safe queries

Template Literal Solutions (solutions-template.ts):
- CamelCase<T> - snake_case to camelCase
- KebabCase<T> - PascalCase to kebab-case
- BEM<B, E, M> - CSS BEM naming
- RouteParams<T> - Extract URL parameters
- ActionType<T, A> - Redux action types
- ValidationMessage<F, R> - Error messages
*/

// Example usage showcase
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Import specific types as needed:
// import { PartialBy, Getters, CamelCase, BEM } from './solutions';

type ExamplePartialUser = PartialBy<User, 'email'>;
type ExampleGetters = Getters<User>;
type ExampleCamelCase = CamelCase<'user_name'>;
type ExampleBEM = BEM<'button', 'icon', 'large'>;

console.log('All advanced types solutions loaded! Check specific files for implementations.');

export type {
  ExamplePartialUser,
  ExampleGetters,
  ExampleCamelCase,
  ExampleBEM
};