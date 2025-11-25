# React & Next.js Guidelines

## Purpose

These guidelines ensure best practices when building React components and Next.js applications.

## Component Structure

### Rule: Follow Consistent Component Structure

```typescript
// 1. Imports
import { useState, useEffect } from 'react'
import type { FC } from 'react'

// 2. Types
interface UserCardProps {
  user: User
  onEdit?: (id: string) => void
}

// 3. Component
export function UserCard({ user, onEdit }: UserCardProps) {
  // 3.1 Hooks (useState, useRef, etc.)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 3.2 Derived state
  const fullName = `${user.firstName} ${user.lastName}`
  
  // 3.3 Effects
  useEffect(() => {
    // Side effects
  }, [])
  
  // 3.4 Event handlers
  const handleEdit = () => {
    onEdit?.(user.id)
  }
  
  // 3.5 Render
  return (
    <div>
      <h2>{fullName}</h2>
      <button onClick={handleEdit}>Edit</button>
    </div>
  )
}
```

## Hooks

### Rule: Follow Rules of Hooks

1. Only call hooks at the top level
2. Only call hooks from React functions

```typescript
// Good
function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])
  
  return <div>{user?.name}</div>
}

// Bad - conditional hook
function UserProfile({ userId }: Props) {
  if (!userId) return null
  
  // ❌ Hook called conditionally
  const [user, setUser] = useState<User | null>(null)
  
  return <div>{user?.name}</div>
}
```

### Rule: Use Custom Hooks for Reusable Logic

```typescript
// Good - custom hook for data fetching
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    setIsLoading(true)
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [userId])
  
  return { user, isLoading, error }
}

// Usage
function UserProfile({ userId }: Props) {
  const { user, isLoading, error } = useUser(userId)
  
  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />
  if (!user) return <NotFound />
  
  return <div>{user.name}</div>
}
```

### Rule: Name Custom Hooks with 'use' Prefix

```typescript
// Good
function useAuth() { }
function useLocalStorage<T>(key: string) { }
function useDebounce<T>(value: T, delay: number) { }

// Bad
function getAuth() { }
function withLocalStorage<T>(key: string) { }
```

## Props

### Rule: Destructure Props

```typescript
// Good
function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={styles[variant]}>
      {children}
    </button>
  )
}

// Bad
function Button(props: ButtonProps) {
  return (
    <button onClick={props.onClick} className={styles[props.variant]}>
      {props.children}
    </button>
  )
}
```

### Rule: Use Sensible Default Props

```typescript
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
}: ButtonProps) {
  // Implementation
}
```

### Rule: Limit Props Count (Max 7)

If a component needs more than 7 props, consider:
- Breaking it into smaller components
- Using composition
- Grouping related props into objects

```typescript
// Bad - too many props
interface UserFormProps {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
  onSubmit: () => void
  onCancel: () => void
}

// Good - grouped props
interface UserFormProps {
  user: UserData
  address: AddressData
  onSubmit: () => void
  onCancel: () => void
}
```

## State Management

### Rule: Lift State Only When Necessary

Keep state as close to where it's used as possible.

```typescript
// Good - local state
function SearchInput() {
  const [query, setQuery] = useState('')
  
  return (
    <input 
      value={query} 
      onChange={(e) => setQuery(e.target.value)} 
    />
  )
}

// Lift state when needed by siblings
function SearchPage() {
  const [query, setQuery] = useState('')
  
  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults query={query} />
    </>
  )
}
```

### Rule: Use Appropriate State Management

| Scope | Solution |
|-------|----------|
| Component local | `useState`, `useReducer` |
| Few components | Props, lifting state |
| Feature/section | React Context |
| Global app state | Context, Zustand, etc. |
| Server state | TanStack Query, SWR |

## Performance

### Rule: Memoize Expensive Calculations

```typescript
// Good - memoized expensive calculation
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.price - b.price)
}, [items])

// Good - memoized callback
const handleClick = useCallback(() => {
  onItemSelect(item.id)
}, [item.id, onItemSelect])
```

### Rule: Use React.memo Sparingly

Only use `React.memo` when:
- Component renders often with same props
- Component render is expensive
- You've measured a performance improvement

```typescript
// Good - expensive pure component
const ExpensiveList = React.memo(function ExpensiveList({ items }: Props) {
  return (
    <ul>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </ul>
  )
})
```

## Next.js App Router

### Rule: Use Server Components by Default

```typescript
// app/users/page.tsx - Server Component (default)
async function UsersPage() {
  const users = await getUsers() // Direct database access
  
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}

export default UsersPage
```

### Rule: Use Client Components Only When Needed

Add `'use client'` only when you need:
- Event handlers (onClick, onChange, etc.)
- State (useState, useReducer)
- Effects (useEffect, useLayoutEffect)
- Browser APIs
- Custom hooks that use the above

```typescript
'use client'

import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

### Rule: Proper Data Fetching Patterns

```typescript
// Server Component - fetch directly
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  
  if (!product) {
    notFound()
  }
  
  return <ProductDetails product={product} />
}

// Client Component - use hooks
'use client'

function ProductSearch() {
  const [query, setQuery] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['products', query],
    queryFn: () => searchProducts(query),
  })
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {isLoading ? <Loading /> : <ProductList products={data} />}
    </div>
  )
}
```

### Rule: Use Proper File Conventions

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── not-found.tsx       # 404 UI
├── users/
│   ├── page.tsx        # /users
│   ├── [id]/
│   │   ├── page.tsx    # /users/[id]
│   │   └── edit/
│   │       └── page.tsx # /users/[id]/edit
│   └── layout.tsx      # Users layout
└── api/
    └── users/
        └── route.ts    # API route
```

### Rule: Use Metadata API

```typescript
// Static metadata
export const metadata: Metadata = {
  title: 'My App',
  description: 'My application description',
}

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id)
  
  return {
    title: product.name,
    description: product.description,
  }
}
```

## Error Handling

### Rule: Use Error Boundaries

```typescript
// app/users/error.tsx
'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Rule: Handle Loading States

```typescript
// app/users/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
    </div>
  )
}
```

## Forms

### Rule: Use Controlled Components

```typescript
'use client'

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Submit logic
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name" 
        value={formData.name} 
        onChange={handleChange} 
      />
      {/* Other fields */}
    </form>
  )
}
```

### Rule: Use Server Actions for Form Submissions

```typescript
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  
  await prisma.user.create({
    data: { name, email },
  })
  
  revalidatePath('/users')
}

// app/users/new/page.tsx
import { createUser } from '@/app/actions'

export default function NewUserPage() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create User</button>
    </form>
  )
}
```

## Accessibility

### Rule: Use Semantic HTML

```typescript
// Good
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

// Bad
<div className="nav">
  <div>
    <span onClick={...}>Home</span>
    <span onClick={...}>About</span>
  </div>
</div>
```

### Rule: Add ARIA Labels When Needed

```typescript
<button 
  aria-label="Close modal"
  onClick={onClose}
>
  <XIcon />
</button>

<input
  aria-label="Search products"
  aria-describedby="search-hint"
  placeholder="Search..."
/>
<span id="search-hint">Enter product name or category</span>
```

## Summary Checklist

- [ ] Follow consistent component structure
- [ ] Follow rules of hooks
- [ ] Use custom hooks for reusable logic
- [ ] Destructure props
- [ ] Limit props count to 7
- [ ] Keep state local when possible
- [ ] Memoize expensive calculations
- [ ] Use Server Components by default
- [ ] Use Client Components only when needed
- [ ] Follow Next.js file conventions
- [ ] Handle errors with error boundaries
- [ ] Handle loading states properly
- [ ] Use Server Actions for form submissions
- [ ] Ensure accessibility
