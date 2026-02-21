import { isUndefined } from './utils.js'
import { ensureItemProxy } from './items.js'
import { SlotNotImplementedError } from './errors.js'

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

const throwIfNotImplemented = (result, slotId, item, paths) => {
  if (isUndefined(result)) throw new SlotNotImplementedError(slotId, item, paths)
}

const createSlotFunc = (slotId, container) => (value) => {
  const proxy = ensureItemProxy(value, container)
  const item = container.items.get(proxy)

  // Lazy resolution: only if slot not implemented
  let paths = []
  if (isUndefined(item.customSlots.get(slotId))) {
    paths = container.resolver.resolveFor(item, slotId)

    // Apply first path (predicates already validated in resolveFor)
    if (paths.length > 0) {
      applyPath(paths[0], item)
    }
  }

  const result = proxy[slotId]
  throwIfNotImplemented(result, slotId, item, paths)
  return result
}

export const addSlot = (container) => {
  const slotId = Symbol()
  const slotFunc = createSlotFunc(slotId, container)
  slotFunc.id = slotId
  return slotFunc
}

export const addSlotWithDescription = (description) => (container) => {
  const slotId = Symbol(description)
  const slotFunc = createSlotFunc(slotId, container)
  slotFunc.id = slotId
  return slotFunc
}