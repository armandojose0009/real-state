import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { PaginationResponse } from '../common/dto/pagination-response.dto';
import { createPaginationResponse } from '../common/utils/pagination.util';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction =
      this.transactionsRepository.create(createTransactionDto);
    return this.transactionsRepository.save(transaction);
  }

  async findAll(filterDto: TransactionFilterDto, tenantId: string): Promise<PaginationResponse<Transaction>> {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.property', 'property')
      .where('transaction.tenantId = :tenantId', { tenantId })
      .andWhere('transaction.deletedAt IS NULL');

    if (filterDto.type) {
      query.andWhere('transaction.type = :type', { type: filterDto.type });
    }
    if (filterDto.minAmount || filterDto.maxAmount) {
      query.andWhere('transaction.amount BETWEEN :minAmount AND :maxAmount', {
        minAmount: filterDto.minAmount || 0,
        maxAmount: filterDto.maxAmount || Number.MAX_SAFE_INTEGER,
      });
    }
    if (filterDto.search) {
      query.andWhere('transaction.description ILIKE :search', {
        search: `%${filterDto.search}%`,
      });
    }
    if (filterDto.sort) {
      const orderDirection = filterDto.order || 'ASC';
      query.orderBy(`transaction.${filterDto.sort}`, orderDirection);
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

  async findOne(id: string, tenantId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
      relations: ['property'],
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    tenantId: string,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, tenantId);
    Object.assign(transaction, updateTransactionDto);
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const transaction = await this.findOne(id, tenantId);
    transaction.deletedAt = new Date();
    await this.transactionsRepository.save(transaction);
  }
}
