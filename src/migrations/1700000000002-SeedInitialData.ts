import { MigrationInterface, QueryRunner } from 'typeorm';
import { generateSeedData } from '../seeds';

export class SeedInitialData1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { tenants, properties, listings, transactions } =
      await generateSeedData();

    for (const tenant of tenants) {
      await queryRunner.query(
        `INSERT INTO "tenant" (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)`,
        [tenant.id, tenant.name, tenant.email, tenant.password, tenant.role],
      );
    }

    for (const property of properties) {
      await queryRunner.query(
        `INSERT INTO "property" (
          id, address, city, state, zip_code, sector, property_type, 
          location, valuation, bedrooms, bathrooms, square_feet, 
          year_built, tenant_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326), $10, $11, $12, $13, $14, $15)`,
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

    for (const listing of listings) {
      await queryRunner.query(
        `INSERT INTO "listing" (
          id, title, description, price, status, listed_at, expires_at, 
          property_id, tenant_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          listing.id,
          listing.title,
          listing.description,
          listing.price,
          listing.status,
          listing.listedAt,
          listing.expiresAt,
          listing.propertyId,
          listing.tenantId,
        ],
      );
    }

    for (const transaction of transactions) {
      await queryRunner.query(
        `INSERT INTO "transaction" (
          id, type, amount, transaction_date, description, 
          property_id, tenant_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          transaction.id,
          transaction.type,
          transaction.amount,
          transaction.transactionDate,
          transaction.description,
          transaction.propertyId,
          transaction.tenantId,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "transaction"`);
    await queryRunner.query(`DELETE FROM "listing"`);
    await queryRunner.query(`DELETE FROM "property"`);
    await queryRunner.query(`DELETE FROM "tenant"`);
  }
}
