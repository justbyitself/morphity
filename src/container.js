import { createResolver } from './resolver.js'

export const createContainer = () => {
  const container = {
    symbols: {
      isItem: Symbol('isItem'),
      target: Symbol('target')
    },
    items: new Map(),
    resolver: createResolver()
  }
  
  return container
}

export const hasSlot = slot => container =>
  container.resolver.hasSlot(slot.id)