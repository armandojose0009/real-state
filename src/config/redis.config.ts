import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisOptions } from 'ioredis';
import { parseEnvInt } from './configuration';
export const redisConfig = (): CacheModuleOptions & RedisOptions => ({
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: parseEnvInt(process.env.REDIS_PORT, 10),
  ttl: 60 * 60,
  max: 1000,
  isGlobal: true,
});
