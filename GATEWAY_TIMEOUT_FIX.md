# Solución al Error 504 (Gateway Timeout) en Registro

## Problema

El error **504 Gateway Timeout** indica que el API Gateway no puede comunicarse con el microservicio de usuario o el microservicio está tardando demasiado en responder.

## Causas Comunes

1. **Microservicio no está corriendo**
   - El microservicio `user-microservice` no está iniciado

2. **Microservicio no está registrado en Eureka**
   - El microservicio no se ha registrado correctamente en el servidor de descubrimiento

3. **Problema de red/conectividad**
   - El gateway no puede alcanzar el microservicio
   - Firewall bloqueando la comunicación

4. **Timeout muy corto**
   - El proceso de registro tarda más de lo configurado en el gateway

## Solución: Verificar Microservicios

### 1. Verificar que Eureka esté corriendo

```bash
# Accede a la consola de Eureka
http://localhost:8761
```

Debes ver el microservicio `user-microservice` (o `USER-MICROSERVICE`) registrado en la lista.

### 2. Verificar que el Microservicio de Usuario esté corriendo

Revisa los logs del microservicio para ver:
- Si se inició correctamente
- Si se registró en Eureka
- Si hay errores de conexión a la base de datos

### 3. Verificar la configuración del Gateway

En `application.yml` del gateway, verifica:

```yaml
# Configuración de timeouts
httpclient:
  connect-timeout: 5000
  response-timeout: 10s  # Aumenta esto si el registro tarda más
```

Si el registro tarda más de 10 segundos, aumenta el `response-timeout`:

```yaml
httpclient:
  connect-timeout: 5000
  response-timeout: 30s  # Aumentado a 30 segundos
```

### 4. Verificar la ruta del Gateway

En `application.yml` del gateway, verifica que la ruta de registro esté configurada:

```yaml
- id: auth-register
  uri: lb://user-microservice  # O lb://USER-MICROSERVICE
  predicates:
    - Path=/auth/register
    - Method=POST
  filters:
    - RemoveRequestHeader=Cookie
```

**Importante**: El nombre del servicio debe coincidir exactamente con el nombre registrado en Eureka.

## Verificación Rápida

### Paso 1: Verificar Eureka
1. Abre `http://localhost:8761` en el navegador
2. Busca `user-microservice` o `USER-MICROSERVICE` en la lista
3. Debe estar en estado **UP**

### Paso 2: Verificar el Gateway
1. Revisa los logs del gateway
2. Busca errores relacionados con `user-microservice`
3. Verifica que el gateway pueda resolver el servicio desde Eureka

### Paso 3: Probar el Endpoint Directamente

Si el microservicio está corriendo en un puerto específico (ej: 8081), prueba hacer una petición directa:

```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test",
    "password": "password123",
    "phoneNumber": "123456789",
    "roles": [1]
  }'
```

Si esto funciona pero el gateway no, el problema está en la configuración del gateway o en Eureka.

## Solución Temporal

Si necesitas probar rápidamente, puedes:

1. **Aumentar el timeout del gateway** (ver arriba)
2. **Verificar que todos los servicios estén corriendo**:
   - Eureka Server (puerto 8761)
   - API Gateway (puerto 8080)
   - User Microservice (puerto específico, ej: 8081)

## Logs Útiles

Revisa los logs del gateway para ver mensajes como:
- `LoadBalancerClientFactory` - Muestra cómo se resuelven los servicios
- `RoutePredicateFactory` - Muestra las rutas configuradas
- Errores de conexión o timeout

## Nota

El frontend ahora tiene un timeout de 30 segundos para el registro y mostrará un mensaje más claro cuando ocurra un 504.

