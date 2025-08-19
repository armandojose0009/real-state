import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

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

  async findAll(tenantId: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { tenantId, deletedAt: IsNull() },
      relations: ['property'],
    });
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
