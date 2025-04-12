import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('Testing provider query...');
    
    const providers = await prisma.providers.findMany({
      where: {
        medicare_services: {
          some: {
            service_count: {
              gt: 0
            }
          }
        }
      },
      include: {
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
        },
        provider_taxonomies: true
      },
      take: 2
    });

    console.log('Query results:');
    console.log(JSON.stringify(providers, null, 2));

  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery(); 