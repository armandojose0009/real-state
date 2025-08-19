import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import * as bcrypt from 'bcrypt';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantsRepository.findOne({
      where: { email: createTenantDto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const password = await bcrypt.hash(createTenantDto.password, 10);
    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      password,
    });

    return this.tenantsRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      relations: ['properties', 'transactions', 'listings'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async findOneByEmail(email: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({ where: { email } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with email ${email} not found`);
    }
    return tenant;
  }
}
