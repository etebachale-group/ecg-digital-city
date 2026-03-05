# 🛠️ Comandos Útiles para Vercel

## Instalación de Vercel CLI

```bash
npm i -g vercel
```

## Comandos Básicos

### Login
```bash
vercel login
```

### Desplegar (Preview)
```bash
vercel
```

### Desplegar a Producción
```bash
vercel --prod
```

### Ver Logs en Tiempo Real
```bash
vercel logs
vercel logs --follow
```

### Ver Logs de una Función Específica
```bash
vercel logs [deployment-url]
```

## Variables de Entorno

### Listar Variables
```bash
vercel env ls
```

### Agregar Variable
```bash
vercel env add
```

### Eliminar Variable
```bash
vercel env rm [variable-name]
```

### Descargar Variables (para desarrollo local)
```bash
vercel env pull
```

## Dominios

### Listar Dominios
```bash
vercel domains ls
```

### Agregar Dominio
```bash
vercel domains add [domain]
```

### Eliminar Dominio
```bash
vercel domains rm [domain]
```

## Proyectos

### Listar Proyectos
```bash
vercel list
```

### Ver Información del Proyecto
```bash
vercel inspect [deployment-url]
```

### Eliminar Deployment
```bash
vercel remove [deployment-url]
```

## Desarrollo Local

### Ejecutar Localmente con Vercel Dev
```bash
vercel dev
```

Esto simula el entorno de Vercel localmente.

### Vincular Proyecto Local
```bash
vercel link
```

## Alias

### Asignar Alias a Deployment
```bash
vercel alias [deployment-url] [alias]
```

### Ejemplo
```bash
vercel alias ecg-digital-city-abc123.vercel.app production.ecg-digital-city.com
```

## Secretos

### Agregar Secreto
```bash
vercel secrets add [secret-name] [secret-value]
```

### Listar Secretos
```bash
vercel secrets ls
```

### Eliminar Secreto
```bash
vercel secrets rm [secret-name]
```

### Usar Secreto en Variables de Entorno
```bash
# En vercel.json
{
  "env": {
    "DB_PASSWORD": "@db-password-secret"
  }
}
```

## Equipos

### Cambiar a Equipo
```bash
vercel switch
```

### Listar Equipos
```bash
vercel teams ls
```

## Certificados SSL

### Listar Certificados
```bash
vercel certs ls
```

### Agregar Certificado
```bash
vercel certs add
```

## Integración con Git

### Desconectar de Git
```bash
vercel git disconnect
```

### Conectar a Git
```bash
vercel git connect
```

## Comandos de Información

### Ver Whoami
```bash
vercel whoami
```

### Ver Ayuda
```bash
vercel help
vercel [command] --help
```

## Scripts NPM Útiles

Agrega estos scripts a tu `package.json` raíz:

```json
{
  "scripts": {
    "deploy": "vercel",
    "deploy:prod": "vercel --prod",
    "logs": "vercel logs --follow",
    "env:pull": "vercel env pull",
    "verify": "node scripts/verify-deployment.js"
  }
}
```

Luego puedes usar:

```bash
npm run deploy
npm run deploy:prod
npm run logs
npm run env:pull
npm run verify
```

## Workflow Recomendado

### Desarrollo
```bash
# 1. Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Desplegar preview
vercel

# 3. Probar en URL de preview
# 4. Si todo está bien, merge a main
git push origin main

# 5. Vercel despliega automáticamente a producción
```

### Hotfix en Producción
```bash
# 1. Hacer cambios urgentes
git add .
git commit -m "fix: corrección urgente"

# 2. Desplegar directamente a producción
vercel --prod

# 3. Luego hacer push a Git
git push origin main
```

## Debugging

### Ver Build Logs
```bash
vercel logs [deployment-url] --output
```

### Ver Function Logs
```bash
vercel logs [deployment-url] --since 1h
```

### Inspeccionar Deployment
```bash
vercel inspect [deployment-url]
```

### Ver Variables de Entorno Activas
```bash
vercel env ls
```

## Rollback

### Promover Deployment Anterior
```bash
# 1. Listar deployments
vercel list

# 2. Promover deployment anterior
vercel alias [old-deployment-url] [production-domain]
```

## Monitoreo

### Ver Métricas
```bash
# En Vercel Dashboard
# Analytics > Overview
```

### Configurar Alertas
```bash
# En Vercel Dashboard
# Settings > Notifications
```

## Limpieza

### Eliminar Deployments Antiguos
```bash
# Listar
vercel list

# Eliminar uno por uno
vercel remove [deployment-url]
```

### Script para Limpiar Deployments Antiguos
```bash
# Eliminar todos excepto los últimos 5
vercel list --json | jq -r '.[5:] | .[].uid' | xargs -I {} vercel remove {}
```

## Troubleshooting Común

### Error: "No se puede conectar a la base de datos"
```bash
# Verificar variables de entorno
vercel env ls

# Descargar variables localmente
vercel env pull

# Verificar en .env.local
cat .env.local
```

### Error: "Build failed"
```bash
# Ver logs completos
vercel logs [deployment-url] --output

# Probar build localmente
cd frontend && npm run build
cd backend && npm run build
```

### Error: "Function timeout"
```bash
# Aumentar timeout en vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  }
}
```

## Recursos

- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Vercel API](https://vercel.com/docs/rest-api)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)

## Atajos de Teclado en Dashboard

- `Cmd/Ctrl + K` - Búsqueda rápida
- `G + D` - Ir a Deployments
- `G + S` - Ir a Settings
- `G + A` - Ir a Analytics

## Tips Pro

1. **Usa Preview Deployments:** Cada branch obtiene su propia URL
2. **Configura Branch Protection:** Solo main va a producción
3. **Usa Secretos:** Para datos sensibles
4. **Monitorea Analytics:** Para detectar problemas temprano
5. **Configura Alertas:** Para downtime y errores
6. **Usa Vercel Dev:** Para desarrollo local más cercano a producción
7. **Documenta Variables:** En .env.example
8. **Automatiza con GitHub Actions:** Para tests antes de deploy

## Ejemplo de GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```
