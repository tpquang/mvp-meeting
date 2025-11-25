# TypeScript Guidelines

## Purpose

These guidelines ensure type safety, code clarity, and optimal use of TypeScript features.

## Type Annotations

### Rule: Use Explicit Return Types for Functions

```typescript
// Good - explicit return type
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

async function fetchUser(id: string): Promise<User | null> {
  // Implementation
}

// Bad - implicit return type
function calculateTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### Rule: Avoid `any` Type

Use `unknown` instead of `any` when type is truly unknown.

```typescript
// Bad
function processData(data: any): void {
  console.log(data.name) // No type checking
}

// Good
function processData(data: unknown): void {
  if (isUser(data)) {
    console.log(data.name) // Type-safe
  }
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as User).name === 'string'
  )
}
```

### Rule: Use Type Guards

```typescript
// Type guard for null checking
function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

// Type guard for discriminated unions
interface SuccessResponse {
  status: 'success'
  data: User
}

interface ErrorResponse {
  status: 'error'
  message: string
}

type ApiResponse = SuccessResponse | ErrorResponse

function isSuccessResponse(response: ApiResponse): response is SuccessResponse {
  return response.status === 'success'
}
```

## Types vs Interfaces

### Rule: Use Interfaces for Objects, Types for Unions/Primitives

```typescript
// Good - interface for object shapes
interface User {
  id: string
  email: string
  name: string
}

interface ApiResponse<T> {
  data: T
  status: number
}

// Good - type for unions and primitives
type UserRole = 'admin' | 'user' | 'guest'
type ID = string | number
type Nullable<T> = T | null
```

### Rule: Prefer Interfaces for Extension

```typescript
// Interfaces can be extended and merged
interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

interface User extends BaseEntity {
  email: string
  name: string
}

// Declaration merging (useful for extending libraries)
interface Window {
  myCustomProperty: string
}
```

## Generics

### Rule: Use Descriptive Generic Names

```typescript
// Good - descriptive names for complex generics
type AsyncResult<TData, TError = Error> = 
  | { status: 'loading' }
  | { status: 'success'; data: TData }
  | { status: 'error'; error: TError }

// Good - single letter for simple, well-known patterns
function identity<T>(value: T): T {
  return value
}

// Bad - cryptic names
type Result<X, Y, Z> = { ... }
```

### Rule: Use Generic Constraints

```typescript
// Good - constrained generic
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// Good - constraint with interface
interface Identifiable {
  id: string
}

function findById<T extends Identifiable>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id)
}
```

## Utility Types

### Rule: Use Built-in Utility Types

```typescript
// Partial - all properties optional
type UpdateUserInput = Partial<User>

// Required - all properties required
type RequiredUser = Required<User>

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - exclude specific properties
type CreateUserInput = Omit<User, 'id' | 'createdAt'>

// Record - create object type
type UserMap = Record<string, User>

// ReadOnly - immutable type
type ImmutableUser = Readonly<User>

// NonNullable - remove null and undefined
type ValidUser = NonNullable<User | null>

// ReturnType - extract function return type
type FetchUserResult = ReturnType<typeof fetchUser>

// Parameters - extract function parameters
type FetchUserParams = Parameters<typeof fetchUser>
```

## Enums

### Rule: Prefer Union Types Over Enums

```typescript
// Good - union type (better tree-shaking, simpler)
type Status = 'pending' | 'approved' | 'rejected'

// Good - const object when you need values
const Status = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
} as const

type Status = typeof Status[keyof typeof Status]

// Avoid - TypeScript enum (worse tree-shaking)
enum StatusEnum {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}
```

## Strict Mode

### Rule: Enable Strict TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Null Handling

### Rule: Use Nullish Coalescing and Optional Chaining

```typescript
// Good - nullish coalescing
const displayName = user.name ?? 'Anonymous'

// Good - optional chaining
const city = user?.address?.city

// Combined
const profileUrl = user?.profile?.avatarUrl ?? '/default-avatar.png'

// Bad - verbose null checks
const displayName = user.name !== null && user.name !== undefined 
  ? user.name 
  : 'Anonymous'
```

### Rule: Be Explicit About Nullable Types

```typescript
// Good - explicit nullable type
function findUser(id: string): User | null {
  return users.get(id) ?? null
}

// Good - explicit undefined for optional returns
function getOptionalConfig(key: string): string | undefined {
  return config[key]
}
```

## Assertions

### Rule: Avoid Type Assertions When Possible

```typescript
// Bad - type assertion (unsafe)
const user = data as User

// Good - type guard (safe)
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  )
}

if (isUser(data)) {
  // data is now typed as User
  console.log(data.email)
}
```

### Rule: Use const Assertions for Literals

```typescript
// Good - const assertion
const colors = ['red', 'green', 'blue'] as const
// Type: readonly ["red", "green", "blue"]

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const
// Type: { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000 }
```

## Import/Export Types

### Rule: Use Type-Only Imports

```typescript
// Good - type-only import (better tree-shaking)
import type { User, UserRole } from '@/types'
import { createUser } from '@/lib/users'

// Good - inline type import
import { createUser, type User } from '@/lib/users'
```

## Discriminated Unions

### Rule: Use Discriminated Unions for State

```typescript
// Good - discriminated union
type LoadingState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function renderUser(state: LoadingState<User>): JSX.Element {
  switch (state.status) {
    case 'idle':
      return <div>Click to load</div>
    case 'loading':
      return <div>Loading...</div>
    case 'success':
      return <div>{state.data.name}</div>
    case 'error':
      return <div>Error: {state.error.message}</div>
  }
}
```

## Declaration Files

### Rule: Create .d.ts Files for External Modules

```typescript
// types/environment.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    NEXT_PUBLIC_API_URL: string
  }
}

// types/modules.d.ts
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>
  export default content
}
```

## Common Patterns

### Result Type Pattern

```typescript
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E }

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { ok: false, error: 'Cannot divide by zero' }
  }
  return { ok: true, value: a / b }
}

const result = divide(10, 2)
if (result.ok) {
  console.log(result.value) // Type-safe access to value
} else {
  console.error(result.error) // Type-safe access to error
}
```

### Builder Pattern with Types

```typescript
interface QueryBuilder<T> {
  where(condition: Partial<T>): QueryBuilder<T>
  orderBy(field: keyof T, direction?: 'asc' | 'desc'): QueryBuilder<T>
  limit(count: number): QueryBuilder<T>
  execute(): Promise<T[]>
}
```

## Summary Checklist

- [ ] Use explicit return types for functions
- [ ] Avoid `any`, use `unknown` when type is unknown
- [ ] Use type guards for type narrowing
- [ ] Use interfaces for objects, types for unions
- [ ] Use descriptive names for generics
- [ ] Use built-in utility types
- [ ] Prefer union types over enums
- [ ] Enable strict TypeScript configuration
- [ ] Use nullish coalescing and optional chaining
- [ ] Use type-only imports when possible
- [ ] Use discriminated unions for state
