# Bocantino ERP

Sistema de gestión empresarial desarrollado con SvelteKit, TypeScript y PostgreSQL.

[Domain model](https://drive.google.com/file/d/1lwSNumP7MRxCC2nTSc_eueGmCpDp2uLi/view?usp=sharing)

## Requisitos

- Node.js 18.x o superior
- npm o yarn
- PostgreSQL (para producción) o Docker (para desarrollo)

## Desarrollo

### Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd bocantino-erp
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
# Copia el archivo de ejemplo y configura las variables
cp .env.example .env
# Edita .env con tus configuraciones de base de datos
```

4. Inicia la base de datos con Docker (para desarrollo):
```bash
npm run test:compose-up
```

5. Ejecuta las migraciones de la base de datos:
```bash
npm run db-push
```

6. Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia la aplicación en producción
- `npm run preview` - Vista previa de la build de producción
- `npm test` - Ejecuta los tests
- `npm run db-push` - Aplica cambios del schema a la base de datos
- `npm run db-migrate` - Genera migraciones de base de datos

## Despliegue en Producción con Node.js

### 1. Preparar el servidor

Asegúrate de que tu servidor tenga:
- Node.js 18.x o superior instalado
- PostgreSQL configurado y ejecutándose
- PM2 (recomendado para gestión de procesos)

### 2. Variables de entorno

Configura las siguientes variables de entorno en tu servidor:

```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/bocantino_erp

# JWT para autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro

# Entorno
NODE_ENV=production

# Puerto (opcional, por defecto 3000)
PORT=3000

# Host (opcional, por defecto 0.0.0.0)
HOST=0.0.0.0
```

### 3. Construir la aplicación

```bash
# En tu máquina local o servidor
npm install
npm run build
```

### 4. Subir archivos al servidor

Sube los siguientes archivos/carpetas a tu servidor:
- `build/` (carpeta generada por la build)
- `package.json`
- `package-lock.json`
- `.env` (con las variables de producción)

### 5. Instalar dependencias en producción

```bash
# En el servidor
npm ci --only=production
```

### 6. Configurar la base de datos

```bash
# Ejecuta las migraciones en producción
npm run db-push
```

### 7. Iniciar la aplicación

#### Opción A: Directamente con Node.js
```bash
npm start
```

#### Opción B: Con PM2 (recomendado)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'bocantino-erp',
    script: 'build/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js

# Configurar PM2 para reiniciar al arranque del sistema
pm2 startup
pm2 save
```

### 8. Configurar servidor web (Nginx - opcional)

Si deseas usar Nginx como proxy reverso:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Verificación del despliegue

1. Verifica que la aplicación esté ejecutándose:
```bash
curl http://localhost:3000
```

2. Revisa los logs:
```bash
# Con PM2
pm2 logs bocantino-erp

# Con Node.js directo
# Los logs aparecerán en la consola
```

3. Monitorea el estado:
```bash
# Con PM2
pm2 status
```

## Mantenimiento

### Actualizaciones
```bash
# Detener la aplicación
pm2 stop bocantino-erp

# Actualizar código
git pull origin main
npm install
npm run build

# Ejecutar migraciones si es necesario
npm run db-push

# Reiniciar la aplicación
pm2 restart bocantino-erp
```

### Backup de base de datos
```bash
# Crear backup
pg_dump bocantino_erp > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql bocantino_erp < backup_20240101_120000.sql
```

## Resolución de problemas

### La aplicación no inicia
1. Verifica las variables de entorno
2. Revisa que la base de datos esté disponible
3. Comprueba los logs de errores
4. Verifica que el puerto no esté ocupado

### Errores de base de datos
1. Verifica la conexión con `DATABASE_URL`
2. Asegúrate de que las migraciones estén aplicadas
3. Comprueba los permisos del usuario de base de datos

### Problemas de rendimiento
1. Usa PM2 en modo cluster
2. Configura un proxy reverso (Nginx)
3. Implementa cachéado
4. Monitorea el uso de recursos

