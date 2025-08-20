import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { generateSeedData } from './seeds';

config();

async function runSeeds() {
  console.log('Iniciando ejecución de seeds...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'real_estate',
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Conectado a la base de datos');

    const { tenants, properties, listings, transactions } =
      await generateSeedData();

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      console.log('Insertando tenants...');

      for (let i = 0; i < tenants.length; i += 100) {
        const batch = tenants.slice(i, i + 100);
        const values = batch
          .map(
            (tenant) =>
              `('${tenant.id}', '${tenant.name.replace(/'/g, "''")}', '${tenant.email}', '${tenant.password}', '${tenant.role}')`,
          )
          .join(',');

        await queryRunner.query(`
          INSERT INTO "tenant" (id, name, email, password, role) 
          VALUES ${values}
        `);
        console.log(
          `Insertados ${Math.min(i + 100, tenants.length)}/${tenants.length} tenants`,
        );
      }

      console.log('Insertando propiedades...');

      for (let i = 0; i < properties.length; i += 50) {
        const batch = properties.slice(i, i + 50);
        for (const property of batch) {
          await queryRunner.query(
            `
            INSERT INTO "property" (
              id, address, city, state, zip_code, sector, property_type, 
              location, valuation, bedrooms, bathrooms, square_feet, 
              year_built, tenant_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326), $10, $11, $12, $13, $14, $15)
          `,
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
        console.log(
          `Insertadas ${Math.min(i + 50, properties.length)}/${properties.length} propiedades`,
        );
      }

      console.log('Insertando listados...');

      for (let i = 0; i < listings.length; i += 100) {
        const batch = listings.slice(i, i + 100);
        const values = batch
          .map(
            (listing) =>
              `('${listing.id}', '${listing.title.replace(/'/g, "''")}', '${listing.description.replace(/'/g, "''")}', ${listing.price}, '${listing.status}', '${listing.listedAt.toISOString()}', '${listing.expiresAt.toISOString()}', '${listing.propertyId}', '${listing.tenantId}')`,
          )
          .join(',');

        await queryRunner.query(`
          INSERT INTO "listing" (id, title, description, price, status, listed_at, expires_at, property_id, tenant_id) 
          VALUES ${values}
        `);
        console.log(
          `Insertados ${Math.min(i + 100, listings.length)}/${listings.length} listados`,
        );
      }

      console.log('Insertando transacciones...');

      for (let i = 0; i < transactions.length; i += 100) {
        const batch = transactions.slice(i, i + 100);
        const values = batch
          .map(
            (transaction) =>
              `('${transaction.id}', '${transaction.type}', ${transaction.amount}, '${transaction.transactionDate.toISOString()}', '${transaction.description.replace(/'/g, "''")}', '${transaction.propertyId}', '${transaction.tenantId}')`,
          )
          .join(',');

        await queryRunner.query(`
          INSERT INTO "transaction" (id, type, amount, transaction_date, description, property_id, tenant_id) 
          VALUES ${values}
        `);
        console.log(
          `Insertadas ${Math.min(i + 100, transactions.length)}/${transactions.length} transacciones`,
        );
      }

      await queryRunner.commitTransaction();
      console.log('✅ Todos los datos insertados exitosamente!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error durante la inserción:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
  } finally {
    await dataSource.destroy();
    console.log('Conexión cerrada');
  }
}

if (require.main === module) {
  runSeeds().catch((error) => {
    console.error('Error ejecutando seeds:', error);
    process.exit(1);
  });
}

export { runSeeds };
