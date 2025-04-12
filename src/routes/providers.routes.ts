import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { searchProviders, getProviderFilters, getProviderDetail } from '../controllers/providers.controller';

export async function providersRoutes(fastify: FastifyInstance) {
  // Search providers endpoint
  fastify.get('/search', {
    schema: {
      querystring: Type.Object({
        query: Type.Optional(Type.String()),
        state: Type.Optional(Type.String()),
        specialty: Type.Optional(Type.String()),
        page: Type.Optional(Type.Number({ default: 1 })),
        limit: Type.Optional(Type.Number({ default: 10 })),
      }),
      response: {
        200: Type.Object({
          providers: Type.Array(Type.Object({
            npi: Type.String(),
            provider_name: Type.String(),
            first_name: Type.Optional(Type.String()),
            last_name: Type.Optional(Type.String()),
            organization_name: Type.Optional(Type.String()),
            primary_taxonomy: Type.Optional(Type.String()),
            primary_taxonomy_desc: Type.Optional(Type.String()),
            address_1: Type.Optional(Type.String()),
            address_2: Type.Optional(Type.String()),
            city: Type.Optional(Type.String()),
            state: Type.Optional(Type.String()),
            postal_code: Type.Optional(Type.String()),
            country_code: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
            direct_address: Type.Optional(Type.String()),
            fhir_endpoint: Type.Optional(Type.String()),
            enumeration_date: Type.Optional(Type.String()),
            last_updated: Type.Optional(Type.String()),
            status: Type.Optional(Type.String()),
          })),
          total: Type.Number(),
          page: Type.Number(),
          limit: Type.Number(),
        }),
      },
    },
  }, async (request, reply) => {
    const { query, state, specialty, page = 1, limit = 10 } = request.query;
    const result = await searchProviders({ query, state, specialty, page, limit });
    return result;
  });

  // Get filters endpoint
  fastify.get('/filters', {
    schema: {
      response: {
        200: Type.Object({
          states: Type.Array(Type.String()),
          specialties: Type.Array(Type.String()),
        }),
      },
    },
  }, async () => {
    const filters = await getProviderFilters();
    return filters;
  });

  // Get provider detail endpoint
  fastify.get('/:npi', {
    schema: {
      params: Type.Object({
        npi: Type.String(),
      }),
      response: {
        200: Type.Object({
          npi: Type.String(),
          provider_name: Type.String(),
          first_name: Type.Optional(Type.String()),
          last_name: Type.Optional(Type.String()),
          organization_name: Type.Optional(Type.String()),
          primary_taxonomy: Type.Optional(Type.String()),
          primary_taxonomy_desc: Type.Optional(Type.String()),
          address_1: Type.Optional(Type.String()),
          address_2: Type.Optional(Type.String()),
          city: Type.Optional(Type.String()),
          state: Type.Optional(Type.String()),
          postal_code: Type.Optional(Type.String()),
          country_code: Type.Optional(Type.String()),
          phone: Type.Optional(Type.String()),
          email: Type.Optional(Type.String()),
          direct_address: Type.Optional(Type.String()),
          fhir_endpoint: Type.Optional(Type.String()),
          enumeration_date: Type.Optional(Type.String()),
          last_updated: Type.Optional(Type.String()),
          status: Type.Optional(Type.String()),
          taxonomies: Type.Array(Type.Object({
            id: Type.Number(),
            taxonomy_code: Type.String(),
            taxonomy_desc: Type.Optional(Type.String()),
            primary_taxonomy: Type.Boolean(),
            license: Type.Optional(Type.String()),
          })),
          medicareServices: Type.Array(Type.Object({
            id: Type.Number(),
            hcpcs_code: Type.String(),
            hcpcs_description: Type.Optional(Type.String()),
            service_count: Type.String(),
            beneficiary_count: Type.String(),
            submitted_charge: Type.String(),
            allowed_amount: Type.String(),
            payment_amount: Type.String(),
            service_year: Type.Number(),
            place_of_service: Type.Optional(Type.String()),
          })),
        }),
      },
    },
  }, getProviderDetail);
} 