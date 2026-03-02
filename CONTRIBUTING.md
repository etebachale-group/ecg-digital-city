# Contributing to ECG Digital City

¡Gracias por tu interés en contribuir! Esta guía te ayudará a entender nuestro proceso de desarrollo.

## 📋 Tabla de Contenidos
1. [Code of Conduct](#code-of-conduct)
2. [Empezando](#empezando)
3. [Proceso de Desarrollo](#proceso-de-desarrollo)
4. [Estándares de Código](#estándares-de-código)
5. [Testing](#testing)
6. [Commits](#commits)
7. [Pull Requests](#pull-requests)

## 🤝 Code of Conduct
- Sé respetuoso con otros contribuyentes
- Acepta crítica constructiva
- Enfócate en lo mejor para la comunidad

## 🚀 Empezando

### 1. Fork y Clone
```bash
git clone https://github.com/[tu-usuario]/ecg-digital-city.git
cd ecg-digital-city
git remote add upstream https://github.com/etebachale-group/ecg-digital-city.git
```

### 2. Crear rama de feature
```bash
git checkout develop
git pull upstream develop
git checkout -b feature/mi-feature
```

### 3. Instalar dependencias
```bash
make install
# o manualmente:
cd backend && npm install
cd frontend && npm install
```

### 4. Empezar a desarrollar
```bash
make dev-docker
# o localmente:
cd backend && npm run dev
cd frontend && npm run dev
```

## 🔄 Proceso de Desarrollo

### 1. Crear una rama
Usar formato: `feature/nombre`, `bugfix/nombre`, `docs/nombre`
```bash
git checkout -b feature/sistema-paquetes
```

### 2. Hacer cambios
- Escribir tests primero (TDD)
- Implementar funcionalidad
- Mantener código limpio y legible

### 3. Testing
```bash
make test              # Correr todos los tests
make test-cov         # Con coverage
make lint             # Verificar linting
make format           # Formatear código
```

### 4. Commits
Ver sección [Commits](#commits)

### 5. Push y PR
```bash
git push origin feature/sistema-paquetes
```
Abrir PR en GitHub contra `develop`

### 6. Code Review
- Esperar review de al menos 1 dev
- Realizar cambios si es necesario
- Esperar hasta que pasen todos los tests

### 7. Merge
Cuando todo está aprobado, se mergea a `develop`

## 📝 Estándares de Código

### JavaScript/Node.js
```javascript
// ✅ CORRECTO
const getUserById = (id) => {
  if (!id) throw Error('ID is required');
  return database.users.find(u => u.id === id);
};

// ❌ INCORRECTO
function get_user_by_id(id) {
  if (!id) throw new Error("ID is required");
  let user = database.users.find(function(u) { return u.id === id; });
  return user;
}
```

### React/JSX
```jsx
// ✅ CORRECTO
const UserCard = ({ user, onDelete }) => {
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={() => onDelete(user.id)}>Delete</button>
    </div>
  );
};

export default UserCard;

// ❌ INCORRECTO
export default class UserCard extends React.Component {
  render() {
    const { user, onDelete } = this.props;
    return <div className="user-card"><h2>{user.name}</h2></div>;
  }
}
```

### Naming Conventions
- **Variables/Functions:** camelCase
- **Classes/Components:** PascalCase
- **Constants:** CONSTANT_CASE (si es realmente constante)
- **Private:** \_prefixWithUnderscore

### Code Quality
- Max line length: 100 caracteres
- No magic numbers - usar constantes nombradas
- DRY - No Repeat Yourself
- SOLID principles
- Documentación inline para lógica compleja

## 🧪 Testing

### Coverage Mínimo: 80%

### Backend - Jest
```bash
cd backend
npm test -- --coverage
npm test -- --watch  # Modo watch
```

**Escribir tests para:**
- Funciones utilitarias
- Lógica de negocio
- APIs endpoints
- Event handlers

### Frontend - Vitest
```bash
cd frontend
npm test -- --coverage
npm test -- --watch
```

**Escribir tests para:**
- Componentes React
- Hooks personalizados
- Functions de servicios
- State management

### Ejemplo Test
```javascript
// ✅ CORRECTO
describe('PacketBuilder', () => {
  describe('setType', () => {
    test('should set packet type correctly', () => {
      const builder = new PacketBuilder();
      builder.setType(0x10);
      
      expect(builder.type).toBe(0x10);
    });

    test('should throw error for invalid type', () => {
      const builder = new PacketBuilder();
      
      expect(() => builder.setType(256)).toThrow();
    });
  });
});
```

## 💬 Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Tipos Validos
- `feat:` Nueva feature
- `fix:` Bug fix
- `docs:` Cambios en documentación
- `style:` Cambios de formato (sin lógica)
- `refactor:` Refactorización
- `perf:` Performance improvements
- `test:` Agregar/actualizar tests
- `chore:` Cambios en build, deps, etc

### Ejemplos
```bash
# Feature
git commit -m "feat(packet-system): implement compression engine"

# Bug fix
git commit -m "fix(gameEngine): correct physics update timing"

# Documentation
git commit -m "docs(README): update installation instructions"

# Test
git commit -m "test(packetSystem): add serialization unit tests"

# Con scope y description detallada
git commit -m "feat(voiceChat): add audio noise cancellation

- Implement noise gate threshold
- Add echo suppression using Web Audio API
- Configure parameters for optimal voice quality"
```

## 📤 Pull Requests

### Antes de abrir un PR
- [ ] Tests pasando localmente
- [ ] Coverage 80%+
- [ ] Linting pasando
- [ ] Código formateado
- [ ] Commits descriptivos
- [ ] Documentación actualizada

### Al abrir PR
- Usar template de PR
- Descripción clara de cambios
- Referencia a issue si existe
- Screenshots para cambios visuales
- Notas para reviewer si es necesario

### Durante Review
- Responder a comentarios
- Realizar cambios si es necesario
- Re-request review después de cambios
- No forcepush a menos que sea necesario

## 🏆 Mejores Prácticas

### DO ✅
- Crear commits pequeños y atómicos
- Escribir tests junto al código
- Documentar lógica compleja
- Comunicar cambios en PR
- Pedir ayuda si la necesitas
- Revisar código de otros

### DON'T ❌
- No commitetar código sin testear
- No ignorar warnings de linting
- No usar console.log en producción
- No mergear PRs sin review
- No reescribir historia de commits
- No commitetar credentials/secrets

## 🐛 Reportando Bugs

Crear issue con:
1. **Descripción clara** del bug
2. **Pasos a reproducir**
3. **Comportamiento esperado** vs actual
4. **Versión** del proyecto
5. **Environment** (OS, navegador, etc)
6. **Screenshots** si aplica

## 💡 Sugerencias

¿Ideas nuevas?
1. Abrir discussion en GitHub
2. Describir la idea
3. Discutir con maintainers
4. Si hay consenso, crear feature branch

## 📞 Contacto

- **Tech Lead:** [asignar]
- **DevOps:** [asignar]
- **Discord:** [link del servidor]

---

¡Gracias por contribuir! 🚀
