import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertyImportService } from './property-import.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/user-role.enum';
import { TenantId } from '../../common/decorators/tenant.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IdempotencyKeyDto } from './dto/idempotency-key.dto';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('v1/imports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyImportController {
  constructor(private readonly propertyImportService: PropertyImportService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: IdempotencyKeyDto })
  @ApiOperation({ summary: 'Import properties from CSV' })
  @ApiResponse({ status: 202, description: 'Import job accepted' })
  async importProperties(
    @UploadedFile() file: Express.Multer.File,
    @Body() { idempotencyKey }: IdempotencyKeyDto,
    @TenantId() tenantId: string,
  ) {
    await this.propertyImportService.enqueueImportJob(
      file.buffer,
      tenantId,
      idempotencyKey,
    );
    return { message: 'Import job accepted', idempotencyKey };
  }
}
