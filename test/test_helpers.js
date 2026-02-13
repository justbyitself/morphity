export const cond = cases => value => {
  const findMatchingCase = (cases, value) => {
    return Array.from(cases).find(([predicate]) => {
      return typeof predicate === 'function' 
        ? predicate(value)
        : value === predicate
    })
  }

  const matchingCase = findMatchingCase(cases, value)
  
  if (!matchingCase) {
    throw new Error(`No matching case found for value: ${JSON.stringify(value)}`)
  }
  
  const [, handler] = matchingCase
  return handler(value)
}
