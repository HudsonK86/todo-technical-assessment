# Todo List Technical Assessment

A simple full-stack Todo List application built for a technical assessment.

## Requirements Covered

### Backend
- NestJS
- GraphQL resolver
- Schema-first GraphQL approach
- CRUD operations for Todo items
- Prisma ORM
- SQLite database
- Standard NestJS `module -> resolver -> service` structure

### Frontend
- Next.js
- Display Todo items
- Add Todo items
- Update title
- Toggle completed status
- Delete Todo items
- Communicates with the NestJS backend using GraphQL queries and mutations

## Architecture

```text
Next.js frontend
      |
      | GraphQL request
      v
NestJS TodoResolver
      |
      v
TodoService
      |
      v
PrismaService
      |
      v
SQLite database
```

The resolver handles GraphQL operations, the service contains Todo logic, and Prisma handles database access. This separation follows the standard NestJS modular structure.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend: `http://localhost:3000`

GraphQL endpoint: `http://localhost:3000/graphql`

## Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend: `http://localhost:3001`

## Schema-first explanation

The GraphQL API is defined manually in `backend/src/schema.graphql`. NestJS reads that schema and maps its operations to resolver methods. This is different from code-first GraphQL, where TypeScript decorators generate the schema.

## CRUD Mapping

| CRUD | GraphQL operation |
|---|---|
| Create | `createTodo` |
| Read all | `todos` |
| Read one | `todo` |
| Update | `updateTodo` |
| Delete | `deleteTodo` |

## Interview explanation

`TodoResolver` receives GraphQL queries and mutations. It stays small and delegates logic to `TodoService`.

`TodoService` contains the CRUD logic and uses `PrismaService` to read and change Todo records in SQLite.

Prisma provides a clear data model, migrations, and type-safe database access.

SQLite was chosen because the assessment explicitly allows it and it makes local setup easier than requiring a MySQL server.

The source code contains detailed learning-focused comments around meaningful lines and blocks so the implementation can be explained clearly during the interview.
