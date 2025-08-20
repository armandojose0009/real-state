import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  GetQueueUrlCommand,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private queueUrl: string;

  constructor(
    @Inject('SQS_CLIENT') private readonly sqsClient: SQSClient,
    private configService: ConfigService,
  ) {}

  async initialize(): Promise<void> {
    if (!this.queueUrl) {
      this.queueUrl = await this.getQueueUrl();
    }
  }

  private async getQueueUrl(): Promise<string> {
    try {
      const queueName =
        this.configService.get<string>('SQS_QUEUE_NAME') ||
        'property-import-queue';

      const command = new GetQueueUrlCommand({ QueueName: queueName });
      const response = await this.sqsClient.send(command);

      if (!response.QueueUrl) {
        throw new Error('Queue URL not found in response');
      }

      return response.QueueUrl;
    } catch (error) {
      this.logger.error(`Failed to get queue URL: ${error.message}`);
      throw error;
    }
  }

  async sendMessage(
    body: Record<string, any>,
    messageGroupId: string,
    deduplicationId: string,
  ): Promise<string> {
    try {
      await this.initialize();
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(body),
        MessageGroupId: messageGroupId,
        MessageDeduplicationId: deduplicationId,
      });

      const result = await this.sqsClient.send(command);

      if (!result.MessageId) {
        throw new Error('Message ID not received');
      }

      this.logger.log(`Message sent with ID: ${result.MessageId}`);
      return result.MessageId;
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      throw new Error(`SQS operation failed: ${error.message}`);
    }
  }
}
