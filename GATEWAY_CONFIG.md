# Configuración del Frontend para Microservicios con Gateway

## Arquitectura

El frontend se comunica con todos los microservicios a través del **API Gateway** en el puerto `8080`.

```
Frontend (Vue) → API Gateway (8080) → Microservicios
```

## Configuración del Gateway

El gateway está configurado en `http://localhost:8080` y enruta las peticiones a los siguientes microservicios:

### Rutas Públicas (sin autenticación)

- `/auth/login` → `user-microservice` (POST)
- `/auth/register` → `user-microservice` (POST)
- `/auth/validate` → `user-microservice` (GET)

### Rutas Protegidas (requieren token JWT)

#### User Microservice (`USER-MICROSERVICE`)

- `/users/**` → Gestión de usuarios
  - `GET /users` - Listar usuarios (ADMIN ve todos, OWNER/CARER solo su perfil)
  - `GET /users/{id}` - Obtener usuario por ID
  - `GET /users/email/{email}` - Obtener usuario por email
  - `GET /users/carers/available` - Cuidadores disponibles (PÚBLICO)
  - `GET /users/{userId}/is-carer` - Verificar si es cuidador (PÚBLICO)
  - `GET /users/{userId}/is-owner` - Verificar si es dueño (PÚBLICO)
  - `GET /users/{userId}/has-role/{roleName}` - Verificar rol (PÚBLICO)
  - `GET /users/{userId}/roles` - Obtener roles de usuario
  - `POST /users/{userId}/roles` - Asignar rol (solo ADMIN)
  - `DELETE /users/{userId}/roles/{roleId}` - Remover rol (solo ADMIN)
  - `POST /users` - Crear usuario (solo ADMIN)
  - `PUT /users/{id}` - Actualizar usuario
  - `DELETE /users/{id}` - Eliminar usuario (solo ADMIN)
  - `GET /users/count` - Contar usuarios (solo ADMIN)

- `/roles/**` → Gestión de roles (solo ADMIN)
- `/user-roles/**` → Gestión de relaciones usuario-rol

#### Services Microservice (`apirest-services`)

- `/apirest-services/**` → Gestión de servicios, cuidadores y propietarios
  - `/apirest-services/services/**` - Servicios
  - `/apirest-services/service-types/**` - Tipos de servicio
  - `/apirest-services/carers/**` - Cuidadores
  - `/apirest-services/carers-with-services/**` - Cuidadores con servicios
  - `/apirest-services/owners/**` - Propietarios

#### Reservation Microservice (`RESERVATION-MICROSERVICE`)

- `/reservations/**` → Gestión de reservaciones
- `/reservation-services/**` → Relaciones reservación-servicio

#### Invoice Microservice (`INVOICE-MICROSERVICE`)

- `/invoices/**` → Gestión de facturas

## Configuración del Frontend

### Proxy de Vite (Desarrollo)

En `vite.config.js` se configuró un proxy que redirige todas las peticiones a `/api` hacia el gateway:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

### Instancias de Axios

Todas las instancias de Axios están configuradas para usar:
- **Desarrollo**: `/api` (a través del proxy de Vite)
- **Producción**: `http://localhost:8080` (directo al gateway)

### Archivos API

- `AuthApi.js` - Autenticación (`/auth/**`)
- `UserApi.js` - Usuarios y roles (`/users/**`, `/roles/**`, `/user-roles/**`)
- `ServiceApi.js` - Servicios (`/apirest-services/services/**`, `/apirest-services/service-types/**`)
- `CarerApi.js` - Cuidadores (`/apirest-services/carers/**`)
- `OwnerApi.js` - Propietarios (`/apirest-services/owners/**`)
- `ReservationApi.js` - Reservaciones (`/reservations/**`, `/reservation-services/**`)

## Autenticación

### Flujo de Autenticación

1. **Login**: `POST /auth/login` → Recibe token JWT
2. **Token almacenado**: Se guarda en `localStorage`
3. **Interceptor automático**: Todas las peticiones incluyen `Authorization: Bearer {token}`
4. **Validación**: `GET /auth/validate` → Valida token y obtiene roles

### Protección de Rutas

El router de Vue tiene guards que:
- Verifican autenticación antes de acceder a rutas protegidas
- Verifican roles para rutas específicas (OWNER, CARER, ADMIN)
- Redirigen al login si no está autenticado

## Permisos por Rol

### ADMIN
- Acceso completo a todos los endpoints
- Puede ver, crear, actualizar y eliminar usuarios
- Puede gestionar roles

### OWNER
- Solo puede ver/actualizar su propio perfil
- Puede ver sus reservaciones
- Puede crear reservaciones

### CARER
- Solo puede ver/actualizar su propio perfil
- Puede ver sus reservaciones recibidas
- Puede gestionar sus servicios

## Notas Importantes

1. **Todas las peticiones pasan por el gateway**: No hay comunicación directa con los microservicios
2. **El gateway maneja CORS**: Configurado para permitir `http://localhost:5173`
3. **El gateway maneja autenticación**: Usa `AuthenticationFilter` para rutas protegidas
4. **Circuit Breaker**: El gateway tiene circuit breakers configurados para resiliencia

## Solución de Problemas

### Error de CORS
- Verifica que el gateway esté corriendo en el puerto 8080
- Verifica la configuración de CORS en el gateway
- Usa el proxy de Vite en desarrollo

### Error 401 (No autorizado)
- Verifica que el token esté en localStorage
- Verifica que el token no haya expirado
- Verifica que el usuario tenga los permisos necesarios

### Error 403 (Prohibido)
- Verifica que el usuario tenga el rol necesario
- Algunos endpoints solo están disponibles para ADMIN

