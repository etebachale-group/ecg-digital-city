/**
 * Unit Tests for SpatialPartitioner
 */

const SpatialPartitioner = require('../../src/systems/SpatialPartitioner');

describe('SpatialPartitioner - Unit Tests', () => {
  describe('Object Management', () => {
    test('adds object to correct sector', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 15, 25);
      
      const location = partitioner.getObjectLocation('obj1');
      expect(location).toEqual({ x: 15, z: 25 });
    });

    test('updates object position', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.updateObject('obj1', 15, 15);
      
      const location = partitioner.getObjectLocation('obj1');
      expect(location).toEqual({ x: 15, z: 15 });
    });

    test('removes object', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      expect(partitioner.getObjectLocation('obj1')).not.toBeNull();
      
      partitioner.removeObject('obj1');
      expect(partitioner.getObjectLocation('obj1')).toBeNull();
    });

    test('adds non-existent object on update', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.updateObject('newObj', 10, 10);
      
      const location = partitioner.getObjectLocation('newObj');
      expect(location).toEqual({ x: 10, z: 10 });
    });
  });

  describe('Sector Key Generation', () => {
    test('generates correct sector key', () => {
      const partitioner = new SpatialPartitioner(10);
      
      expect(partitioner.getSectorKey(5, 5)).toBe('0,0');
      expect(partitioner.getSectorKey(15, 25)).toBe('1,2');
      expect(partitioner.getSectorKey(-5, -5)).toBe('-1,-1');
    });

    test('same sector for nearby positions', () => {
      const partitioner = new SpatialPartitioner(10);
      
      const key1 = partitioner.getSectorKey(11, 11);
      const key2 = partitioner.getSectorKey(12, 13);
      
      expect(key1).toBe(key2);
    });

    test('different sectors for distant positions', () => {
      const partitioner = new SpatialPartitioner(10);
      
      const key1 = partitioner.getSectorKey(5, 5);
      const key2 = partitioner.getSectorKey(15, 15);
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('Nearby Object Queries', () => {
    test('finds objects within radius', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 10, 10);
      partitioner.addObject('obj2', 11, 11);
      partitioner.addObject('obj3', 20, 20);
      
      const nearby = partitioner.getNearbyObjects(10, 10, 5);
      
      expect(nearby).toContain('obj1');
      expect(nearby).toContain('obj2');
      expect(nearby).not.toContain('obj3');
    });

    test('finds objects across sector boundaries', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 9, 9);
      partitioner.addObject('obj2', 11, 11);
      
      const nearby = partitioner.getNearbyObjects(10, 10, 3);
      
      expect(nearby).toContain('obj1');
      expect(nearby).toContain('obj2');
    });

    test('returns empty array when no objects nearby', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 50, 50);
      
      const nearby = partitioner.getNearbyObjects(10, 10, 5);
      
      expect(nearby).toEqual([]);
    });

    test('includes object at exact radius', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 10, 10);
      partitioner.addObject('obj2', 15, 10); // Exactly 5 units away
      
      const nearby = partitioner.getNearbyObjects(10, 10, 5);
      
      expect(nearby).toContain('obj1');
      expect(nearby).toContain('obj2');
    });

    test('handles large radius queries', () => {
      const partitioner = new SpatialPartitioner(10);
      
      for (let i = 0; i < 20; i++) {
        partitioner.addObject(`obj${i}`, i * 5, i * 5);
      }
      
      const nearby = partitioner.getNearbyObjects(50, 50, 50);
      
      expect(nearby.length).toBeGreaterThan(0);
    });
  });

  describe('Sector Operations', () => {
    test('gets objects in specific sector', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.addObject('obj2', 7, 8);
      partitioner.addObject('obj3', 15, 15);
      
      const sectorObjects = partitioner.getObjectsInSector(5, 5);
      
      expect(sectorObjects).toContain('obj1');
      expect(sectorObjects).toContain('obj2');
      expect(sectorObjects).not.toContain('obj3');
    });

    test('returns empty array for empty sector', () => {
      const partitioner = new SpatialPartitioner(10);
      
      const sectorObjects = partitioner.getObjectsInSector(100, 100);
      
      expect(sectorObjects).toEqual([]);
    });

    test('cleans up empty sectors on remove', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      
      let stats = partitioner.getStats();
      expect(stats.totalSectors).toBe(1);
      
      partitioner.removeObject('obj1');
      
      stats = partitioner.getStats();
      expect(stats.totalSectors).toBe(0);
    });

    test('moves object between sectors', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      
      let sector1Objects = partitioner.getObjectsInSector(5, 5);
      expect(sector1Objects).toContain('obj1');
      
      partitioner.updateObject('obj1', 25, 25);
      
      sector1Objects = partitioner.getObjectsInSector(5, 5);
      const sector2Objects = partitioner.getObjectsInSector(25, 25);
      
      expect(sector1Objects).not.toContain('obj1');
      expect(sector2Objects).toContain('obj1');
    });
  });

  describe('Sector Bounds', () => {
    test('calculates correct sector bounds', () => {
      const partitioner = new SpatialPartitioner(10);
      
      const bounds = partitioner.getSectorBounds(15, 25);
      
      expect(bounds).toEqual({
        minX: 10,
        maxX: 20,
        minZ: 20,
        maxZ: 30
      });
    });

    test('handles negative coordinates', () => {
      const partitioner = new SpatialPartitioner(10);
      
      const bounds = partitioner.getSectorBounds(-5, -15);
      
      expect(bounds).toEqual({
        minX: -10,
        maxX: 0,
        minZ: -20,
        maxZ: -10
      });
    });

    test('sector size matches configuration', () => {
      const partitioner = new SpatialPartitioner(20);
      
      const bounds = partitioner.getSectorBounds(25, 35);
      
      expect(bounds.maxX - bounds.minX).toBe(20);
      expect(bounds.maxZ - bounds.minZ).toBe(20);
    });
  });

  describe('All Objects Query', () => {
    test('returns all objects with positions', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.addObject('obj2', 15, 15);
      partitioner.addObject('obj3', 25, 25);
      
      const allObjects = partitioner.getAllObjects();
      
      expect(allObjects.length).toBe(3);
      expect(allObjects).toContainEqual({ id: 'obj1', x: 5, z: 5 });
      expect(allObjects).toContainEqual({ id: 'obj2', x: 15, z: 15 });
      expect(allObjects).toContainEqual({ id: 'obj3', x: 25, z: 25 });
    });

    test('returns empty array when no objects', () => {
      const partitioner = new SpatialPartitioner(10);
      
      const allObjects = partitioner.getAllObjects();
      
      expect(allObjects).toEqual([]);
    });
  });

  describe('Statistics', () => {
    test('tracks total sectors', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.addObject('obj2', 15, 15);
      partitioner.addObject('obj3', 25, 25);
      
      const stats = partitioner.getStats();
      expect(stats.totalSectors).toBe(3);
    });

    test('tracks total objects', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.addObject('obj2', 7, 8);
      partitioner.addObject('obj3', 15, 15);
      
      const stats = partitioner.getStats();
      expect(stats.totalObjects).toBe(3);
    });

    test('calculates average objects per sector', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.addObject('obj2', 7, 8);
      partitioner.addObject('obj3', 15, 15);
      
      const stats = partitioner.getStats();
      expect(parseFloat(stats.avgObjectsPerSector)).toBeCloseTo(1.5, 1);
    });

    test('tracks max objects per sector', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.addObject('obj2', 7, 8);
      partitioner.addObject('obj3', 15, 15);
      
      const stats = partitioner.getStats();
      expect(stats.maxObjectsPerSector).toBe(2);
    });

    test('includes sector size in stats', () => {
      const partitioner = new SpatialPartitioner(15);
      
      const stats = partitioner.getStats();
      expect(stats.sectorSize).toBe(15);
    });
  });

  describe('Active Sectors', () => {
    test('returns list of active sector keys', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.addObject('obj2', 15, 15);
      
      const activeSectors = partitioner.getActiveSectors();
      
      expect(activeSectors).toContain('0,0');
      expect(activeSectors).toContain('1,1');
    });

    test('returns empty array when no objects', () => {
      const partitioner = new SpatialPartitioner(10);
      
      const activeSectors = partitioner.getActiveSectors();
      
      expect(activeSectors).toEqual([]);
    });
  });

  describe('Clear Operation', () => {
    test('removes all objects and sectors', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5, 5);
      partitioner.addObject('obj2', 15, 15);
      
      partitioner.clear();
      
      const stats = partitioner.getStats();
      expect(stats.totalObjects).toBe(0);
      expect(stats.totalSectors).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles removing non-existent object', () => {
      const partitioner = new SpatialPartitioner(10);
      
      expect(() => partitioner.removeObject('nonexistent')).not.toThrow();
    });

    test('handles zero coordinates', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 0, 0);
      
      const location = partitioner.getObjectLocation('obj1');
      expect(location).toEqual({ x: 0, z: 0 });
    });

    test('handles very large coordinates', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 10000, 10000);
      
      const location = partitioner.getObjectLocation('obj1');
      expect(location).toEqual({ x: 10000, z: 10000 });
    });

    test('handles fractional coordinates', () => {
      const partitioner = new SpatialPartitioner(10);
      
      partitioner.addObject('obj1', 5.7, 8.3);
      
      const location = partitioner.getObjectLocation('obj1');
      expect(location.x).toBeCloseTo(5.7, 5);
      expect(location.z).toBeCloseTo(8.3, 5);
    });
  });
});
