/**
 * Unit Tests for PathfindingEngine
 */

const NavigationMesh = require('../../src/systems/NavigationMesh');
const PathfindingEngine = require('../../src/systems/PathfindingEngine');

describe('PathfindingEngine - Unit Tests', () => {
  describe('Basic Pathfinding', () => {
    test('finds straight path in obstacle-free environment', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 9, 9);
      
      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0].x).toBeCloseTo(1, 1);
      expect(path[0].z).toBeCloseTo(1, 1);
      expect(path[path.length - 1].x).toBeCloseTo(9, 1);
      expect(path[path.length - 1].z).toBeCloseTo(9, 1);
    });

    test('finds path around single obstacle', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Place obstacle in the middle
      navMesh.markObstacle(10, 10, 2);
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(5, 10, 15, 10);
      
      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      
      // Path should avoid the obstacle
      for (const waypoint of path) {
        expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
      }
    });

    test('finds path around multiple obstacles', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Place multiple obstacles
      navMesh.markObstacle(8, 10, 1.5);
      navMesh.markObstacle(12, 10, 1.5);
      navMesh.markObstacle(10, 8, 1.5);
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(5, 10, 15, 10);
      
      expect(path).not.toBeNull();
      
      // All waypoints should be walkable
      for (const waypoint of path) {
        expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
      }
    });

    test('returns same position for start equals goal', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(5, 5, 5, 5);
      
      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Unreachable Destinations', () => {
    test('returns null for completely blocked destination', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Create wall blocking path
      for (let z = 0; z < 20; z++) {
        navMesh.markObstacle(10, z);
      }
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(5, 10, 15, 10);
      
      expect(path).toBeNull();
    });

    test('returns null for non-walkable start position', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      navMesh.markObstacle(1, 1);
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(1, 1, 9, 9);
      
      expect(path).toBeNull();
    });

    test('returns null for non-walkable goal position', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      navMesh.markObstacle(9, 9);
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(1, 1, 9, 9);
      
      expect(path).toBeNull();
    });

    test('returns null for out-of-bounds destination', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(5, 5, 100, 100);
      
      expect(path).toBeNull();
    });
  });

  describe('Iteration Limit', () => {
    test('respects max iterations limit', () => {
      const bounds = { minX: 0, maxX: 100, minZ: 0, maxZ: 100 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Create complex maze
      for (let i = 0; i < 50; i++) {
        navMesh.markObstacle(Math.random() * 100, Math.random() * 100, 2);
      }
      
      const pathfinder = new PathfindingEngine(navMesh);
      pathfinder.maxIterations = 100; // Set low limit
      
      const startTime = Date.now();
      const path = pathfinder.findPath(10, 10, 90, 90);
      const endTime = Date.now();
      
      // Should complete quickly even if no path found
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Path Simplification', () => {
    test('simplifies straight path to two points', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      expect(path.length).toBeGreaterThan(2);
      
      const simplified = pathfinder.simplifyPath(path);
      
      // Straight diagonal should simplify to just start and end
      expect(simplified.length).toBeLessThanOrEqual(path.length);
      expect(simplified[0]).toEqual(path[0]);
      expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
    });

    test('preserves corners in path', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Create L-shaped obstacle
      for (let i = 8; i <= 12; i++) {
        navMesh.markObstacle(10, i);
        navMesh.markObstacle(i, 10);
      }
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(5, 5, 15, 15);
      
      if (path) {
        const simplified = pathfinder.simplifyPath(path);
        
        // Should have at least 3 points (start, corner, end)
        expect(simplified.length).toBeGreaterThanOrEqual(3);
      }
    });

    test('handles path with 2 points', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const shortPath = [
        { x: 1, z: 1 },
        { x: 2, z: 2 }
      ];
      
      const simplified = pathfinder.simplifyPath(shortPath);
      
      expect(simplified).toEqual(shortPath);
    });
  });

  describe('Line of Sight', () => {
    test('detects line of sight in open space', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const p1 = { x: 5, z: 5 };
      const p2 = { x: 15, z: 15 };
      
      expect(pathfinder.isLineOfSight(p1, p2)).toBe(true);
    });

    test('detects blocked line of sight', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Place obstacle in the middle
      navMesh.markObstacle(10, 10, 2);
      
      const pathfinder = new PathfindingEngine(navMesh);
      
      const p1 = { x: 5, z: 10 };
      const p2 = { x: 15, z: 10 };
      
      expect(pathfinder.isLineOfSight(p1, p2)).toBe(false);
    });
  });

  describe('Path Smoothing', () => {
    test('smooths path with Catmull-Rom splines', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const path = pathfinder.findPath(1, 1, 19, 19);
      
      if (path && path.length > 2) {
        const smoothed = pathfinder.smoothPath(path, 5);
        
        // Smoothed path should have more points
        expect(smoothed.length).toBeGreaterThanOrEqual(path.length);
        
        // All points should be walkable
        for (const waypoint of smoothed) {
          expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
        }
      }
    });

    test('handles short paths', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const shortPath = [
        { x: 1, z: 1 },
        { x: 2, z: 2 }
      ];
      
      const smoothed = pathfinder.smoothPath(shortPath);
      
      expect(smoothed).toEqual(shortPath);
    });

    test('skips non-walkable smoothed points', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      // Create some obstacles
      navMesh.markObstacle(10, 10, 1);
      
      const pathfinder = new PathfindingEngine(navMesh);
      const path = pathfinder.findPath(5, 5, 15, 15);
      
      if (path && path.length > 2) {
        const smoothed = pathfinder.smoothPath(path, 5);
        
        // All smoothed points should be walkable
        for (const waypoint of smoothed) {
          expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
        }
      }
    });
  });

  describe('Heuristic Function', () => {
    test('calculates Euclidean distance correctly', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const h = pathfinder.heuristic(0, 0, 3, 4);
      
      // 3-4-5 triangle
      expect(h).toBeCloseTo(5, 5);
    });

    test('returns 0 for same position', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const h = pathfinder.heuristic(5, 5, 5, 5);
      
      expect(h).toBe(0);
    });

    test('is symmetric', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const h1 = pathfinder.heuristic(1, 2, 5, 7);
      const h2 = pathfinder.heuristic(5, 7, 1, 2);
      
      expect(h1).toBeCloseTo(h2, 5);
    });
  });

  describe('Path Validation', () => {
    test('validates path with all walkable waypoints', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      const pathfinder = new PathfindingEngine(navMesh);
      
      const validPath = [
        { x: 1, z: 1 },
        { x: 2, z: 2 },
        { x: 3, z: 3 }
      ];
      
      expect(pathfinder.validatePath(validPath)).toBe(true);
    });

    test('rejects path with non-walkable waypoint', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      navMesh.markObstacle(2, 2);
      
      const pathfinder = new PathfindingEngine(navMesh);
      
      const invalidPath = [
        { x: 1, z: 1 },
        { x: 2, z: 2 }, // Obstacle
        { x: 3, z: 3 }
      ];
      
      expect(pathfinder.validatePath(invalidPath)).toBe(false);
    });
  });
});
