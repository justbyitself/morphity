import { isPrimitive } from './utils.js'
import { createPrimitiveItemProxyHandler, createObjectItemProxyHandler } from './proxies.js'

// Ensure value is wrapped in an item proxy
export const ensureItemProxy = (value, container) => {
  if (value == null || !value[container.symbols.isItem]) {
    return createItemProxy(value, container)
  }
  return value
}

// Create a new item and return its proxy
export const createItemProxy = (value, container) => {
  const itemId = Symbol()
  const primitive = isPrimitive(value)
  const target = primitive ? { value } : value
  
  const item = {
    id: itemId,
    value,
    isPrimitive: primitive,
    target,
    proxy: null,
    customSlots: new Map()
  }
  
  const handler = primitive 
    ? createPrimitiveItemProxyHandler(item, container)
    : createObjectItemProxyHandler(item, container)
  
  const proxy = new Proxy(target, handler)
  item.proxy = proxy
  container.items.set(proxy, item)
  
  return proxy
}
