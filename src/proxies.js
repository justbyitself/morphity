import { applyHandlers, primitiveHandlers, objectHandlers } from './handlers.js'

// Proxy handler for primitive values
export const createPrimitiveItemProxyHandler = (item, container) => ({
  get(target, prop) {
    return applyHandlers(primitiveHandlers, { item, container, prop, target })
  }
})

// Proxy handler for object values
export const createObjectItemProxyHandler = (item, container) => ({
  get(target, prop) {
    return applyHandlers(objectHandlers, { item, container, prop, target })
  }
})
