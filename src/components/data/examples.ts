/**
 * Example metadata for Cloudscape components
 */

interface Example {
  id: string
  name: string
  description: string
  component: string
  code: string
  type: string
  tags?: string[]
}

const examples: Record<string, Example> = {
  'app-layout-basic': {
    id: 'app-layout-basic',
    name: 'Basic AppLayout',
    description: 'A basic AppLayout with navigation, content, and tools panels.',
    component: 'app-layout',
    code: `import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";

function BasicAppLayout() {
  return (
    <AppLayout
      navigation={
        <SideNavigation
          header={{ text: "Navigation" }}
          items={[
            { type: "link", text: "Page 1", href: "#/page1" },
            { type: "link", text: "Page 2", href: "#/page2" },
            { type: "link", text: "Page 3", href: "#/page3" }
          ]}
        />
      }
      content={
        <Container
          header={<Header variant="h1">Main Content</Header>}
        >
          <p>This is the main content area.</p>
        </Container>
      }
      tools={
        <Container
          header={<Header variant="h2">Tools</Header>}
        >
          <p>This is the tools panel.</p>
        </Container>
      }
    />
  );
}`,
    type: 'basic',
  },

  'app-layout-with-navigation': {
    id: 'app-layout-with-navigation',
    name: 'AppLayout with Navigation',
    description: 'An AppLayout with a navigation panel and breadcrumbs.',
    component: 'app-layout',
    code: `import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";

function AppLayoutWithNavigation() {
  return (
    <AppLayout
      navigation={
        <SideNavigation
          header={{ text: "Navigation" }}
          items={[
            { type: "link", text: "Dashboard", href: "#/dashboard" },
            { type: "link", text: "Users", href: "#/users" },
            { type: "link", text: "Settings", href: "#/settings" }
          ]}
        />
      }
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Home", href: "#" },
            { text: "Users", href: "#/users" },
            { text: "User Details", href: "#/users/123" }
          ]}
        />
      }
      content={
        <Container
          header={<Header variant="h1">User Details</Header>}
        >
          <p>User details content goes here.</p>
        </Container>
      }
    />
  );
}`,
    type: 'navigation',
  },

  'table-basic': {
    id: 'table-basic',
    name: 'Basic Table',
    description: 'A basic table with column definitions and items.',
    component: 'table',
    code: `import Table from "@cloudscape-design/components/table";

function BasicTable() {
  return (
    <Table
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: item => item.name
        },
        {
          id: "type",
          header: "Type",
          cell: item => item.type
        },
        {
          id: "description",
          header: "Description",
          cell: item => item.description
        }
      ]}
      items={[
        { name: "Item 1", type: "Type 1", description: "Description 1" },
        { name: "Item 2", type: "Type 2", description: "Description 2" },
        { name: "Item 3", type: "Type 3", description: "Description 3" }
      ]}
    />
  );
}`,
    type: 'basic',
  },

  'table-with-sorting': {
    id: 'table-with-sorting',
    name: 'Table with Sorting',
    description: 'A table with sortable columns.',
    component: 'table',
    code: `import Table from "@cloudscape-design/components/table";
import { useState } from "react";

function TableWithSorting() {
  const [items, setItems] = useState([
    { name: "Item A", type: "Type 2", description: "Description A" },
    { name: "Item B", type: "Type 1", description: "Description B" },
    { name: "Item C", type: "Type 3", description: "Description C" }
  ]);
  const [sortingColumn, setSortingColumn] = useState({ id: "name" });
  const [sortingDescending, setSortingDescending] = useState(false);
  
  const handleSortingChange = ({ detail }) => {
    const { sortingColumn, sortingDescending } = detail;
    setSortingColumn(sortingColumn);
    setSortingDescending(sortingDescending);
    
    // Sort items
    const sortedItems = [...items].sort((a, b) => {
      const valueA = a[sortingColumn.id];
      const valueB = b[sortingColumn.id];
      
      if (valueA < valueB) {
        return sortingDescending ? 1 : -1;
      }
      if (valueA > valueB) {
        return sortingDescending ? -1 : 1;
      }
      return 0;
    });
    
    setItems(sortedItems);
  };
  
  return (
    <Table
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: item => item.name,
          sortingField: "name"
        },
        {
          id: "type",
          header: "Type",
          cell: item => item.type,
          sortingField: "type"
        },
        {
          id: "description",
          header: "Description",
          cell: item => item.description,
          sortingField: "description"
        }
      ]}
      items={items}
      sortingColumn={sortingColumn}
      sortingDescending={sortingDescending}
      onSortingChange={handleSortingChange}
    />
  );
}`,
    type: 'sorting',
  },

  'form-basic': {
    id: 'form-basic',
    name: 'Basic Form',
    description: 'A basic form with input fields and submit button.',
    component: 'form',
    code: `import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useState } from "react";

function BasicForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const handleSubmit = () => {
    console.error("Form submitted:", { name, email });
  };
  
  return (
    <Form
      header={<h1>Contact Information</h1>}
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        <FormField label="Name">
          <Input
            value={name}
            onChange={({ detail }) => setName(detail.value)}
          />
        </FormField>
        <FormField label="Email">
          <Input
            value={email}
            onChange={({ detail }) => setEmail(detail.value)}
            type="email"
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );
}`,
    type: 'basic',
  },

  'button-variants': {
    id: 'button-variants',
    name: 'Button Variants',
    description: 'Different button variants (primary, normal, link, icon).',
    component: 'button',
    code: `import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

function ButtonVariants() {
  return (
    <SpaceBetween size="m">
      <Button variant="primary">Primary Button</Button>
      <Button variant="normal">Normal Button</Button>
      <Button variant="link">Link Button</Button>
      <Button iconName="settings" variant="icon" ariaLabel="Settings" />
    </SpaceBetween>
  );
}`,
    type: 'variants',
  },

  'container-with-header': {
    id: 'container-with-header',
    name: 'Container with Header',
    description: 'A container with a header and content.',
    component: 'container',
    code: `import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

function ContainerWithHeader() {
  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <Button variant="primary">Action</Button>
          }
        >
          Container Title
        </Header>
      }
    >
      <SpaceBetween size="m">
        <p>This is the container content.</p>
        <p>It can contain any content you want.</p>
      </SpaceBetween>
    </Container>
  );
}`,
    type: 'header',
  },
}

export default examples
