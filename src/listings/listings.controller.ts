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
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingFilterDto } from './dto/listing-filter.dto';
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
import { Listing } from './entities/listing.entity';

@ApiTags('listings')
@ApiBearerAuth()
@Controller('v1/listings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new listing' })
  @ApiResponse({ status: 201, description: 'Listing created', type: Listing })
  create(
    @Body() createListingDto: CreateListingDto,
    @TenantId() tenantId: string,
  ) {
    return this.listingsService.create({ ...createListingDto, tenantId });
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all listings' })
  @ApiResponse({
    status: 200,
    description: 'List of listings',
    type: [Listing],
  })
  findAll(@Query() filterDto: ListingFilterDto, @TenantId() tenantId: string) {
    return this.listingsService.findAll(filterDto, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get listing details' })
  @ApiResponse({ status: 200, description: 'Listing details', type: Listing })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.listingsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update listing' })
  @ApiResponse({ status: 200, description: 'Listing updated', type: Listing })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateListingDto: UpdateListingDto,
    @TenantId() tenantId: string,
  ) {
    return this.listingsService.update(id, updateListingDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete listing' })
  @ApiResponse({ status: 200, description: 'Listing deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    return this.listingsService.remove(id, tenantId);
  }
}
