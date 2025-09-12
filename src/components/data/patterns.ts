/**
 * Pattern Data Model
 *
 * This module defines pattern entities based on research from cloudscape.design/patterns.
 * Patterns are extracted from the 61+ design patterns across General, Generative AI,
 * and Resource Management categories, plus existing form/table patterns.
 */

export interface PatternExample {
  title: string
  description: string
  code?: string
  demoUrl?: string
}

export interface CustomizationOption {
  name: string
  type: string
  description: string
  defaultValue: any
}

export interface Pattern {
  id: string
  name: string
  description: string
  category: 'general' | 'generative-ai' | 'resource-management' | 'layout'
  components: string[]
  usageGuidelines: string
  examples: PatternExample[]
  codeExample: string
  relatedPatterns: string[]
  tags: string[]
  lastUpdated: string
  // Legacy fields for backward compatibility
  code?: string
  customizationOptions?: Record<string, CustomizationOption>
}

/**
 * Pattern data combining existing patterns with new cloudscape.design/patterns data
 * Organized by categories: General, Generative AI, Resource Management, and Layout
 */
export const patternData: Record<string, Pattern> = {
  'layout-data-table': {
    id: 'layout-data-table',
    name: 'Data Table',
    description: 'A table with sorting, filtering, and pagination.',
    category: 'layout',
    components: ['table', 'pagination', 'collection-preferences', 'text-filter'],
    usageGuidelines:
      'Use data table patterns when displaying tabular data with complex interactions like sorting, filtering, and pagination. Ideal for large datasets that require user manipulation.',
    examples: [
      {
        title: 'Basic Data Table',
        description: 'Table with filtering and pagination',
      },
    ],
    relatedPatterns: ['general-filtering'],
    tags: ['table', 'data-display', 'filtering', 'pagination'],
    lastUpdated: '2025-09-11',
    codeExample: `import Table from "@cloudscape-design/components/table";
import Pagination from "@cloudscape-design/components/pagination";
import TextFilter from "@cloudscape-design/components/text-filter";
import { useState } from "react";

function DataTable({ items, columnDefinitions }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState("");
  
  // Filter items based on filter text
  const filteredItems = items.filter(item => 
    Object.values(item).some(value => 
      String(value).toLowerCase().includes(filterText.toLowerCase())
    )
  );
  
  // Paginate items
  const pageSize = 10;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);
  
  return (
    <>
      <TextFilter
        filteringText={filterText}
        onChange={({ detail }) => setFilterText(detail.filteringText)}
      />
      <Table
        columnDefinitions={columnDefinitions}
        items={paginatedItems}
        variant="full-page"
      />
      <Pagination
        currentPageIndex={currentPage}
        pagesCount={Math.ceil(filteredItems.length / pageSize)}
        onNextPageClick={() => setCurrentPage(currentPage + 1)}
        onPreviousPageClick={() => setCurrentPage(currentPage - 1)}
      />
    </>
  );
}`,
    customizationOptions: {
      columnDefinitions: {
        name: 'columnDefinitions',
        type: 'array',
        description: 'Defines the columns of the table.',
        defaultValue: [],
      },
      items: {
        name: 'items',
        type: 'array',
        description: 'The items to display in the table.',
        defaultValue: [],
      },
    },
  },

  'layout-form': {
    id: 'layout-form',
    name: 'Form Layout',
    description: 'A form with validation and error handling.',
    category: 'layout',
    components: ['form', 'form-field', 'input', 'button', 'space-between'],
    usageGuidelines:
      'Use form layout patterns for collecting user input with proper validation and error handling. Provides consistent form structure and user experience.',
    examples: [
      {
        title: 'Validated Form',
        description: 'Form with field validation and error messages',
      },
    ],
    relatedPatterns: ['general-errors', 'resource-management-create'],
    tags: ['form', 'validation', 'input', 'layout'],
    lastUpdated: '2025-09-11',
    codeExample: `import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useState } from "react";

function FormLayout({ fields, onSubmit }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
    
    // Clear error when field is modified
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };
  
  const handleSubmit = () => {
    // Validate form
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'This field is required';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    onSubmit(formData);
  };
  
  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        {fields.map(field => (
          <FormField
            key={field.name}
            label={field.label}
            errorText={errors[field.name]}
          >
            <Input
              value={formData[field.name] || ''}
              onChange={({ detail }) => handleChange(field.name, detail.value)}
            />
          </FormField>
        ))}
      </SpaceBetween>
    </Form>
  );
}`,
    customizationOptions: {
      fields: {
        name: 'fields',
        type: 'array',
        description: 'The fields to display in the form.',
        defaultValue: [],
      },
      onSubmit: {
        name: 'onSubmit',
        type: 'function',
        description: 'Function called when the form is submitted.',
        defaultValue: 'data => console.error(data)',
      },
    },
  },

  // General Patterns from cloudscape.design/patterns
  'general-actions': {
    id: 'general-actions',
    name: 'Actions',
    description:
      'Patterns for user actions, including primary actions, secondary actions, and bulk actions.',
    category: 'general',
    components: ['button', 'button-group', 'split-button'],
    usageGuidelines: `## When to use actions

Use action patterns to help users complete tasks efficiently and clearly communicate what will happen when they interact with your interface.

## Types of actions

### Primary actions
Use primary actions for the most important action on a page. There should typically be only one primary action visible at a time.

### Secondary actions
Use secondary actions for less important actions that support the primary workflow.`,
    examples: [
      {
        title: 'Primary Action Button',
        description: 'Main call-to-action for completing a workflow',
        code: `<Button variant="primary">Create resource</Button>`,
      },
    ],
    codeExample: `import React from 'react';
import Button from '@cloudscape-design/components/button';
import ButtonGroup from '@cloudscape-design/components/button-group';

export default function ActionsPattern() {
  return (
    <ButtonGroup>
      <Button>Cancel</Button>
      <Button variant="primary">Save changes</Button>
    </ButtonGroup>
  );
}`,
    relatedPatterns: ['general-errors'],
    tags: ['actions', 'buttons', 'workflow'],
    lastUpdated: '2025-09-11',
  },

  'general-errors': {
    id: 'general-errors',
    name: 'Errors',
    description:
      'Patterns for displaying and handling errors, including validation errors, system errors, and recovery actions.',
    category: 'general',
    components: ['alert', 'form-field', 'flash-bar'],
    usageGuidelines: `## When to use error patterns

Use error patterns to communicate problems clearly and help users understand how to resolve issues.`,
    examples: [
      {
        title: 'Form Validation Error',
        description: 'Inline error message for form field validation',
        code: `<FormField label="Email" errorText="Please enter a valid email address">
  <Input value={email} onChange={handleChange} invalid />
</FormField>`,
      },
    ],
    codeExample: `import React, { useState } from 'react';
import Alert from '@cloudscape-design/components/alert';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';

export default function ErrorsPattern() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  return (
    <>
      <Alert type="error" header="Validation Error">
        Please correct the errors below.
      </Alert>
      <FormField label="Email address" errorText={error}>
        <Input value={email} onChange={({ detail }) => setEmail(detail.value)} invalid={!!error} />
      </FormField>
    </>
  );
}`,
    relatedPatterns: ['general-actions'],
    tags: ['errors', 'validation', 'alerts'],
    lastUpdated: '2025-09-11',
  },

  'general-filtering': {
    id: 'general-filtering',
    name: 'Filtering',
    description:
      'Patterns for filtering and searching data, including property filters, faceted search, and advanced filtering.',
    category: 'general',
    components: ['property-filter', 'select', 'input', 'multiselect'],
    usageGuidelines: `## When to use filtering

Use filtering patterns to help users find specific data quickly in large datasets.`,
    examples: [
      {
        title: 'Property Filter',
        description: 'Advanced filtering with multiple properties and operators',
      },
    ],
    codeExample: `import React, { useState } from 'react';
import PropertyFilter from '@cloudscape-design/components/property-filter';

export default function FilteringPattern() {
  const [query, setQuery] = useState({ tokens: [], operation: 'and' });
  
  return (
    <PropertyFilter
      query={query}
      onChange={({ detail }) => setQuery(detail)}
      filteringProperties={[
        {
          key: 'name',
          operators: ['=', '!='],
          propertyLabel: 'Name'
        }
      ]}
    />
  );
}`,
    relatedPatterns: ['layout-data-table'],
    tags: ['filtering', 'search', 'property-filter'],
    lastUpdated: '2025-09-11',
  },

  // Generative AI Patterns
  'generative-ai-chat': {
    id: 'generative-ai-chat',
    name: 'Chat',
    description: 'Conversational interface patterns for AI-powered chat experiences.',
    category: 'generative-ai',
    components: ['input', 'button'],
    usageGuidelines: `## When to use chat patterns

Use chat patterns for conversational AI interfaces where users interact through natural language.`,
    examples: [
      {
        title: 'Basic Chat Interface',
        description: 'Simple chat with user and AI messages',
      },
    ],
    codeExample: `import React, { useState } from 'react';
import Input from '@cloudscape-design/components/input';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function ChatPattern() {
  const [input, setInput] = useState('');
  
  return (
    <SpaceBetween direction="horizontal" size="s">
      <Input 
        value={input} 
        onChange={({ detail }) => setInput(detail.value)}
        placeholder="Type your message..."
      />
      <Button variant="primary">Send</Button>
    </SpaceBetween>
  );
}`,
    relatedPatterns: ['generative-ai-loading-states'],
    tags: ['chat', 'conversation', 'ai'],
    lastUpdated: '2025-09-11',
  },

  'generative-ai-loading-states': {
    id: 'generative-ai-loading-states',
    name: 'Loading States',
    description:
      'Loading patterns specific to AI content generation, including progressive loading and streaming responses.',
    category: 'generative-ai',
    components: ['spinner', 'progress-bar', 'skeleton'],
    usageGuidelines: `## When to use AI loading patterns

Use specialized loading patterns when AI systems are generating content.`,
    examples: [
      {
        title: 'Content Generation Spinner',
        description: 'Loading indicator while AI generates content',
      },
    ],
    codeExample: `import React, { useState } from 'react';
import Spinner from '@cloudscape-design/components/spinner';
import Box from '@cloudscape-design/components/box';

export default function AILoadingPattern() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  return (
    <>
      {isGenerating && (
        <Box textAlign="center">
          <Spinner size="large" />
          <Box>AI is generating your content...</Box>
        </Box>
      )}
    </>
  );
}`,
    relatedPatterns: ['generative-ai-chat'],
    tags: ['loading', 'ai-generation', 'progress'],
    lastUpdated: '2025-09-11',
  },

  // Additional Generative AI Patterns
  'generative-ai-content-generation': {
    id: 'generative-ai-content-generation',
    name: 'Content Generation',
    description:
      'Patterns for AI-powered content creation interfaces with templates, prompts, and output management.',
    category: 'generative-ai',
    components: ['textarea', 'button', 'cards', 'alert'],
    usageGuidelines: `## When to use content generation patterns

Use these patterns when providing AI-powered content creation tools that help users generate text, code, or other content.

## Best practices
- Provide clear prompts and templates
- Show generation progress
- Allow iterative refinement
- Offer multiple output options`,
    examples: [
      {
        title: 'Text Generation Interface',
        description: 'Interface for generating text content with prompts and templates',
      },
      {
        title: 'Code Generation Tool',
        description: 'Specialized interface for AI-assisted code generation',
      },
    ],
    codeExample: `import React, { useState } from 'react';
import Textarea from '@cloudscape-design/components/textarea';
import Button from '@cloudscape-design/components/button';
import Cards from '@cloudscape-design/components/cards';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function ContentGenerationPattern() {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateContent = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const newContent = {
        id: Date.now(),
        title: \`Generated Content \${generatedContent.length + 1}\`,
        content: \`AI-generated content based on: "\${prompt}"\`,
        timestamp: new Date().toLocaleString()
      };
      setGeneratedContent([...generatedContent, newContent]);
      setIsGenerating(false);
    }, 2000);
  };
  
  return (
    <SpaceBetween direction="vertical" size="l">
      <Container header={<Header variant="h2">Content Generation</Header>}>
        <SpaceBetween direction="vertical" size="m">
          <Textarea
            value={prompt}
            onChange={({ detail }) => setPrompt(detail.value)}
            placeholder="Describe what you want to generate..."
            rows={4}
          />
          <Button
            variant="primary"
            onClick={generateContent}
            disabled={!prompt.trim() || isGenerating}
            loading={isGenerating}
          >
            Generate Content
          </Button>
        </SpaceBetween>
      </Container>
      
      {generatedContent.length > 0 && (
        <Cards
          cardDefinition={{
            header: item => item.title,
            sections: [
              {
                content: item => item.content
              },
              {
                content: item => \`Generated: \${item.timestamp}\`
              }
            ]
          }}
          items={generatedContent}
          cardsPerRow={[{ cards: 1 }]}
        />
      )}
    </SpaceBetween>
  );
}`,
    relatedPatterns: ['generative-ai-chat', 'generative-ai-loading-states'],
    tags: ['ai', 'content-generation', 'templates', 'productivity'],
    lastUpdated: '2025-09-11',
  },

  'generative-ai-prompt-engineering': {
    id: 'generative-ai-prompt-engineering',
    name: 'Prompt Engineering',
    description:
      'Interface patterns for building, testing, and refining AI prompts with variables and templates.',
    category: 'generative-ai',
    components: ['input', 'textarea', 'select', 'tabs', 'expandable-section'],
    usageGuidelines: `## When to use prompt engineering patterns

Use these patterns when building interfaces that help users create, test, and optimize prompts for AI systems.

## Key features
- Template management
- Variable substitution
- A/B testing capabilities
- Prompt history and versioning`,
    examples: [
      {
        title: 'Prompt Builder',
        description: 'Interactive tool for constructing AI prompts with variables',
      },
      {
        title: 'Prompt Testing Interface',
        description: 'Environment for testing and comparing different prompt variations',
      },
    ],
    codeExample: `import React, { useState } from 'react';
import Tabs from '@cloudscape-design/components/tabs';
import Textarea from '@cloudscape-design/components/textarea';
import Input from '@cloudscape-design/components/input';
import FormField from '@cloudscape-design/components/form-field';
import Button from '@cloudscape-design/components/button';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function PromptEngineeringPattern() {
  const [promptTemplate, setPromptTemplate] = useState('');
  const [variables, setVariables] = useState({});
  const [testResults, setTestResults] = useState([]);
  
  const tabs = [
    {
      label: 'Prompt Builder',
      id: 'builder',
      content: (
        <SpaceBetween direction="vertical" size="m">
          <FormField label="Prompt Template">
            <Textarea
              value={promptTemplate}
              onChange={({ detail }) => setPromptTemplate(detail.value)}
              placeholder="Enter your prompt template with {{variables}}..."
              rows={6}
            />
          </FormField>
          <ExpandableSection headerText="Variables">
            <SpaceBetween direction="vertical" size="s">
              <FormField label="User Name">
                <Input
                  value={variables.userName || ''}
                  onChange={({ detail }) => 
                    setVariables({...variables, userName: detail.value})
                  }
                  placeholder="{{userName}}"
                />
              </FormField>
              <FormField label="Context">
                <Input
                  value={variables.context || ''}
                  onChange={({ detail }) => 
                    setVariables({...variables, context: detail.value})
                  }
                  placeholder="{{context}}"
                />
              </FormField>
            </SpaceBetween>
          </ExpandableSection>
        </SpaceBetween>
      )
    },
    {
      label: 'Test Results',
      id: 'results',
      content: (
        <SpaceBetween direction="vertical" size="m">
          <Button variant="primary" onClick={() => console.log('Testing prompt...')}>
            Test Prompt
          </Button>
          <div>Test results would appear here...</div>
        </SpaceBetween>
      )
    }
  ];
  
  return <Tabs tabs={tabs} />;
}`,
    relatedPatterns: ['generative-ai-content-generation', 'general-actions'],
    tags: ['ai', 'prompt-engineering', 'templates', 'testing', 'variables'],
    lastUpdated: '2025-09-11',
  },

  // Resource Management Patterns
  'resource-management-create': {
    id: 'resource-management-create',
    name: 'Create Resource',
    description:
      'Patterns for creating new resources, including forms, validation, and confirmation workflows.',
    category: 'resource-management',
    components: ['form', 'form-field', 'input', 'button'],
    usageGuidelines: `## When to use create resource patterns

Use create patterns when users need to add new items to your system.`,
    examples: [
      {
        title: 'Simple Create Form',
        description: 'Basic form for creating a resource',
      },
    ],
    codeExample: `import React, { useState } from 'react';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Button from '@cloudscape-design/components/button';

export default function CreateResourcePattern() {
  const [name, setName] = useState('');
  
  return (
    <Form
      header="Create new resource"
      actions={<Button variant="primary">Create</Button>}
    >
      <FormField label="Name">
        <Input 
          value={name} 
          onChange={({ detail }) => setName(detail.value)} 
        />
      </FormField>
    </Form>
  );
}`,
    relatedPatterns: ['resource-management-view', 'layout-form'],
    tags: ['create', 'form', 'validation'],
    lastUpdated: '2025-09-11',
  },

  'resource-management-view': {
    id: 'resource-management-view',
    name: 'View Resource',
    description:
      'Patterns for displaying resource details, including overview pages, detail panels, and read-only views.',
    category: 'resource-management',
    components: ['container', 'column-layout', 'key-value-pairs'],
    usageGuidelines: `## When to use view resource patterns

Use view patterns to display detailed information about resources in a readable format.`,
    examples: [
      {
        title: 'Resource Overview',
        description: 'High-level overview of resource details',
      },
    ],
    codeExample: `import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';

export default function ViewResourcePattern() {
  const resource = {
    name: 'Production API Gateway',
    status: 'Running',
    type: 'Service'
  };
  
  return (
    <Container header={<Header>{resource.name}</Header>}>
      <KeyValuePairs 
        columns={2}
        items={[
          { label: 'Status', value: resource.status },
          { label: 'Type', value: resource.type }
        ]}
      />
    </Container>
  );
}`,
    relatedPatterns: ['resource-management-create'],
    tags: ['view', 'details', 'overview'],
    lastUpdated: '2025-09-11',
  },

  // Additional Resource Management Patterns
  'resource-management-list': {
    id: 'resource-management-list',
    name: 'List Resources',
    description:
      'Patterns for displaying collections of resources with filtering, sorting, and bulk actions.',
    category: 'resource-management',
    components: ['table', 'cards', 'pagination', 'text-filter', 'button-group'],
    usageGuidelines: `## When to use list resource patterns

Use list patterns when users need to browse, search, and manage collections of resources.

## Key features
- Efficient display of multiple items
- Search and filtering capabilities
- Bulk action support
- Pagination for large datasets`,
    examples: [
      {
        title: 'Resource Table View',
        description: 'Tabular display with sorting and actions',
      },
      {
        title: 'Resource Card Grid',
        description: 'Card-based layout for visual resources',
      },
    ],
    codeExample: `import React, { useState } from 'react';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Pagination from '@cloudscape-design/components/pagination';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Header from '@cloudscape-design/components/header';

export default function ListResourcePattern() {
  const [resources] = useState([
    { id: '1', name: 'Resource A', status: 'Active', type: 'Service' },
    { id: '2', name: 'Resource B', status: 'Inactive', type: 'Database' },
    { id: '3', name: 'Resource C', status: 'Active', type: 'Service' }
  ]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(filterText.toLowerCase())
  );
  
  const columnDefinitions = [
    { id: 'name', header: 'Name', cell: item => item.name },
    { id: 'status', header: 'Status', cell: item => item.status },
    { id: 'type', header: 'Type', cell: item => item.type }
  ];
  
  return (
    <Table
      columnDefinitions={columnDefinitions}
      items={filteredResources}
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      selectionType="multi"
      header={
        <Header
          counter={selectedItems.length ? \`(\${selectedItems.length}/\${filteredResources.length})\` : \`(\${filteredResources.length})\`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button disabled={selectedItems.length === 0}>Delete</Button>
              <Button variant="primary">Create Resource</Button>
            </SpaceBetween>
          }
        >
          Resources
        </Header>
      }
      filter={
        <TextFilter
          filteringText={filterText}
          onChange={({ detail }) => setFilterText(detail.filteringText)}
          filteringPlaceholder="Search resources..."
        />
      }
      pagination={
        <Pagination
          currentPageIndex={currentPage}
          pagesCount={Math.ceil(filteredResources.length / 10)}
          onPageChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
        />
      }
    />
  );
}`,
    relatedPatterns: ['resource-management-view', 'general-filtering'],
    tags: ['list', 'table', 'pagination', 'filtering', 'bulk-actions'],
    lastUpdated: '2025-09-11',
  },

  'resource-management-edit': {
    id: 'resource-management-edit',
    name: 'Edit Resource',
    description:
      'Patterns for modifying existing resources with validation, change tracking, and confirmation workflows.',
    category: 'resource-management',
    components: ['form', 'form-field', 'input', 'button', 'alert'],
    usageGuidelines: `## When to use edit resource patterns

Use edit patterns when users need to modify existing resources with proper change tracking and validation.

## Best practices
- Show original vs. modified values
- Provide clear save/cancel actions
- Validate changes before submission
- Handle concurrent modifications`,
    examples: [
      {
        title: 'In-place Editing',
        description: 'Direct editing within the resource view',
      },
      {
        title: 'Edit Form Dialog',
        description: 'Dedicated form for resource modifications',
      },
    ],
    codeExample: `import React, { useState, useEffect } from 'react';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import Button from '@cloudscape-design/components/button';
import Alert from '@cloudscape-design/components/alert';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function EditResourcePattern({ initialResource }) {
  const [resource, setResource] = useState(initialResource);
  const [originalResource] = useState(initialResource);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    const changed = JSON.stringify(resource) !== JSON.stringify(originalResource);
    setHasChanges(changed);
  }, [resource, originalResource]);
  
  const handleSave = () => {
    const newErrors = {};
    if (!resource.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    console.log('Saving resource:', resource);
    // Implementation would save to backend
  };
  
  const handleRevert = () => {
    setResource(originalResource);
    setErrors({});
  };
  
  return (
    <Form
      header="Edit Resource"
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button onClick={handleRevert} disabled={!hasChanges}>
            Revert Changes
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {hasChanges && (
          <Alert type="info" header="Unsaved Changes">
            You have unsaved changes. Make sure to save before leaving this page.
          </Alert>
        )}
        
        <FormField label="Name" errorText={errors.name}>
          <Input
            value={resource.name}
            onChange={({ detail }) => 
              setResource({...resource, name: detail.value})
            }
          />
        </FormField>
        
        <FormField label="Description">
          <Textarea
            value={resource.description || ''}
            onChange={({ detail }) => 
              setResource({...resource, description: detail.value})
            }
            rows={3}
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );
}`,
    relatedPatterns: ['resource-management-create', 'general-errors'],
    tags: ['edit', 'form', 'validation', 'change-tracking'],
    lastUpdated: '2025-09-11',
  },

  'resource-management-delete': {
    id: 'resource-management-delete',
    name: 'Delete Resource',
    description:
      'Safe deletion patterns with confirmation dialogs, bulk deletion, and recovery options.',
    category: 'resource-management',
    components: ['modal', 'button', 'alert', 'checkbox'],
    usageGuidelines: `## When to use delete resource patterns

Use delete patterns to provide safe, reversible resource removal with clear confirmations.

## Safety measures
- Confirmation dialogs for destructive actions
- Clear consequences explanation
- Bulk deletion with item review
- Soft delete with recovery options`,
    examples: [
      {
        title: 'Single Item Deletion',
        description: 'Confirmation dialog for deleting one resource',
      },
      {
        title: 'Bulk Deletion',
        description: 'Interface for deleting multiple resources safely',
      },
    ],
    codeExample: `import React, { useState } from 'react';
import Modal from '@cloudscape-design/components/modal';
import Button from '@cloudscape-design/components/button';
import Alert from '@cloudscape-design/components/alert';
import Checkbox from '@cloudscape-design/components/checkbox';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function DeleteResourcePattern({ 
  resourcesToDelete, 
  onConfirm, 
  onCancel 
}) {
  const [confirmUnderstood, setConfirmUnderstood] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isMultiple = resourcesToDelete.length > 1;
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(resourcesToDelete);
      // Success handled by parent
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Modal
      visible={true}
      onDismiss={onCancel}
      header={isMultiple ? \`Delete \${resourcesToDelete.length} resources\` : 'Delete resource'}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={onCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={!confirmUnderstood || isDeleting}
              loading={isDeleting}
            >
              Delete
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween direction="vertical" size="m">
        <Alert type="warning" header="This action cannot be undone">
          {isMultiple 
            ? \`You are about to permanently delete \${resourcesToDelete.length} resources.\`
            : \`You are about to permanently delete "\${resourcesToDelete[0].name}".\`
          }
        </Alert>
        
        {isMultiple && (
          <Box>
            <strong>Resources to be deleted:</strong>
            <ul>
              {resourcesToDelete.map(resource => (
                <li key={resource.id}>{resource.name}</li>
              ))}
            </ul>
          </Box>
        )}
        
        <Checkbox
          checked={confirmUnderstood}
          onChange={({ detail }) => setConfirmUnderstood(detail.checked)}
        >
          I understand that this action cannot be undone
        </Checkbox>
      </SpaceBetween>
    </Modal>
  );
}`,
    relatedPatterns: ['resource-management-list', 'general-actions'],
    tags: ['delete', 'confirmation', 'bulk-actions', 'safety'],
    lastUpdated: '2025-09-11',
  },
}

export default patternData
