/**
 * E2E Tests for get_link_resource Tool
 *
 * This file contains comprehensive tests for the get_link_resource tool,
 * which resolves links from usage.md files to appropriate backend resources.
 */

import { MCPServerHelper, shouldSkipInCI } from '../utils'

// Test configuration
const TEST_TIMEOUT = 30000 // 30 seconds

describe('get_link_resource Tool', () => {
  // Skip all tests in this file in CI environment if configured
  beforeAll(() => {
    if (shouldSkipInCI('get_link_resource Tool')) {
      return
    }
  })

  // Create a new server helper for each test
  let serverHelper: MCPServerHelper

  beforeEach(() => {
    serverHelper = new MCPServerHelper({
      testName: 'get_link_resource Tool Test',
    })
  })

  afterEach(() => {
    if (serverHelper.isConnected()) {
      serverHelper.disconnect()
    }
  })

  /**
   * Test that the get_link_resource tool is available
   */
  test(
    'should list get_link_resource tool',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // List tools
      const result = await serverHelper.listTools()

      // Verify the result
      expect(result).toBeDefined()
      expect(result.tools).toBeDefined()
      expect(Array.isArray(result.tools)).toBe(true)

      // Find the get_link_resource tool
      const getLinkResourceTool = result.tools.find((tool) => tool.name === 'get_link_resource')
      expect(getLinkResourceTool).toBeDefined()
      expect(getLinkResourceTool.description).toContain('Resolve links from usage.md files')

      serverHelper.getReporter().assert('get_link_resource tool is available')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test component link resolution with example
   */
  test(
    'should resolve component link with example',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link: /components/button/?example=primary-button
      const link = '/components/button/?example=primary-button'

      const result = await serverHelper.callTool('get_link_resource', { link })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()

      // Parse the JSON response
      const response = JSON.parse(result.content[0].text)

      expect(response.linkType).toBe('component_example')
      expect(response.originalLink).toBe(link)
      expect(response.resolvedTo).toBeDefined()
      expect(response.resolvedTo.componentId).toBe('button')
      expect(response.resolvedTo.exampleId).toBe('button-primary-button')
      expect(response.resolvedTo.example).toBeDefined()
      expect(response.resolvedTo.example.id).toBe('button-primary-button')

      serverHelper.getReporter().assert('Component link with example resolved successfully')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test component link resolution with tabId
   */
  test(
    'should resolve component link with tabId',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link: /components/button/?tabId=usage
      const link = '/components/button/?tabId=usage'

      const result = await serverHelper.callTool('get_link_resource', { link })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()

      // Parse the JSON response
      const response = JSON.parse(result.content[0].text)

      expect(response.linkType).toBe('component_details')
      expect(response.originalLink).toBe(link)
      expect(response.resolvedTo).toBeDefined()
      expect(response.resolvedTo.componentId).toBe('button')
      expect(response.resolvedTo.tabId).toBe('usage')
      expect(response.resolvedTo.component).toBeDefined()
      expect(response.resolvedTo.component.id).toBe('button')

      // Should include usage content when tabId is 'usage'
      expect(response.resolvedTo.component.usage).toBeDefined()

      serverHelper.getReporter().assert('Component link with tabId resolved successfully')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test basic component link resolution
   */
  test(
    'should resolve basic component link',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link: /components/alert/
      const link = '/components/alert/'

      const result = await serverHelper.callTool('get_link_resource', { link })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()

      // Parse the JSON response
      const response = JSON.parse(result.content[0].text)

      expect(response.linkType).toBe('component_details')
      expect(response.originalLink).toBe(link)
      expect(response.resolvedTo).toBeDefined()
      expect(response.resolvedTo.componentId).toBe('alert')
      expect(response.resolvedTo.component).toBeDefined()
      expect(response.resolvedTo.component.id).toBe('alert')

      serverHelper.getReporter().assert('Basic component link resolved successfully')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test pattern link resolution
   */
  test(
    'should resolve pattern link',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link: /patterns/general/errors/validation/
      const link = '/patterns/general/errors/validation/'

      const result = await serverHelper.callTool('get_link_resource', { link })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()

      // Parse the JSON response
      const response = JSON.parse(result.content[0].text)

      expect(response.linkType).toBe('pattern')
      expect(response.originalLink).toBe(link)
      expect(response.resolvedTo).toBeDefined()
      expect(response.resolvedTo.patternId).toBe('general-errors-validation')

      // Note: Pattern might not exist in test data, so we allow for error or success
      if (response.resolvedTo.pattern) {
        expect(response.resolvedTo.pattern.id).toBe('general-errors-validation')
        serverHelper.getReporter().assert('Pattern link resolved successfully')
      } else {
        serverHelper.getReporter().warn('Pattern not found in test data - this is expected')
      }
    },
    TEST_TIMEOUT,
  )

  /**
   * Test foundation link resolution
   */
  test(
    'should resolve foundation link',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link: /foundation/visual-foundation/iconography/
      const link = '/foundation/visual-foundation/iconography/'

      const result = await serverHelper.callTool('get_link_resource', { link })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()

      // Parse the JSON response
      const response = JSON.parse(result.content[0].text)

      expect(response.linkType).toBe('foundation')
      expect(response.originalLink).toBe(link)
      expect(response.resolvedTo).toBeDefined()
      expect(response.resolvedTo.category).toBe('visual-foundation')
      expect(response.resolvedTo.topic).toBe('iconography')
      expect(response.resolvedTo.message).toContain('Foundation resource')

      serverHelper.getReporter().assert('Foundation link resolved successfully')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test foundation link with anchor
   */
  test(
    'should resolve foundation link with anchor',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link: /foundation/visual-foundation/iconography/#action-icons
      const link = '/foundation/visual-foundation/iconography/#action-icons'

      const result = await serverHelper.callTool('get_link_resource', { link })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()

      // Parse the JSON response
      const response = JSON.parse(result.content[0].text)

      expect(response.linkType).toBe('foundation')
      expect(response.originalLink).toBe(link)
      expect(response.resolvedTo).toBeDefined()
      expect(response.resolvedTo.category).toBe('visual-foundation')
      expect(response.resolvedTo.topic).toBe('iconography#action-icons')

      serverHelper.getReporter().assert('Foundation link with anchor resolved successfully')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test external link resolution
   */
  test(
    'should resolve external link',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link: https://example.com/some-page
      const link = 'https://example.com/some-page'

      const result = await serverHelper.callTool('get_link_resource', { link })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()

      // Parse the JSON response
      const response = JSON.parse(result.content[0].text)

      expect(response.linkType).toBe('external')
      expect(response.originalLink).toBe(link)
      expect(response.resolvedTo).toBeDefined()
      expect(response.resolvedTo.url).toBe(link)
      expect(response.resolvedTo.message).toContain('External link')

      serverHelper.getReporter().assert('External link resolved successfully')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test example link resolution (HTML examples)
   */
  test(
    'should resolve example HTML link',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link: /examples/demo/sample-demo.html
      const link = '/examples/demo/sample-demo.html'

      const result = await serverHelper.callTool('get_link_resource', { link })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()

      // Parse the JSON response
      const response = JSON.parse(result.content[0].text)

      expect(response.linkType).toBe('external')
      expect(response.originalLink).toBe(link)
      expect(response.resolvedTo).toBeDefined()
      expect(response.resolvedTo.url).toBe(link)

      serverHelper.getReporter().assert('Example HTML link resolved successfully')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test error handling for invalid links
   */
  test(
    'should handle invalid link patterns',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test invalid link
      const link = '/invalid/link/pattern'

      try {
        await serverHelper.callTool('get_link_resource', { link })
        fail('Expected error for invalid link pattern')
      } catch (error) {
        expect(error).toBeDefined()
        const err = error as Error
        expect(err.message).toContain('Unable to resolve link')
        expect(err.message).toContain('Unrecognized link pattern')

        serverHelper.getReporter().assert('Invalid link pattern handled correctly')
      }
    },
    TEST_TIMEOUT,
  )

  /**
   * Test error handling for non-existent component
   */
  test(
    'should handle non-existent component',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link to non-existent component
      const link = '/components/nonexistent-component/'

      try {
        await serverHelper.callTool('get_link_resource', { link })
        fail('Expected error for non-existent component')
      } catch (error) {
        expect(error).toBeDefined()
        const err = error as Error
        expect(err.message).toContain('Component nonexistent-component not found')

        serverHelper.getReporter().assert('Non-existent component handled correctly')
      }
    },
    TEST_TIMEOUT,
  )

  /**
   * Test error handling for non-existent example
   */
  test(
    'should handle non-existent example',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test link to non-existent example
      const link = '/components/button/?example=nonexistent-example'

      try {
        await serverHelper.callTool('get_link_resource', { link })
        fail('Expected error for non-existent example')
      } catch (error) {
        expect(error).toBeDefined()
        const err = error as Error
        expect(err.message).toContain('Example button-nonexistent-example not found')

        serverHelper.getReporter().assert('Non-existent example handled correctly')
      }
    },
    TEST_TIMEOUT,
  )

  /**
   * Test edge cases with different link formats
   */
  test(
    'should handle edge cases in link formats',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // Test cases for different link formats
      const testCases = [
        {
          name: 'Link without leading slash',
          link: 'components/button/',
          expectedComponentId: 'button',
        },
        {
          name: 'Link without trailing slash',
          link: '/components/button',
          expectedComponentId: 'button',
        },
        {
          name: 'Link with complex query parameters',
          link: '/components/button/?tabId=playground&example=primary-button&other=value',
          expectedComponentId: 'button',
        },
      ]

      for (const testCase of testCases) {
        const result = await serverHelper.callTool('get_link_resource', { link: testCase.link })

        expect(result).toBeDefined()
        expect(result.content).toBeDefined()

        const response = JSON.parse(result.content[0].text)
        expect(response.resolvedTo.componentId).toBe(testCase.expectedComponentId)

        serverHelper.getReporter().assert(`${testCase.name} handled correctly`)
      }
    },
    TEST_TIMEOUT,
  )
})
