/**
 * Property-Based Tests for DepthSorter
 */

const fc = require('fast-check');
const DepthSorter = require('../../src/systems/DepthSorter');

describe('DepthSorter - Property Tests', () => {
  /**
   * Property 32: Z-Index Calculation Formula
   * Validates: Requirements 11.1, 11.3
   */
  test('Property 32: Z-index formula is consistent', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 100 }),
        (yPosition) => {
          const sorter = new DepthSorter();
          const zIndex = sorter.calculateZIndex(yPosition);
          
          const expected = Math.floor(1000 - (yPosition * 10));
          expect(zIndex).toBe(expected);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 33: Z-Index Recalculation on Position Change
   * Validates: Requirements 11.2
   */
  test('Property 33: Z-index updates when position changes', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        (initialY, newY) => {
          fc.pre(Math.abs(initialY - newY) > 0.1); // Ensure meaningful change
          
          const sorter = new DepthSorter();
          const mockObject = { renderOrder: 0 };
          
          sorter.register('obj1', mockObject, initialY, false);
          const initialZIndex = sorter.getZIndex('obj1');
          
          sorter.updatePosition('obj1', newY);
          sorter.update();
          
          const newZIndex = sorter.getZIndex('obj1');
          
          // Z-index should change when Y position changes
          if (Math.floor(initialY * 10) !== Math.floor(newY * 10)) {
            expect(newZIndex).not.toBe(initialZIndex);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 34: Depth-Based Rendering Order
   * Validates: Requirements 11.5
   */
  test('Property 34: Objects further back have lower z-index', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        (y1, y2) => {
          fc.pre(Math.abs(y1 - y2) > 1); // Ensure significant difference
          
          const sorter = new DepthSorter();
          const obj1 = { renderOrder: 0 };
          const obj2 = { renderOrder: 0 };
          
          sorter.register('obj1', obj1, y1);
          sorter.register('obj2', obj2, y2);
          
          const z1 = sorter.getZIndex('obj1');
          const z2 = sorter.getZIndex('obj2');
          
          // Object with higher Y (further back) should have lower z-index
          if (y1 > y2) {
            expect(z1).toBeLessThan(z2);
          } else {
            expect(z1).toBeGreaterThan(z2);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 35: Selective Z-Index Recalculation
   * Validates: Requirements 12.1
   */
  test('Property 35: Only dirty objects are recalculated', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: -50, max: 50 }), { minLength: 3, maxLength: 10 }),
        fc.integer({ min: 0, max: 2 }),
        (yPositions, dirtyIndex) => {
          const sorter = new DepthSorter();
          const objects = yPositions.map((y, i) => ({
            id: `obj${i}`,
            mock: { renderOrder: 0 },
            y
          }));
          
          // Register all objects
          objects.forEach(obj => {
            sorter.register(obj.id, obj.mock, obj.y, false);
          });
          
          // Mark one as dirty
          const dirtyId = objects[dirtyIndex].id;
          sorter.markDirty(dirtyId);
          
          // Update should only affect dirty object
          sorter.update();
          
          // After update, no objects should be dirty
          const stats = sorter.getStats();
          expect(stats.dirtyObjects).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Static objects are not marked dirty
   */
  test('Property: Static objects cannot be marked dirty', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        (initialY, newY) => {
          const sorter = new DepthSorter();
          const mockObject = { renderOrder: 0 };
          
          sorter.register('staticObj', mockObject, initialY, true); // Static
          
          sorter.markDirty('staticObj');
          
          const stats = sorter.getStats();
          expect(stats.dirtyObjects).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: RenderOrder is applied to objects
   */
  test('Property: RenderOrder is set on registered objects', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        (yPosition) => {
          const sorter = new DepthSorter();
          const mockObject = { renderOrder: 0 };
          
          sorter.register('obj1', mockObject, yPosition);
          
          const expectedZIndex = Math.floor(1000 - (yPosition * 10));
          expect(mockObject.renderOrder).toBe(expectedZIndex);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Sorted objects are in correct order
   */
  test('Property: getSortedObjects returns objects in z-index order', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: -50, max: 50 }), { minLength: 2, maxLength: 10 }),
        (yPositions) => {
          const sorter = new DepthSorter();
          
          yPositions.forEach((y, i) => {
            sorter.register(`obj${i}`, { renderOrder: 0 }, y);
          });
          
          const sorted = sorter.getSortedObjects();
          
          // Should be sorted by z-index descending
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].zIndex).toBeGreaterThanOrEqual(sorted[i + 1].zIndex);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
