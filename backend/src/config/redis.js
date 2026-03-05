const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

// Solo conectar a Redis si está configurado
if (process.env.REDIS_HOST) {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redis.on('connect', () => {
    logger.info('Redis conectado');
  });

  redis.on('error', (err) => {
    logger.error('Error de Redis:', err);
  });
} else {
  logger.warn('Redis no configurado - usando memoria local');
}

async function initializeRedis() {
  return redis;
}

// Almacenamiento en memoria como fallback
const memoryStore = {
  users: new Map(),
  districts: new Map(),
  offices: new Map()
};

// Funciones de utilidad para usuarios online
async function setUserOnline(userId, socketId, position) {
  if (!redis) {
    memoryStore.users.set(userId, { socketId, position, lastUpdate: Date.now() });
    return;
  }
  const key = `user:${userId}`;
  await redis.hset(key, {
    socketId,
    positionX: position.x,
    positionY: position.y,
    positionZ: position.z,
    lastUpdate: Date.now()
  });
  await redis.expire(key, 3600);
  await redis.sadd('users:online', userId);
}

async function setUserOffline(userId) {
  if (!redis) {
    memoryStore.users.delete(userId);
    return;
  }
  await redis.del(`user:${userId}`);
  await redis.srem('users:online', userId);
}

async function getUsersOnline() {
  if (!redis) {
    return Array.from(memoryStore.users.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }
  const userIds = await redis.smembers('users:online');
  const users = [];
  
  for (const userId of userIds) {
    const userData = await redis.hgetall(`user:${userId}`);
    if (userData && userData.socketId) {
      users.push({
        userId,
        ...userData,
        positionX: parseFloat(userData.positionX),
        positionY: parseFloat(userData.positionY),
        positionZ: parseFloat(userData.positionZ)
      });
    }
  }
  
  return users;
}

async function updateUserPosition(userId, position) {
  if (!redis) {
    const user = memoryStore.users.get(userId);
    if (user) {
      user.position = position;
      user.lastUpdate = Date.now();
    }
    return;
  }
  const key = `user:${userId}`;
  await redis.hmset(key, {
    positionX: position.x,
    positionY: position.y,
    positionZ: position.z,
    lastUpdate: Date.now()
  });
}

// Funciones para distritos
async function setUserDistrict(userId, districtSlug) {
  if (!redis) {
    if (!memoryStore.districts.has(districtSlug)) {
      memoryStore.districts.set(districtSlug, new Set());
    }
    memoryStore.districts.get(districtSlug).add(userId);
    return;
  }
  await redis.hset(`user:${userId}`, 'district', districtSlug);
  await redis.sadd(`district:${districtSlug}:users`, userId);
}

async function removeUserFromDistrict(userId, districtSlug) {
  if (!redis) {
    const district = memoryStore.districts.get(districtSlug);
    if (district) district.delete(userId);
    return;
  }
  await redis.srem(`district:${districtSlug}:users`, userId);
}

async function getUsersInDistrict(districtSlug) {
  if (!redis) {
    const district = memoryStore.districts.get(districtSlug);
    return district ? Array.from(district) : [];
  }
  return await redis.smembers(`district:${districtSlug}:users`);
}

// Funciones para oficinas
async function setUserInOffice(userId, officeId) {
  if (!redis) {
    if (!memoryStore.offices.has(officeId)) {
      memoryStore.offices.set(officeId, new Set());
    }
    memoryStore.offices.get(officeId).add(userId);
    return;
  }
  await redis.hset(`user:${userId}`, 'officeId', officeId);
  await redis.sadd(`office:${officeId}:users`, userId);
}

async function removeUserFromOffice(userId, officeId) {
  if (!redis) {
    const office = memoryStore.offices.get(officeId);
    if (office) office.delete(userId);
    return;
  }
  await redis.srem(`office:${officeId}:users`, userId);
}

async function getUsersInOffice(officeId) {
  if (!redis) {
    const office = memoryStore.offices.get(officeId);
    return office ? Array.from(office) : [];
  }
  return await redis.smembers(`office:${officeId}:users`);
}

// Cache de permisos
async function cachePermission(userId, officeId, permission) {
  if (!redis) return; // Sin cache en memoria
  const key = `permission:${userId}:${officeId}`;
  await redis.setex(key, 600, JSON.stringify(permission));
}

async function getPermissionFromCache(userId, officeId) {
  if (!redis) return null;
  const key = `permission:${userId}:${officeId}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

// Funciones para gamificación
async function cacheUserProgress(userId, progress) {
  if (!redis) return;
  const key = `progress:${userId}`;
  await redis.setex(key, 300, JSON.stringify(progress));
}

async function getUserProgressCache(userId) {
  if (!redis) return null;
  const key = `progress:${userId}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

async function invalidateUserProgressCache(userId) {
  if (!redis) return;
  await redis.del(`progress:${userId}`);
}

// Leaderboard con sorted sets
async function updateLeaderboard(userId, xp) {
  if (!redis) return;
  await redis.zadd('leaderboard:global', xp, userId);
}

async function getLeaderboard(limit = 10) {
  if (!redis) return [];
  return await redis.zrevrange('leaderboard:global', 0, limit - 1, 'WITHSCORES');
}

module.exports = {
  redis,
  initializeRedis,
  setUserOnline,
  setUserOffline,
  getUsersOnline,
  updateUserPosition,
  setUserDistrict,
  removeUserFromDistrict,
  getUsersInDistrict,
  setUserInOffice,
  removeUserFromOffice,
  getUsersInOffice,
  cachePermission,
  getPermissionFromCache,
  cacheUserProgress,
  getUserProgressCache,
  invalidateUserProgressCache,
  updateLeaderboard,
  getLeaderboard
};
