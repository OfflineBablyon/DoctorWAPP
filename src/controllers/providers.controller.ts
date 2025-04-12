import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { SearchParams, SearchResponse, FiltersResponse, Provider, MedicareSummary } from '../models/interfaces/provider.interface';

const prisma = new PrismaClient();

export const searchProviders = async (
  request: FastifyRequest<{ Querystring: SearchParams }>,
  reply: FastifyReply
): Promise<SearchResponse> => {
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
    serviceYear
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

  // Add Medicare service filters with proper type conversion
  if (minServiceCount || maxServiceCount || minPaymentAmount || maxPaymentAmount || hcpcsCode || serviceYear) {
    where.medicare_services = {
      some: {
        AND: [
          minServiceCount ? { service_count: { gte: Number(minServiceCount) } } : {},
          maxServiceCount ? { service_count: { lte: Number(maxServiceCount) } } : {},
          minPaymentAmount ? { payment_amount: { gte: Number(minPaymentAmount) } } : {},
          maxPaymentAmount ? { payment_amount: { lte: Number(maxPaymentAmount) } } : {},
          hcpcsCode ? { hcpcs_code: hcpcsCode } : {},
          serviceYear ? { service_year: Number(serviceYear) } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    };
  }

  const [providers, total] = await Promise.all([
    prisma.providers.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { provider_name: 'asc' },
      include: {
        provider_taxonomies: true,
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
    }),
    prisma.providers.count({ where })
  ]);

  return {
    providers: providers as unknown as Provider[],
    total,
    page,
    limit
  };
};

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
    provider_type: provider.provider_type,
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
      services: provider.medicare_services.map(svc => ({
        code: svc.hcpcs_code,
        description: svc.hcpcs_description,
        serviceCount: Number(svc.service_count),
        beneficiaryCount: Number(svc.beneficiary_count),
        submittedCharge: Number(svc.submitted_charge),
        allowedAmount: Number(svc.allowed_amount),
        paymentAmount: Number(svc.payment_amount),
        year: svc.service_year,
        placeOfService: svc.place_of_service
      }))
    }
  };

  return formattedProvider as Provider;
}; 