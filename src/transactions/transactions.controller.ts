import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
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
import { Transaction } from './entities/transaction.entity';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('v1/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created',
    type: Transaction,
  })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @TenantId() tenantId: string,
  ) {
    return this.transactionsService.create({
      ...createTransactionDto,
      tenantId,
    });
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    type: [Transaction],
  })
  findAll(@TenantId() tenantId: string) {
    return this.transactionsService.findAll(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    type: Transaction,
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.transactionsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated',
    type: Transaction,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @TenantId() tenantId: string,
  ) {
    return this.transactionsService.update(id, updateTransactionDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    return this.transactionsService.remove(id, tenantId);
  }
}
