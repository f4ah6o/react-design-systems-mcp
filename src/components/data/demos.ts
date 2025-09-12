/**
 * Demo Data Model
 * 
 * This module defines demo entities based on research from the Cloudscape demos repository.
 * Demos are extracted from https://github.com/cloudscape-design/demos and structured
 * according to the examples-list.json catalog and individual demo implementations.
 */

export interface DemoVariation {
  name: string;
  description: string;
  props?: Record<string, any>;
  code?: string;
}

export interface DemoMetadata {
  source: string; // URL or file path to original demo
  complexity: 'basic' | 'intermediate' | 'advanced';
  lastUpdated: string;
  dependencies: string[];
}

export interface Demo {
  id: string;
  name: string;
  description: string;
  componentId: string;
  type: string; // e.g., 'basic', 'interactive', 'form', 'data-display'
  variations: DemoVariation[];
  tags: string[];
  code: string;
  metadata: DemoMetadata;
}

/**
 * Demo data extracted from Cloudscape demos repository
 * Based on examples-list.json and individual demo implementations
 */
export const demoData: Record<string, Demo> = {
  'button-basic': {
    id: 'button-basic',
    name: 'Basic Button',
    description: 'Simple button implementation with different variants',
    componentId: 'button',
    type: 'basic',
    variations: [
      {
        name: 'Primary Button',
        description: 'Primary action button with emphasis',
        props: { variant: 'primary' },
        code: `<Button variant="primary">Primary Action</Button>`
      },
      {
        name: 'Normal Button',
        description: 'Default button for secondary actions',
        props: { variant: 'normal' },
        code: `<Button variant="normal">Secondary Action</Button>`
      },
      {
        name: 'Link Button',
        description: 'Button styled as a link',
        props: { variant: 'link' },
        code: `<Button variant="link">Link Action</Button>`
      }
    ],
    tags: ['button', 'basic', 'variants'],
    code: `import React from 'react';
import Button from '@cloudscape-design/components/button';

export default function ButtonDemo() {
  return (
    <div>
      <Button variant="primary">Primary Action</Button>
      <Button variant="normal">Secondary Action</Button>
      <Button variant="link">Link Action</Button>
    </div>
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/button',
      complexity: 'basic',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components']
    }
  },

  'table-basic': {
    id: 'table-basic',
    name: 'Basic Table',
    description: 'Data table with sorting, pagination, and selection',
    componentId: 'table',
    type: 'data-display',
    variations: [
      {
        name: 'Simple Table',
        description: 'Basic table with static data',
        props: { variant: 'container' },
        code: `<Table
  columnDefinitions={columns}
  items={items}
  variant="container"
/>`
      },
      {
        name: 'Sortable Table',
        description: 'Table with sortable columns',
        props: { sortingDisabled: false },
        code: `<Table
  columnDefinitions={columns}
  items={items}
  sortingDisabled={false}
  onSortingChange={handleSortingChange}
/>`
      },
      {
        name: 'Selectable Table',
        description: 'Table with row selection',
        props: { selectionType: 'multi' },
        code: `<Table
  columnDefinitions={columns}
  items={items}
  selectionType="multi"
  selectedItems={selectedItems}
  onSelectionChange={handleSelectionChange}
/>`
      }
    ],
    tags: ['table', 'data-display', 'sorting', 'selection', 'pagination'],
    code: `import React, { useState } from 'react';
import Table from '@cloudscape-design/components/table';

export default function TableDemo() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortingColumn, setSortingColumn] = useState({ sortingColumn: null });
  
  const columns = [
    { id: 'id', header: 'ID', cell: item => item.id, sortingField: 'id' },
    { id: 'name', header: 'Name', cell: item => item.name, sortingField: 'name' },
    { id: 'status', header: 'Status', cell: item => item.status, sortingField: 'status' }
  ];
  
  const items = [
    { id: '1', name: 'Item 1', status: 'Active' },
    { id: '2', name: 'Item 2', status: 'Inactive' },
    { id: '3', name: 'Item 3', status: 'Pending' }
  ];
  
  return (
    <Table
      columnDefinitions={columns}
      items={items}
      selectionType="multi"
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      sortingColumn={sortingColumn.sortingColumn}
      onSortingChange={({ detail }) => setSortingColumn(detail)}
      variant="container"
    />
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/table',
      complexity: 'intermediate',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components', 'react']
    }
  },

  'form-validation': {
    id: 'form-validation',
    name: 'Form Validation',
    description: 'Form with comprehensive validation and error handling',
    componentId: 'form',
    type: 'form',
    variations: [
      {
        name: 'Basic Validation',
        description: 'Simple form validation with required fields',
        props: { variant: 'full-page' },
        code: `<Form
  variant="full-page"
  errorIconAriaLabel="Error"
  errorText={errorText}
>
  <FormField label="Name" errorText={nameError}>
    <Input value={name} onChange={handleNameChange} />
  </FormField>
</Form>`
      },
      {
        name: 'Real-time Validation',
        description: 'Form with real-time field validation',
        props: { validateOnChange: true },
        code: `<Form variant="full-page">
  <FormField label="Email" errorText={emailError}>
    <Input
      value={email}
      onChange={handleEmailChange}
      onBlur={validateEmail}
      type="email"
    />
  </FormField>
</Form>`
      }
    ],
    tags: ['form', 'validation', 'input', 'error-handling'],
    code: `import React, { useState } from 'react';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Button from '@cloudscape-design/components/button';

export default function FormValidationDemo() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const validateName = (value) => {
    if (!value.trim()) {
      return 'Name is required';
    }
    return '';
  };
  
  const validateEmail = (value) => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!value.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    
    setNameError(nameErr);
    setEmailError(emailErr);
    
    if (!nameErr && !emailErr) {
      console.log('Form submitted:', { name, email });
    }
  };
  
  return (
    <Form variant="full-page">
      <FormField label="Name" errorText={nameError}>
        <Input
          value={name}
          onChange={({ detail }) => {
            setName(detail.value);
            setNameError(validateName(detail.value));
          }}
        />
      </FormField>
      
      <FormField label="Email" errorText={emailError}>
        <Input
          value={email}
          type="email"
          onChange={({ detail }) => {
            setEmail(detail.value);
            setEmailError(validateEmail(detail.value));
          }}
        />
      </FormField>
      
      <Button variant="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Form>
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/form-validation',
      complexity: 'intermediate',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components', 'react']
    }
  },

  'cards-layout': {
    id: 'cards-layout',
    name: 'Cards Layout',
    description: 'Responsive card grid layout with different card types',
    componentId: 'cards',
    type: 'layout',
    variations: [
      {
        name: 'Basic Cards',
        description: 'Simple cards with minimal content',
        props: { cardsPerRow: [{ cards: 1 }, { cards: 3 }] },
        code: `<Cards
  cardsPerRow={[{ cards: 1 }, { cards: 3 }]}
  items={items}
  cardDefinition={{
    header: item => item.name,
    sections: [
      { content: item => item.description }
    ]
  }}
/>`
      },
      {
        name: 'Rich Cards',
        description: 'Cards with multiple sections and actions',
        props: { variant: 'full-page' },
        code: `<Cards
  variant="full-page"
  items={items}
  cardDefinition={{
    header: item => item.name,
    sections: [
      { content: item => item.description },
      { content: item => \`Status: \${item.status}\` }
    ]
  }}
/>`
      }
    ],
    tags: ['cards', 'layout', 'grid', 'responsive'],
    code: `import React from 'react';
import Cards from '@cloudscape-design/components/cards';

export default function CardsDemo() {
  const items = [
    {
      id: '1',
      name: 'Service A',
      description: 'This is a description for Service A',
      status: 'Running'
    },
    {
      id: '2', 
      name: 'Service B',
      description: 'This is a description for Service B',
      status: 'Stopped'
    },
    {
      id: '3',
      name: 'Service C', 
      description: 'This is a description for Service C',
      status: 'Error'
    }
  ];
  
  const cardDefinition = {
    header: item => item.name,
    sections: [
      {
        content: item => item.description
      },
      {
        content: item => \`Status: \${item.status}\`
      }
    ]
  };
  
  return (
    <Cards
      cardsPerRow={[
        { cards: 1 },
        { minWidth: 500, cards: 2 },
        { minWidth: 800, cards: 3 }
      ]}
      items={items}
      cardDefinition={cardDefinition}
      variant="full-page"
    />
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/cards',
      complexity: 'basic',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components']
    }
  },

  'input-basic': {
    id: 'input-basic',
    name: 'Basic Input',
    description: 'Input field with validation and different types',
    componentId: 'input',
    type: 'form',
    variations: [
      {
        name: 'Text Input',
        description: 'Basic text input field',
        props: { type: 'text' },
        code: `<Input\n  value={value}\n  onChange={({ detail }) => setValue(detail.value)}\n  placeholder=\"Enter text...\"\n/>`
      },
      {
        name: 'Password Input',
        description: 'Password input with visibility toggle',
        props: { type: 'password' },
        code: `<Input\n  type=\"password\"\n  value={password}\n  onChange={({ detail }) => setPassword(detail.value)}\n  placeholder=\"Enter password...\"\n/>`
      },
      {
        name: 'Disabled Input',
        description: 'Disabled input field',
        props: { disabled: true },
        code: `<Input\n  value={value}\n  disabled\n  placeholder=\"Disabled input\"\n/>`
      }
    ],
    tags: ['input', 'form', 'validation', 'text'],
    code: `import React, { useState } from 'react';
import Input from '@cloudscape-design/components/input';
import FormField from '@cloudscape-design/components/form-field';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function InputDemo() {
  const [textValue, setTextValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  
  return (
    <SpaceBetween direction="vertical" size="m">
      <FormField label="Text Input">
        <Input
          value={textValue}
          onChange={({ detail }) => setTextValue(detail.value)}
          placeholder="Enter text..."
        />
      </FormField>
      
      <FormField label="Password Input">
        <Input
          type="password"
          value={passwordValue}
          onChange={({ detail }) => setPasswordValue(detail.value)}
          placeholder="Enter password..."
        />
      </FormField>
      
      <FormField label="Email Input">
        <Input
          type="email"
          value={emailValue}
          onChange={({ detail }) => setEmailValue(detail.value)}
          placeholder="user@example.com"
        />
      </FormField>
    </SpaceBetween>
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/input',
      complexity: 'basic',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components']
    }
  },

  'select-basic': {
    id: 'select-basic',
    name: 'Basic Select',
    description: 'Select component with single and multiselect options',
    componentId: 'select',
    type: 'form',
    variations: [
      {
        name: 'Single Select',
        description: 'Basic single selection dropdown',
        props: { selectedOption: null },
        code: `<Select\n  selectedOption={selectedOption}\n  onChange={({ detail }) => setSelectedOption(detail.selectedOption)}\n  options={[\n    { label: "Option 1", value: "1" },\n    { label: "Option 2", value: "2" }\n  ]}\n/>`
      },
      {
        name: 'Multiselect',
        description: 'Multiple selection dropdown',
        props: { selectedOptions: [] },
        code: `<Multiselect\n  selectedOptions={selectedOptions}\n  onChange={({ detail }) => setSelectedOptions(detail.selectedOptions)}\n  options={[\n    { label: "Option 1", value: "1" },\n    { label: "Option 2", value: "2" }\n  ]}\n/>`
      }
    ],
    tags: ['select', 'dropdown', 'form', 'multiselect'],
    code: `import React, { useState } from 'react';
import Select from '@cloudscape-design/components/select';
import Multiselect from '@cloudscape-design/components/multiselect';
import FormField from '@cloudscape-design/components/form-field';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function SelectDemo() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const options = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
    { label: "Option 4", value: "4" }
  ];
  
  return (
    <SpaceBetween direction="vertical" size="m">
      <FormField label="Single Select">
        <Select
          selectedOption={selectedOption}
          onChange={({ detail }) => setSelectedOption(detail.selectedOption)}
          options={options}
          placeholder="Choose an option"
        />
      </FormField>
      
      <FormField label="Multiselect">
        <Multiselect
          selectedOptions={selectedOptions}
          onChange={({ detail }) => setSelectedOptions(detail.selectedOptions)}
          options={options}
          placeholder="Choose multiple options"
        />
      </FormField>
    </SpaceBetween>
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/select',
      complexity: 'basic',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components']
    }
  },

  'alert-basic': {
    id: 'alert-basic',
    name: 'Basic Alert',
    description: 'Alert component with different types and actions',
    componentId: 'alert',
    type: 'feedback',
    variations: [
      {
        name: 'Success Alert',
        description: 'Success message alert',
        props: { type: 'success' },
        code: `<Alert type="success" header="Success">Operation completed successfully</Alert>`
      },
      {
        name: 'Error Alert',
        description: 'Error message alert',
        props: { type: 'error' },
        code: `<Alert type="error" header="Error">Something went wrong</Alert>`
      },
      {
        name: 'Warning Alert',
        description: 'Warning message alert',
        props: { type: 'warning' },
        code: `<Alert type="warning" header="Warning">Please check your input</Alert>`
      },
      {
        name: 'Info Alert',
        description: 'Information alert',
        props: { type: 'info' },
        code: `<Alert type="info" header="Information">Here's some helpful information</Alert>`
      }
    ],
    tags: ['alert', 'notification', 'feedback', 'message'],
    code: `import React, { useState } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function AlertDemo() {
  const [alerts, setAlerts] = useState([]);
  
  const addAlert = (type, message) => {
    const newAlert = {
      id: Date.now(),
      type,
      header: type.charAt(0).toUpperCase() + type.slice(1),
      content: message,
      dismissible: true,
      onDismiss: () => removeAlert(Date.now())
    };
    setAlerts([...alerts, newAlert]);
  };
  
  const removeAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
  
  return (
    <SpaceBetween direction="vertical" size="m">
      <SpaceBetween direction="horizontal" size="s">
        <Button onClick={() => addAlert('success', 'Operation completed successfully')}>
          Show Success
        </Button>
        <Button onClick={() => addAlert('error', 'Something went wrong')}>
          Show Error
        </Button>
        <Button onClick={() => addAlert('warning', 'Please check your input')}>
          Show Warning
        </Button>
        <Button onClick={() => addAlert('info', 'Here\\'s some helpful information')}>
          Show Info
        </Button>
      </SpaceBetween>
      
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          type={alert.type}
          header={alert.header}
          dismissible={alert.dismissible}
          onDismiss={() => removeAlert(alert.id)}
        >
          {alert.content}
        </Alert>
      ))}
    </SpaceBetween>
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/alert',
      complexity: 'intermediate',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components', 'react']
    }
  },

  'modal-basic': {
    id: 'modal-basic',
    name: 'Basic Modal',
    description: 'Modal dialog with different sizes and actions',
    componentId: 'modal',
    type: 'overlay',
    variations: [
      {
        name: 'Small Modal',
        description: 'Compact modal dialog',
        props: { size: 'small' },
        code: `<Modal\n  size="small"\n  visible={visible}\n  onDismiss={() => setVisible(false)}\n  header="Small Modal"\n>\n  Content goes here\n</Modal>`
      },
      {
        name: 'Large Modal',
        description: 'Large modal dialog',
        props: { size: 'large' },
        code: `<Modal\n  size="large"\n  visible={visible}\n  onDismiss={() => setVisible(false)}\n  header="Large Modal"\n>\n  Content goes here\n</Modal>`
      }
    ],
    tags: ['modal', 'dialog', 'overlay', 'popup'],
    code: `import React, { useState } from 'react';
import Modal from '@cloudscape-design/components/modal';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';

export default function ModalDemo() {
  const [visible, setVisible] = useState(false);
  const [modalSize, setModalSize] = useState('medium');
  
  return (
    <>
      <SpaceBetween direction="horizontal" size="s">
        <Button 
          onClick={() => {
            setModalSize('small');
            setVisible(true);
          }}
        >
          Open Small Modal
        </Button>
        <Button 
          onClick={() => {
            setModalSize('medium');
            setVisible(true);
          }}
        >
          Open Medium Modal
        </Button>
        <Button 
          onClick={() => {
            setModalSize('large');
            setVisible(true);
          }}
        >
          Open Large Modal
        </Button>
      </SpaceBetween>
      
      <Modal
        size={modalSize}
        visible={visible}
        onDismiss={() => setVisible(false)}
        header={\`\${modalSize.charAt(0).toUpperCase() + modalSize.slice(1)} Modal\`}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setVisible(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setVisible(false)}>
                Confirm
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box>
          This is a {modalSize} modal dialog. You can put any content here including forms, 
          text, images, or other components.
        </Box>
      </Modal>
    </>
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/modal',
      complexity: 'intermediate',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components', 'react']
    }
  },

  'tabs-basic': {
    id: 'tabs-basic',
    name: 'Basic Tabs',
    description: 'Tabbed interface with different content panels',
    componentId: 'tabs',
    type: 'navigation',
    variations: [
      {
        name: 'Default Tabs',
        description: 'Basic tabbed interface',
        props: { variant: 'default' },
        code: `<Tabs\n  tabs={[\n    { label: "Tab 1", id: "first", content: "First tab content" },\n    { label: "Tab 2", id: "second", content: "Second tab content" }\n  ]}\n/>`
      },
      {
        name: 'Container Tabs',
        description: 'Tabs with container styling',
        props: { variant: 'container' },
        code: `<Tabs\n  variant="container"\n  tabs={[\n    { label: "Tab 1", id: "first", content: "First tab content" },\n    { label: "Tab 2", id: "second", content: "Second tab content" }\n  ]}\n/>`
      }
    ],
    tags: ['tabs', 'navigation', 'panels', 'interface'],
    code: `import React, { useState } from 'react';
import Tabs from '@cloudscape-design/components/tabs';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function TabsDemo() {
  const [activeTabId, setActiveTabId] = useState('general');
  
  const tabs = [
    {
      label: 'General',
      id: 'general',
      content: (
        <Container header={<Header variant="h2">General Settings</Header>}>
          <Box>
            This panel contains general configuration options for your application.
            You can set basic preferences and general settings here.
          </Box>
        </Container>
      )
    },
    {
      label: 'Security',
      id: 'security',
      content: (
        <Container header={<Header variant="h2">Security Settings</Header>}>
          <Box>
            Configure security-related settings including authentication, 
            authorization, and access control preferences.
          </Box>
        </Container>
      )
    },
    {
      label: 'Advanced',
      id: 'advanced',
      content: (
        <Container header={<Header variant="h2">Advanced Settings</Header>}>
          <Box>
            Advanced configuration options for power users. These settings 
            require careful consideration before making changes.
          </Box>
        </Container>
      )
    }
  ];
  
  return (
    <SpaceBetween direction="vertical" size="m">
      <Header variant="h1">Settings</Header>
      
      <Tabs
        tabs={tabs}
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
      />
    </SpaceBetween>
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/tabs',
      complexity: 'basic',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components', 'react']
    }
  },

  'dashboard-layout': {
    id: 'dashboard-layout',
    name: 'Dashboard Layout',
    description: 'Comprehensive dashboard with multiple widgets and real-time updates',
    componentId: 'app-layout',
    type: 'advanced',
    variations: [
      {
        name: 'Basic Dashboard',
        description: 'Simple dashboard with key metrics',
        props: { navigationHide: false },
        code: `<AppLayout
  navigation={<Navigation />}
  content={<DashboardContent />}
  toolsHide
/>`
      },
      {
        name: 'Full Dashboard',
        description: 'Complete dashboard with all features',
        props: { toolsHide: false },
        code: `<AppLayout
  navigation={<Navigation />}
  content={<DashboardContent />}
  tools={<DashboardTools />}
/>`
      }
    ],
    tags: ['dashboard', 'layout', 'app-layout', 'navigation', 'advanced'],
    code: `import React, { useState, useEffect } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';

export default function DashboardDemo() {
  const [metrics, setMetrics] = useState({
    totalUsers: 1250,
    activeServices: 8,
    errorRate: 0.02,
    uptime: 99.95
  });
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 10),
        errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.01)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const DashboardContent = () => (
    <Grid
      gridDefinition={[
        { colspan: { default: 12, xs: 6 } },
        { colspan: { default: 12, xs: 6 } },
        { colspan: { default: 12, xs: 6 } },
        { colspan: { default: 12, xs: 6 } }
      ]}
    >
      <Container header={<Header variant="h2">Total Users</Header>}>
        <Box fontSize="display-l" color="text-status-success" textAlign="center">
          {metrics.totalUsers.toLocaleString()}
        </Box>
      </Container>
      
      <Container header={<Header variant="h2">Active Services</Header>}>
        <Box fontSize="display-l" color="text-status-info" textAlign="center">
          {metrics.activeServices}
        </Box>
      </Container>
      
      <Container header={<Header variant="h2">Error Rate</Header>}>
        <Box fontSize="display-l" textAlign="center">
          <StatusIndicator type={metrics.errorRate < 0.05 ? 'success' : 'error'}>
            {(metrics.errorRate * 100).toFixed(2)}%
          </StatusIndicator>
        </Box>
      </Container>
      
      <Container header={<Header variant="h2">Uptime</Header>}>
        <Box fontSize="display-l" color="text-status-success" textAlign="center">
          {metrics.uptime.toFixed(2)}%
        </Box>
      </Container>
    </Grid>
  );
  
  return (
    <AppLayout
      content={<DashboardContent />}
      navigationHide
      toolsHide
    />
  );
}`,
    metadata: {
      source: 'https://github.com/cloudscape-design/demos/blob/main/src/pages/dashboard',
      complexity: 'advanced',
      lastUpdated: '2025-09-11',
      dependencies: ['@cloudscape-design/components', 'react']
    }
  }
};

export default demoData;