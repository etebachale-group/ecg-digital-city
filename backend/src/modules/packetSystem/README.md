# 📦 Packet System Module

## Descripción
Sistema de paquetes binario eficiente para comunicación cliente-servidor en tiempo real con compresión delta y entrega confiable.

## Estado del Módulo
- [ ] ✅ Fase 1: Especificación Completa
- [ ] ⏳ Fase 2: Prototipo (Próxima)
- [ ] ⏳ Fase 3: Feature Complete
- [ ] ⏳ Fase 4: Tested (80%+)
- [ ] ⏳ Fase 5: Production Ready

**Fase Actual:** 1 - Especificación  
**Estimación:** 4-6 semanas  
**Team Size:** 2-3 devs

## Características Principales

### Formato de Paquete
```
[Header: 8 bytes]
  - Type (1 byte): 0-255 tipos de paquete
  - ID (2 bytes): Identificador único
  - Flags (1 byte): Confiable, Comprimido, ACK, etc.
  - Timestamp (4 bytes): Timestamp del servidor

[Body: Variable]
  - Length (2 bytes): Tamaño de payload
  - Payload: Datos del paquete

[Checksum: 4 bytes]
  - CRC32 para validación
```

### Tipos de Paquete
```
0x01-0x0F: Sistema (heartbeat, ACK, etc.)
0x10-0x1F: Movimiento (player position, rotation)
0x20-0x2F: Gamificación (XP, achievements)
0x30-0x3F: Chat (mensajes)
0x40-0x4F: Voice (audio packets)
0x50-0x5F: Audio 3D (spatial audio)
0x60-0x6F: Empresas/Oficinas
0x70-0x7F: Eventos
0x80-0xFF: Extensiones
```

## Módulos del Sistema

### 1. PacketBuilder.js
Construye paquetes binarios desde datos.

**Métodos principales:**
- `createPacket(type, data, options)` → Buffer
- `addHeader(type, id, flags)` → Builder
- `addPayload(data)` → Builder
- `addChecksum()` → Buffer

**Ejemplo:**
```javascript
const builder = new PacketBuilder();
const packet = builder
  .createPacket(0x10, playerData)
  .addFlag('reliable')
  .build();
```

### 2. PacketParser.js
Parse y valida paquetes binarios.

**Métodos principales:**
- `parse(buffer)` → { header, payload, valid }
- `validateChecksum(buffer)` → boolean
- `getPacketType(buffer)` → number
- `extractPayload(buffer)` → Buffer

**Ejemplo:**
```javascript
const parser = new PacketParser();
const { header, payload } = parser.parse(receivedBuffer);
if (parser.isValid(receivedBuffer)) {
  // Procesar payload
}
```

### 3. CompressionEngine.js
Compresión delta y minificación.

**Características:**
- Delta compression: solo cambios
- ZSTD compression: 40-60% reducción
- State snapshots: cada N paquetes
- Efficient encoding: variable integer encoding

**Métodos:```
- `compress(data, previous)` → Buffer (20-40% original)
- `decompress(buffer, previous)` → Object
- `setCompressionLevel(level)` → void (1-22)

### 4. ReliableDelivery.js
Asegura entrega de paquetes críticos.

**Features:**
- ACK tracking
- Exponential backoff retries
- Sequence numbering
- Timeout handling (3 retries max)

**Métodos:**
- `sendReliable(packet)` → Promise<ACKed>
- `onPacketReceived(packet)` → void
- `resendMissing()` → void
- `cleanup()` → void

## Dependencias

### Internas
- `Logger` (utils/logger.js)
- `EventDispatcher` (gameEngine/EventDispatcher.js)

### Externas
```json
{
  "crc32": "^1.2.0",
  "zstd.wasm": "^1.1.0"
}
```

## Testing

### Pruebas Unitarias
```bash
npm test -- tests/unit/packetSystem
```

**Coverage esperado:** 90%+

**Tests a escribir:**
- [ ] PacketBuilder serialization
- [ ] PacketParser deserialization  
- [ ] Checksum validation
- [ ] Compression ratio >40%
- [ ] Delta compression accuracy
- [ ] Reliable delivery ACK
- [ ] Retry mechanism exponential backoff
- [ ] Timeout handling

### Pruebas de Carga
```bash
npm run test:load -- tests/load/packet-throughput.js
```

**Benchmarks:**
- Serialización: <1ms
- Deserialización: <1ms
- Compresión: <2ms
- Throughput: >1000 paquetes/seg

## Ejemplos de Uso

### Enviar paquete de movimiento
```javascript
const packetBuilder = new PacketBuilder();
const movePacket = packetBuilder
  .createPacket(0x11, {
    x: player.x,
    y: player.y,
    z: player.z,
    angle: player.angle
  })
  .addFlag('unreliable')
  .build();

socket.send(movePacket);
```

### Recibir y parsear
```javascript
socket.on('data', (buffer) => {
  const parser = new PacketParser();
  const { header, payload } = parser.parse(buffer);
  
  if (!parser.isValid(buffer)) {
    console.error('Invalid packet checksum');
    return;
  }
  
  handlePacket(header.type, payload);
});
```

### Envío confiable
```javascript
const reliable = new ReliableDelivery(socket);
const gamificationPacket = packetBuilder
  .createPacket(0x20, { xp: 50, achievement: 'slayer' })
  .addFlag('reliable')
  .build();

await reliable.sendReliable(gamificationPacket);
```

## Performance Targets

| Métrica | Target | Status |
|---------|--------|--------|
| Serialización | <1ms | ⏳ |
| Deserialización | <1ms | ⏳ |
| Compresión | <2ms | ⏳ |
| Ratio compresión | >40% | ⏳ |
| Throughput | >1000 paq/s | ⏳ |
| Latencia de ACK | <50ms | ⏳ |
| Loss rate | <0.1% | ⏳ |

## Integración con Sistema Actual

### Socket.IO Integration
```javascript
// En sockets/index.js
const packetSystem = require('../modules/packetSystem');

io.on('connection', (socket) => {
  socket.on('packet', (buffer) => {
    const packet = packetSystem.parse(buffer);
    // Manejar packet
  });
});
```

### Database Logging
Guardar estadísticas de paquetes:
```javascript
PacketStats.create({
  type: header.type,
  size: buffer.length,
  compressed: flags.compressed,
  timestamp: new Date()
});
```

## Próximos Pasos

1. ✅ Escribir especificación técnica completa
2. ⏳ Implementar PacketBuilder y Parser
3. ⏳ Implementar CompressionEngine
4. ⏳ Implementar ReliableDelivery
5. ⏳ Escribir tests unitarios (80%+ coverage)
6. ⏳ Integration testing con Socket.IO
7. ⏳ Load testing (1000+ usuarios)
8. ⏳ Optimizaciones de performance

## Referencias

- [Packet System Specification](../../docs/technical-specs/PACKET-SYSTEM-SPEC.md)
- [Game Engine Architecture](../../docs/architecture/ARCHITECTURE.md)
- [Socket.IO Documentation](https://socket.io/docs/)

## Contribuyendo

Ver [CONTRIBUTING.md](../../../CONTRIBUTING.md) para guías de contribución.

---

**Creado:** 2026-03-02  
**Última actualización:** 2026-03-02  
**Responsable:** Tech Lead
