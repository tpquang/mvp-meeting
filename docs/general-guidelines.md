# General Coding Guidelines

## Purpose

These guidelines ensure code quality, consistency, and maintainability across the project.

## Code Quality Principles

### 1. DRY (Don't Repeat Yourself)

Avoid duplicating code. If you find yourself writing the same code twice, extract it into a reusable function or component.

```typescript
// Bad - repeated logic
function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}

function displayUserName(user: User): void {
  console.log(`${user.firstName} ${user.lastName}`)
}

// Good - reusable function
function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

function getUserFullName(user: User): string {
  return formatFullName(user.firstName, user.lastName)
}

function displayUserName(user: User): void {
  console.log(formatFullName(user.firstName, user.lastName))
}
```

### 2. KISS (Keep It Simple, Stupid)

Write simple, straightforward code. Avoid over-engineering.

```typescript
// Bad - over-engineered
class UserNameFormatter {
  private strategy: FormattingStrategy

  setStrategy(strategy: FormattingStrategy): void {
    this.strategy = strategy
  }

  format(user: User): string {
    return this.strategy.execute(user)
  }
}

// Good - simple and clear
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```

### 3. YAGNI (You Ain't Gonna Need It)

Don't add functionality until it's needed. Avoid speculative features.

```typescript
// Bad - unnecessary abstraction for future "flexibility"
interface StorageProvider {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

class LocalStorageProvider implements StorageProvider { ... }
class SessionStorageProvider implements StorageProvider { ... }
class CookieStorageProvider implements StorageProvider { ... }

// Good - simple implementation, refactor when needed
function saveToLocalStorage(key: string, value: string): void {
  localStorage.setItem(key, value)
}

function getFromLocalStorage(key: string): string | null {
  return localStorage.getItem(key)
}
```

## Error Handling

### Rule: Always Handle Errors Gracefully

```typescript
// Good - proper error handling
async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}

// Bad - no error handling
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
```

### Rule: Use Custom Error Types

```typescript
// Good - custom error types
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}
```

## Comments

### Rule: Code Should Be Self-Documenting

Write clear code that doesn't need comments to explain what it does.

```typescript
// Bad - comment explaining unclear code
// Check if user is admin
if (u.r === 1) {
  // ...
}

// Good - self-documenting code
const isAdmin = user.role === UserRole.Admin
if (isAdmin) {
  // ...
}
```

### Rule: Use Comments for "Why", Not "What"

```typescript
// Bad - commenting the obvious
// Increment counter by 1
counter++

// Good - explaining the reason
// We need to offset by 1 because the API uses 1-based indexing
const apiPageNumber = pageIndex + 1
```

### Rule: Use JSDoc for Public APIs

```typescript
/**
 * Formats a date according to the user's locale settings.
 * 
 * @param date - The date to format
 * @param options - Optional formatting options
 * @returns The formatted date string
 * 
 * @example
 * ```ts
 * formatDate(new Date()) // "2024-01-15"
 * formatDate(new Date(), { includeTime: true }) // "2024-01-15 10:30:00"
 * ```
 */
export function formatDate(date: Date, options?: DateFormatOptions): string {
  // Implementation
}
```

## Magic Numbers/Strings

### Rule: Use Named Constants

```typescript
// Bad - magic numbers
if (password.length < 8) {
  throw new Error('Password too short')
}

setTimeout(fetchData, 300000)

// Good - named constants
const MIN_PASSWORD_LENGTH = 8
const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

if (password.length < MIN_PASSWORD_LENGTH) {
  throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
}

setTimeout(fetchData, REFRESH_INTERVAL_MS)
```

## Immutability

### Rule: Prefer Immutable Data

```typescript
// Bad - mutating data
function addItem(cart: CartItem[], item: CartItem): CartItem[] {
  cart.push(item)
  return cart
}

// Good - returning new array
function addItem(cart: CartItem[], item: CartItem): CartItem[] {
  return [...cart, item]
}

// Good - using const for variables that shouldn't be reassigned
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const
```

## Early Returns

### Rule: Use Guard Clauses

```typescript
// Bad - deep nesting
function processUser(user: User | null): void {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // Do something
      }
    }
  }
}

// Good - guard clauses
function processUser(user: User | null): void {
  if (!user) return
  if (!user.isActive) return
  if (!user.hasPermission) return
  
  // Do something
}
```

## Async/Await

### Rule: Prefer async/await Over Promises

```typescript
// Bad - promise chains
function fetchUserData(userId: string): Promise<UserData> {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(user => fetch(`/api/profiles/${user.profileId}`))
    .then(response => response.json())
    .then(profile => ({ user, profile }))
}

// Good - async/await
async function fetchUserData(userId: string): Promise<UserData> {
  const userResponse = await fetch(`/api/users/${userId}`)
  const user = await userResponse.json()
  
  const profileResponse = await fetch(`/api/profiles/${user.profileId}`)
  const profile = await profileResponse.json()
  
  return { user, profile }
}
```

### Rule: Handle Parallel Requests Properly

```typescript
// Bad - sequential when could be parallel
async function fetchDashboardData(): Promise<DashboardData> {
  const users = await fetchUsers()
  const stats = await fetchStats()
  const notifications = await fetchNotifications()
  return { users, stats, notifications }
}

// Good - parallel execution
async function fetchDashboardData(): Promise<DashboardData> {
  const [users, stats, notifications] = await Promise.all([
    fetchUsers(),
    fetchStats(),
    fetchNotifications(),
  ])
  return { users, stats, notifications }
}
```

## Testing Considerations

### Rule: Write Testable Code

- Avoid side effects in functions
- Use dependency injection
- Keep functions pure when possible

```typescript
// Bad - hard to test
function saveUser(user: User): void {
  const timestamp = new Date().toISOString()
  localStorage.setItem('user', JSON.stringify({ ...user, timestamp }))
  console.log('User saved')
}

// Good - testable
function createUserPayload(user: User, timestamp: string): UserPayload {
  return { ...user, timestamp }
}

function saveUser(
  user: User,
  storage: Storage,
  getCurrentTime: () => string = () => new Date().toISOString()
): void {
  const payload = createUserPayload(user, getCurrentTime())
  storage.setItem('user', JSON.stringify(payload))
}
```

## Performance Considerations

### Rule: Avoid Premature Optimization

Write clear code first, optimize only when needed based on measurements.

```typescript
// Don't optimize without measuring first
// Do optimize:
// - When you have measured a performance problem
// - When the solution is simple and doesn't hurt readability
// - When dealing with known expensive operations (large loops, network calls)
```

### Rule: Memoize Expensive Calculations

```typescript
// In React components
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

const handleClick = useCallback(() => {
  doSomething(value)
}, [value])
```

## Security Considerations

### Rule: Never Trust User Input

Always validate and sanitize user input.

```typescript
// Validate input
function createUser(input: unknown): User {
  const validatedInput = userSchema.parse(input)
  return { ...validatedInput, id: generateId() }
}
```

### Rule: Don't Expose Sensitive Information

```typescript
// Bad - exposing sensitive data
const user = await prisma.user.findUnique({ where: { id } })
return user // Includes password hash

// Good - selecting specific fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true },
})
return user
```

## Summary Checklist

- [ ] Follow DRY, KISS, YAGNI principles
- [ ] Handle errors gracefully
- [ ] Write self-documenting code
- [ ] Use comments for "why", not "what"
- [ ] Use named constants instead of magic numbers
- [ ] Prefer immutable data
- [ ] Use guard clauses for early returns
- [ ] Use async/await consistently
- [ ] Write testable code
- [ ] Consider security implications
