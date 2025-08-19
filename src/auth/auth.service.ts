import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Tenant } from '../tenants/entities/tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoggerUtils } from '../common/utils/logger.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({ where: { email } });
    if (!tenant || !(await bcrypt.compare(password, tenant.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return tenant;
  }

  async login(loginDto: LoginDto) {
    const tenant = await this.validateUser(loginDto.email, loginDto.password);
    const payload: JwtPayload = {
      sub: tenant.id,
      email: tenant.email,
      role: tenant.role,
      tenantId: tenant.id,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        secret: process.env.REFRESH_TOKEN_SECRET,
      }),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      const tenant = await this.tenantsRepository.findOne({
        where: { id: payload.sub },
      });
      if (!tenant) throw new UnauthorizedException('Invalid refresh token');

      const newPayload: JwtPayload = {
        sub: tenant.id,
        email: tenant.email,
        role: tenant.role,
        tenantId: tenant.id,
      };
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
          secret: process.env.REFRESH_TOKEN_SECRET,
        }),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message ? error.message : String(error);
      LoggerUtils.error('Invalid refresh token', errorMessage);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
