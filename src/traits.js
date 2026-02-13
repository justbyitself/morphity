import { ensureItemProxy } from './items.js'

export const defineTrait = (container) => {
  return {
    slots: new Map(),
    container
  }
}

export const addToTrait = (slotImplementations) => (trait) => {
  for (const [slot, impl] of slotImplementations) {
    trait.slots.set(slot.id, impl)
  }
  return trait
}

export const addTrait = (trait) => (value) => {
  const container = trait.container
  const proxy = ensureItemProxy(value, container)
  
  // Find the actual item object from the proxy
  const item = container.items.get(proxy)
  
  if (!item) {
    throw new Error("Item not found in container")
  }
  
  // Add trait slots to item's custom slots (override if exists)
  for (const [slotId, impl] of trait.slots.entries()) {
    item.customSlots.set(slotId, impl)
  }
  
  return proxy
}
