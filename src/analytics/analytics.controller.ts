import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { TenantId } from '../common/decorators/tenant.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('v1/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('property-distribution')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get property distribution by sector/type' })
  getPropertyDistribution(@TenantId() tenantId: string) {
    return this.analyticsService.getPropertyDistribution(tenantId);
  }

  @Get('monthly-trends')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get monthly price trends' })
  getMonthlyTrends(@TenantId() tenantId: string) {
    return this.analyticsService.getMonthlyTrends(tenantId);
  }

  @Get('valuation-growth')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get yearly valuation growth by sector' })
  getValuationGrowth(@TenantId() tenantId: string) {
    return this.analyticsService.getValuationGrowth(tenantId);
  }
}
