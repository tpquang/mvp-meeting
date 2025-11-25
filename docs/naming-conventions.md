# Naming Conventions

## Purpose

Consistent naming conventions improve code readability, reduce cognitive load, and make the codebase easier to navigate.

## General Principles

1. **Descriptive:** Names should clearly describe what the thing is or does
2. **Consistent:** Follow the same pattern throughout the codebase
3. **Concise:** Keep names reasonably short while maintaining clarity
4. **Avoid abbreviations:** Use full words unless the abbreviation is universally understood

## Variables

### Rule: Use camelCase for Variables

```typescript
// Good
const userName = 'John'
const isLoading = false
const userList = []
const maxRetryCount = 3

// Bad
const user_name = 'John'     // snake_case
const IsLoading = false      // PascalCase
const USERLIST = []          // SCREAMING_SNAKE_CASE
const usr = 'John'           // Abbreviated
```

### Rule: Use Descriptive Boolean Names

Boolean variables should be prefixed with `is`, `has`, `can`, `should`, or similar.

```typescript
// Good
const isActive = true
const hasPermission = false
const canEdit = true
const shouldRefresh = false
const isUserLoggedIn = true

// Bad
const active = true
const permission = false
const edit = true
const refresh = false
```

### Rule: Use Plural Names for Arrays/Collections

```typescript
// Good
const users = [...]
const items = [...]
const selectedIds = [...]

// Bad
const userArray = [...]
const itemList = [...]
const user = [...]  // Ambiguous - is it an array?
```

## Constants

### Rule: Use SCREAMING_SNAKE_CASE for True Constants

Only use SCREAMING_SNAKE_CASE for values that are truly constant and never change.

```typescript
// Good - true constants
const MAX_FILE_SIZE = 1024 * 1024 * 5  // 5MB
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_PAGE_SIZE = 20

// Good - runtime values (use camelCase)
const userConfig = getUserConfig()
const currentDate = new Date()
```

## Functions

### Rule: Use camelCase for Functions

```typescript
// Good
function getUserById(id: string): User { }
function calculateTotalPrice(items: Item[]): number { }
function handleSubmit(event: FormEvent): void { }

// Bad
function GetUserById(id: string): User { }       // PascalCase
function get_user_by_id(id: string): User { }    // snake_case
```

### Rule: Use Action Verbs for Function Names

Function names should start with a verb that describes the action.

| Prefix | Usage | Example |
|--------|-------|---------|
| `get` | Retrieve data | `getUser`, `getUserById` |
| `set` | Assign a value | `setUserName`, `setConfig` |
| `is/has/can` | Return boolean | `isValid`, `hasAccess`, `canEdit` |
| `create` | Create new instance | `createUser`, `createOrder` |
| `update` | Modify existing | `updateUser`, `updateSettings` |
| `delete/remove` | Delete data | `deleteUser`, `removeItem` |
| `fetch` | Async data retrieval | `fetchUsers`, `fetchData` |
| `handle` | Event handlers | `handleClick`, `handleSubmit` |
| `validate` | Validation | `validateEmail`, `validateForm` |
| `format` | Data transformation | `formatDate`, `formatCurrency` |
| `parse` | Parse data | `parseJson`, `parseDate` |
| `calculate` | Compute value | `calculateTotal`, `calculateTax` |
| `find` | Search for item | `findUser`, `findById` |
| `filter` | Filter collection | `filterActiveUsers` |

```typescript
// Good
function fetchUserData(): Promise<User[]> { }
function handleFormSubmit(data: FormData): void { }
function validateEmailFormat(email: string): boolean { }
function formatCurrency(amount: number): string { }

// Bad
function userData(): Promise<User[]> { }      // No verb
function formSubmit(data: FormData): void { } // No prefix
function emailValid(email: string): boolean { } // Unclear
```

## Types & Interfaces

### Rule: Use PascalCase for Types and Interfaces

```typescript
// Good
interface User {
  id: string
  name: string
}

type UserRole = 'admin' | 'user' | 'guest'

interface ApiResponse<T> {
  data: T
  error: string | null
}

// Bad
interface user { }           // camelCase
type userRole = '...'        // camelCase
interface API_RESPONSE { }   // SCREAMING_SNAKE_CASE
```

### Rule: Use Descriptive Type Names

```typescript
// Good
interface CreateUserInput { }
interface UpdateUserInput { }
interface UserResponse { }
interface PaginatedResponse<T> { }

// Bad
interface Input { }       // Too generic
interface Data { }        // Too generic
interface Stuff { }       // Meaningless
```

### Rule: Props Types End with 'Props'

```typescript
// Good
interface ButtonProps { }
interface UserCardProps { }
interface ModalProps { }

// Bad
interface ButtonP { }        // Abbreviated
interface UserCardOptions { } // Inconsistent suffix
```

## React Components

### Rule: Use PascalCase for Components

```typescript
// Good
function UserProfile() { }
function NavigationBar() { }
function DataTable() { }

// Bad
function userProfile() { }   // camelCase
function navigation_bar() { } // snake_case
```

### Rule: Component Names Should Be Descriptive

```typescript
// Good
function UserProfileCard() { }
function ProductListItem() { }
function SearchResultsTable() { }

// Bad
function Card() { }         // Too generic
function Item() { }         // Too generic
function Table() { }        // Too generic
```

## Files and Directories

### Rule: Use kebab-case for File Names

```typescript
// Good
user-profile.tsx
data-table.tsx
use-auth.ts
date-utils.ts

// Bad
UserProfile.tsx      // PascalCase
userProfile.tsx      // camelCase
user_profile.tsx     // snake_case
```

### Rule: Use kebab-case for Directory Names

```
// Good
src/
├── components/
│   └── user-profile/
├── hooks/
├── lib/
└── utils/

// Bad
src/
├── Components/      // PascalCase
├── user_hooks/      // snake_case
└── utilFunctions/   // camelCase
```

### Rule: Special File Naming Patterns

| File Type | Pattern | Example |
|-----------|---------|---------|
| Components | kebab-case | `user-card.tsx` |
| Hooks | `use-` prefix | `use-auth.ts` |
| Utilities | kebab-case | `date-utils.ts` |
| Types | `.types.ts` or `types.ts` | `user.types.ts` |
| Tests | `.test.ts` or `.spec.ts` | `user.test.ts` |
| Constants | kebab-case or `constants.ts` | `api-endpoints.ts` |

## CSS/Styling

### Rule: Use kebab-case for CSS Classes

```css
/* Good */
.user-profile { }
.navigation-bar { }
.btn-primary { }

/* Bad */
.userProfile { }     /* camelCase */
.NavigationBar { }   /* PascalCase */
.user_profile { }    /* snake_case */
```

### Rule: Use BEM-like Naming for Complex Components

```css
/* Block */
.card { }

/* Block__Element */
.card__header { }
.card__body { }
.card__footer { }

/* Block--Modifier */
.card--featured { }
.card--compact { }
```

## API & Database

### Rule: Use camelCase for API Response Properties

```typescript
// Good
interface ApiResponse {
  userId: string
  firstName: string
  lastName: string
  createdAt: string
}

// Bad (if backend uses snake_case, transform on frontend)
interface ApiResponse {
  user_id: string
  first_name: string
}
```

### Rule: Use snake_case for Database Columns

```sql
-- Good (Prisma will convert to camelCase in client)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP
);
```

## Summary Table

| Item | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `isLoading` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| Functions | camelCase | `getUserById` |
| Types/Interfaces | PascalCase | `UserResponse` |
| Components | PascalCase | `UserProfile` |
| Files | kebab-case | `user-profile.tsx` |
| Directories | kebab-case | `components/` |
| CSS Classes | kebab-case | `.user-profile` |
| Database Columns | snake_case | `first_name` |

## Summary Checklist

- [ ] Variables use camelCase
- [ ] Booleans have descriptive prefixes (is, has, can)
- [ ] Arrays/collections use plural names
- [ ] True constants use SCREAMING_SNAKE_CASE
- [ ] Functions use camelCase with action verbs
- [ ] Types/Interfaces use PascalCase
- [ ] Props interfaces end with 'Props'
- [ ] Components use PascalCase
- [ ] Files use kebab-case
- [ ] Directories use kebab-case
