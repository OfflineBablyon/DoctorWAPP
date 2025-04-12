# HealthProvider Data API

The HealthProvider Data API provides real-time access to comprehensive healthcare provider information across the United States. Search for providers by name, location, specialty, or type and retrieve detailed Medicare service data.

## Features

- **Real-Time Provider Search**: Find healthcare providers by name, location, specialty, or provider type
- **Detailed Provider Profiles**: Access comprehensive information including contact details, specialties, and Medicare data
- **Medicare Service Data**: Get detailed Medicare service statistics, payment information, and procedure codes
- **Advanced Filtering**: Filter by state, specialty, provider type, and Medicare participation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/healthprovider-api.git
   cd healthprovider-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.development
   ```
   Edit the `.env.development` file with your database credentials and other settings.

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API documentation is available at `/docs` when running with `ENABLE_SWAGGER=true`.

### Main Endpoints

#### Search Providers
```
GET /api/providers/search
```

Query parameters:
- `query`: Search by provider name or organization name
- `state`: Filter by state code (e.g., CA, NY)
- `specialty`: Filter by taxonomy/specialty code
- `provider_type`: Filter by provider type (1 for individual, 2 for organization)
- `has_medicare`: Filter to include only providers with Medicare data
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 10, max: 100)

Example:
```
GET /api/providers/search?state=CA&specialty=207R00000X&limit=10
```

#### Get Provider Details
```
GET /api/providers/:npi
```

Example:
```
GET /api/providers/1234567890
```

#### Get Filter Options
```
GET /api/providers/filters
```

Returns available states and specialties for filtering.

## Deployment

### Production Deployment

1. Create a production environment file:
   ```bash
   cp .env.example .env.production
   ```
   Edit the `.env.production` file with production settings.

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm start
   ```

### Deployment with Docker

A Dockerfile is provided for containerized deployment:

```bash
docker build -t healthprovider-api .
docker run -p 3000:3000 --env-file .env.production healthprovider-api
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- 500 requests per minute in production environment

## Pricing Plans

| Plan | Price | Rate Limit | Features |
|------|-------|------------|----------|
| Basic | Free | 50/minute | - Basic provider search<br>- Limited filter options |
| Pro | $45/month | 150/minute | - Full provider search<br>- All filters<br>- Provider details |
| Ultra | $250/month | 300/minute | - Everything in Pro<br>- Medicare service data<br>- Bulk search |
| Mega | $1,000/month | 500/minute | - Everything in Ultra<br>- Unlimited access<br>- Priority support |

## Troubleshooting

- For issues with complex Medicare queries timing out, try simplifying your search criteria or adding more specific filters.
- The search API returns a maximum of 100 results per page to maintain performance.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 