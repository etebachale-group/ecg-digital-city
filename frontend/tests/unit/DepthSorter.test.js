/**
 * Unit Tests for DepthSorter
 */

const DepthSorter = require('../../src/systems/DepthSorter');

describe('DepthSorter - Unit Tests', () => {
  describe('Object Registration', () => {
    test('registers object with correct z-index', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50);
      
      expect(sorter.getZIndex('obj1')).toBe(500); // 1000 - (50 * 10)
      expect(mockObject.renderOrder).toBe(500);
    });

    test('registers static object', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('staticObj', mockObject, 30, true);
      
      const stats = sorter.getStats();
      expect(stats.staticObjects).toBe(1);
      expect(stats.dynamicObjects).toBe(0);
    });

    test('registers dynamic object by default', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('dynamicObj', mockObject, 30);
      
      const stats = sorter.getStats();
      expect(stats.staticObjects).toBe(0);
      expect(stats.dynamicObjects).toBe(1);
    });

    test('unregisters object', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50);
      expect(sorter.getZIndex('obj1')).toBe(500);
      
      sorter.unregister('obj1');
      expect(sorter.getZIndex('obj1')).toBeNull();
    });
  });

  describe('Z-Index Calculation', () => {
    test('calculates z-index for positive Y', () => {
      const sorter = new DepthSorter();
      
      expect(sorter.calculateZIndex(0)).toBe(1000);
      expect(sorter.calculateZIndex(10)).toBe(900);
      expect(sorter.calculateZIndex(50)).toBe(500);
      expect(sorter.calculateZIndex(100)).toBe(0);
    });

    test('calculates z-index for negative Y', () => {
      const sorter = new DepthSorter();
      
      expect(sorter.calculateZIndex(-10)).toBe(1100);
      expect(sorter.calculateZIndex(-50)).toBe(1500);
    });

    test('floors z-index values', () => {
      const sorter = new DepthSorter();
      
      expect(sorter.calculateZIndex(5.7)).toBe(943); // floor(1000 - 57)
      expect(sorter.calculateZIndex(12.3)).toBe(877); // floor(1000 - 123)
    });
  });

  describe('Dirty Tracking', () => {
    test('marks dynamic object as dirty', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50, false);
      sorter.markDirty('obj1');
      
      const stats = sorter.getStats();
      expect(stats.dirtyObjects).toBe(1);
    });

    test('does not mark static object as dirty', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50, true);
      sorter.markDirty('obj1');
      
      const stats = sorter.getStats();
      expect(stats.dirtyObjects).toBe(0);
    });

    test('marks object dirty on position update', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50, false);
      sorter.updatePosition('obj1', 60);
      
      const stats = sorter.getStats();
      expect(stats.dirtyObjects).toBe(1);
    });

    test('does not mark dirty if position unchanged', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50, false);
      sorter.updatePosition('obj1', 50);
      
      const stats = sorter.getStats();
      expect(stats.dirtyObjects).toBe(0);
    });
  });

  describe('Update Operations', () => {
    test('updates z-index for dirty objects', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50);
      expect(mockObject.renderOrder).toBe(500);
      
      sorter.updatePosition('obj1', 30);
      sorter.update();
      
      expect(mockObject.renderOrder).toBe(700); // 1000 - (30 * 10)
      expect(sorter.getZIndex('obj1')).toBe(700);
    });

    test('clears dirty flags after update', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50);
      sorter.markDirty('obj1');
      
      expect(sorter.getStats().dirtyObjects).toBe(1);
      
      sorter.update();
      
      expect(sorter.getStats().dirtyObjects).toBe(0);
    });

    test('does not update if no dirty objects', () => {
      const sorter = new DepthSorter();
      const mockObject = { renderOrder: 0 };
      
      sorter.register('obj1', mockObject, 50);
      const initialRenderOrder = mockObject.renderOrder;
      
      sorter.update(); // No dirty objects
      
      expect(mockObject.renderOrder).toBe(initialRenderOrder);
    });

    test('updates multiple dirty objects', () => {
      const sorter = new DepthSorter();
      const obj1 = { renderOrder: 0 };
      const obj2 = { renderOrder: 0 };
      const obj3 = { renderOrder: 0 };
      
      sorter.register('obj1', obj1, 50);
      sorter.register('obj2', obj2, 30);
      sorter.register('obj3', obj3, 70);
      
      sorter.updatePosition('obj1', 40);
      sorter.updatePosition('obj3', 60);
      
      sorter.update();
      
      expect(obj1.renderOrder).toBe(600);
      expect(obj2.renderOrder).toBe(700); // Unchanged
      expect(obj3.renderOrder).toBe(400);
    });
  });

  describe('Force Update', () => {
    test('updates all objects including static', () => {
      const sorter = new DepthSorter();
      const staticObj = { renderOrder: 0 };
      const dynamicObj = { renderOrder: 0 };
      
      sorter.register('static', staticObj, 50, true);
      sorter.register('dynamic', dynamicObj, 30, false);
      
      // Manually change positions (simulating external change)
      staticObj.renderOrder = 999;
      dynamicObj.renderOrder = 999;
      
      sorter.forceUpdateAll();
      
      expect(staticObj.renderOrder).toBe(500);
      expect(dynamicObj.renderOrder).toBe(700);
    });

    test('clears all dirty flags', () => {
      const sorter = new DepthSorter();
      const obj1 = { renderOrder: 0 };
      const obj2 = { renderOrder: 0 };
      
      sorter.register('obj1', obj1, 50);
      sorter.register('obj2', obj2, 30);
      
      sorter.markDirty('obj1');
      sorter.markDirty('obj2');
      
      sorter.forceUpdateAll();
      
      expect(sorter.getStats().dirtyObjects).toBe(0);
    });
  });

  describe('Sorted Objects', () => {
    test('returns objects sorted by z-index descending', () => {
      const sorter = new DepthSorter();
      
      sorter.register('obj1', { renderOrder: 0 }, 50); // z=500
      sorter.register('obj2', { renderOrder: 0 }, 30); // z=700
      sorter.register('obj3', { renderOrder: 0 }, 70); // z=300
      
      const sorted = sorter.getSortedObjects();
      
      expect(sorted[0].id).toBe('obj2'); // Highest z-index
      expect(sorted[1].id).toBe('obj1');
      expect(sorted[2].id).toBe('obj3'); // Lowest z-index
    });

    test('includes y-position in sorted results', () => {
      const sorter = new DepthSorter();
      
      sorter.register('obj1', { renderOrder: 0 }, 50);
      
      const sorted = sorter.getSortedObjects();
      
      expect(sorted[0].yPosition).toBe(50);
      expect(sorted[0].zIndex).toBe(500);
    });
  });

  describe('Statistics', () => {
    test('tracks total objects', () => {
      const sorter = new DepthSorter();
      
      sorter.register('obj1', { renderOrder: 0 }, 50);
      sorter.register('obj2', { renderOrder: 0 }, 30);
      sorter.register('obj3', { renderOrder: 0 }, 70);
      
      const stats = sorter.getStats();
      expect(stats.totalObjects).toBe(3);
    });

    test('tracks static vs dynamic objects', () => {
      const sorter = new DepthSorter();
      
      sorter.register('static1', { renderOrder: 0 }, 50, true);
      sorter.register('static2', { renderOrder: 0 }, 30, true);
      sorter.register('dynamic1', { renderOrder: 0 }, 70, false);
      
      const stats = sorter.getStats();
      expect(stats.staticObjects).toBe(2);
      expect(stats.dynamicObjects).toBe(1);
    });

    test('tracks dirty objects', () => {
      const sorter = new DepthSorter();
      
      sorter.register('obj1', { renderOrder: 0 }, 50);
      sorter.register('obj2', { renderOrder: 0 }, 30);
      
      sorter.markDirty('obj1');
      
      const stats = sorter.getStats();
      expect(stats.dirtyObjects).toBe(1);
    });
  });

  describe('Clear Operation', () => {
    test('removes all objects', () => {
      const sorter = new DepthSorter();
      
      sorter.register('obj1', { renderOrder: 0 }, 50);
      sorter.register('obj2', { renderOrder: 0 }, 30);
      
      sorter.clear();
      
      const stats = sorter.getStats();
      expect(stats.totalObjects).toBe(0);
      expect(stats.dirtyObjects).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles non-existent object gracefully', () => {
      const sorter = new DepthSorter();
      
      expect(sorter.getZIndex('nonexistent')).toBeNull();
      expect(() => sorter.markDirty('nonexistent')).not.toThrow();
      expect(() => sorter.updatePosition('nonexistent', 50)).not.toThrow();
    });

    test('handles object without renderOrder property', () => {
      const sorter = new DepthSorter();
      const mockObject = {}; // No renderOrder
      
      expect(() => sorter.register('obj1', mockObject, 50)).not.toThrow();
    });

    test('handles very large Y values', () => {
      const sorter = new DepthSorter();
      
      const zIndex = sorter.calculateZIndex(1000);
      expect(zIndex).toBe(-9000);
    });

    test('handles very small Y values', () => {
      const sorter = new DepthSorter();
      
      const zIndex = sorter.calculateZIndex(-1000);
      expect(zIndex).toBe(11000);
    });
  });
});
