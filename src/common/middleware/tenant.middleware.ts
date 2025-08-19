import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request as ExpressRequest, Response, NextFunction } from 'express';

interface UserWithTenant {
  tenantId?: string;
  [key: string]: any;
}

interface RequestWithTenant extends ExpressRequest {
  user?: UserWithTenant;
  tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: RequestWithTenant, res: Response, next: NextFunction) {
    const headerTenantId = req.headers['x-tenant-id'];
    let tenantId: string | undefined;

    if (typeof headerTenantId === 'string') {
      tenantId = headerTenantId;
    } else if (Array.isArray(headerTenantId)) {
      tenantId = headerTenantId[0];
    } else if (req.user?.tenantId && typeof req.user.tenantId === 'string') {
      tenantId = req.user.tenantId;
    }

    if (tenantId) {
      req.tenantId = tenantId;
    }
    next();
  }
}
