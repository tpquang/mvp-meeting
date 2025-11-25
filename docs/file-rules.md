# File Rules

## Purpose

These rules ensure files remain focused, organized, and maintainable.

## File Length

### Rule: Maximum 300 Lines Per File

**Limit:** 300 lines (including comments and blank lines)

**Rationale:**
- Large files are difficult to navigate
- Indicates a file is doing too much
- Smaller files are easier to understand and maintain
- Promotes better code organization

### Exceptions

Some files may exceed this limit with justification:
- Generated files (e.g., Prisma client)
- Configuration files
- Test files with many test cases
- Type definition files

## File Organization

### Rule: One Component Per File

React components should follow the one-component-per-file rule.

**Example - Good:**

```
src/components/
├── Button.tsx       # Button component only
├── Input.tsx        # Input component only
└── Modal.tsx        # Modal component only
```

**Example - Bad:**

```typescript
// components/FormElements.tsx - Multiple components in one file
export function Button() { ... }
export function Input() { ... }
export function Select() { ... }
export function Checkbox() { ... }
```

### Rule: Related Utilities Together

Group related utility functions in the same file.

**Example:**

```
src/lib/
├── date-utils.ts    # Date manipulation functions
├── string-utils.ts  # String manipulation functions
└── validation.ts    # Validation functions
```

## File Structure

### Recommended File Structure for Components

```typescript
// 1. Imports (grouped and ordered)
import { useState, useEffect } from 'react'
import type { FC } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import type { UserCardProps } from './types'

// 2. Types/Interfaces (if not in separate file)
interface LocalState {
  isLoading: boolean
}

// 3. Constants
const DEFAULT_AVATAR = '/images/default-avatar.png'

// 4. Helper functions (if small, otherwise extract to separate file)
function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

// 5. Main component
export function UserCard({ user, onEdit }: UserCardProps): JSX.Element {
  // Hooks
  const [state, setState] = useState<LocalState>({ isLoading: false })
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [])
  
  // Event handlers
  const handleEdit = () => {
    onEdit(user.id)
  }
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

// 6. Default export (if needed)
export default UserCard
```

### Recommended File Structure for Utilities

```typescript
// 1. Imports
import { format, parseISO } from 'date-fns'

// 2. Types
export interface DateFormatOptions {
  locale?: string
  includeTime?: boolean
}

// 3. Constants
const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'
const DEFAULT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'

// 4. Functions (ordered by dependency or alphabetically)
export function formatDate(date: Date, options?: DateFormatOptions): string {
  const formatString = options?.includeTime 
    ? DEFAULT_DATETIME_FORMAT 
    : DEFAULT_DATE_FORMAT
  return format(date, formatString)
}

export function parseDate(dateString: string): Date {
  return parseISO(dateString)
}

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}
```

## Import Organization

### Rule: Group and Order Imports

1. External libraries (react, next, etc.)
2. Internal aliases (@/components, @/lib, etc.)
3. Relative imports
4. Type imports

**Example:**

```typescript
// External libraries
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Internal aliases
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// Relative imports
import { UserAvatar } from './UserAvatar'
import { formatUserData } from './utils'

// Type imports
import type { User } from '@/types'
import type { UserCardProps } from './types'
```

## Export Guidelines

### Rule: Prefer Named Exports

Use named exports for most cases. Default exports are acceptable for:
- Page components (Next.js requirement)
- Dynamic imports

**Example - Good:**

```typescript
// Named exports
export function Button() { ... }
export function Input() { ... }

// Re-export from index
export { Button } from './Button'
export { Input } from './Input'
```

### Rule: Use Index Files for Public API

Create index files to define the public API of a directory.

**Example:**

```typescript
// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Modal } from './modal'
export type { ButtonProps, InputProps, ModalProps } from './types'
```

## File Size Monitoring

### Warning Thresholds

| File Type | Warning | Error |
|-----------|---------|-------|
| Component files | 200 lines | 300 lines |
| Utility files | 150 lines | 250 lines |
| Test files | 300 lines | 500 lines |
| Type files | 200 lines | 400 lines |

### What to Do When Files Grow Too Large

1. **Split by feature:** Extract related functionality into separate files
2. **Split by type:** Separate types, constants, and utilities
3. **Split by responsibility:** Each file should have one clear purpose
4. **Create subdirectories:** Group related files together

**Example refactoring:**

```
Before:
src/components/UserProfile.tsx (400 lines)

After:
src/components/UserProfile/
├── index.ts           # Re-exports
├── UserProfile.tsx    # Main component
├── UserAvatar.tsx     # Avatar subcomponent
├── UserDetails.tsx    # Details subcomponent
├── hooks.ts           # Custom hooks for this component
├── utils.ts           # Utility functions
└── types.ts           # TypeScript types
```

## Summary Checklist

- [ ] File ≤ 300 lines
- [ ] One component per file
- [ ] Imports are grouped and ordered
- [ ] Exports are clear and consistent
- [ ] File has a single, clear purpose
- [ ] Related utilities are grouped together
- [ ] Index files define public API
