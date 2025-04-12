import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check providers count
    const providersCount = await prisma.providers.count();
    console.log(`📊 Total providers: ${providersCount}`);

    // Check medicare services count
    const medicareServicesCount = await prisma.medicare_services.count();
    console.log(`💰 Total medicare services: ${medicareServicesCount}`);

    // Check taxonomies count
    const taxonomiesCount = await prisma.provider_taxonomies.count();
    console.log(`🏷️ Total taxonomies: ${taxonomiesCount}`);

    // Get a sample provider with medicare data
    const sampleProvider = await prisma.providers.findFirst({
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
        medicare_services: true,
        provider_taxonomies: true
      }
    });

    if (sampleProvider) {
      console.log('\nSample provider with Medicare data:');
      console.log(JSON.stringify(sampleProvider, null, 2));
    } else {
      console.log('\nNo providers found with Medicare data');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 