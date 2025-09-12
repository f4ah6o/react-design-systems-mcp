/**
 * Performance Optimization Module
 *
 * This module provides performance optimizations for the Cloudscape MCP Server.
 * It includes caching, memoization, and other performance enhancements.
 */

// Define types for cache entries
interface CacheEntry<T> {
  value: T
  timestamp: number
}

// Cache for storing results of expensive operations
interface Cache {
  componentSearch: Map<string, CacheEntry<any>>
  componentDetails: Map<string, CacheEntry<any>>
  componentCode: Map<string, CacheEntry<any>>
  patternCode: Map<string, CacheEntry<any>>
  documentation: Map<string, CacheEntry<any>>
  examples: Map<string, CacheEntry<any>>
}

// Cache configuration
interface CacheConfig {
  maxSize: number
  ttl: number
}

// Cache for storing results of expensive operations
const cache: Cache = {
  componentSearch: new Map(),
  componentDetails: new Map(),
  componentCode: new Map(),
  patternCode: new Map(),
  documentation: new Map(),
  examples: new Map(),
}

// Cache configuration
const cacheConfig: CacheConfig = {
  maxSize: 1000, // Maximum number of entries in each cache
  ttl: 3600000, // Time to live in milliseconds (1 hour)
}

/**
 * Generate a cache key from input parameters
 * @param cacheType - Type of cache
 * @param params - Input parameters
 * @returns Cache key
 */
export function generateCacheKey(cacheType: string, params: any): string {
  return `${cacheType}:${JSON.stringify(params)}`
}

/**
 * Check if a cache entry is valid
 * @param entry - Cache entry
 * @returns Whether the entry is valid
 */
export function isCacheEntryValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < cacheConfig.ttl
}

/**
 * Add an entry to the cache
 * @param cacheType - Type of cache
 * @param key - Cache key
 * @param value - Value to cache
 */
export function addToCache<T>(cacheType: keyof Cache, key: string, value: T): void {
  const cacheMap = cache[cacheType]

  // If cache is full, remove oldest entry
  if (cacheMap.size >= cacheConfig.maxSize) {
    const oldestKey = cacheMap.keys().next().value
    if (oldestKey) {
      cacheMap.delete(oldestKey)
    }
  }

  // Add new entry
  cacheMap.set(key, {
    value,
    timestamp: Date.now(),
  })
}

/**
 * Get an entry from the cache
 * @param cacheType - Type of cache
 * @param key - Cache key
 * @returns Cached value or undefined
 */
export function getFromCache<T>(cacheType: keyof Cache, key: string): T | undefined {
  const cacheMap = cache[cacheType]
  const entry = cacheMap.get(key)

  if (entry && isCacheEntryValid(entry)) {
    return entry.value as T
  }

  // Remove invalid entry
  if (entry) {
    cacheMap.delete(key)
  }

  return undefined
}

/**
 * Clear the cache
 * @param cacheType - Type of cache to clear (optional)
 */
export function clearCache(cacheType?: keyof Cache): void {
  if (cacheType) {
    cache[cacheType].clear()
  } else {
    Object.values(cache).forEach((cacheMap) => cacheMap.clear())
  }
}

/**
 * Memoize a function
 * @param fn - Function to memoize
 * @param cacheType - Type of cache to use
 * @returns Memoized function
 */
export function memoize<T, A extends any[]>(
  fn: (...args: A) => T,
  cacheType: keyof Cache,
): (...args: A) => T {
  return (...args: A): T => {
    const key = generateCacheKey(cacheType, args)
    const cachedResult = getFromCache<T>(cacheType, key)

    if (cachedResult !== undefined) {
      return cachedResult
    }

    // Use call instead of apply to avoid 'this' context issues
    const result = fn.call(null, ...args)
    addToCache(cacheType, key, result)

    return result
  }
}

/**
 * Optimize component search
 * @param searchEngine - Search engine module
 * @returns Optimized search engine
 */
export function optimizeSearch(searchEngine: any): any {
  // Memoize search functions
  const optimizedSearchEngine = {
    ...searchEngine,
    searchComponents: memoize(searchEngine.searchComponents, 'componentSearch'),
    searchComponentsByFunctionality: memoize(
      searchEngine.searchComponentsByFunctionality,
      'componentSearch',
    ),
  }

  return optimizedSearchEngine
}

/**
 * Optimize component registry
 * @param componentRegistry - Component registry module
 * @returns Optimized component registry
 */
export function optimizeComponentRegistry(componentRegistry: any): any {
  // Memoize component registry functions
  const optimizedComponentRegistry = {
    ...componentRegistry,
    getComponent: memoize(componentRegistry.getComponent, 'componentDetails'),
    getCategory: memoize(componentRegistry.getCategory, 'componentDetails'),
    getPattern: memoize(componentRegistry.getPattern, 'componentDetails'),
    getComponentExamples: memoize(componentRegistry.getComponentExamples, 'examples'),
  }

  return optimizedComponentRegistry
}

/**
 * Optimize code generator
 * @param codeGenerator - Code generator module
 * @returns Optimized code generator
 */
export function optimizeCodeGenerator(codeGenerator: any): any {
  // Memoize code generator functions
  const optimizedCodeGenerator = {
    ...codeGenerator,
    generateComponentCode: memoize(codeGenerator.generateComponentCode, 'componentCode'),
    generatePatternCode: memoize(codeGenerator.generatePatternCode, 'patternCode'),
    generateComponentInterface: memoize(codeGenerator.generateComponentInterface, 'componentCode'),
  }

  return optimizedCodeGenerator
}

/**
 * Optimize documentation provider
 * @param documentationProvider - Documentation provider module
 * @returns Optimized documentation provider
 */
export function optimizeDocumentationProvider(documentationProvider: any): any {
  // Memoize documentation provider functions
  const optimizedDocumentationProvider = {
    ...documentationProvider,
    getComponentDocumentation: memoize(
      documentationProvider.getComponentDocumentation,
      'documentation',
    ),
    searchDocumentation: memoize(documentationProvider.searchDocumentation, 'documentation'),
  }

  return optimizedDocumentationProvider
}

/**
 * Optimize example provider
 * @param exampleProvider - Example provider module
 * @returns Optimized example provider
 */
export function optimizeExampleProvider(exampleProvider: any): any {
  // Memoize example provider functions
  const optimizedExampleProvider = {
    ...exampleProvider,
    getExamples: memoize(exampleProvider.getExamples, 'examples'),
    searchExamples: memoize(exampleProvider.searchExamples, 'examples'),
    getExampleCategories: memoize(exampleProvider.getExampleCategories, 'examples'),
    getExample: memoize(exampleProvider.getExample, 'examples'),
  }

  return optimizedExampleProvider
}

/**
 * Apply performance optimizations to all modules
 */
export function applyPerformanceOptimizations(): void {
  // Import modules
  import('../components/registry').then((componentRegistry) => {
    import('../search/engine').then((searchEngine) => {
      import('../code-generator/generator').then((codeGenerator) => {
        import('../documentation/provider').then((documentationProvider) => {
          import('../example-provider/index').then((exampleProvider) => {
            // Apply optimizations
            const optimizedComponentRegistry = optimizeComponentRegistry(componentRegistry.default)
            const optimizedSearchEngine = optimizeSearch(searchEngine.default)
            const optimizedCodeGenerator = optimizeCodeGenerator(codeGenerator.default)
            const optimizedDocumentationProvider = optimizeDocumentationProvider(
              documentationProvider.default,
            )
            const optimizedExampleProvider = optimizeExampleProvider(exampleProvider.default)

            // Replace module exports
            Object.assign(componentRegistry.default, optimizedComponentRegistry)
            Object.assign(searchEngine.default, optimizedSearchEngine)
            Object.assign(codeGenerator.default, optimizedCodeGenerator)
            Object.assign(documentationProvider.default, optimizedDocumentationProvider)
            Object.assign(exampleProvider.default, optimizedExampleProvider)

            //console.error('Performance optimizations applied');
          })
        })
      })
    })
  })
}
