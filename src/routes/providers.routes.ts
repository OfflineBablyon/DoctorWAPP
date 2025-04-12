import { FastifyInstance } from 'fastify';
import { searchProviders, getProviderFilters, getProviderDetails } from '../controllers/providers.controller';

export const registerProviderRoutes = (app: FastifyInstance) => {
  // Search providers
  app.get('/api/providers/search', {
    schema: {
      tags: ['providers'],
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          state: { type: 'string' },
          specialty: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
          minServiceCount: { type: 'number' },
          maxServiceCount: { type: 'number' },
          minPaymentAmount: { type: 'number' },
          maxPaymentAmount: { type: 'number' },
          hcpcsCode: { type: 'string' },
          serviceYear: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            providers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  npi: { type: 'string' },
                  provider_name: { type: 'string' },
                  first_name: { type: ['string', 'null'] },
                  last_name: { type: ['string', 'null'] },
                  organization_name: { type: ['string', 'null'] },
                  provider_type: { type: 'number' },
                  address: {
                    type: 'object',
                    properties: {
                      line1: { type: ['string', 'null'] },
                      line2: { type: ['string', 'null'] },
                      city: { type: ['string', 'null'] },
                      state: { type: ['string', 'null'] },
                      postal_code: { type: ['string', 'null'] },
                      country_code: { type: ['string', 'null'] }
                    }
                  },
                  phone: { type: ['string', 'null'] },
                  status: { type: ['string', 'null'] }
                }
              }
            },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' }
          }
        }
      }
    }
  }, searchProviders);

  // Get provider filters
  app.get('/api/providers/filters', {
    schema: {
      tags: ['providers'],
      response: {
        200: {
          type: 'object',
          properties: {
            states: {
              type: 'array',
              items: { type: 'string' }
            },
            specialties: {
              type: 'array',
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
      params: {
        type: 'object',
        properties: {
          npi: { type: 'string' }
        },
        required: ['npi']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            npi: { type: 'string' },
            provider_name: { type: 'string' },
            first_name: { type: ['string', 'null'] },
            last_name: { type: ['string', 'null'] },
            organization_name: { type: ['string', 'null'] },
            provider_type: { type: 'number' },
            address: {
              type: 'object',
              properties: {
                line1: { type: ['string', 'null'] },
                line2: { type: ['string', 'null'] },
                city: { type: ['string', 'null'] },
                state: { type: ['string', 'null'] },
                postal_code: { type: ['string', 'null'] },
                country_code: { type: ['string', 'null'] }
              }
            },
            phone: { type: ['string', 'null'] },
            email: { type: ['string', 'null'] },
            direct_address: { type: ['string', 'null'] },
            fhir_endpoint: { type: ['string', 'null'] },
            enumeration_date: { type: ['string', 'null'] },
            last_updated: { type: ['string', 'null'] },
            status: { type: ['string', 'null'] },
            taxonomies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: ['string', 'null'] },
                  description: { type: ['string', 'null'] },
                  isPrimary: { type: ['boolean', 'null'] },
                  license: { type: ['string', 'null'] }
                }
              }
            },
            medicare: {
              type: 'object',
              properties: {
                summary: {
                  type: 'object',
                  properties: {
                    totalServices: { type: 'number' },
                    totalBeneficiaries: { type: 'number' },
                    totalPayments: { type: 'number' },
                    totalSubmitted: { type: 'number' },
                    totalAllowed: { type: 'number' }
                  }
                },
                services: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      code: { type: ['string', 'null'] },
                      description: { type: ['string', 'null'] },
                      serviceCount: { type: 'number' },
                      beneficiaryCount: { type: 'number' },
                      submittedCharge: { type: 'number' },
                      allowedAmount: { type: 'number' },
                      paymentAmount: { type: 'number' },
                      year: { type: ['number', 'null'] },
                      placeOfService: { type: ['string', 'null'] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, getProviderDetails);
}; 