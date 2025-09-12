/**
 * Category metadata for Cloudscape components
 */

interface Category {
  id: string
  name: string
  description: string
  components: string[]
}

const categories: Record<string, Category> = {
  layout: {
    id: 'layout',
    name: 'Layout',
    description: 'Components for structuring and organizing content.',
    components: ['app-layout', 'container', 'space-between', 'grid'],
  },
  display: {
    id: 'display',
    name: 'Display',
    description: 'Components for displaying content and information.',
    components: ['table', 'cards', 'alert', 'header', 'modal'],
  },
  input: {
    id: 'input',
    name: 'Input',
    description: 'Components for user input and form controls.',
    components: ['form', 'button', 'select', 'input'],
  },
  navigation: {
    id: 'navigation',
    name: 'Navigation',
    description: 'Components for navigation and wayfinding.',
    components: ['tabs', 'pagination'],
  },
}

export default categories
