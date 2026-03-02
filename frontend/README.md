# 🌍 ECG Digital City - Frontend

Frontend multijugador en React con Three.js para la oficina virtual 3D.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build para producción
npm build
```

El frontend se iniciará en http://localhost:5173

## 🎮 Controles

- **WASD** - Mover avatar
- **E** - Interactuar con NPCs
- **T** - Abrir/cerrar chat
- **Mouse** - Rotar cámara (temporal)

## 📁 Estructura

```
frontend/
├── src/
│   ├── components/
│   │   ├── AuthScreen.jsx      # Login/Registro
│   │   ├── Office.jsx           # Oficina 3D
│   │   ├── Player.jsx           # Avatar del jugador
│   │   ├── OtherPlayer.jsx      # Avatares de otros jugadores
│   │   └── UI.jsx               # Overlay (mapa, chat, etc)
│   ├── services/
│   │   └── socket.js            # Cliente Socket.IO
│   ├── store/
│   │   ├── authStore.js         # Estado de autenticación
│   │   └── gameStore.js         # Estado del juego
│   ├── App.jsx                  # Componente principal
│   └── main.jsx                 # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## 🔧 Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool
- **Three.js** - Motor 3D
- **React Three Fiber** - React renderer para Three.js
- **@react-three/drei** - Helpers para R3F
- **Socket.IO Client** - WebSockets en tiempo real
- **Zustand** - Gestión de estado

## 🎨 Características

### Autenticación
- Login y registro de usuarios
- JWT tokens
- Persistencia de sesión

### Mundo 3D
- Oficina virtual con 4 áreas
- Movimiento con WASD
- Cámara que sigue al jugador
- Iluminación y sombras

### Multijugador
- Sincronización en tiempo real
- Ver otros jugadores moverse
- Nombres sobre avatares
- Contador de usuarios online

### Chat
- Chat por proximidad (3 unidades)
- Indicador de escritura
- Historial de mensajes
- Atajo de teclado (T)

### UI
- Mapa de navegación
- Información del jugador
- Contador de usuarios online
- Controles en pantalla

## 🔌 Conexión con Backend

El frontend se conecta al backend en `http://localhost:3000` mediante:

1. **API REST** - Login, registro, datos de usuario
2. **Socket.IO** - Sincronización en tiempo real

### Eventos Socket.IO

**Cliente → Servidor:**
- `avatar:move` - Movimiento del jugador
- `avatar:stop` - Jugador se detuvo
- `chat:message` - Enviar mensaje
- `chat:typing` - Indicador de escritura
- `teleport:request` - Cambiar de área

**Servidor → Cliente:**
- `world:users` - Lista de usuarios online
- `world:user-joined` - Usuario se unió
- `world:user-moved` - Usuario se movió
- `world:user-left` - Usuario salió
- `chat:message` - Mensaje recibido
- `chat:typing` - Alguien está escribiendo
- `teleport:success` - Teletransporte exitoso

## 🎯 Próximas Mejoras

- [ ] Sistema de colisiones con Cannon.js
- [ ] Animaciones de caminar
- [ ] NPCs interactivos
- [ ] Más áreas (Sala de reuniones, Presentaciones)
- [ ] Personalización de avatares
- [ ] Efectos de sonido
- [ ] Música ambiental
- [ ] Optimización de rendimiento
- [ ] Modo VR

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"
- Verifica que el backend esté corriendo en puerto 3000
- Revisa la consola del navegador para errores de CORS

### Error: "Token invalid"
- Limpia localStorage: `localStorage.clear()`
- Vuelve a hacer login

### Lag o FPS bajos
- Reduce la calidad de sombras en `App.jsx`
- Cierra otras pestañas del navegador
- Actualiza drivers de GPU

## 📄 Licencia

Propiedad de Eteba Chale Group © 2026
