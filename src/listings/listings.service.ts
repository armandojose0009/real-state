import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

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

  async findAll(tenantId: string): Promise<Listing[]> {
    return this.listingsRepository.find({
      where: { tenantId, deletedAt: IsNull() },
      relations: ['property'],
    });
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
