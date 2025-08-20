import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';
import { PaginationResponse } from '../common/dto/pagination-response.dto';
import { createPaginationResponse } from '../common/utils/pagination.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class PropertiesService {
  private readonly CACHE_TTL = 3600;

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const property = this.propertyRepository.create(createPropertyDto);
    if (!createPropertyDto.tenantId) {
      throw new Error('tenantId is required to invalidate cache');
    }
    await this.invalidateCache(createPropertyDto.tenantId);
    return this.propertyRepository.save(property);
  }

  async findAll(filterDto: PropertyFilterDto, tenantId: string): Promise<PaginationResponse<Property>> {
    const cacheKey = this.getCacheKey(filterDto, tenantId);
    const cached = await this.cacheManager.get<PaginationResponse<Property>>(cacheKey);

    if (cached) {
      return cached;
    }

    const query = this.buildQuery(filterDto, tenantId);
    const [data, total] = await query.getManyAndCount();
    const response = createPaginationResponse(
      data,
      total,
      filterDto.limit || 10,
      filterDto.offset || 0,
    );

    await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);
    return response;
  }

  async findOne(id: string, tenantId: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    tenantId: string,
  ): Promise<Property> {
    const property = await this.findOne(id, tenantId);
    Object.assign(property, updatePropertyDto);
    await this.invalidateCache(tenantId);
    return this.propertyRepository.save(property);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const property = await this.findOne(id, tenantId);
    property.deletedAt = new Date();
    await this.propertyRepository.save(property);
    await this.invalidateCache(tenantId);
  }

  async restore(id: string, tenantId: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id, tenantId, deletedAt: Not(IsNull()) },
    });
    if (!property) throw new NotFoundException('Deleted property not found');
    property.deletedAt = null as unknown as Date;
    await this.invalidateCache(tenantId);
    return this.propertyRepository.save(property);
  }

  async findByRadius(
    lat: number,
    lng: number,
    radius: number,
    tenantId: string,
  ): Promise<Property[]> {
    const cacheKey = `properties:radius:${tenantId}:${lat}:${lng}:${radius}`;
    const cached = await this.cacheManager.get<Property[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .where('property.tenantId = :tenantId', { tenantId })
      .andWhere('property.deletedAt IS NULL')
      .andWhere(
        `ST_DWithin(
          ST_MakePoint(:lng, :lat)::geography,
          property.location::geography,
          :radius
        )`,
        { lat, lng, radius },
      )
      .getMany();

    await this.cacheManager.set(cacheKey, properties, this.CACHE_TTL);
    return properties;
  }

  private buildQuery(filterDto: PropertyFilterDto, tenantId: string) {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .where('property.tenantId = :tenantId', { tenantId })
      .andWhere('property.deletedAt IS NULL');

    if (filterDto.sector) {
      query.andWhere('property.sector = :sector', { sector: filterDto.sector });
    }
    if (filterDto.propertyType) {
      query.andWhere('property.propertyType = :propertyType', {
        propertyType: filterDto.propertyType,
      });
    }
    if (filterDto.minPrice || filterDto.maxPrice) {
      query.andWhere('property.valuation BETWEEN :minPrice AND :maxPrice', {
        minPrice: filterDto.minPrice || 0,
        maxPrice: filterDto.maxPrice || Number.MAX_SAFE_INTEGER,
      });
    }
    if (filterDto.search) {
      query.andWhere('property.address ILIKE :search', {
        search: `%${filterDto.search}%`,
      });
    }
    if (filterDto.sort) {
      const orderDirection = filterDto.order || 'ASC';
      query.orderBy(`property.${filterDto.sort}`, orderDirection);
    }

    query.take(filterDto.limit || 10);
    query.skip(filterDto.offset || 0);

    return query;
  }

  private getCacheKey(filterDto: PropertyFilterDto, tenantId: string): string {
    const { sort, order, ...rest } = filterDto as any;
    return `properties:${tenantId}:${JSON.stringify(rest)}`;
  }

  private async invalidateCache(tenantId: string): Promise<void> {
    const pattern = `properties:${tenantId}:*`;
    const cache = this.cacheManager as any;
    const keys = await cache.keys(pattern);

    if (keys?.length) {
      await cache.del(keys);
    }
  }
}
