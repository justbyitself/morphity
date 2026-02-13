export const createContainer = () => {
  const container = {
    symbols: {
      isItem: Symbol('isItem'),
      target: Symbol('target')
    },
    items: new Map(),
    defaultTrait: {
      slots: new Map(),
      container: null
    }
  }
  
  // Set circular reference
  container.defaultTrait.container = container
  
  return container
}
