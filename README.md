# Simple CMS

A simple content management system with an admin console and frontpage.

## Features

- Admin console with CRUD operations for User table
- Authentication using username and password
- Avatar upload functionality
- Responsive UI with Tailwind CSS
- MySQL database with Prisma ORM

## Tech Stack

- Next.js 14 (App Router)
- Prisma.io with MySQL
- Tailwind CSS
- Docker Compose for MySQL database

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd simplecms
```

2. Install dependencies:

```bash
npm install
```

3. Start the MySQL database using Docker:

```bash
docker-compose up -d
```

4. Set up the database and seed initial admin user:

```bash
npx prisma db push
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

After running the seed script, you can log in to the admin console with:

- Username: `admin`
- Password: `admin123`

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/app/api` - API routes
- `/src/components` - React components
- `/prisma` - Prisma schema and migrations
- `/public` - Static assets

## Database Schema

### User

- `id` (Int, Primary Key)
- `username` (String, Unique)
- `password` (String)
- `avatar` (String, Optional)
- `created_at` (DateTime)
- `modified_at` (DateTime)
