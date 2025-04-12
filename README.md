# DoctorWAPP

A Fastify-based API for searching and retrieving healthcare provider information.

## Features

- Search providers by name, state, and specialty
- Get provider details including taxonomies and medicare services
- Filter providers by state and specialty

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Start development server:
```bash
npm run dev
```

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm install && npm run prisma:generate`
   - Start Command: `npm start`
   - Environment Variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NODE_ENV`: `production`

4. Deploy!

## API Endpoints

- `GET /api/providers/search`: Search providers
  - Query parameters:
    - `query`: Search term
    - `state`: State filter
    - `specialty`: Specialty filter
    - `page`: Page number
    - `limit`: Results per page

- `GET /api/providers/filters`: Get available filters
  - Returns lists of states and specialties

- `GET /api/providers/:npi`: Get provider details
  - Returns detailed information about a specific provider

## Health Check

- `GET /health`: Check API health status 