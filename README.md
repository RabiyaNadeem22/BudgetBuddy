# BudgetBuddy

BudgetBuddy is a full-stack personal finance application for tracking income, expenses, budgets, and reports. The app includes authentication, transaction management, category-based budgeting, and a dashboard for reviewing spending trends.

## Features

- User authentication and profile management
- Create, edit, and delete transactions
- Manage categories for income and expense tracking
- Set monthly/weekly/yearly budgets by category
- Review reports and summary statistics
- Swagger-based API documentation

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-inspired components

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Swagger/OpenAPI docs

## Project Structure

- `src/` – React frontend application
- `server/` – Express backend and API routes
- `server/models/` – Mongoose schemas
- `server/controllers/` – Request handlers
- `server/routes/` – API endpoints and Swagger docs

## Prerequisites

- Node.js 18+
- npm or pnpm
- MongoDB instance running locally or remotely

## Environment Setup

Create a `.env` file inside the `server` folder with the following values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/budgetbuddy
JWT_SECRET=your_secret_key
```

## Installation

Install dependencies for both the frontend and backend:

```bash
cd BudgetBuddy
npm install
cd server
npm install
```

## Running the App

### Start the backend

```bash
cd server
npm run dev
```

The API will run on `http://localhost:5000` and Swagger docs will be available at `http://localhost:5000/api-docs`.

### Start the frontend

In a separate terminal:

```bash
cd BudgetBuddy
npm run dev
```

The frontend will be served by Vite, typically at `http://localhost:5173`.

## API Overview

Key endpoints include:

- `POST /api/users/signup`
- `POST /api/users/signin`
- `GET /api/categories`
- `POST /api/transactions`
- `GET /api/transactions`
- `POST /api/budgets`
- `GET /api/budgets`

## Notes

- Default categories are seeded automatically on backend startup.
- The backend uses JWT-based protection for authenticated routes.

## License

This project is for personal or educational use.
