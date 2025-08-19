import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PropertyImportService } from './property-import.service';
import { Logger } from '@nestjs/common';

@Processor('property-import')
export class PropertyImportProcessor {
  private readonly logger = new Logger(PropertyImportProcessor.name);

  constructor(private readonly propertyImportService: PropertyImportService) {}

  @Process()
  async handleImport(
    job: Job<{ fileBuffer: string; tenantId: string; idempotencyKey: string }>,
  ) {
    try {
      this.logger.log(`Processing import job: ${job.data.idempotencyKey}`);

      const fileBuffer = Buffer.from(job.data.fileBuffer, 'base64');

      await this.propertyImportService.processImportJob(
        fileBuffer,
        job.data.tenantId,
        job.data.idempotencyKey,
      );

      this.logger.log(`Import job completed: ${job.data.idempotencyKey}`);
    } catch (error) {
      this.logger.error(`Import job failed: ${error.message}`);
      throw error;
    }
  }
}
