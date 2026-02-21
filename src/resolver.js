const hasCycle = (edges) => {
  const visited = new Set()
  const recStack = new Set()
  
  const dfs = (node) => {
    visited.add(node)
    recStack.add(node)
    
    const neighbors = edges.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true
      } else if (recStack.has(neighbor)) {
        return true
      }
    }
    
    recStack.delete(node)
    return false
  }
  
  for (const node of edges.keys()) {
    if (!visited.has(node)) {
      if (dfs(node)) return true
    }
  }
  
  return false
}

export const createResolver = (traits) => {
  const edges = new Map()
  
  const addEdgeToMap = (map, from, to) => {
    if (!map.has(from)) {
      map.set(from, [])
    }
    map.get(from).push(to)
  }
  
  const register = (trait) => {
    const traitId = Symbol(`trait_${traits.length}`)
    const newEdges = new Map(edges)
    
    if (trait.requiresSlots && trait.provides) {
      for (const requiredSlot of trait.requiresSlots) {
        addEdgeToMap(newEdges, traitId, requiredSlot.id)
      }
      for (const providedSlot of trait.provides) {
        addEdgeToMap(newEdges, providedSlot.id, traitId)
      }
    } else if (trait.requiresValue && trait.provides) {
      for (const providedSlot of trait.provides) {
        addEdgeToMap(newEdges, providedSlot.id, traitId)
      }
    }
    
    if (hasCycle(newEdges)) {
      throw new Error('Circular dependency detected')
    }
    
    for (const [from, tos] of newEdges) {
      edges.set(from, [...tos])
    }
  }
  
  const resolveFor = (item, targetSlotId) => {
    const paths = []
    
    const matchingPredicates = traits.filter(t => 
      t.requiresValue && t.requiresValue(item.value) && t.provides
    )
    
    if (matchingPredicates.length === 0) return paths
    
    const initialPath = [...matchingPredicates]
    const initialProvides = new Set()
    matchingPredicates.forEach(t => 
      t.provides.forEach(s => initialProvides.add(s.id))
    )
    
    if (initialProvides.has(targetSlotId)) {
      paths.push(initialPath)
      return paths
    }
    
    const setsAreEqual = (set1, set2) => 
      set1.size === set2.size && 
      Array.from(set1).every(item => set2.has(item))
    
    const queue = [{ path: initialPath, provides: initialProvides }]
    const visited = []
    
    while (queue.length > 0) {
      const { path, provides } = queue.shift()
      
      if (visited.some(prevProvides => setsAreEqual(prevProvides, provides))) {
        continue
      }
      visited.push(new Set(provides))
      
      for (const slotTrait of traits) {
        if (!slotTrait.requiresSlots || !slotTrait.provides) continue
        if (path.includes(slotTrait)) continue
        
        const allReqsMet = slotTrait.requiresSlots.every(reqSlot =>
          provides.has(reqSlot.id)
        )
        
        if (allReqsMet) {
          const newPath = [...path, slotTrait]
          const newProvides = new Set(provides)
          slotTrait.provides.forEach(s => newProvides.add(s.id))
          
          if (newProvides.has(targetSlotId)) {
            paths.push(newPath)
          } else {
            queue.push({ path: newPath, provides: newProvides })
          }
        }
      }
    }
    
    return paths
  }
  
  return {
    register,
    resolveFor
  }
}