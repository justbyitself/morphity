import { createTraitRegistry } from './trait-registry.js'

export const createContainer = () => {
  const container = {
    symbols: {
      isItem: Symbol('isItem'),
      target: Symbol('target')
    },
    items: new Map(),
    traitRegistry: createTraitRegistry()
  }
  
  return container
}
