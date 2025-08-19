import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PropertyImportService } from './property-import.service';
import { Logger } from '@nestjs/common';

interface ImportJobData {
  fileBuffer: string;
  tenantId: string;
  idempotencyKey: string;
}

@Processor('property-import')
export class PropertyImportProcessor {
  private readonly logger = new Logger(PropertyImportProcessor.name);

  constructor(private readonly propertyImportService: PropertyImportService) {}

  @Process()
  async handleImport(job: Job<ImportJobData>) {
    try {
      this.logger.log(`Processing import job: ${job.data.idempotencyKey}`);

      const fileBuffer = Buffer.from(job.data.fileBuffer, 'base64');

      await this.propertyImportService.processImport(
        fileBuffer,
        job.data.tenantId,
      );

      this.logger.log(`Import job completed: ${job.data.idempotencyKey}`);
    } catch (error) {
      this.logger.error(`Import job failed: ${error.message}`);
      throw error;
    }
  }
}
