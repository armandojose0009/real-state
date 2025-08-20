import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PropertyImportController } from './import/property-import.controller';
import { PropertyImportService } from './import/property-import.service';
import { Property } from './entities/property.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { SqsModule } from '../sqs/sqs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, Tenant, Listing, Transaction]),
    CacheModule.register({
      ttl: 3600,
      max: 1000,
    }),
    SqsModule,
  ],
  providers: [PropertiesService, PropertyImportService],
  controllers: [PropertiesController, PropertyImportController],
  exports: [PropertiesService],
})
export class PropertiesModule {}
