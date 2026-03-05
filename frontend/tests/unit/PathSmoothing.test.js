/**
 * Unit Tests for Path Smoothing
 */

const NavigationMesh = require('../../src/systems/NavigationMesh');
const PathfindingEngine = require('../../src/systems/PathfindingEngine');

describe('Path Smoothing - Unit Tests', () => {
  describe('Path Simplification', () => {
    test('simplifies straight line to two points', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      const simplified = pathfinder.simplifyPath(path);
      
      // Straight diagonal should simplify significantly
      expect(simplified.length).toBeLessThan(path.length);
      expect(simplified[0]).toEqual(path[0]);
      expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
    });

    test('preserves corners in L-shaped path', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Create wall forcing L-shaped path
      for (let i = 8; i <= 12; i++) {
        navMesh.markObstacle(10, i);
      }
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(5, 10, 15, 10);
      
      if (path) {
        const simplified = pathfinder.simplifyPath(path);
        
        // Should have at least 3 points (start, corner, end)
        expect(simplified.length).toBeGreaterThanOrEqual(3);
      }
    });

    test('handles already simple path', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const simplePath = [
        { x: 1, z: 1 },
        { x: 5, z: 5 },
        { x: 9, z: 9 }
      ];
      
      const simplified = pathfinder.simplifyPath(simplePath);
      
      // Already simple, should not change much
      expect(simplified.length).toBeLessThanOrEqual(simplePath.length);
    });

    test('respects tolerance parameter', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      
      const simplified1 = pathfinder.simplifyPath(path, 0.1);
      const simplified2 = pathfinder.simplifyPath(path, 1.0);
      
      // Larger tolerance should result in more simplification
      expect(simplified2.length).toBeLessThanOrEqual(simplified1.length);
    });
  });

  describe('Catmull-Rom Smoothing', () => {
    test('smooths path with spline interpolation', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      const smoothed = pathfinder.smoothPath(path, 5);
      
      // Should have more points
      expect(smoothed.length).toBeGreaterThan(path.length);
      
      // All points should be walkable
      for (const waypoint of smoothed) {
        expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
      }
    });

    test('preserves endpoints', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      const smoothed = pathfinder.smoothPath(path, 5);
      
      // First and last should match
      expect(smoothed[0]).toEqual(path[0]);
      expect(smoothed[smoothed.length - 1]).toEqual(path[path.length - 1]);
    });

    test('handles short paths', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const shortPath = [
        { x: 1, z: 1 },
        { x: 2, z: 2 }
      ];
      
      const smoothed = pathfinder.smoothPath(shortPath, 5);
      
      // Should return original for very short paths
      expect(smoothed).toEqual(shortPath);
    });

    test('adjusts segment count', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      
      const smoothed3 = pathfinder.smoothPath(path, 3);
      const smoothed10 = pathfinder.smoothPath(path, 10);
      
      // More segments should result in more points
      expect(smoothed10.length).toBeGreaterThan(smoothed3.length);
    });

    test('skips non-walkable interpolated points', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Add some obstacles
      navMesh.markObstacle(10, 10, 1);
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(5, 5, 15, 15);
      
      if (path) {
        const smoothed = pathfinder.smoothPath(path, 5);
        
        // All smoothed points should be walkable
        for (const waypoint of smoothed) {
          expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
        }
      }
    });
  });

  describe('Catmull-Rom Helper Function', () => {
    test('interpolates between control points', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const p0 = { x: 0, z: 0 };
      const p1 = { x: 1, z: 1 };
      const p2 = { x: 2, z: 2 };
      const p3 = { x: 3, z: 3 };
      
      const interpolated = pathfinder.catmullRom(p0, p1, p2, p3, 0.5);
      
      // Should be between p1 and p2
      expect(interpolated.x).toBeGreaterThan(p1.x);
      expect(interpolated.x).toBeLessThan(p2.x);
      expect(interpolated.z).toBeGreaterThan(p1.z);
      expect(interpolated.z).toBeLessThan(p2.z);
    });

    test('returns p1 at t=0', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const p0 = { x: 0, z: 0 };
      const p1 = { x: 1, z: 1 };
      const p2 = { x: 2, z: 2 };
      const p3 = { x: 3, z: 3 };
      
      const interpolated = pathfinder.catmullRom(p0, p1, p2, p3, 0);
      
      expect(interpolated.x).toBeCloseTo(p1.x, 5);
      expect(interpolated.z).toBeCloseTo(p1.z, 5);
    });

    test('returns p2 at t=1', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const p0 = { x: 0, z: 0 };
      const p1 = { x: 1, z: 1 };
      const p2 = { x: 2, z: 2 };
      const p3 = { x: 3, z: 3 };
      
      const interpolated = pathfinder.catmullRom(p0, p1, p2, p3, 1);
      
      expect(interpolated.x).toBeCloseTo(p2.x, 5);
      expect(interpolated.z).toBeCloseTo(p2.z, 5);
    });
  });

  describe('Combined Simplification and Smoothing', () => {
    test('simplify then smooth produces valid path', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      const simplified = pathfinder.simplifyPath(path);
      const smoothed = pathfinder.smoothPath(simplified, 5);
      
      // All points should be walkable
      for (const waypoint of smoothed) {
        expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
      }
      
      // Should have reasonable number of points
      expect(smoothed.length).toBeGreaterThan(0);
    });

    test('smooth then simplify produces valid path', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      const smoothed = pathfinder.smoothPath(path, 3);
      const simplified = pathfinder.simplifyPath(smoothed);
      
      // All points should be walkable
      for (const waypoint of simplified) {
        expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
      }
      
      // Should have reasonable number of points
      expect(simplified.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty path', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const emptyPath = [];
      
      expect(() => pathfinder.simplifyPath(emptyPath)).not.toThrow();
      expect(() => pathfinder.smoothPath(emptyPath)).not.toThrow();
    });

    test('handles single point path', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const singlePath = [{ x: 5, z: 5 }];
      
      const simplified = pathfinder.simplifyPath(singlePath);
      const smoothed = pathfinder.smoothPath(singlePath);
      
      expect(simplified).toEqual(singlePath);
      expect(smoothed).toEqual(singlePath);
    });

    test('handles path with duplicate points', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const pathWithDuplicates = [
        { x: 1, z: 1 },
        { x: 1, z: 1 },
        { x: 2, z: 2 },
        { x: 2, z: 2 },
        { x: 3, z: 3 }
      ];
      
      expect(() => pathfinder.simplifyPath(pathWithDuplicates)).not.toThrow();
      expect(() => pathfinder.smoothPath(pathWithDuplicates)).not.toThrow();
    });
  });
});
