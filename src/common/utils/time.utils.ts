export class TimeUtils {
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }
}
