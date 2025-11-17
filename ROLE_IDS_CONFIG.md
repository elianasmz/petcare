# Configuración de IDs de Roles para Registro

## Problema

El endpoint `/roles` requiere rol de **ADMIN**, por lo que no puede ser usado durante el registro de nuevos usuarios (que aún no tienen autenticación).

## Solución Actual

El frontend usa un **mapeo estático** de tipos de usuario a IDs de roles en `src/views/Login.vue`:

```javascript
const DEFAULT_ROLE_IDS = {
  'dueno': [1],      // OWNER
  'cuidador': [2],   // CARER
  'ambos': [1, 2]    // OWNER y CARER
};
```

## ⚠️ IMPORTANTE: Verificar IDs en tu Base de Datos

**Debes verificar que estos IDs coincidan con los IDs reales de los roles en tu base de datos.**

### Cómo verificar los IDs:

1. **Como ADMIN** (después de iniciar sesión con un usuario admin):
   - Ve a la consola del navegador
   - Ejecuta: `await fetch('/api/roles', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }).then(r => r.json()).then(console.log)`
   - Esto te mostrará todos los roles con sus IDs

2. **O consulta directamente en la base de datos:**
   ```sql
   SELECT id, name FROM roles;
   ```

3. **O crea un endpoint público** (recomendado - ver abajo)

## Solución Recomendada: Endpoint Público para Roles de Registro

### En el Backend (RoleController.java):

Agrega un endpoint público que solo devuelva los roles disponibles para registro:

```java
/**
 * Obtener roles disponibles para registro (PÚBLICO)
 * Solo devuelve OWNER y CARER, no ADMIN
 */
@GetMapping("/available")
public ResponseEntity<List<RoleResponseDTO>> getAvailableRolesForRegistration() {
    log.info("GET /roles/available - Getting roles available for registration");
    
    // Solo devolver OWNER y CARER, excluir ADMIN
    List<RoleResponseDTO> roles = roleService.findAll()
        .stream()
        .filter(role -> !role.getName().equalsIgnoreCase("ADMIN"))
        .collect(Collectors.toList());
    
    return ResponseEntity.ok(roles);
}
```

### En el Gateway (application.yml):

Agrega una ruta pública para este endpoint:

```yaml
- id: roles-available
  uri: lb://USER-MICROSERVICE
  predicates:
    - Path=/roles/available
    - Method=GET
  # Sin AuthenticationFilter - es público
```

### En el Frontend (UserApi.js):

Agrega el método:

```javascript
getAvailableRoles() {
    return this.userApi.get('/roles/available')
}
```

### En el Frontend (Login.vue):

Actualiza para usar el endpoint público:

```javascript
import { useUsersStore } from "../stores/usersStore.js";

const usersStore = useUsersStore();
const availableRoles = ref([]);

onMounted(async () => {
  try {
    // Cargar roles disponibles para registro (endpoint público)
    const { data } = await UserApi.getAvailableRoles();
    availableRoles.value = data;
  } catch (err) {
    console.warn('No se pudieron cargar los roles disponibles:', err);
    // Usar mapeo por defecto como fallback
  }
});

// En handleRegister, usar los roles cargados:
const getRoleIds = (userType) => {
  const roleNames = {
    'dueno': ['OWNER', 'owner', 'dueno'],
    'cuidador': ['CARER', 'carer', 'cuidador'],
    'ambos': ['OWNER', 'CARER', 'owner', 'carer']
  };
  
  const namesToFind = roleNames[userType] || [];
  const foundRoles = availableRoles.value.filter(role => 
    namesToFind.some(name => 
      role.name?.toLowerCase().includes(name.toLowerCase())
    )
  );
  
  return foundRoles.map(role => role.id);
};
```

## Configuración Actual (Temporal)

Mientras implementas el endpoint público, **ajusta los IDs en `Login.vue`** según tu base de datos:

```javascript
const DEFAULT_ROLE_IDS = {
  'dueno': [1],      // Cambia 1 por el ID real de OWNER
  'cuidador': [2],   // Cambia 2 por el ID real de CARER
  'ambos': [1, 2]    // Ambos IDs
};
```

## Nota

El error 401 en `/roles` durante el registro es **esperado** y no afecta el funcionamiento, ya que el código usa el mapeo estático. Sin embargo, es mejor implementar el endpoint público para mayor flexibilidad.

