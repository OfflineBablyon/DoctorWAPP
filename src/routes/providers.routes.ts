import { FastifyInstance } from 'fastify';
import { searchProviders, getProviderFilters, getProviderDetails } from '../controllers/providers.controller';

export const registerProviderRoutes = (app: FastifyInstance) => {
  // Search providers
  app.get('/api/providers/search', {
    schema: {
      tags: ['providers'],
      description: 'Search for healthcare providers with various filters and pagination',
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search by provider name or organization name' },
          state: { type: 'string', description: 'Filter by state code (e.g. CA, NY)' },
          specialty: { type: 'string', description: 'Filter by taxonomy/specialty code' },
          provider_type: { type: 'string', description: 'Filter by provider type (1 for individual, 2 for organization)' },
          has_medicare: { type: 'boolean', description: 'Filter to include only providers with Medicare data' },
          page: { type: 'number', default: 1, description: 'Page number for pagination' },
          limit: { type: 'number', default: 10, description: 'Number of results per page (max 100)' },
          minServiceCount: { type: 'number', description: 'Minimum Medicare service count' },
          maxServiceCount: { type: 'number', description: 'Maximum Medicare service count' },
          minPaymentAmount: { type: 'number', description: 'Minimum Medicare payment amount' },
          maxPaymentAmount: { type: 'number', description: 'Maximum Medicare payment amount' },
          hcpcsCode: { type: 'string', description: 'Filter by specific Medicare procedure code' },
          serviceYear: { type: 'number', description: 'Filter by Medicare service year' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: 'Successful search response with paginated results',
          properties: {
            providers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  npi: { type: 'string', description: 'National Provider Identifier' },
                  provider_name: { type: 'string', description: 'Provider display name' },
                  first_name: { type: ['string', 'null'], description: 'First name (for individual providers)' },
                  last_name: { type: ['string', 'null'], description: 'Last name (for individual providers)' },
                  organization_name: { type: ['string', 'null'], description: 'Organization name (for organization providers)' },
                  provider_type: { type: ['string', 'null'], description: '1 for individual, 2 for organization' },
                  address: {
                    type: 'object',
                    properties: {
                      line1: { type: ['string', 'null'], description: 'Address line 1' },
                      line2: { type: ['string', 'null'], description: 'Address line 2' },
                      city: { type: ['string', 'null'], description: 'City' },
                      state: { type: ['string', 'null'], description: 'State code' },
                      postal_code: { type: ['string', 'null'], description: 'Postal/ZIP code' },
                      country_code: { type: ['string', 'null'], description: 'Country code' }
                    }
                  },
                  phone: { type: ['string', 'null'], description: 'Phone number' },
                  status: { type: ['string', 'null'], description: 'Provider status (A=Active)' }
                }
              }
            },
            total: { type: 'number', description: 'Total number of matching providers' },
            page: { type: 'number', description: 'Current page number' },
            limit: { type: 'number', description: 'Number of results per page' }
          }
        },
        408: {
          type: 'object',
          description: 'Request timeout for complex Medicare queries',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          description: 'Server error',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, searchProviders);

  // Get provider filters
  app.get('/api/providers/filters', {
    schema: {
      tags: ['providers'],
      description: 'Get available filter values for states and specialties',
      response: {
        200: {
          type: 'object',
          description: 'Available filter values',
          properties: {
            states: {
              type: 'array',
              description: 'List of available state codes',
              items: { type: 'string' }
            },
            specialties: {
              type: 'array',
              description: 'List of available specialty/taxonomy codes',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  }, getProviderFilters);

  // Get provider details
  app.get('/api/providers/:npi', {
    schema: {
      tags: ['providers'],
      description: 'Get detailed information for a specific provider by NPI',
      params: {
        type: 'object',
        properties: {
          npi: { type: 'string', description: 'National Provider Identifier' }
        },
        required: ['npi']
      },
      response: {
        200: {
          type: 'object',
          description: 'Provider details with full information',
          properties: {
            npi: { type: 'string', description: 'National Provider Identifier' },
            provider_name: { type: 'string', description: 'Provider display name' },
            first_name: { type: ['string', 'null'], description: 'First name (for individual providers)' },
            last_name: { type: ['string', 'null'], description: 'Last name (for individual providers)' },
            organization_name: { type: ['string', 'null'], description: 'Organization name (for organization providers)' },
            provider_type: { type: ['string', 'null'], description: '1 for individual, 2 for organization' },
            address: {
              type: 'object',
              properties: {
                line1: { type: ['string', 'null'], description: 'Address line 1' },
                line2: { type: ['string', 'null'], description: 'Address line 2' },
                city: { type: ['string', 'null'], description: 'City' },
                state: { type: ['string', 'null'], description: 'State code' },
                postal_code: { type: ['string', 'null'], description: 'Postal/ZIP code' },
                country_code: { type: ['string', 'null'], description: 'Country code' }
              }
            },
            phone: { type: ['string', 'null'], description: 'Phone number' },
            email: { type: ['string', 'null'], description: 'Email address' },
            direct_address: { type: ['string', 'null'], description: 'Direct secure email address' },
            fhir_endpoint: { type: ['string', 'null'], description: 'FHIR API endpoint URL' },
            enumeration_date: { type: ['string', 'null'], description: 'Date when NPI was assigned' },
            last_updated: { type: ['string', 'null'], description: 'Last update date' },
            status: { type: ['string', 'null'], description: 'Provider status (A=Active)' },
            taxonomies: {
              type: 'array',
              description: 'Provider specialties',
              items: {
                type: 'object',
                properties: {
                  code: { type: ['string', 'null'], description: 'Taxonomy code' },
                  description: { type: ['string', 'null'], description: 'Taxonomy description' },
                  isPrimary: { type: ['boolean', 'null'], description: 'Whether this is the primary specialty' },
                  license: { type: ['string', 'null'], description: 'License number' }
                }
              }
            },
            medicare: {
              type: 'object',
              description: 'Medicare service information',
              properties: {
                summary: {
                  type: 'object',
                  description: 'Summary of Medicare service statistics',
                  properties: {
                    totalServices: { type: 'number', description: 'Total number of services provided' },
                    totalBeneficiaries: { type: 'number', description: 'Total number of beneficiaries served' },
                    totalPayments: { type: 'number', description: 'Total Medicare payments received' },
                    totalSubmitted: { type: 'number', description: 'Total amount submitted for billing' },
                    totalAllowed: { type: 'number', description: 'Total amount allowed by Medicare' }
                  }
                },
                services: {
                  type: 'array',
                  description: 'Detailed Medicare services',
                  items: {
                    type: 'object',
                    properties: {
                      code: { type: ['string', 'null'], description: 'HCPCS/CPT code' },
                      description: { type: ['string', 'null'], description: 'Service description' },
                      serviceCount: { type: 'number', description: 'Number of services provided' },
                      beneficiaryCount: { type: 'number', description: 'Number of beneficiaries served' },
                      submittedCharge: { type: 'number', description: 'Amount submitted for billing' },
                      allowedAmount: { type: 'number', description: 'Amount allowed by Medicare' },
                      paymentAmount: { type: 'number', description: 'Amount paid by Medicare' },
                      year: { type: ['number', 'null'], description: 'Service year' },
                      placeOfService: { type: ['string', 'null'], description: 'Place of service code' }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          type: 'object',
          description: 'Provider not found',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          description: 'Server error',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, getProviderDetails);
}; 