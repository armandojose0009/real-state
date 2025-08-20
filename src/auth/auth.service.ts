import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tenant } from '../tenants/entities/tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private jwtService: JwtService,
    private configService: ConfigService,
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
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
        secret: this.configService.get('jwt.refreshSecret'),
      }),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
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
          expiresIn: this.configService.get('jwt.refreshExpiresIn'),
          secret: this.configService.get('jwt.refreshSecret'),
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
