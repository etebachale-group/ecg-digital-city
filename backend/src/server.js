require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const { setupSocketHandlers } = require('./sockets');

// Importar modelos (con asociaciones)
require('./models');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const officeRoutes = require('./routes/offices');
const districtRoutes = require('./routes/districts');
const permissionRoutes = require('./routes/permissions');
const gamificationRoutes = require('./routes/gamification');
const achievementRoutes = require('./routes/achievements');
const missionRoutes = require('./routes/missions');
const eventRoutes = require('./routes/events');
const interactiveObjectRoutes = require('./routes/interactiveObjects');

const app = express();
const server = http.createServer(app);

// Configuración de Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitar CSP para permitir conexiones
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/objects', interactiveObjectRoutes);

// Ruta de health check
app.get('/health', async (req, res) => {
  try {
    const { sequelize } = require('./config/database')
    const District = require('./models/District')
    const Achievement = require('./models/Achievement')
    const User = require('./models/User')
    
    // Verificar conexión a BD
    await sequelize.authenticate()
    
    // Contar registros críticos
    const [districtCount, achievementCount, userCount] = await Promise.all([
      District.count().catch(() => 0),
      Achievement.count().catch(() => 0),
      User.count().catch(() => 0)
    ])
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        districts: districtCount,
        achievements: achievementCount,
        users: userCount
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false
      }
    })
  }
});

// Ruta raíz de API
app.get('/api', (req, res) => {
  res.json({
    name: 'ECG Digital City API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs'
  });
});

// Servir archivos estáticos del frontend (para producción)
const path = require('path');
const frontendPath = path.join(__dirname, '../../frontend/dist');

if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos
  app.use(express.static(frontendPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));

  // Manejar rutas de React Router (SPA)
  app.get('*', (req, res, next) => {
    // No manejar rutas de API
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Manejo de errores 404 para API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  logger.error('Error no manejado:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Configurar Socket.IO handlers
setupSocketHandlers(io);

// Inicializar servicios
async function startServer() {
  try {
    logger.info('🔄 Iniciando servidor...');
    logger.info(`📝 Variables de entorno: NODE_ENV=${process.env.NODE_ENV}, DB_HOST=${process.env.DB_HOST}, DB_NAME=${process.env.DB_NAME}`);
    
    // Conectar a la base de datos
    logger.info('🔄 Conectando a la base de datos...');
    await initializeDatabase();
    logger.info('✅ Base de datos conectada');
    
    // Ejecutar migraciones automáticamente en producción
    if (process.env.NODE_ENV === 'production' && process.env.AUTO_MIGRATE !== 'false' && false) { // DESHABILITADO TEMPORALMENTE
      logger.info('🔄 Ejecutando migraciones automáticas...');
      try {
        const { runMigrations } = require('../scripts/migrate');
        const result = await runMigrations();
        logger.info('✅ Migraciones completadas');
        
        // Seed de distritos DESPUÉS de las migraciones (solo si fueron exitosas)
        if (result.success) {
          logger.info('🔄 Ejecutando seed de distritos...');
          try {
            const { seedDistricts } = require('./utils/seedDistricts');
            await seedDistricts();
            logger.info('✅ Seed de distritos completado');
          } catch (seedError) {
            logger.warn('⚠️  Error en seed de distritos:', seedError.message);
          }
        }
      } catch (migrationError) {
        logger.error('❌ Error en migraciones:', migrationError.message);
        throw migrationError; // Detener si las migraciones fallan
      }
    }
    
    // Seed de gamificación (solo si llegamos aquí)
    logger.info('🔄 Ejecutando seed de gamificación...');
    try {
      const { seedGamification } = require('./utils/seedGamification');
      await seedGamification();
      logger.info('✅ Seed de gamificación completado');
    } catch (seedError) {
      logger.warn('⚠️  Error en seed de gamificación:', seedError.message);
    }

    // Conectar a Redis (opcional)
    logger.info('🔄 Conectando a Redis...');
    try {
      await initializeRedis();
      logger.info('✅ Redis conectado');
    } catch (redisError) {
      logger.warn('⚠️  Redis no disponible, continuando sin cache:', redisError.message);
    }

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    server.listen(PORT, HOST, () => {
      logger.info(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV}`);
      logger.info(`🔌 Socket.IO listo para conexiones`);
    });

  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar el servidor
startServer();

module.exports = { app, server, io };
