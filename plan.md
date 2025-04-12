# Medical Provider Leads API Plan

## Tech Stack
- Fastify: High-performance web framework
- Typebox: Runtime type validation
- Prisma: Database ORM
- PostgreSQL: Database
- TypeScript: Language

## Project Structure
```
src/
├── app.ts                 # Fastify application setup
├── config/               # Configuration files
│   └── database.ts       # Database configuration
├── routes/               # API routes
│   ├── providers.ts      # Provider routes
│   └── index.ts         # Route registration
├── controllers/          # Route handlers
│   └── providers.ts      # Provider controller
├── services/             # Business logic
│   └── providers.ts      # Provider service
├── schemas/              # Typebox schemas
│   ├── provider.ts       # Provider schemas
│   ├── medicare.ts       # Medicare schemas
│   └── taxonomy.ts       # Taxonomy schemas
├── types/                # TypeScript types
│   └── index.ts         # Type exports
└── utils/               # Utility functions
    └── validation.ts    # Validation helpers
```

## Database Schema (Prisma)
```prisma
model Provider {
  npi                String           @id
  provider_type      String
  provider_name     String
  first_name        String?
  last_name         String?
  organization_name String?
  primary_taxonomy  String?
  address_1         String?
  city              String?
  state             String?
  postal_code       String?
  phone             String?
  email             String?
  status            String?

  taxonomies        ProviderTaxonomy[]
  medicareServices  MedicareService[]
}

model ProviderTaxonomy {
  id               Int      @id @default(autoincrement())
  npi              String
  taxonomy_code    String
  taxonomy_desc    String?
  primary_taxonomy Boolean
  license          String?

  provider         Provider @relation(fields: [npi], references: [npi])
}

model MedicareService {
  id                Int      @id @default(autoincrement())
  npi               String
  hcpcs_code        String
  hcpcs_description String?
  service_count     String
  beneficiary_count String
  submitted_charge  String
  allowed_amount    String
  payment_amount    String
  service_year      Int
  place_of_service  String?

  provider         Provider @relation(fields: [npi], references: [npi])
}
```

## API Endpoints

### 1. Search Providers (`GET /api/providers`)
- **Query Parameters**:
  ```typescript
  {
    name?: string;
    first_name?: string;
    last_name?: string;
    organization_name?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    provider_type?: string;
    specialty?: string;
    // Medicare filters
    min_services?: number;
    min_beneficiaries?: number;
    min_payment?: number;
    service_year?: number;
    hcpcs_codes?: string[];
    place_of_service?: string;
    // Pagination
    page?: number;
    limit?: number;
  }
  ```

### 2. Get Provider Details (`GET /api/providers/:npi`)
- **Path Parameters**:
  ```typescript
  {
    npi: string;
  }
  ```

### 3. Get Provider Statistics (`GET /api/stats`)
- **Query Parameters**:
  ```typescript
  {
    state?: string;
    specialty?: string;
    year?: number;
  }
  ```

## Typebox Schemas

### Provider Search Schema
```typescript
const ProviderSearchSchema = Type.Object({
  name: Type.Optional(Type.String()),
  first_name: Type.Optional(Type.String()),
  last_name: Type.Optional(Type.String()),
  organization_name: Type.Optional(Type.String()),
  city: Type.Optional(Type.String()),
  state: Type.Optional(Type.String()),
  postal_code: Type.Optional(Type.String()),
  provider_type: Type.Optional(Type.String()),
  specialty: Type.Optional(Type.String()),
  min_services: Type.Optional(Type.Number()),
  min_beneficiaries: Type.Optional(Type.Number()),
  min_payment: Type.Optional(Type.Number()),
  service_year: Type.Optional(Type.Number()),
  hcpcs_codes: Type.Optional(Type.Array(Type.String())),
  place_of_service: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ default: 1 })),
  limit: Type.Optional(Type.Number({ default: 10 }))
})
```

## Implementation Phases

### Phase 1: Setup and Basic Search
1. Set up Fastify with Typebox
2. Configure Prisma with database connection
3. Implement basic provider search endpoint
4. Add pagination support

### Phase 2: Advanced Search Features
1. Add Medicare data filtering
2. Implement taxonomy-based search
3. Add location-based search
4. Implement provider type filtering

### Phase 3: Provider Details and Statistics
1. Implement provider details endpoint
2. Add Medicare service statistics
3. Implement provider distribution statistics
4. Add specialty coverage statistics

### Phase 4: Performance Optimization
1. Add database indexes
2. Implement response caching
3. Add query optimization
4. Implement rate limiting

## Security Considerations
- Input validation using Typebox
- Rate limiting
- CORS configuration
- Error handling
- Logging

## Performance Optimization
- Database indexes for common search patterns
- Caching for frequently accessed data
- Query optimization for complex searches
- Response compression

## Documentation
- OpenAPI/Swagger documentation
- Example requests and responses
- Error code documentation
- Rate limit information 