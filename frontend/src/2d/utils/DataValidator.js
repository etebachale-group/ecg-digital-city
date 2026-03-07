/**
 * DataValidator - Validates and sanitizes data
 * Prevents XSS, validates formats, provides safe defaults
 */

/**
 * Validate and sanitize avatar customization data
 * @param {Object} data - Avatar customization data
 * @returns {Object} - Validated data with safe defaults
 */
export function validateAvatarData(data) {
  if (!data || typeof data !== 'object') {
    return getDefaultAvatarData()
  }

  return {
    skinColor: validateHexColor(data.skinColor, '#fdbcb4'),
    hairStyle: validateHairStyle(data.hairStyle, 'short'),
    hairColor: validateHexColor(data.hairColor, '#8B4513'),
    shirtColor: validateHexColor(data.shirtColor, '#3498db'),
    pantsColor: validateHexColor(data.pantsColor, '#2c3e50'),
    accessories: validateAccessories(data.accessories)
  }
}

/**
 * Get default avatar data
 * @returns {Object}
 */
export function getDefaultAvatarData() {
  return {
    skinColor: '#fdbcb4',
    hairStyle: 'short',
    hairColor: '#8B4513',
    shirtColor: '#3498db',
    pantsColor: '#2c3e50',
    accessories: {}
  }
}

/**
 * Validate hex color format
 * @param {string} color - Hex color string
 * @param {string} defaultColor - Default if invalid
 * @returns {string}
 */
export function validateHexColor(color, defaultColor) {
  if (!color || typeof color !== 'string') {
    return defaultColor
  }

  // Remove # if present
  const cleanColor = color.replace('#', '')

  // Check if valid hex (3 or 6 characters)
  const hexRegex = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/
  if (!hexRegex.test(cleanColor)) {
    return defaultColor
  }

  return '#' + cleanColor
}

/**
 * Validate hair style
 * @param {string} style - Hair style
 * @param {string} defaultStyle - Default if invalid
 * @returns {string}
 */
export function validateHairStyle(style, defaultStyle) {
  const validStyles = ['short', 'long', 'ponytail', 'bald']
  
  if (!style || typeof style !== 'string') {
    return defaultStyle
  }

  const lowerStyle = style.toLowerCase()
  return validStyles.includes(lowerStyle) ? lowerStyle : defaultStyle
}

/**
 * Validate accessories object
 * @param {Object} accessories - Accessories data
 * @returns {Object}
 */
export function validateAccessories(accessories) {
  if (!accessories || typeof accessories !== 'object') {
    return {}
  }

  const validated = {}
  const validAccessories = ['hat', 'glasses', 'badge']

  validAccessories.forEach(key => {
    if (accessories[key] !== undefined) {
      validated[key] = Boolean(accessories[key])
    }
  })

  return validated
}

/**
 * Sanitize chat message to prevent XSS
 * @param {string} message - Chat message
 * @returns {string} - Sanitized message
 */
export function sanitizeChatMessage(message) {
  if (!message || typeof message !== 'string') {
    return ''
  }

  // Remove HTML tags
  let sanitized = message.replace(/<[^>]*>/g, '')

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Limit length
  const maxLength = 500
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Validate position data
 * @param {Object} position - Position object {x, y}
 * @param {Object} bounds - World bounds
 * @returns {Object} - Validated position
 */
export function validatePosition(position, bounds) {
  if (!position || typeof position !== 'object') {
    return { x: 0, y: 0 }
  }

  const x = validateNumber(position.x, 0)
  const y = validateNumber(position.y, 0)

  // Clamp to bounds if provided
  if (bounds) {
    return {
      x: Math.max(bounds.minX || -Infinity, Math.min(bounds.maxX || Infinity, x)),
      y: Math.max(bounds.minY || -Infinity, Math.min(bounds.maxY || Infinity, y))
    }
  }

  return { x, y }
}

/**
 * Validate number
 * @param {any} value - Value to validate
 * @param {number} defaultValue - Default if invalid
 * @returns {number}
 */
export function validateNumber(value, defaultValue) {
  const num = Number(value)
  
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue
  }

  return num
}

/**
 * Validate username
 * @param {string} username - Username
 * @returns {string} - Validated username
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return 'Usuario'
  }

  // Remove special characters
  let sanitized = username.replace(/[^a-zA-Z0-9_\-\s]/g, '')

  // Limit length
  const maxLength = 20
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized || 'Usuario'
}

/**
 * Validate district data
 * @param {Object} district - District data
 * @returns {Object} - Validated district
 */
export function validateDistrictData(district) {
  if (!district || typeof district !== 'object') {
    return null
  }

  return {
    id: district.id || 'unknown',
    name: validateUsername(district.name) || 'Unknown District',
    slug: district.slug || 'unknown',
    bounds: validateBounds(district.bounds),
    portals: Array.isArray(district.portals) ? district.portals : []
  }
}

/**
 * Validate bounds object
 * @param {Object} bounds - Bounds {minX, maxX, minY, maxY}
 * @returns {Object}
 */
export function validateBounds(bounds) {
  if (!bounds || typeof bounds !== 'object') {
    return { minX: -90, maxX: 90, minY: -90, maxY: 90 }
  }

  return {
    minX: validateNumber(bounds.minX, -90),
    maxX: validateNumber(bounds.maxX, 90),
    minY: validateNumber(bounds.minY, -90),
    maxY: validateNumber(bounds.maxY, 90)
  }
}
