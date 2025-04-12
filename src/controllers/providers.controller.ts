import { prisma } from '../app';
import { SearchParams, SearchResponse, FiltersResponse } from '../models/interfaces/provider.interface';
import { FastifyRequest, FastifyReply } from 'fastify';

export async function searchProviders(params: SearchParams): Promise<SearchResponse> {
  const { query, state, specialty, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      query ? {
        OR: [
          { provider_name: { contains: query, mode: 'insensitive' } },
          { first_name: { contains: query, mode: 'insensitive' } },
          { last_name: { contains: query, mode: 'insensitive' } },
          { organization_name: { contains: query, mode: 'insensitive' } },
        ],
      } : {},
      state ? { state: { equals: state, mode: 'insensitive' } } : {},
      specialty ? { primary_taxonomy: { equals: specialty, mode: 'insensitive' } } : {},
    ],
  };

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take: limit,
      orderBy: { provider_name: 'asc' },
      include: {
        taxonomies: true,
        medicareServices: true,
      }
    }),
    prisma.provider.count({ where }),
  ]);

  return {
    providers,
    total,
    page,
    limit,
  };
}

export async function getProviderFilters(): Promise<FiltersResponse> {
  const [states, specialties] = await Promise.all([
    prisma.provider.findMany({
      select: { state: true },
      distinct: ['state'],
      orderBy: { state: 'asc' },
    }),
    prisma.provider.findMany({
      select: { primary_taxonomy: true },
      distinct: ['primary_taxonomy'],
      orderBy: { primary_taxonomy: 'asc' },
    }),
  ]);

  return {
    states: states.map((s: { state: string }) => s.state).filter((state: string | null) => state !== null),
    specialties: specialties.map((s: { primary_taxonomy: string }) => s.primary_taxonomy).filter((specialty: string | null) => specialty !== null),
  };
}

export async function getProviderDetail(request: FastifyRequest<{ Params: { npi: string } }>, reply: FastifyReply) {
  try {
    const { npi } = request.params;

    const provider = await prisma.provider.findUnique({
      where: { npi },
      include: {
        taxonomies: true,
        medicareServices: true,
      }
    });

    if (!provider) {
      return reply.status(404).send({
        error: 'Provider not found'
      });
    }

    return reply.send(provider);
  } catch (error) {
    console.error('Error fetching provider detail:', error);
    return reply.status(500).send({
      error: 'Failed to fetch provider detail'
    });
  }
} 