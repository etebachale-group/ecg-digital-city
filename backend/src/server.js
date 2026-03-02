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
app.use(helmet());
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

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: 'ECG Digital City API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs'
  });
});

// Manejo de errores 404
app.use((req, res) => {
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
    // Conectar a la base de datos
    await initializeDatabase();
    logger.info('✅ Base de datos conectada');
    
    // Seed de gamificación
    const { seedGamification } = require('./utils/seedGamification');
    await seedGamification();

    // Conectar a Redis
    await initializeRedis();
    logger.info('✅ Redis conectado');

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || 'localhost';

    server.listen(PORT, HOST, () => {
      logger.info(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV}`);
      logger.info(`🔌 Socket.IO listo para conexiones`);
    });

  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
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
