# E-commerce API

Express & Mongoose API

## ERD

`User` -|--< `Order` -|--< `Product`

`Order`s are owned by `User`s
`Product`s are not owned & are managed via "admin"

## Routes

### Authentication

| HTTP Verb | Endpoint | Headers |
|-----------|----------|---------|
| `POST` | `/sign-up` | None |
| `POST` | `/sign-in` | None |
| `PATCH` | `/change-password` | Bearer Token |
| `DELETE` | `/sign-out` | Bearer Token |

### Products

| HTTP Verb | Endpoint | Headers |
|-----------|----------|---------|
| `GET` | `/products` | None |
| `GET` | `/products/:id` | None |

### Orders

| Action | HTTP Verb | Endpoint | Headers |
|--------|-----------|----------|---------|
| Index Orders | `GET` | `/orders` | Bearer Token |
| Show Order | `GET` | `/orders/:id` | Bearer Token |
| Create Order | `POST` | `/orders` | Bearer Token |
| Update Order | `PATCH` | `/orders/:id` | Bearer Token |
| Delete Order | `DELETE` | `/orders/:id` | Bearer Token |
