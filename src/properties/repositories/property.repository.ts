import { EntityRepository, Repository } from 'typeorm';
import { Property } from '../entities/property.entity';

@EntityRepository(Property)
export class PropertyRepository extends Repository<Property> {
  async findWithFilters(filterDto: any, tenantId: string) {
    const query = this.createQueryBuilder('property')
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
      if (filterDto.minPrice) {
        query.andWhere('property.valuation >= :minPrice', {
          minPrice: filterDto.minPrice,
        });
      }
      if (filterDto.maxPrice) {
        query.andWhere('property.valuation <= :maxPrice', {
          maxPrice: filterDto.maxPrice,
        });
      }
    }

    if (filterDto.search) {
      query.andWhere('property.address LIKE :search', {
        search: `%${filterDto.search}%`,
      });
    }

    if (filterDto.sort) {
      query.orderBy(`property.${filterDto.sort}`, filterDto.order || 'ASC');
    }

    if (filterDto.limit) {
      query.take(filterDto.limit);
    }

    if (filterDto.offset) {
      query.skip(filterDto.offset);
    }

    return query.getManyAndCount();
  }
}
