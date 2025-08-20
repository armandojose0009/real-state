import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingFilterDto } from './dto/listing-filter.dto';
import { PaginationResponse } from '../common/dto/pagination-response.dto';
import { createPaginationResponse } from '../common/utils/pagination.util';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {}

  async create(createListingDto: CreateListingDto): Promise<Listing> {
    const listing = this.listingsRepository.create(createListingDto);
    return this.listingsRepository.save(listing);
  }

  async findAll(filterDto: ListingFilterDto, tenantId: string): Promise<PaginationResponse<Listing>> {
    const query = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.property', 'property')
      .where('listing.tenantId = :tenantId', { tenantId })
      .andWhere('listing.deletedAt IS NULL');

    if (filterDto.status) {
      query.andWhere('listing.status = :status', { status: filterDto.status });
    }
    if (filterDto.minPrice || filterDto.maxPrice) {
      query.andWhere('listing.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: filterDto.minPrice || 0,
        maxPrice: filterDto.maxPrice || Number.MAX_SAFE_INTEGER,
      });
    }
    if (filterDto.search) {
      query.andWhere('listing.title ILIKE :search', {
        search: `%${filterDto.search}%`,
      });
    }
    if (filterDto.sort) {
      const orderDirection = filterDto.order || 'ASC';
      query.orderBy(`listing.${filterDto.sort}`, orderDirection);
    }

    query.take(filterDto.limit || 10);
    query.skip(filterDto.offset || 0);

    const [data, total] = await query.getManyAndCount();
    return createPaginationResponse(
      data,
      total,
      filterDto.limit || 10,
      filterDto.offset || 0,
    );
  }

  async findOne(id: string, tenantId: string): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
      relations: ['property'],
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async update(
    id: string,
    updateListingDto: UpdateListingDto,
    tenantId: string,
  ): Promise<Listing> {
    const listing = await this.findOne(id, tenantId);
    Object.assign(listing, updateListingDto);
    return this.listingsRepository.save(listing);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const listing = await this.findOne(id, tenantId);
    listing.deletedAt = new Date();
    await this.listingsRepository.save(listing);
  }
}
