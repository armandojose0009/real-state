import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SqsService } from './sqs.service';

describe('SqsService', () => {
  let service: SqsService;
  let mockSqsClient: jest.Mocked<any>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockSqsClient = {
      send: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqsService,
        {
          provide: 'SQS_CLIENT',
          useValue: mockSqsClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SqsService>(SqsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockBody = { test: 'data' };
      const messageGroupId = 'test-group';
      const deduplicationId = 'unique-id';
      const mockMessageId = 'message-123';

      mockConfigService.get.mockReturnValue('test-queue');
      mockSqsClient.send
        .mockResolvedValueOnce({ QueueUrl: 'https://sqs.region.amazonaws.com/123456789012/test-queue' })
        .mockResolvedValueOnce({ MessageId: mockMessageId });

      const result = await service.sendMessage(mockBody, messageGroupId, deduplicationId);

      expect(mockSqsClient.send).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockMessageId);
    });

    it('should handle send message error', async () => {
      const mockBody = { test: 'data' };
      const messageGroupId = 'test-group';
      const deduplicationId = 'unique-id';

      mockConfigService.get.mockReturnValue('test-queue');
      mockSqsClient.send
        .mockResolvedValueOnce({ QueueUrl: 'https://sqs.region.amazonaws.com/123456789012/test-queue' })
        .mockRejectedValueOnce(new Error('SQS error'));

      await expect(service.sendMessage(mockBody, messageGroupId, deduplicationId))
        .rejects.toThrow('SQS operation failed: SQS error');
    });

    it('should handle missing queue URL', async () => {
      mockConfigService.get.mockReturnValue('test-queue');
      mockSqsClient.send.mockResolvedValueOnce({});

      await expect(service.sendMessage({}, 'group', 'id'))
        .rejects.toThrow('Queue URL not found in response');
    });

    it('should handle missing message ID', async () => {
      mockConfigService.get.mockReturnValue('test-queue');
      mockSqsClient.send
        .mockResolvedValueOnce({ QueueUrl: 'https://sqs.region.amazonaws.com/123456789012/test-queue' })
        .mockResolvedValueOnce({});

      await expect(service.sendMessage({}, 'group', 'id'))
        .rejects.toThrow('Message ID not received');
    });
  });

  describe('initialize', () => {
    it('should initialize queue URL', async () => {
      mockConfigService.get.mockReturnValue('test-queue');
      mockSqsClient.send.mockResolvedValue({ QueueUrl: 'https://sqs.region.amazonaws.com/123456789012/test-queue' });

      await service.initialize();

      expect(mockSqsClient.send).toHaveBeenCalledTimes(1);
    });

    it('should handle queue URL error', async () => {
      mockConfigService.get.mockReturnValue('test-queue');
      mockSqsClient.send.mockRejectedValue(new Error('Queue not found'));

      await expect(service.initialize()).rejects.toThrow('Queue not found');
    });
  });
});