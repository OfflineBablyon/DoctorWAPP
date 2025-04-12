import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { SearchParams, SearchResponse, FiltersResponse, Provider, MedicareSummary, ProviderSearchResult } from '../models/interfaces/provider.interface';

const prisma = new PrismaClient();

// Set a query timeout for complex queries
const QUERY_TIMEOUT = 10000; // 10 seconds

export const searchProviders = async (
  request: FastifyRequest<{ Querystring: SearchParams }>,
  reply: FastifyReply
): Promise<SearchResponse> => {
  try {
    const { 
      query, 
      state, 
      specialty, 
      page = 1, 
      limit = 10,
      minServiceCount,
      maxServiceCount,
      minPaymentAmount,
      maxPaymentAmount,
      hcpcsCode,
      serviceYear,
      has_medicare,
      provider_type
    } = request.query;

    const where: any = {};
    if (query) {
      where.OR = [
        { provider_name: { contains: query, mode: 'insensitive' } },
        { organization_name: { contains: query, mode: 'insensitive' } }
      ];
    }
    if (state) {
      where.state = state;
    }
    if (specialty) {
      where.provider_taxonomies = {
        some: {
          taxonomy_code: specialty,
          primary_taxonomy: true
        }
      };
    }
    if (provider_type) {
      where.provider_type = provider_type;
    }

    // Add Medicare service filters
    if (has_medicare) {
      where.medicare_services = {
        some: {}
      };

      // Check if we have complex Medicare filters that might slow down the query
      const hasComplexMedicareFilters = minServiceCount || maxServiceCount || 
                                      minPaymentAmount || maxPaymentAmount || 
                                      hcpcsCode || serviceYear;

      // For complex Medicare queries, add a timeout
      if (hasComplexMedicareFilters) {
        // Create a promise that resolves with the data
        const queryPromise = new Promise(async (resolve, reject) => {
          try {
            if (minServiceCount) {
              where.medicare_services.some.service_count = { gte: Number(minServiceCount) };
            }
            if (maxServiceCount) {
              where.medicare_services.some.service_count = { 
                ...where.medicare_services.some.service_count,
                lte: Number(maxServiceCount) 
              };
            }
            if (minPaymentAmount) {
              where.medicare_services.some.payment_amount = { gte: Number(minPaymentAmount) };
            }
            if (maxPaymentAmount) {
              where.medicare_services.some.payment_amount = { 
                ...where.medicare_services.some.payment_amount,
                lte: Number(maxPaymentAmount) 
              };
            }
            if (hcpcsCode) {
              where.medicare_services.some.hcpcs_code = hcpcsCode;
            }
            if (serviceYear) {
              where.medicare_services.some.service_year = String(serviceYear);
            }

            const [providers, total] = await Promise.all([
              prisma.providers.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { provider_name: 'asc' },
                include: {
                  provider_taxonomies: true
                }
              }),
              prisma.providers.count({ where })
            ]);

            resolve({ providers, total });
          } catch (error) {
            reject(error);
          }
        });

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Query timeout - please simplify your search criteria'));
          }, QUERY_TIMEOUT);
        });

        // Race the query against the timeout
        const { providers, total } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as { providers: any[], total: number };

        // Format the providers data
        const formattedProviders = providers.map(formatProvider);

        return {
          providers: formattedProviders,
          total,
          page,
          limit
        };
      }
    }

    // Standard query without complex Medicare filters
    const [providers, total] = await Promise.all([
      prisma.providers.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { provider_name: 'asc' },
        include: {
          provider_taxonomies: true
        }
      }),
      prisma.providers.count({ where })
    ]);

    // Format the providers data
    const formattedProviders = providers.map(formatProvider);

    return {
      providers: formattedProviders,
      total,
      page,
      limit
    };
  } catch (error) {
    request.log.error(error);
    if ((error as Error).message.includes('timeout')) {
      reply.status(408).send({ 
        error: 'Request Timeout', 
        message: 'Query took too long to process. Please simplify your search criteria.' 
      });
    } else {
      reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'An error occurred while processing your request.' 
      });
    }
    return { providers: [], total: 0, page: 1, limit: 10 };
  }
};

// Helper function to format provider data for search results
const formatProvider = (provider: any): ProviderSearchResult => ({
  npi: provider.npi,
  provider_name: provider.provider_name || '',
  first_name: provider.first_name || '',
  last_name: provider.last_name || '',
  organization_name: provider.organization_name || '',
  provider_type: provider.provider_type || '',
  address: {
    line1: provider.address_1 || '',
    line2: provider.address_2 || '',
    city: provider.city || '',
    state: provider.state || '',
    postal_code: provider.postal_code || '',
    country_code: provider.country_code || ''
  },
  phone: provider.phone || '',
  status: provider.status || ''
});

export const getProviderFilters = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FiltersResponse> => {
  const [states, specialties] = await Promise.all([
    prisma.$queryRaw`
      SELECT DISTINCT state 
      FROM providers 
      WHERE state IS NOT NULL 
      ORDER BY state
    `,
    prisma.$queryRaw`
      SELECT DISTINCT taxonomy_code 
      FROM provider_taxonomies 
      WHERE primary_taxonomy = true 
      AND taxonomy_code IS NOT NULL
      ORDER BY taxonomy_code
    `
  ]);

  return {
    states: (states as { state: string }[]).map(s => s.state),
    specialties: (specialties as { taxonomy_code: string }[]).map(s => s.taxonomy_code)
  };
};

export const getProviderDetails = async (
  request: FastifyRequest<{ Params: { npi: string } }>,
  reply: FastifyReply
): Promise<Provider | null> => {
  const { npi } = request.params;

  const provider = await prisma.providers.findUnique({
    where: { npi },
    include: {
      provider_taxonomies: {
        select: {
          taxonomy_code: true,
          taxonomy_desc: true,
          primary_taxonomy: true,
          license: true
        }
      },
      medicare_services: {
        select: {
          hcpcs_code: true,
          hcpcs_description: true,
          service_count: true,
          beneficiary_count: true,
          submitted_charge: true,
          allowed_amount: true,
          payment_amount: true,
          service_year: true,
          place_of_service: true
        }
      }
    }
  });

  if (!provider) {
    reply.code(404).send({ error: 'Provider not found' });
    return null;
  }

  // Calculate Medicare service summary
  const medicareSummary: MedicareSummary = provider.medicare_services.reduce((acc, service) => ({
    totalServices: acc.totalServices + Number(service.service_count || 0),
    totalBeneficiaries: acc.totalBeneficiaries + Number(service.beneficiary_count || 0),
    totalPayments: acc.totalPayments + Number(service.payment_amount || 0),
    totalSubmitted: acc.totalSubmitted + Number(service.submitted_charge || 0),
    totalAllowed: acc.totalAllowed + Number(service.allowed_amount || 0)
  }), {
    totalServices: 0,
    totalBeneficiaries: 0,
    totalPayments: 0,
    totalSubmitted: 0,
    totalAllowed: 0
  });

  // Format the response
  const formattedProvider = {
    npi: provider.npi,
    provider_name: provider.provider_name,
    first_name: provider.first_name,
    last_name: provider.last_name,
    organization_name: provider.organization_name,
    provider_type: provider.provider_type || '',
    address: {
      line1: provider.address_1,
      line2: provider.address_2,
      city: provider.city,
      state: provider.state,
      postal_code: provider.postal_code,
      country_code: provider.country_code
    },
    phone: provider.phone,
    email: provider.email,
    direct_address: provider.direct_address,
    fhir_endpoint: provider.fhir_endpoint,
    enumeration_date: provider.enumeration_date,
    last_updated: provider.last_updated,
    status: provider.status,
    taxonomies: provider.provider_taxonomies.map(tax => ({
      code: tax.taxonomy_code,
      description: tax.taxonomy_desc,
      isPrimary: tax.primary_taxonomy,
      license: tax.license
    })),
    medicare: {
      summary: medicareSummary,
      services: provider.medicare_services.map(service => ({
        code: service.hcpcs_code || '',
        description: service.hcpcs_description || '',
        serviceCount: Number(service.service_count || 0),
        beneficiaryCount: Number(service.beneficiary_count || 0),
        submittedCharge: Number(service.submitted_charge || 0),
        allowedAmount: Number(service.allowed_amount || 0),
        paymentAmount: Number(service.payment_amount || 0),
        year: service.service_year || null,
        placeOfService: service.place_of_service || null
      }))
    }
  };

  return formattedProvider as Provider;
}; 