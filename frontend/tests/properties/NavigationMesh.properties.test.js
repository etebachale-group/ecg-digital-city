/**
 * Property-Based Tests for NavigationMesh
 * 
 * Tests universal properties that must hold for all valid inputs
 */

const fc = require('fast-check');
const NavigationMesh = require('../../src/systems/NavigationMesh');

describe('NavigationMesh - Property Tests', () => {
  /**
   * Property 23: Navigation Mesh Walkability
   * Validates: Requirements 8.6
   * 
   * Property: All cells in the navigation mesh should be walkable by default
   * unless explicitly marked as obstacles
   */
  test('Property 23: All cells walkable by default', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -100, max: 0 }),
          maxX: fc.integer({ min: 1, max: 100 }),
          minZ: fc.integer({ min: -100, max: 0 }),
          maxZ: fc.integer({ min: 1, max: 100 })
        }),
        fc.float({ min: 0.1, max: 2.0 }),
        (bounds, cellSize) => {
          const navMesh = new NavigationMesh(bounds, cellSize);
          
          // Sample random positions within bounds
          const testX = bounds.minX + (bounds.maxX - bounds.minX) * 0.5;
          const testZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * 0.5;
          
          // Should be walkable by default
          expect(navMesh.isWalkable(testX, testZ)).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 24: Obstacle Identification
   * Validates: Requirements 9.1
   * 
   * Property: After marking a position as obstacle, that position
   * should not be walkable
   */
  test('Property 24: Marked obstacles are not walkable', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -50, max: 0 }),
          maxX: fc.integer({ min: 10, max: 50 }),
          minZ: fc.integer({ min: -50, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 50 })
        }),
        fc.float({ min: 0, max: 1 }),
        fc.float({ min: 0, max: 1 }),
        (bounds, xRatio, zRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          
          // Calculate position within bounds
          const x = bounds.minX + (bounds.maxX - bounds.minX) * xRatio;
          const z = bounds.minZ + (bounds.maxZ - bounds.minZ) * zRatio;
          
          // Mark as obstacle
          navMesh.markObstacle(x, z);
          
          // Should not be walkable
          expect(navMesh.isWalkable(x, z)).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Obstacle marking and clearing is reversible
   */
  test('Property: Obstacle marking is reversible', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -50, max: 0 }),
          maxX: fc.integer({ min: 10, max: 50 }),
          minZ: fc.integer({ min: -50, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 50 })
        }),
        fc.float({ min: 0, max: 1 }),
        fc.float({ min: 0, max: 1 }),
        (bounds, xRatio, zRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          
          const x = bounds.minX + (bounds.maxX - bounds.minX) * xRatio;
          const z = bounds.minZ + (bounds.maxZ - bounds.minZ) * zRatio;
          
          // Mark as obstacle then mark as walkable
          navMesh.markObstacle(x, z);
          navMesh.markWalkable(x, z);
          
          // Should be walkable again
          expect(navMesh.isWalkable(x, z)).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Grid dimensions match world bounds
   */
  test('Property: Grid dimensions correctly represent world bounds', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -100, max: 0 }),
          maxX: fc.integer({ min: 10, max: 100 }),
          minZ: fc.integer({ min: -100, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 100 })
        }),
        fc.float({ min: 0.5, max: 2.0 }),
        (bounds, cellSize) => {
          const navMesh = new NavigationMesh(bounds, cellSize);
          const dims = navMesh.getDimensions();
          
          const expectedWidth = Math.ceil((bounds.maxX - bounds.minX) / cellSize);
          const expectedHeight = Math.ceil((bounds.maxZ - bounds.minZ) / cellSize);
          
          expect(dims.width).toBe(expectedWidth);
          expect(dims.height).toBe(expectedHeight);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: World-to-grid-to-world conversion is consistent
   */
  test('Property: Coordinate conversion round-trip is consistent', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -50, max: 0 }),
          maxX: fc.integer({ min: 10, max: 50 }),
          minZ: fc.integer({ min: -50, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 50 })
        }),
        fc.float({ min: 0, max: 1 }),
        fc.float({ min: 0, max: 1 }),
        (bounds, xRatio, zRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          
          const worldX = bounds.minX + (bounds.maxX - bounds.minX) * xRatio;
          const worldZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * zRatio;
          
          // Convert to grid and back
          const gridPos = navMesh.worldToGrid(worldX, worldZ);
          const worldPos = navMesh.gridToWorld(gridPos.x, gridPos.z);
          
          // Should be close to original (within cell size)
          const tolerance = navMesh.cellSize;
          expect(Math.abs(worldPos.x - worldX)).toBeLessThan(tolerance);
          expect(Math.abs(worldPos.z - worldZ)).toBeLessThan(tolerance);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Neighbors are always valid and walkable
   */
  test('Property: All neighbors are valid grid positions', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -50, max: 0 }),
          maxX: fc.integer({ min: 10, max: 50 }),
          minZ: fc.integer({ min: -50, max: 0 }),
          maxZ: fc.integer({ min: 10, max: 50 })
        }),
        fc.float({ min: 0, max: 1 }),
        fc.float({ min: 0, max: 1 }),
        (bounds, xRatio, zRatio) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          
          const worldX = bounds.minX + (bounds.maxX - bounds.minX) * xRatio;
          const worldZ = bounds.minZ + (bounds.maxZ - bounds.minZ) * zRatio;
          
          const gridPos = navMesh.worldToGrid(worldX, worldZ);
          
          if (navMesh.isValidGridPosition(gridPos.x, gridPos.z)) {
            const neighbors = navMesh.getNeighbors(gridPos.x, gridPos.z);
            
            // All neighbors should be valid and walkable
            for (const neighbor of neighbors) {
              expect(navMesh.isValidGridPosition(neighbor.x, neighbor.z)).toBe(true);
              expect(navMesh.grid[neighbor.z][neighbor.x]).toBe(true);
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Circular obstacles create non-walkable areas
   */
  test('Property: Circular obstacles affect all cells within radius', () => {
    fc.assert(
      fc.property(
        fc.record({
          minX: fc.integer({ min: -50, max: 0 }),
          maxX: fc.integer({ min: 20, max: 50 }),
          minZ: fc.integer({ min: -50, max: 0 }),
          maxZ: fc.integer({ min: 20, max: 50 })
        }),
        fc.float({ min: 1, max: 5 }),
        (bounds, radius) => {
          const navMesh = new NavigationMesh(bounds, 0.5);
          
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerZ = (bounds.minZ + bounds.maxZ) / 2;
          
          // Mark circular obstacle
          navMesh.markObstacle(centerX, centerZ, radius);
          
          // Center should not be walkable
          expect(navMesh.isWalkable(centerX, centerZ)).toBe(false);
          
          // Points just outside radius should be walkable
          const outsideX = centerX + radius + 1;
          const outsideZ = centerZ;
          
          if (outsideX < bounds.maxX) {
            expect(navMesh.isWalkable(outsideX, outsideZ)).toBe(true);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
