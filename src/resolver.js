// Simple cycle detection for trait dependencies
// Uses DFS to detect cycles in the dependency graph
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
        return true // Cycle detected
      }
    }
    
    recStack.delete(node)
    return false
  }
  
  // Check all nodes
  for (const node of edges.keys()) {
    if (!visited.has(node)) {
      if (dfs(node)) return true
    }
  }
  
  return false
}

export const createResolver = () => {
  const traits = []
  const edges = new Map() // node → [dependencies]
  
  const addEdge = (from, to) => {
    if (!edges.has(from)) {
      edges.set(from, [])
    }
    edges.get(from).push(to)
  }
  
  const register = (trait) => {
    const traitId = Symbol(`trait_${traits.length}`)
    
    // Build edges for this trait
    const newEdges = new Map(edges) // Clone current edges
    
    if (trait.requiresSlots && trait.provides) {
      // Slot-based trait
      for (const requiredSlot of trait.requiresSlots) {
        addEdgeToMap(newEdges, traitId, requiredSlot.id)
      }
      
      for (const providedSlot of trait.provides) {
        addEdgeToMap(newEdges, providedSlot.id, traitId)
      }
    } else if (trait.requiresValue && trait.provides) {
      // Predicate trait
      for (const providedSlot of trait.provides) {
        addEdgeToMap(newEdges, providedSlot.id, traitId)
      }
    }
    
    // Check for cycles
    if (hasCycle(newEdges)) {
      throw new Error('Circular dependency detected')
    }
    
    // No cycle, commit the changes
    traits.push(trait)
    for (const [from, tos] of newEdges) {
      edges.set(from, [...tos])
    }
  }
  
  const addEdgeToMap = (map, from, to) => {
    if (!map.has(from)) {
      map.set(from, [])
    }
    map.get(from).push(to)
  }
  
  const resolveFor = (item, targetSlotId) => {
    const paths = []
    
    // Collect all matching predicate traits
    const matchingPredicates = traits.filter(t => 
      t.requiresValue && t.requiresValue(item.value) && t.provides
    )
    
    if (matchingPredicates.length === 0) return paths
    
    // Start with all provides from all matching predicates
    const initialPath = [...matchingPredicates]
    const initialProvides = new Set()
    matchingPredicates.forEach(t => 
      t.provides.forEach(s => initialProvides.add(s.id))
    )
    
    // Check if predicates already provide target
    if (initialProvides.has(targetSlotId)) {
      paths.push(initialPath)
      return paths
    }
    
    // Helper to compare Sets
    const setsAreEqual = (set1, set2) => 
      set1.size === set2.size && 
      Array.from(set1).every(item => set2.has(item))
    
    // Try to reach target through slot-based traits
    const queue = [{ path: initialPath, provides: initialProvides }]
    const visited = []
    
    while (queue.length > 0) {
      const { path, provides } = queue.shift()
      
      // Check if we already visited this state
      if (visited.some(prevProvides => setsAreEqual(prevProvides, provides))) {
        continue
      }
      visited.push(new Set(provides))
      
      // Try each slot trait
      for (const slotTrait of traits) {
        if (!slotTrait.requiresSlots || !slotTrait.provides) continue
        if (path.includes(slotTrait)) continue
        
        // Check if ALL requirements are met
        const allReqsMet = slotTrait.requiresSlots.every(reqSlot =>
          provides.has(reqSlot.id)
        )
        
        if (allReqsMet) {
          const newPath = [...path, slotTrait]
          const newProvides = new Set(provides)
          slotTrait.provides.forEach(s => newProvides.add(s.id))
          
          // Reached target?
          if (newProvides.has(targetSlotId)) {
            paths.push(newPath)
            // Continue to find more paths
          } else {
            // Keep searching
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