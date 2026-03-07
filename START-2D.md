# 🚀 Guía de Inicio Rápido - Modo 2D

## Requisitos Previos

- Node.js instalado
- Backend corriendo en puerto 3000
- PostgreSQL con base de datos configurada

## Pasos para Probar el Modo 2D

### 1. Instalar Dependencias (si no lo has hecho)

```bash
cd frontend
npm install
```

### 2. Iniciar el Frontend en Desarrollo

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: http://localhost:5173

### 3. Iniciar el Backend (en otra terminal)

```bash
cd backend
npm start
```

El backend estará disponible en: http://localhost:3000

### 4. Acceder a la Aplicación

1. Abre tu navegador en http://localhost:5173
2. Inicia sesión o regístrate
3. Por defecto, la aplicación cargará en **modo 2D**

### 5. Cambiar entre 3D y 2D

- Haz click en el botón **🎮 2D** o **🎲 3D** en la esquina superior derecha
- La página se recargará automáticamente con el modo seleccionado
- Tu preferencia se guarda en localStorage

## 🎮 Controles en Modo 2D

### Movimiento
- **W / ↑**: Mover arriba
- **S / ↓**: Mover abajo
- **A / ←**: Mover izquierda
- **D / →**: Mover derecha
- **Shift + WASD**: Correr

### UI
- **T**: Abrir/cerrar chat
- **M**: Abrir mapa de distritos
- **ESC**: Cerrar ventanas

## 🔍 Verificar que Funciona

### Indicadores Visuales
1. **Esquina superior derecha**: Debe decir "2D Mode (Pixi.js)"
2. **Avatar**: Verás un rectángulo azul (placeholder)
3. **Movimiento**: El avatar debe moverse suavemente con WASD
4. **Cámara**: La cámara debe seguir al avatar

### Consola del Navegador
Deberías ver estos mensajes:
```
🎮 Pixi.js 2D initialized!
👤 Player avatar created
✅ 2D Game loop started!
```

### Performance
- **FPS**: Debería estar cerca de 60 FPS
- **Memoria**: ~150MB (vs 400MB en 3D)
- **Carga**: ~2 segundos

## 🐛 Troubleshooting

### El modo 2D no carga
1. Verifica que Pixi.js esté instalado: `npm list pixi.js`
2. Limpia la caché: `rm -rf node_modules/.vite`
3. Reconstruye: `npm run build`

### Avatar no se mueve
1. Verifica que el backend esté corriendo
2. Abre la consola y busca errores
3. Verifica que Socket.IO esté conectado

### Performance baja
1. Cierra otras pestañas del navegador
2. Verifica que no haya otros procesos pesados
3. Prueba en modo incógnito

### No puedo cambiar a 3D
1. Verifica que Three.js esté instalado
2. Limpia localStorage: `localStorage.clear()`
3. Recarga la página

## 📊 Comparación 3D vs 2D

| Característica | 3D (Three.js) | 2D (Pixi.js) |
|----------------|---------------|--------------|
| FPS | 45-55 | 58-60 |
| Memoria | 400MB | 150MB |
| Carga | 8s | 2s |
| Bundle | 1.0MB | 465KB |
| Complejidad | Alta | Media |

## 🎯 Qué Esperar en Fase 1

### ✅ Funciona
- Renderizado 2D básico
- Movimiento WASD
- Cámara con seguimiento
- Toggle 3D/2D
- UI completa

### ⏳ Pendiente (Próximas Fases)
- Sprites animados (Fase 2)
- Otros jugadores visibles (Fase 2)
- Colisiones con paredes (Fase 3)
- Distritos renderizados (Fase 3)
- Objetos interactivos (Fase 3)

## 🚀 Siguiente Fase

Una vez verificado que todo funciona, estamos listos para:
- **Fase 2**: Implementar sprites animados y sistema de avatares completo
- **Fase 3**: Agregar colisiones y renderizado de distritos
- **Fase 4**: Integrar todas las features (chat, gamificación, etc.)

## 📝 Reportar Issues

Si encuentras problemas:
1. Verifica la consola del navegador
2. Verifica la consola del backend
3. Revisa el archivo `MIGRACION-2D-PROGRESO.md`
4. Documenta el error con screenshots

## 💡 Tips

1. **Desarrollo**: Usa `npm run dev` para hot reload
2. **Producción**: Usa `npm run build` para optimizar
3. **Debug**: Abre DevTools (F12) para ver logs
4. **Performance**: Usa Chrome DevTools > Performance para profiling

## 🎉 ¡Listo!

Si ves el avatar moviéndose en 2D, ¡la Fase 1 está funcionando correctamente! 🎮
