import { createResolver } from './resolver.js'

export const createContainer = () => {
  const container = {
    symbols: {
      isItem: Symbol('isItem'),
      target: Symbol('target')
    },
    items: new Map(),
    slots: new Map(),
    traits: [],
  }
  container.resolver = createResolver(container.traits)
  return container
}

export const hasSlot = slot => container =>
  slot != null && container.slots.has(slot.id)