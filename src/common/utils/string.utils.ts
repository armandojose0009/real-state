export class StringUtils {
  static generateRandom(length = 16): string {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }

  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static toSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
}
