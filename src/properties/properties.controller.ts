import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { TenantId } from '../common/decorators/tenant.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Property } from './entities/property.entity';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('v1/properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property created', type: Property })
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @TenantId() tenantId: string,
  ) {
    return this.propertiesService.create({ ...createPropertyDto, tenantId });
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all properties' })
  @ApiResponse({
    status: 200,
    description: 'List of properties',
    type: [Property],
  })
  findAll(@Query() filterDto: PropertyFilterDto, @TenantId() tenantId: string) {
    return this.propertiesService.findAll(filterDto, tenantId);
  }

  @Get('nearby')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get nearby properties' })
  @ApiResponse({
    status: 200,
    description: 'List of nearby properties',
    type: [Property],
  })
  async findByRadius(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number,
    @TenantId() tenantId: string,
  ) {
    return this.propertiesService.findByRadius(lat, lng, radius, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get property details' })
  @ApiResponse({ status: 200, description: 'Property details', type: Property })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.propertiesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update property' })
  @ApiResponse({ status: 200, description: 'Property updated', type: Property })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @TenantId() tenantId: string,
  ) {
    return this.propertiesService.update(id, updatePropertyDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete property' })
  @ApiResponse({ status: 200, description: 'Property deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    return this.propertiesService.remove(id, tenantId);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore deleted property' })
  @ApiResponse({
    status: 200,
    description: 'Property restored',
    type: Property,
  })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.propertiesService.restore(id, tenantId);
  }
}
