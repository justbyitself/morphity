// ============================================================================
// INTERNAL UTILITIES
// ============================================================================

// Check if a value is a primitive (not an object)
export const isPrimitive = value => value !== Object(value)

// Check if a value is defined
export const isDefined = value => value !== undefined
export const isUndefined = value => value === undefined

// Return the first defined result from a sequence of functions
export const firstDefined = (...fns) => {
  for (const fn of fns) {
    const result = fn()
    if (isDefined(result)) return result
  }
  return undefined
}
