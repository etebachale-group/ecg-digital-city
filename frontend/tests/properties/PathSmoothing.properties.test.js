/**
 * Property-Based Tests for Path Smoothing
 */

const fc = require('fast-check');
const NavigationMesh = require('../../src/systems/NavigationMesh');
const PathfindingEngine = require('../../src/systems/PathfindingEngine');

describe('Path Smoothing - Property Tests', () => {
  /**
   * Property 28: Path Smoothing Validity
   * Validates: Requirements 10.1
   */
  test('Property 28: Smoothed paths contain only walkable waypoints', () => {
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
        fc.integer({ min: 3, max: 10 }),
        (bounds, startXRatio, startZRatio, goalXRatio, goalZRatio, segments) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          const pathfinder = new PathfindingEngine(navMesh);
          
          const startX = bounds.minX + (bounds.maxX - bounds.minX) * startXRatio;
          const startZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * startZRatio;
          const goalX = bounds.minX + (bounds.maxX - bounds.minX) * goalXRatio;
          const goalZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * goalZRatio;
          
          const path = pathfinder.findPath(startX, startZ, goalX, goalZ);
          
          if (path && path.length > 2) {
            const smoothed = pathfinder.smoothPath(path, segments);
            
            // All smoothed waypoints must be walkable
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
   * Property 29: Path Simplification
   * Validates: Requirements 10.2
   */
  test('Property 29: Simplified path has fewer or equal waypoints', () => {
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
          
          if (path && path.length > 2) {
            const simplified = pathfinder.simplifyPath(path);
            
            expect(simplified.length).toBeLessThanOrEqual(path.length);
            expect(simplified.length).toBeGreaterThanOrEqual(2);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 30: Smooth Path Continuity
   * Validates: Requirements 10.3
   */
  test('Property 30: Smoothed path maintains continuity', () => {
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
          
          if (path && path.length > 2) {
            const smoothed = pathfinder.smoothPath(path, 5);
            
            // Check continuity - no large gaps between waypoints
            for (let i = 0; i < smoothed.length - 1; i++) {
              const dx = smoothed[i + 1].x - smoothed[i].x;
              const dz = smoothed[i + 1].z - smoothed[i].z;
              const distance = Math.sqrt(dx * dx + dz * dz);
              
              // Distance between consecutive waypoints should be reasonable
              expect(distance).toBeLessThan(5);
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Simplified path preserves endpoints
   */
  test('Property: Simplification preserves start and end points', () => {
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
          
          if (path && path.length > 2) {
            const simplified = pathfinder.simplifyPath(path);
            
            expect(simplified[0]).toEqual(path[0]);
            expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Smoothed path has more points than original
   */
  test('Property: Smoothing increases waypoint count', () => {
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
        fc.integer({ min: 5, max: 10 }),
        (bounds, startXRatio, startZRatio, goalXRatio, goalZRatio, segments) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          const pathfinder = new PathfindingEngine(navMesh);
          
          const startX = bounds.minX + (bounds.maxX - bounds.minX) * startXRatio;
          const startZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * startZRatio;
          const goalX = bounds.minX + (bounds.maxX - bounds.minX) * goalXRatio;
          const goalZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * goalZRatio;
          
          const path = pathfinder.findPath(startX, startZ, goalX, goalZ);
          
          if (path && path.length > 2) {
            const smoothed = pathfinder.smoothPath(path, segments);
            
            // Smoothing should add interpolated points
            expect(smoothed.length).toBeGreaterThanOrEqual(path.length);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
