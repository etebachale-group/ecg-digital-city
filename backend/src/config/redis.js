const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
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

async function initializeRedis() {
  return redis;
}

// Funciones de utilidad para usuarios online
async function setUserOnline(userId, socketId, position) {
  const key = `user:${userId}`;
  await redis.hset(key, {
    socketId,
    positionX: position.x,
    positionY: position.y,
    positionZ: position.z,
    lastUpdate: Date.now()
  });
  await redis.expire(key, 3600); // 1 hora
  await redis.sadd('users:online', userId);
}

async function setUserOffline(userId) {
  await redis.del(`user:${userId}`);
  await redis.srem('users:online', userId);
}

async function getUsersOnline() {
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
  await redis.hset(`user:${userId}`, 'district', districtSlug);
  await redis.sadd(`district:${districtSlug}:users`, userId);
}

async function removeUserFromDistrict(userId, districtSlug) {
  await redis.srem(`district:${districtSlug}:users`, userId);
}

async function getUsersInDistrict(districtSlug) {
  return await redis.smembers(`district:${districtSlug}:users`);
}

// Funciones para oficinas
async function setUserInOffice(userId, officeId) {
  await redis.hset(`user:${userId}`, 'officeId', officeId);
  await redis.sadd(`office:${officeId}:users`, userId);
}

async function removeUserFromOffice(userId, officeId) {
  await redis.srem(`office:${officeId}:users`, userId);
}

async function getUsersInOffice(officeId) {
  return await redis.smembers(`office:${officeId}:users`);
}

// Cache de permisos
async function cachePermission(userId, officeId, permission) {
  const key = `permission:${userId}:${officeId}`;
  await redis.setex(key, 600, JSON.stringify(permission)); // 10 minutos
}

async function getPermissionFromCache(userId, officeId) {
  const key = `permission:${userId}:${officeId}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

// Funciones para gamificación
async function cacheUserProgress(userId, progress) {
  const key = `progress:${userId}`;
  await redis.setex(key, 300, JSON.stringify(progress)); // 5 minutos
}

async function getUserProgressCache(userId) {
  const key = `progress:${userId}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

async function invalidateUserProgressCache(userId) {
  await redis.del(`progress:${userId}`);
}

// Leaderboard con sorted sets
async function updateLeaderboard(userId, xp) {
  await redis.zadd('leaderboard:global', xp, userId);
}

async function getLeaderboard(limit = 10) {
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
