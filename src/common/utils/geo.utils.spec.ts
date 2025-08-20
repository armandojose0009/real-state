import { GeoUtils } from './geo.utils';
import { Point } from 'geojson';

describe('GeoUtils', () => {
  describe('createPoint', () => {
    it('should create a GeoJSON Point with correct coordinates', () => {
      const lat = 40.7128;
      const lng = -74.0060;

      const result = GeoUtils.createPoint(lat, lng);

      expect(result).toEqual({
        type: 'Point',
        coordinates: [-74.0060, 40.7128], // Note: longitude first, then latitude
      });
    });

    it('should handle zero coordinates', () => {
      const lat = 0;
      const lng = 0;

      const result = GeoUtils.createPoint(lat, lng);

      expect(result).toEqual({
        type: 'Point',
        coordinates: [0, 0],
      });
    });

    it('should handle negative coordinates', () => {
      const lat = -33.8688;
      const lng = 151.2093;

      const result = GeoUtils.createPoint(lat, lng);

      expect(result).toEqual({
        type: 'Point',
        coordinates: [151.2093, -33.8688],
      });
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points in kilometers', () => {
      const point1: Point = { type: 'Point', coordinates: [-74.0060, 40.7128] }; // New York
      const point2: Point = { type: 'Point', coordinates: [-118.2437, 34.0522] }; // Los Angeles

      const distance = GeoUtils.calculateDistance(point1, point2, 'km');

      // Approximate distance between NYC and LA is about 3944 km
      expect(distance).toBeCloseTo(3944, -2); // Within 100km accuracy
    });

    it('should calculate distance between two points in miles', () => {
      const point1: Point = { type: 'Point', coordinates: [-74.0060, 40.7128] }; // New York
      const point2: Point = { type: 'Point', coordinates: [-118.2437, 34.0522] }; // Los Angeles

      const distance = GeoUtils.calculateDistance(point1, point2, 'mi');

      // Approximate distance between NYC and LA is about 2451 miles
      expect(distance).toBeCloseTo(2451, -2); // Within 100 miles accuracy
    });

    it('should default to kilometers when unit not specified', () => {
      const point1: Point = { type: 'Point', coordinates: [-74.0060, 40.7128] };
      const point2: Point = { type: 'Point', coordinates: [-73.9857, 40.7484] }; // Times Square

      const distance = GeoUtils.calculateDistance(point1, point2);

      // Short distance should be in single digits for km
      expect(distance).toBeLessThan(10);
      expect(distance).toBeGreaterThan(0);
    });

    it('should return 0 for identical points', () => {
      const point1: Point = { type: 'Point', coordinates: [-74.0060, 40.7128] };
      const point2: Point = { type: 'Point', coordinates: [-74.0060, 40.7128] };

      const distance = GeoUtils.calculateDistance(point1, point2);

      expect(distance).toBeCloseTo(0, 5);
    });

    it('should handle points on opposite sides of the earth', () => {
      const point1: Point = { type: 'Point', coordinates: [0, 0] }; // Equator, Prime Meridian
      const point2: Point = { type: 'Point', coordinates: [180, 0] }; // Equator, International Date Line

      const distance = GeoUtils.calculateDistance(point1, point2, 'km');

      // Half the circumference of Earth is approximately 20,015 km
      expect(distance).toBeCloseTo(20015, -2);
    });

    it('should handle very close points', () => {
      const point1: Point = { type: 'Point', coordinates: [-74.0060, 40.7128] };
      const point2: Point = { type: 'Point', coordinates: [-74.0061, 40.7129] }; // Very close

      const distance = GeoUtils.calculateDistance(point1, point2, 'km');

      expect(distance).toBeLessThan(1); // Should be less than 1 km
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('deg2rad (private method behavior)', () => {
    it('should correctly convert degrees to radians through distance calculation', () => {
      // Test the deg2rad functionality indirectly through distance calculation
      const point1: Point = { type: 'Point', coordinates: [0, 0] };
      const point2: Point = { type: 'Point', coordinates: [90, 0] }; // 90 degrees longitude difference

      const distance = GeoUtils.calculateDistance(point1, point2, 'km');

      // Quarter of Earth's circumference at equator
      expect(distance).toBeCloseTo(10007, -2);
    });
  });
});