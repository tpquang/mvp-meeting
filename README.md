# MVP Meeting

A Next.js application base with database connectivity, Tailwind CSS, and shadcn/ui components.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) - React framework with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- **Database ORM:** [Prisma](https://www.prisma.io/) - Type-safe database client
- **Linting:** [ESLint](https://eslint.org/) - Code quality and consistency

## Project Structure

```
├── docs/                    # Coding rules and guidelines
│   ├── README.md            # Documentation overview
│   ├── function-rules.md    # Function length and complexity rules
│   ├── file-rules.md        # File organization rules
│   ├── naming-conventions.md # Naming standards
│   ├── general-guidelines.md # General best practices
│   ├── typescript-guidelines.md # TypeScript patterns
│   └── react-nextjs-guidelines.md # React/Next.js best practices
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utility functions
│       ├── prisma.ts        # Prisma client instance
│       └── utils.ts         # shadcn/ui utilities
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL database (or any Prisma-supported database)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mvp-meeting
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your database connection string.

4. Generate Prisma Client:

```bash
npx prisma generate
```

5. Run database migrations (if you have migrations):

```bash
npx prisma migrate dev
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name <migration-name>

# Apply migrations to production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add <component-name>
```

Example:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

## Coding Guidelines

Please refer to the [docs/](./docs/README.md) folder for coding rules and guidelines:

- [Function Rules](./docs/function-rules.md) - Max 30 lines per function
- [File Rules](./docs/file-rules.md) - Max 300 lines per file
- [Naming Conventions](./docs/naming-conventions.md) - Consistent naming standards
- [General Guidelines](./docs/general-guidelines.md) - Best practices
- [TypeScript Guidelines](./docs/typescript-guidelines.md) - Type safety patterns
- [React & Next.js Guidelines](./docs/react-nextjs-guidelines.md) - Component patterns

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## License

This project is private.
