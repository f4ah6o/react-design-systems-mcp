/**
 * Additional component metadata for Cloudscape components
 *
 * This file contains metadata for additional Cloudscape components
 * to be merged with the existing components.js file.
 */

interface ComponentProperty {
  name: string
  type: string
  description: string
  defaultValue: any
  required: boolean
  acceptedValues: (string | number)[]
  isDeprecated?: boolean
  examples?: any[]
}

interface Component {
  id: string
  name: string
  category: string
  description: string
  importPath: string
  version: string
  isExperimental: boolean
  relatedComponents: string[]
  tags: string[]
  properties: Record<string, ComponentProperty>
  examples: string[]
}

const additionalComponents: Record<string, Component> = {
  // 16. Box
  box: {
    id: 'box',
    name: 'Box',
    category: 'layout',
    description: 'A layout container for grouping content with consistent spacing.',
    importPath: '@cloudscape-design/components/box',
    version: '3.0.0',
    isExperimental: false,
    relatedComponents: ['container', 'space-between'],
    tags: ['layout', 'container', 'spacing'],
    properties: {
      variant: {
        name: 'variant',
        type: 'string',
        description: 'Defines the visual variant of the box.',
        defaultValue: 'default',
        required: false,
        acceptedValues: ['default', 'code', 'info', 'warning', 'success', 'error'],
        isDeprecated: false,
        examples: [],
      },
      padding: {
        name: 'padding',
        type: 'string',
        description: 'Defines the padding inside the box.',
        defaultValue: 'm',
        required: false,
        acceptedValues: ['none', 'xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'],
        isDeprecated: false,
        examples: [],
      },
      margin: {
        name: 'margin',
        type: 'string',
        description: 'Defines the margin outside the box.',
        defaultValue: 'none',
        required: false,
        acceptedValues: ['none', 'xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'],
        isDeprecated: false,
        examples: [],
      },
      color: {
        name: 'color',
        type: 'string',
        description: 'Defines the color of the box.',
        defaultValue: 'default',
        required: false,
        acceptedValues: ['default', 'text-label', 'text-body-secondary'],
        isDeprecated: false,
        examples: [],
      },
    },
    examples: [],
  },

  // 17. BreadcrumbGroup
  'breadcrumb-group': {
    id: 'breadcrumb-group',
    name: 'BreadcrumbGroup',
    category: 'navigation',
    description: 'Displays a breadcrumb navigation path.',
    importPath: '@cloudscape-design/components/breadcrumb-group',
    version: '3.0.0',
    isExperimental: false,
    relatedComponents: ['app-layout', 'link'],
    tags: ['navigation', 'breadcrumb', 'path'],
    properties: {
      items: {
        name: 'items',
        type: 'array',
        description: 'The items to display in the breadcrumb group.',
        defaultValue: [],
        required: true,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      expandAriaLabel: {
        name: 'expandAriaLabel',
        type: 'string',
        description: 'Aria label for the expand button.',
        defaultValue: 'Show path',
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'string',
        description: 'Aria label for the breadcrumb group.',
        defaultValue: 'Breadcrumbs',
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      onFollow: {
        name: 'onFollow',
        type: 'function',
        description: 'Function called when a breadcrumb item is clicked.',
        defaultValue: null,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
    },
    examples: [],
  },

  // 18. Calendar
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    category: 'input',
    description: 'Displays a calendar for date selection.',
    importPath: '@cloudscape-design/components/calendar',
    version: '3.0.0',
    isExperimental: false,
    relatedComponents: ['date-picker', 'date-range-picker'],
    tags: ['input', 'date', 'calendar', 'picker'],
    properties: {
      value: {
        name: 'value',
        type: 'string',
        description: 'The selected date in ISO 8601 format (YYYY-MM-DD).',
        defaultValue: null,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      onChange: {
        name: 'onChange',
        type: 'function',
        description: 'Function called when a date is selected.',
        defaultValue: null,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      locale: {
        name: 'locale',
        type: 'string',
        description: 'The locale to use for formatting dates.',
        defaultValue: 'en-US',
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      startOfWeek: {
        name: 'startOfWeek',
        type: 'number',
        description: 'The day of the week to start the calendar (0 = Sunday, 1 = Monday, etc.).',
        defaultValue: 0,
        required: false,
        acceptedValues: [0, 1, 2, 3, 4, 5, 6],
        isDeprecated: false,
        examples: [],
      },
      isDateEnabled: {
        name: 'isDateEnabled',
        type: 'function',
        description: 'Function that determines if a date is enabled for selection.',
        defaultValue: null,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
    },
    examples: [],
  },

  // 19. Checkbox
  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'input',
    description: 'Allows users to select one or more options.',
    importPath: '@cloudscape-design/components/checkbox',
    version: '3.0.0',
    isExperimental: false,
    relatedComponents: ['form-field', 'radio-group'],
    tags: ['input', 'selection', 'toggle', 'boolean'],
    properties: {
      checked: {
        name: 'checked',
        type: 'boolean',
        description: 'Whether the checkbox is checked.',
        defaultValue: false,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      onChange: {
        name: 'onChange',
        type: 'function',
        description: 'Function called when the checkbox state changes.',
        defaultValue: null,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      disabled: {
        name: 'disabled',
        type: 'boolean',
        description: 'Whether the checkbox is disabled.',
        defaultValue: false,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      indeterminate: {
        name: 'indeterminate',
        type: 'boolean',
        description: 'Whether the checkbox is in an indeterminate state.',
        defaultValue: false,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      name: {
        name: 'name',
        type: 'string',
        description: 'The name of the checkbox for form submission.',
        defaultValue: '',
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
    },
    examples: [],
  },

  // 20. ColumnLayout
  'column-layout': {
    id: 'column-layout',
    name: 'ColumnLayout',
    category: 'layout',
    description: 'Arranges content in multiple columns.',
    importPath: '@cloudscape-design/components/column-layout',
    version: '3.0.0',
    isExperimental: false,
    relatedComponents: ['grid', 'container'],
    tags: ['layout', 'columns', 'responsive'],
    properties: {
      columns: {
        name: 'columns',
        type: 'number',
        description: 'The number of columns to display.',
        defaultValue: 1,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
      variant: {
        name: 'variant',
        type: 'string',
        description: 'The visual variant of the column layout.',
        defaultValue: 'default',
        required: false,
        acceptedValues: ['default', 'text-grid'],
        isDeprecated: false,
        examples: [],
      },
      borders: {
        name: 'borders',
        type: 'string',
        description: 'Defines where to display borders between columns.',
        defaultValue: 'none',
        required: false,
        acceptedValues: ['none', 'vertical', 'horizontal', 'all'],
        isDeprecated: false,
        examples: [],
      },
      disableGutters: {
        name: 'disableGutters',
        type: 'boolean',
        description: 'Whether to disable the default gutters between columns.',
        defaultValue: false,
        required: false,
        acceptedValues: [],
        isDeprecated: false,
        examples: [],
      },
    },
    examples: [],
  },
}

export default additionalComponents
