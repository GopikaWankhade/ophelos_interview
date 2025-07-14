# Backend Application

This is a simple Node.js application with Prisma ORM and Express.js

## Useful commands

- To Run the test simply run `npm test` from your terminal in the root of this directory
- To Lint run `npm run lint`
- To build and start your DB docker instance `docker compose up -d postgres_db`
- To stop your DB docker instance `docker compose down`
- Migrate your DB `npx prisma migrate dev --name init`
- To start your app locally `npm run dev`

### Expanding DB Schema

To migrate your database after any changes to the schema (in your backend directory). See below for an example

```
npx prisma migrate dev --name add_statement_model
```
