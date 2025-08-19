import { Injectable, Logger } from '@nestjs/common';
import { SqsService } from '../../sqs/sqs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { parse } from 'csv-parse/sync';

@Injectable()
export class PropertyImportService {
  private logger = new Logger(PropertyImportService.name);

  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private sqsService: SqsService,
  ) {}

  async enqueueImportJob(
    fileBuffer: Buffer,
    tenantId: string,
    idempotencyKey: string,
  ) {
    await this.sqsService.sendMessage(
      {
        fileBuffer: fileBuffer.toString('base64'),
        tenantId,
        idempotencyKey,
      },
      'property-import',
      idempotencyKey,
    );
  }

  async processImport(fileBuffer: Buffer, tenantId: string): Promise<void> {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
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
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(record.longitude),
            parseFloat(record.latitude),
          ],
        },
        valuation: parseFloat(record.valuation),
        bedrooms: parseInt(record.bedrooms),
        bathrooms: parseInt(record.bathrooms),
        squareFeet: parseInt(record.squareFeet),
        yearBuilt: parseInt(record.yearBuilt),
        tenantId,
      }));

      await this.propertyRepository
        .createQueryBuilder()
        .insert()
        .into(Property)
        .values(properties)
        .orUpdate(['valuation', 'location'], ['address', 'tenantId'])
        .execute();
    }
  }
}
