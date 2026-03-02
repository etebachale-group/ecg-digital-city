/**
 * Test Helpers - Backend
 * Utilidades comunes para tests
 */

// Mock de Socket.IO
class MockSocket {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.removeListener(event, wrapper);
    };
    this.on(event, wrapper);
  }

  removeListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
}

// Mock de Database
class MockDatabase {
  async query(sql) {
    return { rows: [] };
  }

  async close() {
    return;
  }
}

// Mock de Redis
class MockRedis {
  constructor() {
    this.store = {};
  }

  async set(key, value, ttl) {
    this.store[key] = value;
    return 'OK';
  }

  async get(key) {
    return this.store[key] || null;
  }

  async del(key) {
    delete this.store[key];
    return 1;
  }

  async flushAll() {
    this.store = {};
    return 'OK';
  }

  async close() {
    return;
  }
}

module.exports = {
  MockSocket,
  MockDatabase,
  MockRedis,
};
