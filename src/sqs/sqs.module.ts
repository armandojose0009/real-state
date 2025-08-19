import { Module, Global } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SQSClient } from '@aws-sdk/client-sqs';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SQS_CLIENT',
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

        return new SQSClient({
          region,
          endpoint,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      },
      inject: [ConfigService],
    },
    SqsService,
  ],
  exports: [SqsService],
})
export class SqsModule {}
