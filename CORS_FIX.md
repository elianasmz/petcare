# Solución al Problema de CORS

## Problema
El error indica que el header `Access-Control-Allow-Origin` está siendo enviado duplicado:
```
The 'Access-Control-Allow-Origin' header contains multiple values 'http://localhost:5173, http://localhost:5173', but only one is allowed.
```

## Causa
Esto ocurre cuando hay múltiples configuraciones de CORS en el backend que están agregando el mismo header.

## Solución en el Backend (Spring Boot)

### Opción 1: Configuración Global de CORS (Recomendado)

Crea o actualiza tu clase de configuración de CORS:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Opción 2: Filtro de CORS

Si usas un filtro personalizado, asegúrate de que solo haya UNO:

```java
@Component
public class CorsFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;
        
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");
        
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }
}
```

### Opción 3: Anotación @CrossOrigin en el Controlador

Si usas `@CrossOrigin` en el controlador, **NO** uses también una configuración global:

```java
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {
    // ...
}
```

## ⚠️ IMPORTANTE

**NO uses múltiples métodos a la vez:**
- ❌ NO uses `@CrossOrigin` + Configuración Global
- ❌ NO uses Filtro + Configuración Global
- ❌ NO uses Filtro + `@CrossOrigin`

**Usa SOLO UNO de estos métodos.**

## Verificación

Después de aplicar la solución, verifica que solo haya un header `Access-Control-Allow-Origin` en la respuesta:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña Network
3. Intenta hacer login
4. Revisa los headers de la respuesta
5. Debe haber SOLO UN `Access-Control-Allow-Origin: http://localhost:5173`

## Si el problema persiste

1. Limpia y reconstruye el proyecto backend
2. Reinicia el servidor
3. Verifica que no haya múltiples configuraciones de seguridad (Spring Security)
4. Revisa si hay un Gateway o Proxy que también esté agregando headers CORS

