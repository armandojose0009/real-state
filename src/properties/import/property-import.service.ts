import { Injectable, Logger } from '@nestjs/common';
import { SqsService } from '../../sqs/sqs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { parse } from 'csv-parse/sync';

interface CsvRecord {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  sector: string;
  propertyType: string;
  longitude: number;
  latitude: number;
  valuation: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
}

@Injectable()
export class PropertyImportService {
  private logger = new Logger(PropertyImportService.name);

  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private sqsService: SqsService,
  ) {}

  async processImport(fileBuffer: Buffer, tenantId: string): Promise<void> {
    const records: CsvRecord[] = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        if (context.header) return value;

        const column = String(context.column);

        if (['longitude', 'latitude', 'valuation'].includes(column)) {
          return parseFloat(value);
        }
        if (
          ['bedrooms', 'bathrooms', 'squareFeet', 'yearBuilt'].includes(column)
        ) {
          return parseInt(value, 10);
        }
        return value;
      },
    });

    const batchSize = 500;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const properties = batch.map((record) => ({
        address: record.address,
        city: record.city,
        state: record.state,
        zipCode: record.zipCode,
        sector: record.sector,
        propertyType: record.propertyType,
        longitude: record.longitude,
        latitude: record.latitude,
        valuation: record.valuation,
        bedrooms: record.bedrooms,
        bathrooms: record.bathrooms,
        squareFeet: record.squareFeet,
        yearBuilt: record.yearBuilt,
        tenantId,
      }));

      try {
        await this.propertyRepository
          .createQueryBuilder()
          .insert()
          .into(Property)
          .values(properties)
          .orUpdate(
            ['valuation', 'bedrooms', 'bathrooms', 'squareFeet', 'yearBuilt'],
            ['address', 'tenantId'],
          )
          .execute();
      } catch (error) {
        if (error.code === '23503') { // Foreign key violation
          this.logger.error(`Tenant ${tenantId} does not exist. Skipping batch.`);
          continue;
        }
        throw error;
      }
    }
  }

  async enqueueImportJob(
    fileBuffer: Buffer,
    tenantId: string,
    idempotencyKey: string,
  ) {
    try {
      await this.sqsService.sendMessage(
        {
          fileBuffer: fileBuffer.toString('base64'),
          tenantId,
          idempotencyKey,
        },
        'property-import',
        idempotencyKey,
      );
    } catch (error) {
      this.logger.warn('SQS not available, processing import directly');
      await this.processImport(fileBuffer, tenantId);
    }
  }
}
