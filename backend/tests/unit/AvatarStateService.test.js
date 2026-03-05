/**
 * Unit Tests for AvatarStateService
 * Feature: sistema-interacciones-avanzadas
 * 
 * These tests verify specific scenarios and edge cases for AvatarStateService:
 * - Valid state transitions
 * - Invalid transition rejection
 * - State persistence (saveState/loadState)
 * - State synchronization
 * - getCurrentState functionality
 * - resetToIdle utility
 * 
 * Requirements: 5.1, 5.5, 7.1
 */

const { sequelize } = require('../../src/config/database');
const AvatarStateService = require('../../src/services/AvatarStateService');
const Avatar = require('../../src/models/Avatar');

describe('AvatarStateService Unit Tests', () => {
  const service = AvatarStateService;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  }, 30000);

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean avatars table before each test
    await Avatar.destroy({ where: {}, truncate: true, cascade: true });
  });

  // Helper function to create a test avatar
  const createTestAvatar = async (userId, currentState = 'idle') => {
    return await Avatar.create({
      userId,
      skinColor: '#fdbcb4',
      hairStyle: 'short',
      hairColor: '#000000',
      shirtColor: '#3498db',
      pantsColor: '#2c3e50',
      currentState,
      previousState: null,
      stateChangedAt: new Date()
    });
  };

  // ==================== Valid State Transitions Tests ====================

  describe('Valid State Transitions', () => {
    test('should transition from idle to walking', async () => {
      await createTestAvatar(1, 'idle');

      const result = await service.changeState(1, 'walking');

      expect(result.success).toBe(true);
      expect(result.state).toBe('walking');
      expect(result.previousState).toBe('idle');
      expect(result.stateChangedAt).toBeDefined();
    });

    test('should transition from idle to sitting', async () => {
      await createTestAvatar(1, 'idle');

      const result = await service.changeState(1, 'sitting', {
        objectId: 100,
        nodeId: 200
      });

      expect(result.success).toBe(true);
      expect(result.state).toBe('sitting');
      expect(result.previousState).toBe('idle');
      expect(result.context.sittingAt).toBe(200);
      expect(result.context.interactingWith).toBe(100);
    });

    test('should transition from idle to interacting', async () => {
      await createTestAvatar(1, 'idle');

      const result = await service.changeState(1, 'interacting', {
        objectId: 100
      });

      expect(result.success).toBe(true);
      expect(result.state).toBe('interacting');
      expect(result.previousState).toBe('idle');
      expect(result.context.interactingWith).toBe(100);
    });

    test('should transition from idle to dancing', async () => {
      await createTestAvatar(1, 'idle');

      const result = await service.changeState(1, 'dancing');

      expect(result.success).toBe(true);
      expect(result.state).toBe('dancing');
      expect(result.previousState).toBe('idle');
    });

    test('should transition from walking to idle', async () => {
      await createTestAvatar(1, 'walking');

      const result = await service.changeState(1, 'idle');

      expect(result.success).toBe(true);
      expect(result.state).toBe('idle');
      expect(result.previousState).toBe('walking');
    });

    test('should transition from walking to running', async () => {
      await createTestAvatar(1, 'walking');

      const result = await service.changeState(1, 'running');

      expect(result.success).toBe(true);
      expect(result.state).toBe('running');
      expect(result.previousState).toBe('walking');
    });

    test('should transition from running to walking', async () => {
      await createTestAvatar(1, 'running');

      const result = await service.changeState(1, 'walking');

      expect(result.success).toBe(true);
      expect(result.state).toBe('walking');
      expect(result.previousState).toBe('running');
    });

    test('should transition from running to idle', async () => {
      await createTestAvatar(1, 'running');

      const result = await service.changeState(1, 'idle');

      expect(result.success).toBe(true);
      expect(result.state).toBe('idle');
      expect(result.previousState).toBe('running');
    });

    test('should transition from sitting to idle', async () => {
      await createTestAvatar(1, 'sitting');

      const result = await service.changeState(1, 'idle');

      expect(result.success).toBe(true);
      expect(result.state).toBe('idle');
      expect(result.previousState).toBe('sitting');
      expect(result.context.sittingAt).toBeNull();
      expect(result.context.interactingWith).toBeNull();
    });

    test('should transition from interacting to idle', async () => {
      await createTestAvatar(1, 'interacting');

      const result = await service.changeState(1, 'idle');

      expect(result.success).toBe(true);
      expect(result.state).toBe('idle');
      expect(result.previousState).toBe('interacting');
      expect(result.context.interactingWith).toBeNull();
    });

    test('should transition from dancing to idle', async () => {
      await createTestAvatar(1, 'dancing');

      const result = await service.changeState(1, 'idle');

      expect(result.success).toBe(true);
      expect(result.state).toBe('idle');
      expect(result.previousState).toBe('dancing');
    });

    test('should allow same state transition (no-op)', async () => {
      await createTestAvatar(1, 'idle');

      const result = await service.changeState(1, 'idle');

      expect(result.success).toBe(true);
      expect(result.state).toBe('idle');
      expect(result.noChange).toBe(true);
    });
  });

  // ==================== Invalid Transition Rejection Tests ====================

  describe('Invalid Transition Rejection', () => {
    test('should reject transition from sitting to dancing', async () => {
      await createTestAvatar(1, 'sitting');

      const result = await service.changeState(1, 'dancing');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
      expect(result.currentState).toBe('sitting');
    });

    test('should reject transition from sitting to walking', async () => {
      await createTestAvatar(1, 'sitting');

      const result = await service.changeState(1, 'walking');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
    });

    test('should reject transition from sitting to interacting', async () => {
      await createTestAvatar(1, 'sitting');

      const result = await service.changeState(1, 'interacting');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
    });

    test('should reject transition from interacting to dancing', async () => {
      await createTestAvatar(1, 'interacting');

      const result = await service.changeState(1, 'dancing');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
    });

    test('should reject transition from interacting to walking', async () => {
      await createTestAvatar(1, 'interacting');

      const result = await service.changeState(1, 'walking');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
    });

    test('should reject transition from dancing to walking', async () => {
      await createTestAvatar(1, 'dancing');

      const result = await service.changeState(1, 'walking');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
    });

    test('should reject transition from dancing to sitting', async () => {
      await createTestAvatar(1, 'dancing');

      const result = await service.changeState(1, 'sitting');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
    });

    test('should reject transition from running to sitting', async () => {
      await createTestAvatar(1, 'running');

      const result = await service.changeState(1, 'sitting');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
    });

    test('should reject transition from running to dancing', async () => {
      await createTestAvatar(1, 'running');

      const result = await service.changeState(1, 'dancing');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state transition');
    });

    test('should reject transition to invalid state', async () => {
      await createTestAvatar(1, 'idle');

      const result = await service.changeState(1, 'flying');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject transition from invalid state', async () => {
      // Manually create avatar with invalid state (bypassing validation)
      const avatar = await Avatar.create({
        userId: 1,
        skinColor: '#fdbcb4',
        currentState: 'idle'
      });
      
      // Manually update to invalid state
      await sequelize.query(
        `UPDATE avatars SET current_state = 'invalid' WHERE user_id = 1`
      );

      const result = await service.changeState(1, 'walking');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ==================== State Persistence Tests ====================

  describe('State Persistence', () => {
    test('should save state to database', async () => {
      await createTestAvatar(1, 'idle');

      const saved = await service.saveState(1, 'walking');

      expect(saved).toBe(true);

      const avatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(avatar.currentState).toBe('walking');
      expect(avatar.stateChangedAt).toBeDefined();
    });

    test('should load state from database', async () => {
      await createTestAvatar(1, 'dancing');

      const state = await service.loadState(1);

      expect(state).toBe('dancing');
    });

    test('should return idle for avatar without explicit state', async () => {
      // Create avatar with null state
      await Avatar.create({
        userId: 1,
        skinColor: '#fdbcb4',
        currentState: null
      });

      const state = await service.loadState(1);

      expect(state).toBe('idle');
    });

    test('should return false when saving state for non-existent avatar', async () => {
      const saved = await service.saveState(99999, 'walking');

      expect(saved).toBe(false);
    });

    test('should return null when loading state for non-existent avatar', async () => {
      const state = await service.loadState(99999);

      expect(state).toBeNull();
    });

    test('should persist state changes through changeState', async () => {
      await createTestAvatar(1, 'idle');

      await service.changeState(1, 'sitting', {
        objectId: 100,
        nodeId: 200
      });

      const avatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(avatar.currentState).toBe('sitting');
      expect(avatar.previousState).toBe('idle');
      expect(avatar.sittingAt).toBe(200);
      expect(avatar.interactingWith).toBe(100);
      expect(avatar.stateChangedAt).toBeDefined();
    });

    test('should clear interaction references when returning to idle', async () => {
      const avatar = await Avatar.create({
        userId: 1,
        skinColor: '#fdbcb4',
        currentState: 'sitting',
        sittingAt: 200,
        interactingWith: 100
      });

      await service.changeState(1, 'idle');

      const updatedAvatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(updatedAvatar.currentState).toBe('idle');
      expect(updatedAvatar.sittingAt).toBeNull();
      expect(updatedAvatar.interactingWith).toBeNull();
    });
  });

  // ==================== State Synchronization Tests ====================

  describe('State Synchronization', () => {
    test('should broadcast state change to office room', () => {
      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };

      service.broadcastStateChange(
        mockIo,
        1,
        'sitting',
        'idle',
        'office-123',
        { objectId: 100, nodeId: 200 }
      );

      expect(mockIo.to).toHaveBeenCalledWith('office:office-123');
      expect(mockIo.emit).toHaveBeenCalledWith('avatar:state-changed', {
        userId: 1,
        newState: 'sitting',
        previousState: 'idle',
        timestamp: expect.any(String),
        context: { objectId: 100, nodeId: 200 }
      });
    });

    test('should broadcast to district when no office specified', () => {
      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };

      service.broadcastStateChange(mockIo, 1, 'walking', 'idle', null);

      expect(mockIo.to).toHaveBeenCalledWith('district:central');
      expect(mockIo.emit).toHaveBeenCalledWith('avatar:state-changed', expect.any(Object));
    });

    test('should include timestamp in broadcast message', () => {
      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };

      service.broadcastStateChange(mockIo, 1, 'dancing', 'idle', 'office-123');

      const emitCall = mockIo.emit.mock.calls[0];
      expect(emitCall[1].timestamp).toBeDefined();
      expect(new Date(emitCall[1].timestamp)).toBeInstanceOf(Date);
    });

    test('should sync all non-idle avatar states to new client', async () => {
      // Create multiple avatars with different states
      await createTestAvatar(1, 'idle');
      await createTestAvatar(2, 'sitting');
      await createTestAvatar(3, 'dancing');
      await createTestAvatar(4, 'walking');

      const mockSocket = {
        emit: jest.fn()
      };

      await service.syncStates(mockSocket, 'office-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('avatar:states-sync', {
        officeId: 'office-123',
        states: expect.arrayContaining([
          expect.objectContaining({ userId: 2, state: 'sitting' }),
          expect.objectContaining({ userId: 3, state: 'dancing' }),
          expect.objectContaining({ userId: 4, state: 'walking' })
        ]),
        timestamp: expect.any(String)
      });

      // Should not include idle avatar
      const emitCall = mockSocket.emit.mock.calls[0];
      const states = emitCall[1].states;
      expect(states.find(s => s.userId === 1)).toBeUndefined();
    });

    test('should sync empty array when no active avatars', async () => {
      const mockSocket = {
        emit: jest.fn()
      };

      await service.syncStates(mockSocket, 'office-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('avatar:states-sync', {
        officeId: 'office-123',
        states: [],
        timestamp: expect.any(String)
      });
    });
  });

  // ==================== getCurrentState Tests ====================

  describe('getCurrentState Functionality', () => {
    test('should get current state for existing avatar', async () => {
      await createTestAvatar(1, 'dancing');

      const result = await service.getCurrentState(1);

      expect(result.success).toBe(true);
      expect(result.state).toBe('dancing');
      expect(result.previousState).toBeNull();
      expect(result.stateChangedAt).toBeDefined();
    });

    test('should return idle for avatar without explicit state', async () => {
      await Avatar.create({
        userId: 1,
        skinColor: '#fdbcb4',
        currentState: null
      });

      const result = await service.getCurrentState(1);

      expect(result.success).toBe(true);
      expect(result.state).toBe('idle');
    });

    test('should return error for non-existent avatar', async () => {
      const result = await service.getCurrentState(99999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Avatar not found');
    });

    test('should include interaction context in state', async () => {
      await Avatar.create({
        userId: 1,
        skinColor: '#fdbcb4',
        currentState: 'sitting',
        sittingAt: 200,
        interactingWith: 100
      });

      const result = await service.getCurrentState(1);

      expect(result.success).toBe(true);
      expect(result.state).toBe('sitting');
      expect(result.sittingAt).toBe(200);
      expect(result.interactingWith).toBe(100);
    });

    test('should include previous state in result', async () => {
      await Avatar.create({
        userId: 1,
        skinColor: '#fdbcb4',
        currentState: 'walking',
        previousState: 'idle'
      });

      const result = await service.getCurrentState(1);

      expect(result.success).toBe(true);
      expect(result.state).toBe('walking');
      expect(result.previousState).toBe('idle');
    });
  });

  // ==================== resetToIdle Tests ====================

  describe('resetToIdle Utility', () => {
    test('should reset avatar to idle from any state', async () => {
      await createTestAvatar(1, 'dancing');

      const success = await service.resetToIdle(1);

      expect(success).toBe(true);

      const avatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(avatar.currentState).toBe('idle');
      expect(avatar.previousState).toBe('dancing');
    });

    test('should clear interaction references on reset', async () => {
      await Avatar.create({
        userId: 1,
        skinColor: '#fdbcb4',
        currentState: 'sitting',
        sittingAt: 200,
        interactingWith: 100
      });

      await service.resetToIdle(1);

      const avatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(avatar.currentState).toBe('idle');
      expect(avatar.sittingAt).toBeNull();
      expect(avatar.interactingWith).toBeNull();
    });

    test('should update stateChangedAt timestamp', async () => {
      const avatar = await createTestAvatar(1, 'walking');
      const oldTimestamp = avatar.stateChangedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await service.resetToIdle(1);

      const updatedAvatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(updatedAvatar.stateChangedAt.getTime()).toBeGreaterThan(oldTimestamp.getTime());
    });

    test('should return false for non-existent avatar', async () => {
      const success = await service.resetToIdle(99999);

      expect(success).toBe(false);
    });

    test('should handle resetting already idle avatar', async () => {
      await createTestAvatar(1, 'idle');

      const success = await service.resetToIdle(1);

      expect(success).toBe(true);

      const avatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(avatar.currentState).toBe('idle');
      expect(avatar.previousState).toBe('idle');
    });
  });

  // ==================== Edge Cases and Error Handling ====================

  describe('Edge Cases and Error Handling', () => {
    test('should handle changeState for non-existent avatar', async () => {
      const result = await service.changeState(99999, 'walking');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Avatar not found');
    });

    test('should handle multiple rapid state changes', async () => {
      await createTestAvatar(1, 'idle');

      // Perform multiple state changes rapidly
      const result1 = await service.changeState(1, 'walking');
      const result2 = await service.changeState(1, 'running');
      const result3 = await service.changeState(1, 'idle');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);

      const avatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(avatar.currentState).toBe('idle');
      expect(avatar.previousState).toBe('running');
    });

    test('should validate transition even for same state', async () => {
      await createTestAvatar(1, 'walking');

      const result = await service.changeState(1, 'walking');

      expect(result.success).toBe(true);
      expect(result.noChange).toBe(true);
    });

    test('should handle context without nodeId for sitting state', async () => {
      await createTestAvatar(1, 'idle');

      const result = await service.changeState(1, 'sitting', {
        objectId: 100
        // nodeId is missing
      });

      expect(result.success).toBe(true);
      expect(result.state).toBe('sitting');
      // When nodeId is missing, the sitting state is set but interactingWith is not updated
      // because the condition checks for nodeId presence
      expect(result.context.objectId).toBe(100);
    });

    test('should handle context without objectId for interacting state', async () => {
      await createTestAvatar(1, 'idle');

      const result = await service.changeState(1, 'interacting', {});

      expect(result.success).toBe(true);
      expect(result.state).toBe('interacting');
    });

    test('should preserve state history through multiple transitions', async () => {
      await createTestAvatar(1, 'idle');

      await service.changeState(1, 'walking');
      await service.changeState(1, 'running');
      await service.changeState(1, 'walking');
      await service.changeState(1, 'idle');

      const avatar = await Avatar.findOne({ where: { userId: 1 } });
      expect(avatar.currentState).toBe('idle');
      expect(avatar.previousState).toBe('walking');
    });

    test('should handle broadcast with empty context', () => {
      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };

      service.broadcastStateChange(mockIo, 1, 'idle', 'walking', 'office-123');

      expect(mockIo.emit).toHaveBeenCalledWith('avatar:state-changed', {
        userId: 1,
        newState: 'idle',
        previousState: 'walking',
        timestamp: expect.any(String),
        context: {}
      });
    });

    test('should handle validateTransition with valid states', () => {
      expect(service.validateTransition('idle', 'walking')).toBe(true);
      expect(service.validateTransition('walking', 'running')).toBe(true);
      expect(service.validateTransition('sitting', 'idle')).toBe(true);
    });

    test('should handle validateTransition with invalid states', () => {
      expect(service.validateTransition('sitting', 'dancing')).toBe(false);
      expect(service.validateTransition('invalid', 'walking')).toBe(false);
      expect(service.validateTransition('idle', 'invalid')).toBe(false);
    });
  });
});
