/**
 * Jest Setup File - Backend
 * Configuración global de Jest para tests del backend
 */

// Aumentar timeout para tests de base de datos
jest.setTimeout(10000);

// Mock de variables de entorno
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-secret-key';

// Configurar logging silencioso en tests
global.logger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
