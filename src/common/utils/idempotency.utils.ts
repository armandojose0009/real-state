import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class IdempotencyUtils {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async checkDuplicate(key: string): Promise<boolean> {
    const exists = await this.cacheManager.get(key);
    if (exists) return true;
    await this.cacheManager.set(key, 'processing', 60 * 60 * 24);
    return false;
  }

  async markComplete(key: string, result: any): Promise<void> {
    await this.cacheManager.set(key, result, 60 * 60 * 24);
  }
}
