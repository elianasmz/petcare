/**
 * Utilidad para decodificar tokens JWT
 */

/**
 * Decodifica un token JWT y retorna el payload
 * @param {string} token - Token JWT
 * @returns {object|null} Payload del token o null si es inválido
 */
export function decodeJWT(token) {
  if (!token || typeof token !== 'string') return null
  
  try {
    // Remover "Bearer " si está presente
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim()
    
    if (!cleanToken) return null
    
    // JWT tiene 3 partes separadas por puntos: header.payload.signature
    const parts = cleanToken.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    // Decodificar el payload (segunda parte)
    const payload = parts[1]
    
    if (!payload) return null
    
    // Base64URL decode (reemplazar caracteres especiales)
    // Agregar padding si es necesario
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    // Decodificar Base64
    let decoded
    try {
      decoded = atob(base64)
    } catch (e) {
      return null
    }
    
    // Convertir a JSON
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    // Silenciar errores de decodificación, solo retornar null
    return null
  }
}

/**
 * Extrae el ID del usuario del token JWT
 * @param {string} token - Token JWT
 * @returns {number|null} ID del usuario o null si no se encuentra
 */
export function getUserIdFromToken(token) {
  const payload = decodeJWT(token)
  if (!payload) return null
  
  // Intentar diferentes campos comunes donde puede estar el ID
  return payload.userId || payload.user_id || payload.id || payload.sub || null
}

/**
 * Extrae el username/email del token JWT
 * @param {string} token - Token JWT
 * @returns {string|null} Username/email o null si no se encuentra
 */
export function getUsernameFromToken(token) {
  const payload = decodeJWT(token)
  if (!payload) return null
  
  return payload.username || payload.email || payload.sub || null
}

