import { createResolver } from './resolver.js'
import { ensureItemProxy } from './items.js'

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

export const paths = slot => container => value => {
  const proxy = ensureItemProxy(value, container)
  const item = container.items.get(proxy)
  return container.resolver.resolveFor(item, slot.id)
}