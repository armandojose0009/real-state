import { v4 as uuidv4 } from 'uuid';
import { Point } from 'geojson';
import { addDays, subDays, subYears } from 'date-fns';

interface Tenant {
  id: string;
  name: string;
}

interface Property {
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

interface Listing {
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

interface Transaction {
  id: string;
  type: string;
  amount: number;
  transactionDate: Date;
  description: string;
  propertyId: string;
  tenantId: string;
}

const propertyTypes = [
  'Residential',
  'Commercial',
  'Industrial',
  'Land',
  'Special Purpose',
];

const sectors = [
  'North',
  'South',
  'East',
  'West',
  'Central',
  'Downtown',
  'Uptown',
  'Suburb',
  'Rural',
];

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
];

const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'GA', 'NC', 'WA'];

const listingStatuses = ['Active', 'Pending', 'Sold', 'Expired', 'Withdrawn'];

const transactionTypes = ['Sale', 'Lease', 'Tax', 'Maintenance', 'Improvement'];

export function generateSeedData(): {
  tenants: Tenant[];
  properties: Property[];
  listings: Listing[];
  transactions: Transaction[];
} {
  // Generate tenants
  const tenants: Tenant[] = [
    {
      id: uuidv4(),
      name: 'Real Estate Inc.',
    },
    {
      id: uuidv4(),
      name: 'Property Management LLC',
    },
  ];

  // Generate properties
  const properties: Property[] = [];
  for (let i = 0; i < 100000; i++) {
    const tenantIndex = i % 2;
    const cityIndex = i % cities.length;
    const stateIndex = i % states.length;
    const sectorIndex = i % sectors.length;
    const propertyTypeIndex = i % propertyTypes.length;

    const latitude = 34.0522 + (Math.random() * 10 - 5);
    const longitude = -118.2437 + (Math.random() * 10 - 5);

    properties.push({
      id: uuidv4(),
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Maple', 'Cedar'][Math.floor(Math.random() * 5)]} St`,
      city: cities[cityIndex],
      state: states[stateIndex],
      zipCode: `${Math.floor(Math.random() * 99999) + 10000}`,
      sector: sectors[sectorIndex],
      propertyType: propertyTypes[propertyTypeIndex],
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      valuation: Math.floor(Math.random() * 2000000) + 50000,
      bedrooms: Math.floor(Math.random() * 5) + 1,
      bathrooms: Math.floor(Math.random() * 4) + 1,
      squareFeet: Math.floor(Math.random() * 3000) + 500,
      yearBuilt: Math.floor(Math.random() * 50) + 1970,
      tenantId: tenants[tenantIndex].id,
    });
  }

  // Generate listings
  const listings: Listing[] = [];
  for (let i = 0; i < 200000; i++) {
    const propertyIndex = i % properties.length;
    const statusIndex = i % listingStatuses.length;
    const listedAt = subDays(new Date(), Math.floor(Math.random() * 365));
    const expiresAt = addDays(listedAt, Math.floor(Math.random() * 180) + 30);

    listings.push({
      id: uuidv4(),
      title: `${properties[propertyIndex].propertyType} Property in ${properties[propertyIndex].sector}`,
      description: `Beautiful ${properties[propertyIndex].propertyType.toLowerCase()} property located in ${properties[propertyIndex].city}.`,
      price: properties[propertyIndex].valuation * (0.9 + Math.random() * 0.2),
      status: listingStatuses[statusIndex],
      listedAt,
      expiresAt,
      propertyId: properties[propertyIndex].id,
      tenantId: properties[propertyIndex].tenantId,
    });
  }

  // Generate transactions
  const transactions: Transaction[] = [];
  for (let i = 0; i < 150000; i++) {
    const propertyIndex = i % properties.length;
    const typeIndex = i % transactionTypes.length;
    const transactionDate = subDays(
      new Date(),
      Math.floor(Math.random() * 365),
    );

    transactions.push({
      id: uuidv4(),
      type: transactionTypes[typeIndex],
      amount:
        typeIndex === 0
          ? properties[propertyIndex].valuation * (0.8 + Math.random() * 0.4)
          : Math.floor(Math.random() * 10000) + 100,
      transactionDate,
      description: `${transactionTypes[typeIndex]} for property at ${properties[propertyIndex].address}`,
      propertyId: properties[propertyIndex].id,
      tenantId: properties[propertyIndex].tenantId,
    });
  }

  return { tenants, properties, listings, transactions };
}
