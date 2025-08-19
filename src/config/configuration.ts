import { registerAs } from '@nestjs/config';

export const parseEnvInt = (
  value: string | undefined,
  defaultValue: number,
): number => {
  return value ? parseInt(value, 10) : defaultValue;
};

export default registerAs('config', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseEnvInt(process.env.PORT, 3000),
  allowedOrigins:
    process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || '*',
  logLevel: process.env.LOG_LEVEL || 'info',

  database: {
    host: process.env.DB_HOST,
    port: parseEnvInt(process.env.DB_PORT, 5432),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: parseEnvInt(process.env.REDIS_PORT, 6379),
    ttl: parseEnvInt(process.env.REDIS_TTL, 3600),
    max: parseEnvInt(process.env.REDIS_MAX, 1000),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sqsEndpoint: process.env.SQS_ENDPOINT,
    sqsQueueName: process.env.SQS_QUEUE_NAME,
  },

  throttle: {
    ttl: parseEnvInt(process.env.THROTTLE_TTL, 60),
    limit: parseEnvInt(process.env.THROTTLE_LIMIT, 100),
  },

  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: process.env.SWAGGER_TITLE || 'Real Estate API',
    description:
      process.env.SWAGGER_DESCRIPTION || 'Property management system API',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'docs',
  },
}));
