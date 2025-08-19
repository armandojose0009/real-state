import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { generateSeedData } from './generate-test-data';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const connection = getConnection();

  try {
    console.log('Starting seed...');
    const { tenants, properties, listings, transactions } = generateSeedData();

    await connection.transaction(async (manager) => {
      console.log('Clearing existing data...');
      await manager.query(
        'TRUNCATE TABLE transaction, listing, property, tenant RESTART IDENTITY CASCADE',
      );

      console.log('Seeding tenants...');
      await manager.insert('tenant', tenants);

      console.log('Seeding properties...');
      for (const property of properties) {
        await manager.query(
          `INSERT INTO property (
            id, address, city, state, zip_code, sector, property_type, 
            location, valuation, bedrooms, bathrooms, square_feet, 
            year_built, tenant_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326), $10, $11, $12, $13, $14, $15, NOW(), NOW()`,
          [
            property.id,
            property.address,
            property.city,
            property.state,
            property.zipCode,
            property.sector,
            property.propertyType,
            property.location.coordinates[0],
            property.location.coordinates[1],
            property.valuation,
            property.bedrooms,
            property.bathrooms,
            property.squareFeet,
            property.yearBuilt,
            property.tenantId,
          ],
        );
      }

      console.log('Seeding listings...');
      await manager.insert('listing', listings);

      console.log('Seeding transactions...');
      await manager.insert('transaction', transactions);
    });

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

seed();
