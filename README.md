# Setup Instructions

## Backend Setup

1. Clone the repo and navigate to the server folder:

```bash
git clone https://github.com/anasri12/Sustainity_Assignment.git
cd Sustainity_Assignment/server
```

2. Install dependencies:

```bash
npm install
```

3. Set up .env with your PostgreSQL connection:

```
DATABASE_URL=postgresql://user:password@localhost:5432/database-name
```

4. Apply Prisma migrations and generate client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Start the server:

```bash
npm run dev
```

Server will run on <http://localhost:4000>

## Frontend Setup

1. Open a new terminal and navigate to the frontend:

```bash
cd Sustainity_Assignment/client
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

Frontend runs on <http://localhost:3000>
