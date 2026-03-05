/**
 * Unit Tests for NavigationMesh
 */

const NavigationMesh = require('../../src/systems/NavigationMesh');

describe('NavigationMesh - Unit Tests', () => {
  describe('Grid Creation', () => {
    test('creates grid with correct dimensions', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      const dims = navMesh.getDimensions();
      expect(dims.width).toBe(20); // 10 / 0.5
      expect(dims.height).toBe(20);
    });

    test('creates grid with all cells walkable by default', () => {
      const bounds = { minX: 0, maxX: 5, minZ: 0, maxZ: 5 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      expect(navMesh.isWalkable(2.5, 2.5)).toBe(true);
      expect(navMesh.isWalkable(0.5, 0.5)).toBe(true);
      expect(navMesh.isWalkable(4.5, 4.5)).toBe(true);
    });

    test('handles negative world coordinates', () => {
      const bounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      expect(navMesh.isWalkable(-5, -5)).toBe(true);
      expect(navMesh.isWalkable(0, 0)).toBe(true);
      expect(navMesh.isWalkable(5, 5)).toBe(true);
    });
  });

  describe('Obstacle Marking', () => {
    test('marks single cell as obstacle', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      navMesh.markObstacle(5, 5);
      
      expect(navMesh.isWalkable(5, 5)).toBe(false);
      expect(navMesh.isWalkable(6, 6)).toBe(true); // Adjacent cell still walkable
    });

    test('marks circular area as obstacle', () => {
      const bounds = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      navMesh.markObstacle(10, 10, 2); // 2-unit radius
      
      // Center should be obstacle
      expect(navMesh.isWalkable(10, 10)).toBe(false);
      
      // Points within radius should be obstacles
      expect(navMesh.isWalkable(11, 10)).toBe(false);
      expect(navMesh.isWalkable(10, 11)).toBe(false);
      
      // Points outside radius should be walkable
      expect(navMesh.isWalkable(13, 10)).toBe(true);
      expect(navMesh.isWalkable(10, 13)).toBe(true);
    });

    test('marks walkable after marking obstacle', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      navMesh.markObstacle(5, 5);
      expect(navMesh.isWalkable(5, 5)).toBe(false);
      
      navMesh.markWalkable(5, 5);
      expect(navMesh.isWalkable(5, 5)).toBe(true);
    });

    test('handles out-of-bounds obstacle marking gracefully', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      // Should not throw
      expect(() => navMesh.markObstacle(100, 100)).not.toThrow();
      expect(() => navMesh.markObstacle(-100, -100)).not.toThrow();
    });
  });

  describe('Walkability Checks', () => {
    test('returns false for out-of-bounds positions', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      expect(navMesh.isWalkable(100, 100)).toBe(false);
      expect(navMesh.isWalkable(-10, -10)).toBe(false);
    });

    test('returns correct walkability for edge cells', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      expect(navMesh.isWalkable(0.5, 0.5)).toBe(true);
      expect(navMesh.isWalkable(9.5, 9.5)).toBe(true);
    });
  });

  describe('Neighbor Retrieval', () => {
    test('returns 8 neighbors for center cell', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const gridPos = navMesh.worldToGrid(5, 5);
      const neighbors = navMesh.getNeighbors(gridPos.x, gridPos.z);
      
      expect(neighbors.length).toBe(8);
    });

    test('returns fewer neighbors for edge cells', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const gridPos = navMesh.worldToGrid(0.5, 0.5);
      const neighbors = navMesh.getNeighbors(gridPos.x, gridPos.z);
      
      expect(neighbors.length).toBeLessThan(8);
      expect(neighbors.length).toBeGreaterThan(0);
    });

    test('returns fewer neighbors for corner cells', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const neighbors = navMesh.getNeighbors(0, 0);
      
      expect(neighbors.length).toBe(3); // Only 3 neighbors for corner
    });

    test('excludes obstacle neighbors', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const gridPos = navMesh.worldToGrid(5, 5);
      
      // Mark some neighbors as obstacles
      navMesh.markObstacle(6, 5);
      navMesh.markObstacle(5, 6);
      
      const neighbors = navMesh.getNeighbors(gridPos.x, gridPos.z);
      
      expect(neighbors.length).toBeLessThan(8);
    });

    test('diagonal neighbors have correct cost', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const gridPos = navMesh.worldToGrid(5, 5);
      const neighbors = navMesh.getNeighbors(gridPos.x, gridPos.z);
      
      const diagonalNeighbor = neighbors.find(n => 
        Math.abs(n.x - gridPos.x) === 1 && Math.abs(n.z - gridPos.z) === 1
      );
      
      expect(diagonalNeighbor.cost).toBeCloseTo(1.414, 2);
    });

    test('cardinal neighbors have cost of 1', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const gridPos = navMesh.worldToGrid(5, 5);
      const neighbors = navMesh.getNeighbors(gridPos.x, gridPos.z);
      
      const cardinalNeighbor = neighbors.find(n => 
        (Math.abs(n.x - gridPos.x) === 1 && n.z === gridPos.z) ||
        (Math.abs(n.z - gridPos.z) === 1 && n.x === gridPos.x)
      );
      
      expect(cardinalNeighbor.cost).toBe(1);
    });
  });

  describe('Coordinate Conversion', () => {
    test('converts world to grid coordinates correctly', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const gridPos = navMesh.worldToGrid(5.7, 3.2);
      
      expect(gridPos.x).toBe(5);
      expect(gridPos.z).toBe(3);
    });

    test('converts grid to world coordinates correctly', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const worldPos = navMesh.gridToWorld(5, 3);
      
      // Should return center of cell
      expect(worldPos.x).toBe(5.5);
      expect(worldPos.z).toBe(3.5);
    });

    test('handles negative coordinates in conversion', () => {
      const bounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      const gridPos = navMesh.worldToGrid(-5, -3);
      expect(gridPos.x).toBeGreaterThanOrEqual(0);
      expect(gridPos.z).toBeGreaterThanOrEqual(0);
      
      const worldPos = navMesh.gridToWorld(gridPos.x, gridPos.z);
      expect(worldPos.x).toBeCloseTo(-4.5, 1);
      expect(worldPos.z).toBeCloseTo(-2.5, 1);
    });
  });

  describe('Grid Operations', () => {
    test('clears all obstacles', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      navMesh.markObstacle(5, 5);
      navMesh.markObstacle(6, 6);
      
      expect(navMesh.isWalkable(5, 5)).toBe(false);
      
      navMesh.clear();
      
      expect(navMesh.isWalkable(5, 5)).toBe(true);
      expect(navMesh.isWalkable(6, 6)).toBe(true);
    });

    test('validates grid positions correctly', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 1);
      
      expect(navMesh.isValidGridPosition(5, 5)).toBe(true);
      expect(navMesh.isValidGridPosition(0, 0)).toBe(true);
      expect(navMesh.isValidGridPosition(9, 9)).toBe(true);
      
      expect(navMesh.isValidGridPosition(-1, 5)).toBe(false);
      expect(navMesh.isValidGridPosition(5, -1)).toBe(false);
      expect(navMesh.isValidGridPosition(100, 5)).toBe(false);
      expect(navMesh.isValidGridPosition(5, 100)).toBe(false);
    });
  });

  describe('Different Cell Sizes', () => {
    test('works with small cell size (0.5)', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 0.5);
      
      const dims = navMesh.getDimensions();
      expect(dims.width).toBe(20);
      expect(dims.height).toBe(20);
      
      expect(navMesh.isWalkable(5, 5)).toBe(true);
    });

    test('works with large cell size (2.0)', () => {
      const bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const navMesh = new NavigationMesh(bounds, 2.0);
      
      const dims = navMesh.getDimensions();
      expect(dims.width).toBe(5);
      expect(dims.height).toBe(5);
      
      expect(navMesh.isWalkable(5, 5)).toBe(true);
    });
  });
});
