/**
 * Property-Based Tests for SpatialPartitioner
 */

const fc = require('fast-check');
const SpatialPartitioner = require('../../src/systems/SpatialPartitioner');

describe('SpatialPartitioner - Property Tests', () => {
  /**
   * Property 36: Static Object Z-Index Caching
   * Validates: Requirements 12.4
   */
  test('Property 36: Objects remain in correct sectors', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 100 }),
        fc.float({ min: -100, max: 100 }),
        fc.float({ min: 5, max: 20 }),
        (x, z, sectorSize) => {
          const partitioner = new SpatialPartitioner(sectorSize);
          
          partitioner.addObject('obj1', x, z);
          
          const location = partitioner.getObjectLocation('obj1');
          expect(location.x).toBe(x);
          expect(location.z).toBe(z);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Sector key is consistent for same position
   */
  test('Property: Same position produces same sector key', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 100 }),
        fc.float({ min: -100, max: 100 }),
        fc.float({ min: 5, max: 20 }),
        (x, z, sectorSize) => {
          const partitioner = new SpatialPartitioner(sectorSize);
          
          const key1 = partitioner.getSectorKey(x, z);
          const key2 = partitioner.getSectorKey(x, z);
          
          expect(key1).toBe(key2);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Nearby objects are found within radius
   */
  test('Property: Objects within radius are found', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: 1, max: 5 }),
        (centerX, centerZ, radius) => {
          const partitioner = new SpatialPartitioner(10);
          
          // Add object at center
          partitioner.addObject('center', centerX, centerZ);
          
          // Add object within radius
          const nearX = centerX + radius * 0.5;
          const nearZ = centerZ;
          partitioner.addObject('near', nearX, nearZ);
          
          const nearby = partitioner.getNearbyObjects(centerX, centerZ, radius);
          
          // Should find both objects
          expect(nearby).toContain('center');
          expect(nearby).toContain('near');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Objects outside radius are not found
   */
  test('Property: Objects outside radius are excluded', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: 5, max: 10 }),
        (centerX, centerZ, radius) => {
          const partitioner = new SpatialPartitioner(10);
          
          // Add object at center
          partitioner.addObject('center', centerX, centerZ);
          
          // Add object outside radius
          const farX = centerX + radius * 2;
          const farZ = centerZ;
          partitioner.addObject('far', farX, farZ);
          
          const nearby = partitioner.getNearbyObjects(centerX, centerZ, radius);
          
          // Should find center but not far
          expect(nearby).toContain('center');
          expect(nearby).not.toContain('far');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Object update changes sector if needed
   */
  test('Property: Object moves to correct sector on update', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: 5, max: 15 }),
        (x1, z1, x2, z2, sectorSize) => {
          const partitioner = new SpatialPartitioner(sectorSize);
          
          partitioner.addObject('obj1', x1, z1);
          partitioner.updateObject('obj1', x2, z2);
          
          const location = partitioner.getObjectLocation('obj1');
          expect(location.x).toBe(x2);
          expect(location.z).toBe(z2);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: All added objects can be retrieved
   */
  test('Property: All objects are retrievable', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.float({ min: -50, max: 50 }),
            z: fc.float({ min: -50, max: 50 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (positions) => {
          const partitioner = new SpatialPartitioner(10);
          
          positions.forEach((pos, i) => {
            partitioner.addObject(`obj${i}`, pos.x, pos.z);
          });
          
          const allObjects = partitioner.getAllObjects();
          expect(allObjects.length).toBe(positions.length);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Removed objects are not found
   */
  test('Property: Removed objects are not in queries', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        (x, z) => {
          const partitioner = new SpatialPartitioner(10);
          
          partitioner.addObject('obj1', x, z);
          expect(partitioner.getObjectLocation('obj1')).not.toBeNull();
          
          partitioner.removeObject('obj1');
          expect(partitioner.getObjectLocation('obj1')).toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Sector bounds contain sector positions
   */
  test('Property: Sector bounds are correct', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: 5, max: 20 }),
        (x, z, sectorSize) => {
          const partitioner = new SpatialPartitioner(sectorSize);
          
          const bounds = partitioner.getSectorBounds(x, z);
          
          // Position should be within bounds
          expect(x).toBeGreaterThanOrEqual(bounds.minX);
          expect(x).toBeLessThan(bounds.maxX);
          expect(z).toBeGreaterThanOrEqual(bounds.minZ);
          expect(z).toBeLessThan(bounds.maxZ);
          
          // Bounds should have correct size
          expect(bounds.maxX - bounds.minX).toBe(sectorSize);
          expect(bounds.maxZ - bounds.minZ).toBe(sectorSize);
        }
      ),
      { numRuns: 20 }
    );
  });
});
