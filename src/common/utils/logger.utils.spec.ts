import { createLogger, logError, logInfo, logWarn, logDebug } from './logger.utils';

describe('LoggerUtils', () => {
  describe('createLogger', () => {
    it('should create logger with context', () => {
      const logger = createLogger('TestContext');
      expect(logger).toBeDefined();
      expect(logger.context).toBe('TestContext');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should create logger methods that call respective log functions', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const logger = createLogger('TestContext');
      
      logger.error('Test error');
      
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] ERROR: Test error');
      consoleSpy.mockRestore();
    });
  });

  describe('logError', () => {
    it('should log error message with context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      logError('Test error message', 'TestContext');
      
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] ERROR: Test error message');
      consoleSpy.mockRestore();
    });

    it('should log error message without context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      logError('Test error message');
      
      expect(consoleSpy).toHaveBeenCalledWith('ERROR: Test error message');
      consoleSpy.mockRestore();
    });
  });

  describe('logInfo', () => {
    it('should log info message with context', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      logInfo('Test info message', 'TestContext');
      
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] INFO: Test info message');
      consoleSpy.mockRestore();
    });

    it('should log info message without context', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      logInfo('Test info message');
      
      expect(consoleSpy).toHaveBeenCalledWith('INFO: Test info message');
      consoleSpy.mockRestore();
    });
  });

  describe('logWarn', () => {
    it('should log warning message', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      logWarn('Test warning message', 'TestContext');
      
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] WARN: Test warning message');
      consoleSpy.mockRestore();
    });
  });

  describe('logDebug', () => {
    it('should log debug message', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      logDebug('Test debug message', 'TestContext');
      
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] DEBUG: Test debug message');
      consoleSpy.mockRestore();
    });
  });
});