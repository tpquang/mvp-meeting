# Function Rules

## Purpose

These rules ensure functions remain focused, readable, and maintainable.

## Function Length

### Rule: Maximum 30 Lines Per Function Body

**Limit:** 30 lines (excluding comments and blank lines)

**Rationale:**
- Smaller functions are easier to understand
- Encourages single responsibility principle
- Easier to test and debug
- Improves code reusability

**Example - Good:**

```typescript
function calculateTotal(items: CartItem[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = calculateTax(subtotal)
  const shipping = calculateShipping(items)
  
  return subtotal + tax + shipping
}
```

**Example - Bad:**

```typescript
function processOrder(order: Order): ProcessedOrder {
  // 100+ lines of code handling validation, 
  // calculation, database operations, 
  // email sending, logging, etc.
}
```

**Solution when function is too long:**
1. Extract helper functions
2. Break into smaller, focused functions
3. Use composition patterns

## Function Parameters

### Rule: Maximum 4 Parameters

**Limit:** 4 parameters per function

**Rationale:**
- Too many parameters make functions hard to call correctly
- Often indicates the function is doing too much
- Reduces cognitive load

**Example - Good:**

```typescript
function createUser(userData: CreateUserInput): Promise<User> {
  // Implementation
}

interface CreateUserInput {
  email: string
  name: string
  password: string
  role: UserRole
}
```

**Example - Bad:**

```typescript
function createUser(
  email: string,
  name: string,
  password: string,
  role: string,
  department: string,
  manager: string,
  startDate: Date
): Promise<User> {
  // Implementation
}
```

**Solution when too many parameters:**
1. Group related parameters into an object
2. Use a configuration/options pattern
3. Consider if function is doing too much

## Nesting Depth

### Rule: Maximum 3 Levels of Nesting

**Limit:** 3 levels of nested blocks

**Rationale:**
- Deep nesting is hard to follow
- Makes code difficult to modify
- Often indicates complex logic that should be refactored

**Example - Good:**

```typescript
function processItems(items: Item[]): Item[] {
  return items
    .filter(isValidItem)
    .map(transformItem)
    .filter(hasRequiredFields)
}
```

**Example - Bad:**

```typescript
function processItems(items: Item[]): Item[] {
  const result: Item[] = []
  for (const item of items) {
    if (item.isValid) {
      if (item.type === 'special') {
        if (item.price > 0) {
          if (item.stock > 0) {
            // Deep nesting - hard to read
          }
        }
      }
    }
  }
  return result
}
```

**Solutions for deep nesting:**
1. Use early returns (guard clauses)
2. Extract conditions into helper functions
3. Use array methods (map, filter, reduce)
4. Use the strategy pattern

## Function Complexity

### Rule: Cyclomatic Complexity ≤ 10

**Limit:** Maximum cyclomatic complexity of 10

**Rationale:**
- High complexity makes testing difficult
- Increases probability of bugs
- Makes code harder to understand

**Tips to reduce complexity:**
1. Replace switch statements with lookup objects
2. Use polymorphism instead of conditionals
3. Extract complex conditions into named functions

## Async Functions

### Rule: Always Handle Errors

All async functions should have proper error handling.

**Example - Good:**

```typescript
async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}
```

## Arrow Functions vs Regular Functions

### Rule: Use Arrow Functions for Callbacks

- Use arrow functions for callbacks and inline functions
- Use regular functions for methods that need `this` binding
- Use regular functions for generators

**Example:**

```typescript
// Good - arrow function for callback
const doubled = numbers.map((n) => n * 2)

// Good - regular function for class methods
class UserService {
  async getUser(id: string) {
    return this.repository.findById(id)
  }
}
```

## Summary Checklist

- [ ] Function body ≤ 30 lines
- [ ] Parameters ≤ 4
- [ ] Nesting depth ≤ 3 levels
- [ ] Cyclomatic complexity ≤ 10
- [ ] Proper error handling in async functions
- [ ] Single responsibility
- [ ] Descriptive function names
