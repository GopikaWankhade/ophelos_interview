# README

## Requirements

Node.js (LTS)

npm (Package manager)

Typescript

PostgreSQL

Docker Desktop

## Environment Variables

Before starting the application, you need to create environment files with the following variables:

### Backend Environment (.env.prod)
Create a `.env.prod` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres?schema=public"
JWT_SECRET="a-very-long-jwt-secret"
```

### Development Environment (.env)
For local development, create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres?schema=public"
JWT_SECRET="a-very-long-jwt-secret"
```

## SETUP

### Get Started

This entire application is containerized and you can use the following npm script in your root directory to start everything:

```
npm run dev
```

After you spin up the container you can visit:
- **Backend API**: `http://localhost:3000/` 
- **Frontend**: `http://localhost:3001/`
- **Prisma Studio** (Database GUI): `http://localhost:5555/`

The backend will show "No users have been created." when you first visit it.

## Teardown

To tear everything that was built above down use the following npm script:

```
npm run down
```