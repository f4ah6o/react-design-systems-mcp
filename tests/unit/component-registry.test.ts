/**
 * Unit Tests for Component Registry
 *
 * This file contains tests for the component registry functionality.
 * It verifies that the registry correctly loads and provides component data.
 */

import componentRegistry from '../../src/components/registry'
import { describe, it, expect } from 'vitest'

describe('Component Registry', () => {
  describe('getAllComponents', () => {
    it('should return all components', () => {
      const components = componentRegistry.getAllComponents()

      // Verify that components were loaded
      expect(components).toBeDefined()
      expect(Object.keys(components).length).toBeGreaterThan(0)

      // Check a few known components
      expect(components.button).toBeDefined()
      expect(components.box).toBeDefined()
      expect(components.badge).toBeDefined()
    })

    it('should return components with correct structure', () => {
      const components = componentRegistry.getAllComponents()
      const button = components.button

      // Verify component structure
      expect(button).toHaveProperty('id', 'button')
      expect(button).toHaveProperty('name', 'Button')
      expect(button).toHaveProperty('category')
      expect(button).toHaveProperty('description')
      expect(button).toHaveProperty('properties')
      expect(button).toHaveProperty('tags')
      expect(Array.isArray(button.tags)).toBe(true)
    })
  })

  describe('getComponent', () => {
    it('should return a specific component by ID', () => {
      const button = componentRegistry.getComponent('button')

      // Verify component was found
      expect(button).toBeDefined()
      expect(button?.id).toBe('button')
      expect(button?.name).toBe('Button')
    })

    it('should return undefined for non-existent component', () => {
      const nonExistent = componentRegistry.getComponent('non-existent-component')
      expect(nonExistent).toBeUndefined()
    })
  })

  describe('getAllCategories', () => {
    it('should return all categories', () => {
      const categories = componentRegistry.getAllCategories()

      // Verify that categories were loaded
      expect(categories).toBeDefined()
      expect(Object.keys(categories).length).toBeGreaterThan(0)

      // Check a few known categories
      expect(categories.input).toBeDefined()
      expect(categories.display).toBeDefined()
      expect(categories.layout).toBeDefined()
    })

    it('should return categories with correct structure', () => {
      const categories = componentRegistry.getAllCategories()
      const inputCategory = categories.input

      // Verify category structure
      expect(inputCategory).toHaveProperty('id', 'input')
      expect(inputCategory).toHaveProperty('name', 'Input')
      expect(inputCategory).toHaveProperty('description')
      expect(inputCategory).toHaveProperty('components')
      expect(Array.isArray(inputCategory.components)).toBe(true)
      expect(inputCategory.components.length).toBeGreaterThan(0)
    })
  })

  describe('getCategory', () => {
    it('should return a specific category by ID', () => {
      const inputCategory = componentRegistry.getCategory('input')

      // Verify category was found
      expect(inputCategory).toBeDefined()
      expect(inputCategory?.id).toBe('input')
      expect(inputCategory?.name).toBe('Input')
    })

    it('should return undefined for non-existent category', () => {
      const nonExistent = componentRegistry.getCategory('non-existent-category')
      expect(nonExistent).toBeUndefined()
    })
  })

  describe('getAllPatterns', () => {
    it('should return all patterns', () => {
      const patterns = componentRegistry.getAllPatterns()

      // Verify that patterns were loaded
      expect(patterns).toBeDefined()
      expect(Object.keys(patterns).length).toBeGreaterThan(0)
    })
  })

  describe('getPattern', () => {
    it('should return a specific pattern by ID', () => {
      // Get all patterns first to ensure they're loaded
      const patterns = componentRegistry.getAllPatterns()
      const patternId = Object.keys(patterns)[0]

      // Skip test if no patterns are available
      if (!patternId) {
        console.warn('No patterns available, skipping test')
        return
      }

      const pattern = componentRegistry.getPattern(patternId)

      // Verify pattern was found
      expect(pattern).toBeDefined()
      expect(pattern?.id).toBe(patternId)
    })

    it('should return undefined for non-existent pattern', () => {
      const nonExistent = componentRegistry.getPattern('non-existent-pattern')
      expect(nonExistent).toBeUndefined()
    })
  })

  describe('getComponentExamples', () => {
    it('should return examples for a component', () => {
      const examples = componentRegistry.getComponentExamples({
        componentId: 'button',
      })

      // Verify examples were found
      expect(examples).toBeDefined()
      expect(Array.isArray(examples)).toBe(true)
    })

    it('should filter examples by type', () => {
      const allExamples = componentRegistry.getComponentExamples({
        componentId: 'button',
      })

      // Skip test if no examples are available
      if (allExamples.length === 0) {
        console.warn('No examples available for button, skipping test')
        return
      }

      // Get a type from the available examples
      const exampleType = allExamples[0].type

      const filteredExamples = componentRegistry.getComponentExamples({
        componentId: 'button',
        type: exampleType,
      })

      // Verify filtered examples
      expect(filteredExamples).toBeDefined()
      expect(Array.isArray(filteredExamples)).toBe(true)
      expect(filteredExamples.length).toBeLessThanOrEqual(allExamples.length)

      // Verify all examples have the correct type
      filteredExamples.forEach((example) => {
        expect(example.type).toBe(exampleType)
      })
    })

    it('should limit the number of examples returned', () => {
      const limit = 2
      const examples = componentRegistry.getComponentExamples({
        componentId: 'button',
        limit,
      })

      // Verify limit was applied
      expect(examples).toBeDefined()
      expect(Array.isArray(examples)).toBe(true)
      expect(examples.length).toBeLessThanOrEqual(limit)
    })
  })
})
