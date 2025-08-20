import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { Point } from 'geojson';

const NUM_TENANTS = 10;
const NUM_PROPERTIES = 20000;
const NUM_LISTINGS = 40000;
const NUM_TRANSACTIONS = 40000;

interface TenantSeed {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

interface PropertySeed {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  sector: string;
  propertyType: string;
  location: Point;
  valuation: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  tenantId: string;
}

interface ListingSeed {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  listedAt: Date;
  expiresAt: Date;
  propertyId: string;
  tenantId: string;
}

interface TransactionSeed {
  id: string;
  type: string;
  amount: number;
  transactionDate: Date;
  description: string;
  propertyId: string;
  tenantId: string;
}

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
  const wholeBaths = faker.number.int({ min: 1, max: 3 });
  const hasHalfBath = faker.datatype.boolean();
  return hasHalfBath ? wholeBaths + 0.5 : wholeBaths;
};

const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa'];
const transactionTypes = ['Purchase', 'Rent', 'Maintenance', 'Tax', 'Fee'];
const listingStatuses = ['active', 'pending', 'sold'];

export async function generateSeedData() {
  console.log('Generando datos de seed...');

  const tenants: TenantSeed[] = [];
  for (let i = 0; i < NUM_TENANTS; i++) {
    tenants.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await bcrypt.hash('Password123!', 10),
      role: i === 0 ? 'admin' : 'user',
    });
  }

  console.log(`${tenants.length} tenants generados`);

  const properties: PropertySeed[] = [];
  for (let i = 0; i < NUM_PROPERTIES; i++) {
    const tenant = tenants[i % tenants.length];
    const yearBuilt = faker.number.int({ min: 1950, max: 2023 });

    properties.push({
      id: faker.string.uuid(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode(),
      sector: faker.location.county(),
      propertyType: faker.helpers.arrayElement(propertyTypes),
      location: generateLocation(),
      valuation: faker.number.int({ min: 50000, max: 5000000 }),
      bedrooms: faker.number.int({ min: 1, max: 6 }),
      bathrooms: generateBathrooms(),
      squareFeet: faker.number.int({ min: 500, max: 5000 }),
      yearBuilt,
      tenantId: tenant.id,
    });

    if (i % 5000 === 0) {
      console.log(`${i} propiedades generadas...`);
    }
  }

  console.log(`${properties.length} propiedades generadas`);

  const listings: ListingSeed[] = [];
  for (let i = 0; i < NUM_LISTINGS; i++) {
    const property = properties[i % properties.length];
    const listedAt = faker.date.past({ years: 2 });
    const expiresAt = new Date(listedAt);
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    listings.push({
      id: faker.string.uuid(),
      title: `${faker.helpers.arrayElement(['Beautiful', 'Spacious', 'Luxury'])} ${property.propertyType} in ${property.city}`,
      description: faker.lorem.paragraphs(3),
      price: Math.round(property.valuation * (0.7 + Math.random() * 0.6)),
      status: faker.helpers.arrayElement(listingStatuses),
      listedAt,
      expiresAt,
      propertyId: property.id,
      tenantId: property.tenantId,
    });

    if (i % 10000 === 0) {
      console.log(`${i} listados generados...`);
    }
  }

  console.log(`${listings.length} listados generados`);

  const transactions: TransactionSeed[] = [];
  for (let i = 0; i < NUM_TRANSACTIONS; i++) {
    const property = properties[i % properties.length];
    const transactionDate = faker.date.past({ years: 1 });

    transactions.push({
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(transactionTypes),
      amount: faker.number.int({
        min: 500,
        max: Math.floor(property.valuation * 0.2),
      }),
      transactionDate,
      description: faker.finance.transactionDescription(),
      propertyId: property.id,
      tenantId: property.tenantId,
    });

    if (i % 10000 === 0) {
      console.log(`${i} transacciones generadas...`);
    }
  }

  console.log(`${transactions.length} transacciones generadas`);
  console.log('Datos de seed generados exitosamente!');

  return { tenants, properties, listings, transactions };
}

if (require.main === module) {
  generateSeedData().catch(console.error);
}
