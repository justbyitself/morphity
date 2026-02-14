import { ensureItemProxy } from './items.js'

export const defineTrait = (config) => (container) => {
  // Normalize format: accept both object and array
  const [requires, providesArray] = Array.isArray(config)
    ? config  // [requires, [[slot, impl], ...]]
    : [config.requires, config.provides]  // { requires, provides: [[slot, impl], ...] }
  
  // Detect trait type
  const isPredicateTrait = typeof requires === 'function'
  
  // Convert provides array to Map and extract slot references
  const slots = new Map()
  const providesSlots = []
  
  for (const [slot, impl] of providesArray) {
    slots.set(slot.id, impl)
    providesSlots.push(slot)
  }
  
  // Create trait object
  const trait = isPredicateTrait
    ? {
        requiresValue: requires,
        provides: providesSlots,
        slots,
        container
      }
    : {
        requiresSlots: requires,
        provides: providesSlots,
        slots,
        container
      }
  
  // Register trait
  container.traitRegistry.register(trait)
  
  return trait
}

export const apply = (trait) => (value) => {
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
