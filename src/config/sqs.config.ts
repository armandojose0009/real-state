import { registerAs } from '@nestjs/config';

export default registerAs('sqs', () => ({
  region: process.env.AWS_REGION,
  endpoint: process.env.SQS_ENDPOINT,
  queueName: process.env.SQS_QUEUE_NAME,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}));
