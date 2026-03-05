/**
 * Property-Based Tests for PathfindingEngine
 * 
 * Tests universal properties that must hold for all valid inputs
 */

const fc = require('fast-check');
const NavigationMesh = require('../../src/systems/NavigationMesh');
const PathfindingEngine = require('../../src/systems/PathfindingEngine');

describe('PathfindingEngine - Property Tests', () => {
  /**
   * Property 21: A* Path Validity
   * Validates: Requirements 8.1, 8.4
   * 
   * Property: All waypoints in a generated path must be walkable
   */
  test('Property 21: All waypoints in path are walkable', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -50, max: 0 }),
          maxX: fc.integer({ min: 20, max: 50 }),
          minZ: fc.integer({ min: -50, max: 0 }),
          maxZ: fc.integer({ min: 20, max: 50 })
        }),
        fc.float({ min: 0.1, max: 0.9 }),
        fc.float({ min: 0.1, max: 0.9 }),
        fc.float({ min: 0.1, max: 0.9 }),
        fc.float({ min: 0.1, max: 0.9 }),
        (bounds, startXRatio, startZRatio, goalXRatio, goalZRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          const pathfinder = new PathfindingEngine(navMesh);
          
          const startX = bounds.minX + (bounds.maxX - bounds.minX) * startXRatio;
          const startZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * startZRatio;
          const goalX = bounds.minX + (bounds.maxX - bounds.minX) * goalXRatio;
          const goalZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * goalZRatio;
          
          const path = pathfinder.findPath(startX, startZ, goalX, goalZ);
          
          if (path !== null) {
            // All waypoints must be walkable
            for (const waypoint of path) {
              expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
            }
            
            // Path should have at least 2 points (start and goal)
            expect(path.length).toBeGreaterThanOrEqual(2);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 22: Path Calculation for Valid Destinations
   * Validates: Requirements 8.2
   * 
   * Property: A path should be found between any two walkable positions
   * in an obstacle-free environment
   */
  test('Property 22: Path found for walkable start and goal', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -30, max: 0 }),
          maxX: fc.integer({ min: 10, max: 30 }),
          minZ: fc.integer({ min: -30, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 30 })
        }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        (bounds, startXRatio, startZRatio, goalXRatio, goalZRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          const pathfinder = new PathfindingEngine(navMesh);
          
          const startX = bounds.minX + (bounds.maxX - bounds.minX) * startXRatio;
          const startZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * startZRatio;
          const goalX = bounds.minX + (bounds.maxX - bounds.minX) * goalXRatio;
          const goalZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * goalZRatio;
          
          const path = pathfinder.findPath(startX, startZ, goalX, goalZ);
          
          // Should find a path in obstacle-free environment
          expect(path).not.toBeNull();
          expect(path.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 25: Obstacle Avoidance with Minimum Distance
   * Validates: Requirements 9.2, 9.4
   * 
   * Property: Generated paths should not pass through obstacles
   */
  test('Property 25: Path avoids obstacles', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -50, max: 0 }),
          maxX: fc.integer({ min: 30, max: 50 }),
          minZ: fc.integer({ min: -50, max: 0 }),
          maxZ: fc.integer({ min: 30, max: 50 })
        }),
        fc.float({ min: 2, max: 5 }),
        (bounds, obstacleRadius) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          
          // Place obstacle in center
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerZ = (bounds.minZ + bounds.maxZ) / 2;
          navMesh.markObstacle(centerX, centerZ, obstacleRadius);
          
          const pathfinder = new PathfindingEngine(navMesh);
          
          // Try to find path from left to right of obstacle
          const startX = centerX - obstacleRadius - 5;
          const startZ = centerZ;
          const goalX = centerX + obstacleRadius + 5;
          const goalZ = centerZ;
          
          const path = pathfinder.findPath(startX, startZ, goalX, goalZ);
          
          if (path !== null) {
            // All waypoints should be walkable (not in obstacle)
            for (const waypoint of path) {
              expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Path start and end match requested positions
   */
  test('Property: Path starts and ends at correct positions', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -30, max: 0 }),
          maxX: fc.integer({ min: 10, max: 30 }),
          minZ: fc.integer({ min: -30, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 30 })
        }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        (bounds, startXRatio, startZRatio, goalXRatio, goalZRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          const pathfinder = new PathfindingEngine(navMesh);
          
          const startX = bounds.minX + (bounds.maxX - bounds.minX) * startXRatio;
          const startZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * startZRatio;
          const goalX = bounds.minX + (bounds.maxX - bounds.minX) * goalXRatio;
          const goalZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * goalZRatio;
          
          const path = pathfinder.findPath(startX, startZ, goalX, goalZ);
          
          if (path !== null && path.length > 0) {
            const cellSize = navMesh.cellSize;
            
            // First waypoint should be close to start
            expect(Math.abs(path[0].x - startX)).toBeLessThan(cellSize * 2);
            expect(Math.abs(path[0].z - startZ)).toBeLessThan(cellSize * 2);
            
            // Last waypoint should be close to goal
            const last = path[path.length - 1];
            expect(Math.abs(last.x - goalX)).toBeLessThan(cellSize * 2);
            expect(Math.abs(last.z - goalZ)).toBeLessThan(cellSize * 2);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Path simplification preserves start and end
   */
  test('Property: Simplified path preserves endpoints', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -30, max: 0 }),
          maxX: fc.integer({ min: 10, max: 30 }),
          minZ: fc.integer({ min: -30, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 30 })
        }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        (bounds, startXRatio, startZRatio, goalXRatio, goalZRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          const pathfinder = new PathfindingEngine(navMesh);
          
          const startX = bounds.minX + (bounds.maxX - bounds.minX) * startXRatio;
          const startZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * startZRatio;
          const goalX = bounds.minX + (bounds.maxX - bounds.minX) * goalXRatio;
          const goalZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * goalZRatio;
          
          const path = pathfinder.findPath(startX, startZ, goalX, goalZ);
          
          if (path !== null && path.length > 2) {
            const simplified = pathfinder.simplifyPath(path);
            
            // Should preserve start and end
            expect(simplified[0]).toEqual(path[0]);
            expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
            
            // Should have fewer or equal waypoints
            expect(simplified.length).toBeLessThanOrEqual(path.length);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Smoothed path waypoints are walkable
   */
  test('Property: Smoothed path contains only walkable waypoints', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -30, max: 0 }),
          maxX: fc.integer({ min: 10, max: 30 }),
          minZ: fc.integer({ min: -30, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 30 })
        }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        fc.float({ min: 0.2, max: 0.8 }),
        (bounds, startXRatio, startZRatio, goalXRatio, goalZRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          const pathfinder = new PathfindingEngine(navMesh);
          
          const startX = bounds.minX + (bounds.maxX - bounds.minX) * startXRatio;
          const startZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * startZRatio;
          const goalX = bounds.minX + (bounds.maxX - bounds.minX) * goalXRatio;
          const goalZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * goalZRatio;
          
          const path = pathfinder.findPath(startX, startZ, goalX, goalZ);
          
          if (path !== null && path.length > 2) {
            const smoothed = pathfinder.smoothPath(path, 3);
            
            // All smoothed waypoints should be walkable
            for (const waypoint of smoothed) {
              expect(navMesh.isWalkable(waypoint.x, waypoint.z)).toBe(true);
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Heuristic is admissible (never overestimates)
   */
  test('Property: Heuristic never overestimates actual distance', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -50, max: 50 }),
        fc.integer({ min: -50, max: 50 }),
        fc.integer({ min: -50, max: 50 }),
        fc.integer({ min: -50, max: 50 }),
        (x1, z1, x2, z2) => {
          const navMesh = new NavigationMesh({ minX: -100, maxX: 100, minZ: -100, maxZ: 100 }, 1);
          const pathfinder = new PathfindingEngine(navMesh);
          
          const heuristic = pathfinder.heuristic(x1, z1, x2, z2);
          
          // Euclidean distance is admissible for grid with diagonal movement
          const dx = x2 - x1;
          const dz = z2 - z1;
          const euclidean = Math.sqrt(dx * dx + dz * dz);
          
          expect(heuristic).toBeCloseTo(euclidean, 5);
        }
      ),
      { numRuns: 20 }
    );
  });
});
