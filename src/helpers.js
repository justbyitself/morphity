/**
 * Returns the actual type of a value
 * Works correctly with primitives wrapped in proxies
 */
export const typeOf = (value) => {
  // Try valueOf first (for primitives wrapped in proxies)
  if (typeof value?.valueOf === 'function') {
    const unwrapped = value.valueOf()
    if (unwrapped !== value) {
      return typeof unwrapped
    }
  }
  // Fallback to regular typeof
  return typeof value
}

/**
 * Proper equality checking for primitives and objects
 * Usage: equalsTo(value)(other) returns true/false
 */
export const equalsTo = (compareValue) => {
  return (value) => {
    // Try to get the underlying values
    const getValue = (v) => {
      if (typeof v?.valueOf === 'function') {
        const unwrapped = v.valueOf()
        if (unwrapped !== v) return unwrapped
      }
      return v
    }
    
    return getValue(value) === getValue(compareValue)
  }
}
