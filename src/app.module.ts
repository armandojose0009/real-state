import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs';
import { AwsCredentialIdentity } from '@aws-sdk/types';

import configuration from './config/configuration';
import { databaseConfig } from './config/database.config';
import jwtConfig from './config/jwt.config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { ListingsModule } from './listings/listings.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TenantsModule } from './tenants/tenants.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SqsModule } from './sqs/sqs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, jwtConfig],
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get<string>('REDIS_HOST') || 'localhost',
            port: parseInt(config.get<string>('REDIS_PORT') || '6379'),
          },
          ttl: 3600,
        }),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get<string>('REDIS_PORT') || '6379'),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => [
        {
          ttl: config.get<number>('THROTTLE_TTL') || 60,
          limit: config.get<number>('THROTTLE_LIMIT') || 100,
        },
      ],
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrometheusModule.register(),
    TerminusModule,
    HealthModule,
    AuthModule,
    PropertiesModule,
    ListingsModule,
    TransactionsModule,
    TenantsModule,
    AnalyticsModule,
    SqsModule,
  ],
  providers: [
    Logger,
    {
      provide: SQSClient,
      useFactory: (configService: ConfigService): SQSClient => {
        const region = configService.get<string>('AWS_REGION');
        const endpoint = configService.get<string>('SQS_ENDPOINT');
        const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        );

        if (!region || !accessKeyId || !secretAccessKey) {
          throw new Error('Missing AWS configuration');
        }

        const config: SQSClientConfig = {
          region,
          endpoint,
          credentials: {
            accessKeyId,
            secretAccessKey,
          } as AwsCredentialIdentity,
        };

        return new SQSClient(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [SQSClient, Logger],
})
export class AppModule {}
