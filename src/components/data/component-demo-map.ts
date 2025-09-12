/**
 * Component-Demo Relationship Mappings
 * 
 * This module defines the relationships between components and their available demos.
 * It provides a centralized mapping to efficiently look up which demos are available
 * for each component and enables cross-referencing between the component registry
 * and demo provider systems.
 */

export interface ComponentDemoMapping {
  componentId: string;
  demoIds: string[];
  primaryDemo?: string; // The main/recommended demo for this component
  demoCount: number;
  lastUpdated: string;
}

/**
 * Mapping of components to their available demos
 * This enables efficient lookup of demos by component ID
 */
export const componentDemoMap: Record<string, ComponentDemoMapping> = {
  'button': {
    componentId: 'button',
    demoIds: ['button-basic'],
    primaryDemo: 'button-basic',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'table': {
    componentId: 'table',
    demoIds: ['table-basic'],
    primaryDemo: 'table-basic',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'form': {
    componentId: 'form',
    demoIds: ['form-validation'],
    primaryDemo: 'form-validation',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'cards': {
    componentId: 'cards',
    demoIds: ['cards-layout'],
    primaryDemo: 'cards-layout',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'app-layout': {
    componentId: 'app-layout',
    demoIds: ['dashboard-layout'],
    primaryDemo: 'dashboard-layout',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'input': {
    componentId: 'input',
    demoIds: ['input-basic'],
    primaryDemo: 'input-basic',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'select': {
    componentId: 'select',
    demoIds: ['select-basic'],
    primaryDemo: 'select-basic',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'alert': {
    componentId: 'alert',
    demoIds: ['alert-basic'],
    primaryDemo: 'alert-basic',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'modal': {
    componentId: 'modal',
    demoIds: ['modal-basic'],
    primaryDemo: 'modal-basic',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  },

  'tabs': {
    componentId: 'tabs',
    demoIds: ['tabs-basic'],
    primaryDemo: 'tabs-basic',
    demoCount: 1,
    lastUpdated: '2025-09-11'
  }
};

/**
 * Reverse mapping: demo ID to component ID
 * Enables quick lookup of which component a demo belongs to
 */
export const demoToComponentMap: Record<string, string> = {
  'button-basic': 'button',
  'table-basic': 'table',
  'form-validation': 'form',
  'cards-layout': 'cards',
  'dashboard-layout': 'app-layout',
  'input-basic': 'input',
  'select-basic': 'select',
  'alert-basic': 'alert',
  'modal-basic': 'modal',
  'tabs-basic': 'tabs'
};

/**
 * Get all demos for a specific component
 */
export function getDemosForComponent(componentId: string): string[] {
  const mapping = componentDemoMap[componentId];
  return mapping ? mapping.demoIds : [];
}

/**
 * Get the primary (recommended) demo for a component
 */
export function getPrimaryDemoForComponent(componentId: string): string | undefined {
  const mapping = componentDemoMap[componentId];
  return mapping ? mapping.primaryDemo : undefined;
}

/**
 * Get the component ID for a specific demo
 */
export function getComponentForDemo(demoId: string): string | undefined {
  return demoToComponentMap[demoId];
}

/**
 * Get all components that have demos
 */
export function getComponentsWithDemos(): string[] {
  return Object.keys(componentDemoMap);
}

/**
 * Get demo count for a component
 */
export function getDemoCountForComponent(componentId: string): number {
  const mapping = componentDemoMap[componentId];
  return mapping ? mapping.demoCount : 0;
}

/**
 * Check if a component has any demos
 */
export function componentHasDemos(componentId: string): boolean {
  return componentId in componentDemoMap;
}

/**
 * Get statistics about component-demo relationships
 */
export function getComponentDemoStats() {
  const totalComponents = Object.keys(componentDemoMap).length;
  const totalDemos = Object.keys(demoToComponentMap).length;
  const componentsWithMultipleDemos = Object.values(componentDemoMap)
    .filter(mapping => mapping.demoCount > 1).length;
  
  return {
    totalComponents,
    totalDemos,
    componentsWithMultipleDemos,
    averageDemosPerComponent: totalDemos / totalComponents,
    mappings: Object.values(componentDemoMap).map(mapping => ({
      componentId: mapping.componentId,
      demoCount: mapping.demoCount,
      primaryDemo: mapping.primaryDemo
    }))
  };
}

/**
 * Validate component-demo mapping consistency
 */
export function validateComponentDemoMappings(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check forward mapping consistency
  Object.entries(componentDemoMap).forEach(([componentId, mapping]) => {
    if (mapping.componentId !== componentId) {
      errors.push(`Component mapping key '${componentId}' doesn't match mapping.componentId '${mapping.componentId}'`);
    }
    
    if (mapping.demoCount !== mapping.demoIds.length) {
      errors.push(`Component '${componentId}' demoCount (${mapping.demoCount}) doesn't match demoIds length (${mapping.demoIds.length})`);
    }
    
    if (mapping.primaryDemo && !mapping.demoIds.includes(mapping.primaryDemo)) {
      errors.push(`Component '${componentId}' primaryDemo '${mapping.primaryDemo}' not found in demoIds`);
    }
  });
  
  // Check reverse mapping consistency
  Object.entries(demoToComponentMap).forEach(([demoId, componentId]) => {
    const componentMapping = componentDemoMap[componentId];
    if (!componentMapping) {
      errors.push(`Demo '${demoId}' maps to component '${componentId}' which doesn't exist in componentDemoMap`);
    } else if (!componentMapping.demoIds.includes(demoId)) {
      errors.push(`Demo '${demoId}' not found in component '${componentId}' demoIds array`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Find similar demos for a given demo (based on component relationship)
 */
export function findSimilarDemos(demoId: string, limit: number = 3): string[] {
  const componentId = getComponentForDemo(demoId);
  if (!componentId) {
    return [];
  }
  
  // Get other demos for the same component
  const componentDemos = getDemosForComponent(componentId)
    .filter(id => id !== demoId);
  
  // If we need more, could add logic to find demos from related components
  return componentDemos.slice(0, limit);
}

export default {
  componentDemoMap,
  demoToComponentMap,
  getDemosForComponent,
  getPrimaryDemoForComponent,
  getComponentForDemo,
  getComponentsWithDemos,
  getDemoCountForComponent,
  componentHasDemos,
  getComponentDemoStats,
  validateComponentDemoMappings,
  findSimilarDemos
};