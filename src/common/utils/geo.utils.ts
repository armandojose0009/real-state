import { Point } from 'geojson';

export class GeoUtils {
  static createPoint(lat: number, lng: number): Point {
    return {
      type: 'Point',
      coordinates: [lng, lat],
    };
  }

  static calculateDistance(
    point1: Point,
    point2: Point,
    unit: 'km' | 'mi' = 'km',
  ): number {
    const [lng1, lat1] = point1.coordinates;
    const [lng2, lat2] = point2.coordinates;
    const R = unit === 'km' ? 6371 : 3956;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
