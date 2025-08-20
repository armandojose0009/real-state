import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { Point } from 'geojson';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Property } from '../properties/entities/property.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { UserRole } from '../auth/enums/user-role.enum';

config();

const NUM_TENANTS = 100;
const NUM_PROPERTIES = 200000;
const NUM_LISTINGS = 400000;
const NUM_TRANSACTIONS = 400000;

const generateLocation = (): Point => {
  return {
    type: 'Point',
    coordinates: [
      faker.location.longitude({ min: -180, max: 180 }),
      faker.location.latitude({ min: -90, max: 90 }),
    ],
  };
};

const generateBathrooms = (): number => {
  return faker.number.int({ min: 1, max: 3 });
};

const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa'];
const transactionTypes = ['Purchase', 'Rent', 'Maintenance', 'Tax', 'Fee'];
const listingStatuses = ['active', 'pending', 'sold'];

export async function generateSeedData() {
  console.log('Generating seed data...');

  const tenants: Tenant[] = [];
  for (let i = 0; i < NUM_TENANTS; i++) {
    const tenant = new Tenant();
    tenant.id = faker.string.uuid();
    tenant.name = faker.person.fullName();
    tenant.email = i === 0 ? 'admin@admin.com' : faker.internet.email();
    tenant.password = await bcrypt.hash('Password123!', 10);
    tenant.role = i === 0 ? UserRole.ADMIN : UserRole.USER;

    tenants.push(tenant);
  }

  console.log(`${tenants.length} tenants generated`);

  const properties: Property[] = [];
  for (let i = 0; i < NUM_PROPERTIES; i++) {
    const tenant = tenants[i % tenants.length];
    const yearBuilt = faker.number.int({ min: 1950, max: 2023 });

    const property = new Property();
    property.id = faker.string.uuid();
    property.address = faker.location.streetAddress();
    property.city = faker.location.city();
    property.state = faker.location.state({ abbreviated: true });
    property.zipCode = faker.location.zipCode();
    property.sector = faker.location.county();
    property.propertyType = faker.helpers.arrayElement(propertyTypes);
    property.location = generateLocation();
    property.valuation = faker.number.int({ min: 50000, max: 5000000 });
    property.bedrooms = faker.number.int({ min: 1, max: 6 });
    property.bathrooms = generateBathrooms();
    property.squareFeet = faker.number.int({ min: 500, max: 5000 });
    property.yearBuilt = yearBuilt;
    property.tenantId = tenant.id;

    properties.push(property);

    if (i % 5000 === 0) {
      console.log(`${i} properties generated...`);
    }
  }

  console.log(`${properties.length} properties generated`);

  const listings: Listing[] = [];
  for (let i = 0; i < NUM_LISTINGS; i++) {
    const property = properties[i % properties.length];
    const listedAt = faker.date.past({ years: 2 });
    const expiresAt = new Date(listedAt);
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const listing = new Listing();
    listing.id = faker.string.uuid();
    listing.title = `${faker.helpers.arrayElement(['Beautiful', 'Spacious', 'Luxury'])} ${property.propertyType} in ${property.city}`;
    listing.description = faker.lorem.paragraphs(3);
    listing.price = Math.round(
      property.valuation * (0.7 + Math.random() * 0.6),
    );
    listing.status = faker.helpers.arrayElement(listingStatuses);
    listing.listedAt = listedAt;
    listing.expiresAt = expiresAt;
    listing.propertyId = property.id;
    listing.tenantId = property.tenantId;

    listings.push(listing);

    if (i % 10000 === 0) {
      console.log(`${i} listings generated...`);
    }
  }

  console.log(`${listings.length} listings generated`);

  const transactions: Transaction[] = [];
  for (let i = 0; i < NUM_TRANSACTIONS; i++) {
    const property = properties[i % properties.length];
    const transactionDate = faker.date.past({ years: 1 });

    const transaction = new Transaction();
    transaction.id = faker.string.uuid();
    transaction.type = faker.helpers.arrayElement(transactionTypes);
    transaction.amount = faker.number.int({
      min: 500,
      max: Math.floor(property.valuation * 0.2),
    });
    transaction.transactionDate = transactionDate;
    transaction.description = faker.finance.transactionDescription();
    transaction.propertyId = property.id;
    transaction.tenantId = property.tenantId;

    transactions.push(transaction);

    if (i % 10000 === 0) {
      console.log(`${i} transactions generated...`);
    }
  }

  console.log(`${transactions.length} transactions generated`);
  console.log('Seed data generated successfully!');

  return { tenants, properties, listings, transactions };
}

export async function insertSeedData() {
  console.log('Connecting to database...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'real_estate',
    entities: [Tenant, Property, Listing, Transaction],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const { tenants, properties, listings, transactions } =
      await generateSeedData();

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      console.log('Inserting tenants...');
      const tenantRepository = dataSource.getRepository(Tenant);
      for (let i = 0; i < tenants.length; i += 100) {
        const batch = tenants.slice(i, i + 100);
        await tenantRepository.save(batch);
        console.log(
          `Inserted ${Math.min(i + 100, tenants.length)}/${tenants.length} tenants`,
        );
      }

      console.log('Inserting properties...');
      const propertyRepository = dataSource.getRepository(Property);
      for (let i = 0; i < properties.length; i += 100) {
        const batch = properties.slice(i, i + 100);
        await propertyRepository.save(batch);
        console.log(
          `Inserted ${Math.min(i + 100, properties.length)}/${properties.length} properties`,
        );
      }

      console.log('Inserting listings...');
      const listingRepository = dataSource.getRepository(Listing);
      for (let i = 0; i < listings.length; i += 100) {
        const batch = listings.slice(i, i + 100);
        await listingRepository.save(batch);
        console.log(
          `Inserted ${Math.min(i + 100, listings.length)}/${listings.length} listings`,
        );
      }

      console.log('Inserting transactions...');
      const transactionRepository = dataSource.getRepository(Transaction);
      for (let i = 0; i < transactions.length; i += 100) {
        const batch = transactions.slice(i, i + 100);
        await transactionRepository.save(batch);
        console.log(
          `Inserted ${Math.min(i + 100, transactions.length)}/${transactions.length} transactions`,
        );
      }

      await queryRunner.commitTransaction();
      console.log('✅ All data inserted successfully!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error during insertion:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Error connecting to the database:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Connection closed');
    }
  }
}

if (require.main === module) {
  insertSeedData().catch((error) => {
    console.error('Error running seeds:', error);
    process.exit(1);
  });
}
