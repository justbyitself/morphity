import { applyHandlers, primitiveHandlers, objectHandlers } from './handlers.js'

// Proxy handler for primitive values
export const createPrimitiveItemProxyHandler = (item, container) => ({
  get(target, prop, receiver) {
    return applyHandlers(primitiveHandlers, { item, container, prop, target, receiver })
  }
})

// Proxy handler for object values
export const createObjectItemProxyHandler = (item, container) => ({
  get(target, prop, receiver) {
    return applyHandlers(objectHandlers, { item, container, prop, target, receiver })
  }
})
