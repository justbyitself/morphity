import { isUndefined } from './utils.js'
import { ensureItemProxy } from './items.js'

const applyPath = (path, item) => {
  for (const trait of path) {
    // Apply trait slots to item
    for (const [slotId, impl] of trait.slots.entries()) {
      if (!item.customSlots.has(slotId)) {
        item.customSlots.set(slotId, impl)
      }
    }
  }
}

const createSlotFunc = (slotId, container) => (value) => {
  const proxy = ensureItemProxy(value, container)
  const item = container.items.get(proxy)
  
  // Lazy resolution: only if slot not implemented
  if (isUndefined(item.customSlots.get(slotId))) {
    const paths = container.traitRegistry.resolveFor(item, slotId)
    
    // Apply first path (predicates already validated in resolveFor)
    if (paths.length > 0) {
      applyPath(paths[0], item)
    }
  }
  
  const result = proxy[slotId]
  if (isUndefined(result)) throw new Error("Slot not implemented")
  return result
}

export const addSlot = (container) => {
  const slotId = Symbol()
  const slotFunc = createSlotFunc(slotId, container)
  slotFunc.id = slotId
  return slotFunc
}

export const addSlotWithArity = (arity) => (container) => {
  const slotId = Symbol()
  const normalSlot = createSlotFunc(slotId, container)
  
  // Wrapper for data-last behavior
  const dataLastSlot = (...args) => {
    if (args.length === arity - 1) {
      // Missing args, return function waiting for data
      return (data) => {
        const result = normalSlot(data)
        return result(...args)
      }
    }
    // Has all args, last one is data
    const data = args[arity - 1]
    const otherArgs = args.slice(0, arity - 1)
    return normalSlot(data)(...otherArgs)
  }
  
  dataLastSlot.id = slotId
  dataLastSlot.arity = arity
  return dataLastSlot
}
