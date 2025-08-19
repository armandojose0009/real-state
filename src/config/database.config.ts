import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Property } from '../properties/entities/property.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { parseEnvInt } from './configuration';
export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseEnvInt(process.env.DB_PORT, 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Property, Listing, Transaction, Tenant],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: [__dirname + '/../../migrations/*.ts'],
  migrationsRun: true,
  extra: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  },
});
