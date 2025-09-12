/**
 * Component Registry
 * 
 * This module provides access to the Cloudscape component metadata using the new documentation format.
 * - Full documentation on all components is now available under src/components/data/{component-name}
 * - Each component directory provides:
 *   - examples (directory): Example implementations of specific use cases
 *   - usage.md: Guidelines on how and when to use the component
 *   - api.json: A full API representation of the component in JSON format
 */

import fs from 'fs';
import path from 'path';
import demoProvider, { DemoSearchOptions, DemoSearchResult } from '../demo-provider';
import { Demo } from './data/demos';
import patternProvider, { PatternSearchOptions, PatternSearchResult, PatternDetailsOptions } from '../pattern-provider';
import { Pattern } from './data/patterns';
import { PatternCategory } from './data/pattern-categories';
import componentDemoMap, { getDemosForComponent, getPrimaryDemoForComponent, componentHasDemos } from './data/component-demo-map';

// Define types for component metadata
export interface PropertyMetadata {
  name: string;
  type: string;
  description: string;
  defaultValue?: any;
  required: boolean;
  acceptedValues?: (string | number)[];
  isDeprecated?: boolean;
  examples?: string[];
}

export interface ComponentMetadata {
  id: string;
  name: string;
  category?: string;
  description?: string;
  importPath?: string;
  version?: string;
  isExperimental?: boolean;
  relatedComponents?: string[];
  tags?: string[];
  properties: Record<string, PropertyMetadata>;
  events: Record<string, EventMetadata>;
  functions: Record<string, FunctionMetadata>;
  regions?: Array<{
    name: string;
    description: string;
    isDefault: boolean;
    deprecatedTag?: string;
  }>;
  examples: string[];
  usageGuidelines?: string;
  // Demo-related properties
  demoIds?: string[];
  primaryDemo?: string;
  hasDemos?: boolean;
}

export interface CategoryMetadata {
  id: string;
  name: string;
  description: string;
  components: string[];
}

export interface PatternMetadata {
  id: string;
  name: string;
  description: string;
  components: string[];
  code: string;
  customizationOptions: Record<string, CustomizationOption>;
}

export interface CustomizationOption {
  name: string;
  type: string;
  description: string;
  defaultValue: any;
  acceptedValues?: (string | number)[];
}

export interface ExampleMetadata {
  id: string;
  name: string;
  description: string;
  component: string;
  code: string;
  type: string;
  tags?: string[];
}

// Define types for API JSON format
interface ApiJsonProperty {
  name: string;
  type: string;
  inlineType?: {
    name: string;
    type: string;
    values?: string[];
    properties?: Array<{
      name: string;
      type: string;
      optional?: boolean;
    }>;
  };
  optional?: boolean;
  description: string;
  defaultValue?: string;
  deprecatedTag?: string;
  analyticsTag?: string;
  i18nTag?: boolean;
}

interface ApiJsonEvent {
  name: string;
  description: string;
  cancelable: boolean;
  detail?: {
    type: string;
    properties?: Array<{
      name: string;
      type: string;
      optional?: boolean;
      description?: string;
    }>;
  };
}

interface ApiJsonFunction {
  name: string;
  description: string;
  returnType: string;
  parameters: Array<{
    name: string;
    type: string;
    optional?: boolean;
    description?: string;
  }>;
}

interface ApiJsonRegion {
  name: string;
  description: string;
  isDefault: boolean;
  deprecatedTag?: string;
}

interface ApiJson {
  name: string;
  dashCaseName: string;
  releaseStatus: string;
  regions: ApiJsonRegion[];
  functions: ApiJsonFunction[];
  properties: ApiJsonProperty[];
  events: ApiJsonEvent[];
  _meta: {
    component: string;
    source: string;
    extracted_at: string;
  };
}

// Public interfaces for events and functions
export interface EventMetadata {
  name: string;
  description: string;
  cancelable: boolean;
  detailType?: string;
  detailProperties?: Array<{
    name: string;
    type: string;
    optional?: boolean;
    description?: string;
  }>;
}

export interface FunctionMetadata {
  name: string;
  description: string;
  returnType: string;
  parameters: Array<{
    name: string;
    type: string;
    optional?: boolean;
    description?: string;
  }>;
}

// Cache for component metadata
const componentCache: Record<string, ComponentMetadata> = {};
const exampleCache: Record<string, ExampleMetadata> = {};
const categoryCache: Record<string, CategoryMetadata> = {};
const patternCache: Record<string, PatternMetadata> = {};

// Helper function to get component directories
function getComponentDirectories(): string[] {
  const componentsDataDir = path.resolve(__dirname, './data');
  return fs.readdirSync(componentsDataDir)
    .filter(item => {
      const itemPath = path.join(componentsDataDir, item);
      return fs.statSync(itemPath).isDirectory() && 
             fs.existsSync(path.join(itemPath, 'api.json')); // Must have api.json
    })
    .map(dir => dir);
}

// Helper function to load API JSON
function loadApiJson(componentDir: string): ApiJson | null {
  try {
    const apiJsonPath = path.resolve(__dirname, './data', componentDir, 'api.json');
    if (fs.existsSync(apiJsonPath)) {
      const apiJsonContent = fs.readFileSync(apiJsonPath, 'utf8');
      return JSON.parse(apiJsonContent);
    }
  } catch (error) {
    console.error(`Error loading API JSON for ${componentDir}:`, error);
  }
  return null;
}

// Helper function to load usage markdown
function loadUsageMd(componentDir: string): string | null {
  try {
    const usageMdPath = path.resolve(__dirname, './data', componentDir, 'usage.md');
    if (fs.existsSync(usageMdPath)) {
      return fs.readFileSync(usageMdPath, 'utf8');
    }
  } catch (error) {
    console.error(`Error loading usage.md for ${componentDir}:`, error);
  }
  return null;
}

// Helper function to get example files
function getExampleFiles(componentDir: string): string[] {
  try {
    const examplesDir = path.resolve(__dirname, './data', componentDir, 'examples');
    if (fs.existsSync(examplesDir)) {
      return fs.readdirSync(examplesDir)
        .filter(file => file.endsWith('.tsx.d'))
        .map(file => file.replace('.tsx.d', ''));
    }
  } catch (error) {
    console.error(`Error loading examples for ${componentDir}:`, error);
  }
  return [];
}

// Helper function to load example content
function loadExampleContent(componentDir: string, exampleFile: string): string | null {
  try {
    const examplePath = path.resolve(__dirname, './data', componentDir, 'examples', `${exampleFile}.tsx.d`);
    if (fs.existsSync(examplePath)) {
      return fs.readFileSync(examplePath, 'utf8');
    }
  } catch (error) {
    console.error(`Error loading example ${exampleFile} for ${componentDir}:`, error);
  }
  return null;
}

// Convert API JSON property to PropertyMetadata
function convertApiJsonProperty(apiProperty: ApiJsonProperty): PropertyMetadata {
  const acceptedValues: (string | number)[] = [];
  
  // Extract accepted values from inlineType if available
  if (apiProperty.inlineType?.type === 'union' && apiProperty.inlineType.values) {
    apiProperty.inlineType.values.forEach(value => {
      if (typeof value === 'string' || typeof value === 'number') {
        acceptedValues.push(value);
      }
    });
  }

  return {
    name: apiProperty.name,
    type: apiProperty.inlineType?.name || apiProperty.type,
    description: apiProperty.description,
    defaultValue: apiProperty.defaultValue ? apiProperty.defaultValue.replace(/^['"]|['"]$/g, '') : undefined,
    required: !apiProperty.optional,
    acceptedValues,
    isDeprecated: !!apiProperty.deprecatedTag,
    examples: []
  };
}

// Convert API JSON event to EventMetadata
function convertApiJsonEvent(apiEvent: ApiJsonEvent): EventMetadata {
  return {
    name: apiEvent.name,
    description: apiEvent.description,
    cancelable: apiEvent.cancelable,
    detailType: apiEvent.detail?.type,
    detailProperties: apiEvent.detail?.properties
  };
}

// Convert API JSON function to FunctionMetadata
function convertApiJsonFunction(apiFunction: ApiJsonFunction): FunctionMetadata {
  return {
    name: apiFunction.name,
    description: apiFunction.description,
    returnType: apiFunction.returnType,
    parameters: apiFunction.parameters || []
  };
}

// Convert example file to ExampleMetadata
function createExampleMetadata(componentId: string, exampleFile: string): ExampleMetadata {
  // Format the example name from the file name
  const name = exampleFile
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Determine example type based on filename
  let type = 'basic';
  if (exampleFile.includes('error')) type = 'error';
  else if (exampleFile.includes('warning')) type = 'warning';
  else if (exampleFile.includes('success')) type = 'success';
  else if (exampleFile.includes('loading')) type = 'loading';
  else if (exampleFile.includes('empty')) type = 'empty';

  // Extract tags from filename
  const tags = exampleFile.split('_').filter(tag => tag.length > 2);

  return {
    id: `${componentId}-${exampleFile}`,
    name,
    description: `Example of ${name.toLowerCase()} for ${componentId}`,
    component: componentId,
    code: loadExampleContent(componentId, exampleFile) || '',
    type,
    tags
  };
}

// Load all components
function loadAllComponents(): void {
  const componentDirs = getComponentDirectories();
  
  componentDirs.forEach(componentDir => {
    const apiJson = loadApiJson(componentDir);
    if (!apiJson) return;

    const componentId = apiJson.dashCaseName;
    const exampleFiles = getExampleFiles(componentDir);
    
    // Create component metadata
    const componentMetadata: ComponentMetadata = {
      id: componentId,
      name: apiJson.name,
      category: determineCategory(componentId),
      description: extractDescription(apiJson),
      importPath: `@cloudscape-design/components/${componentId}`,
      version: '3.0.0', // Default version
      isExperimental: apiJson.releaseStatus === 'experimental',
      relatedComponents: [], // Would need additional logic to determine related components
      tags: determineTags(componentId, apiJson),
      properties: {},
      events: {},
      functions: {},
      regions: apiJson.regions,
      examples: exampleFiles,
      usageGuidelines: loadUsageMd(componentDir) || undefined
    };

    // Convert properties
    apiJson.properties.forEach(prop => {
      componentMetadata.properties[prop.name] = convertApiJsonProperty(prop);
    });

    // Convert events
    apiJson.events.forEach(event => {
      componentMetadata.events[event.name] = convertApiJsonEvent(event);
    });

    // Convert functions
    apiJson.functions.forEach(func => {
      componentMetadata.functions[func.name] = convertApiJsonFunction(func);
    });

    // Store in cache
    componentCache[componentId] = componentMetadata;

    // Process examples
    exampleFiles.forEach(exampleFile => {
      const exampleMetadata = createExampleMetadata(componentId, exampleFile);
      exampleCache[exampleMetadata.id] = exampleMetadata;
    });
  });
}

// Helper function to determine component category
function determineCategory(componentId: string): string {
  // This is a simplified approach - in a real implementation, you might want to
  // have a more sophisticated categorization system
  if (['table', 'cards', 'alert', 'badge', 'box', 'status-indicator'].includes(componentId)) {
    return 'display';
  } else if (['form', 'input', 'select', 'textarea', 'checkbox', 'radio-group', 'button'].includes(componentId)) {
    return 'input';
  } else if (['app-layout', 'grid', 'space-between', 'container'].includes(componentId)) {
    return 'layout';
  } else if (['side-navigation', 'tabs', 'breadcrumb-group'].includes(componentId)) {
    return 'navigation';
  } else {
    return 'other';
  }
}

// Helper function to extract description from API JSON
function extractDescription(apiJson: ApiJson): string {
  // This is a simplified approach - in a real implementation, you might want to
  // extract this from the usage.md file or have a separate description field
  const childrenRegion = apiJson.regions.find(region => region.name === 'children');
  return childrenRegion?.description || '';
}

// Helper function to determine tags
function determineTags(componentId: string, apiJson: ApiJson): string[] {
  // This is a simplified approach - in a real implementation, you might want to
  // extract tags from the usage.md file or have a separate tags field
  const tags: string[] = [componentId];
  
  // Add category as a tag
  const category = determineCategory(componentId);
  if (category) tags.push(category);
  
  // Add release status as a tag
  if (apiJson.releaseStatus) tags.push(apiJson.releaseStatus);
  
  return tags;
}

// Initialize the registry
function initialize(): void {
  loadAllComponents();
}

/**
 * Get all components
 * @returns All components
 */
export function getAllComponents(): Record<string, ComponentMetadata> {
  if (Object.keys(componentCache).length === 0) {
    initialize();
  }
  return componentCache;
}

/**
 * Get a component by ID with demo information enriched
 * @param componentId - Component ID
 * @returns Component metadata with demo references
 */
export function getComponent(componentId: string): ComponentMetadata | undefined {
  if (Object.keys(componentCache).length === 0) {
    initialize();
  }
  
  const component = componentCache[componentId];
  if (!component) {
    return undefined;
  }
  
  // Enrich with demo information
  return enrichComponentWithDemoInfo(component);
}

/**
 * Get all components with demo information enriched
 * @returns All components with demo references
 */
export function getAllComponentsWithDemos(): Record<string, ComponentMetadata> {
  if (Object.keys(componentCache).length === 0) {
    initialize();
  }
  
  // Enrich all components with demo information
  const enrichedComponents: Record<string, ComponentMetadata> = {};
  Object.entries(componentCache).forEach(([id, component]) => {
    enrichedComponents[id] = enrichComponentWithDemoInfo(component);
  });
  
  return enrichedComponents;
}

/**
 * Enrich component metadata with demo information
 * @param component - Base component metadata
 * @returns Component metadata with demo info
 */
function enrichComponentWithDemoInfo(component: ComponentMetadata): ComponentMetadata {
  const demoIds = getDemosForComponent(component.id);
  const primaryDemo = getPrimaryDemoForComponent(component.id);
  const hasDemos = componentHasDemos(component.id);
  
  return {
    ...component,
    demoIds,
    primaryDemo,
    hasDemos
  };
}

/**
 * Get all categories
 * @returns All categories
 */
export function getAllCategories(): Record<string, CategoryMetadata> {
  if (Object.keys(categoryCache).length === 0) {
    // Generate categories from components
    const components = getAllComponents();
    const categories: Record<string, CategoryMetadata> = {};
    
    Object.values(components).forEach(component => {
      if (component.category) {
        if (!categories[component.category]) {
          categories[component.category] = {
            id: component.category,
            name: component.category.charAt(0).toUpperCase() + component.category.slice(1),
            description: `${component.category.charAt(0).toUpperCase() + component.category.slice(1)} components`,
            components: []
          };
        }
        categories[component.category].components.push(component.id);
      }
    });
    
    Object.assign(categoryCache, categories);
  }
  
  return categoryCache;
}

/**
 * Get a category by ID
 * @param categoryId - Category ID
 * @returns Category metadata
 */
export function getCategory(categoryId: string): CategoryMetadata | undefined {
  const categories = getAllCategories();
  return categories[categoryId];
}

/**
 * Get all patterns
 * @returns All patterns
 */
export function getAllPatterns(): Record<string, PatternMetadata> {
  if (Object.keys(patternCache).length === 0) {
    // Load patterns from patterns.ts file
    try {
      // Using dynamic import to avoid circular dependencies
      const patternsModule = require('./data/patterns').default;
      Object.assign(patternCache, patternsModule);
    } catch (error) {
      console.error('Error loading patterns:', error);
    }
  }
  return patternCache;
}

/**
 * Get a pattern by ID
 * @param patternId - Pattern ID
 * @returns Pattern metadata
 */
export function getPattern(patternId: string): PatternMetadata | undefined {
  return patternCache[patternId];
}

/**
 * Get component examples
 * @param options - Options
 * @param options.componentId - Component ID
 * @param options.type - Example type
 * @param options.limit - Maximum number of examples to return
 * @returns Component examples
 */
export function getComponentExamples(options: {
  componentId: string;
  type?: string;
  limit?: number;
}): ExampleMetadata[] {
  const { componentId, type, limit } = options;
  
  // Ensure components are loaded
  getAllComponents();
  
  // Get component examples
  const componentExamples = Object.values(exampleCache).filter((example: ExampleMetadata) =>
    example.component === componentId &&
    (!type || example.type === type)
  );
  
  // Apply limit
  return limit ? componentExamples.slice(0, limit) : componentExamples;
}

/**
 * Search for properties across components
 * @param options - Search options
 * @returns Matching properties with component information
 */
export function searchProperties(options: {
  query?: string;
  type?: string;
  required?: boolean;
  deprecated?: boolean;
  componentId?: string;
}): Array<{ componentId: string; componentName: string; property: PropertyMetadata }> {
  const { query, type, required, deprecated, componentId } = options;
  const results: Array<{ componentId: string; componentName: string; property: PropertyMetadata }> = [];
  
  // Ensure components are loaded
  const components = getAllComponents();
  
  // Search through all components or specific component
  const componentsToSearch = componentId 
    ? { [componentId]: components[componentId] } 
    : components;
  
  Object.entries(componentsToSearch).forEach(([compId, component]) => {
    if (!component) return;
    
    Object.values(component.properties).forEach(property => {
      // Apply filters
      if (query && !property.name.toLowerCase().includes(query.toLowerCase()) && 
          !(property.description || '').toLowerCase().includes(query.toLowerCase())) {
        return;
      }
      
      if (type && property.type !== type) return;
      if (required !== undefined && property.required !== required) return;
      if (deprecated !== undefined && property.isDeprecated !== deprecated) return;
      
      results.push({
        componentId: compId,
        componentName: component.name,
        property
      });
    });
  });
  
  return results;
}

/**
 * Search for events across components
 * @param options - Search options
 * @returns Matching events with component information
 */
export function searchEvents(options: {
  query?: string;
  cancelable?: boolean;
  componentId?: string;
}): Array<{ componentId: string; componentName: string; event: EventMetadata }> {
  const { query, cancelable, componentId } = options;
  const results: Array<{ componentId: string; componentName: string; event: EventMetadata }> = [];
  
  // Ensure components are loaded
  const components = getAllComponents();
  
  // Search through all components or specific component
  const componentsToSearch = componentId 
    ? { [componentId]: components[componentId] } 
    : components;
  
  Object.entries(componentsToSearch).forEach(([compId, component]) => {
    if (!component) return;
    
    Object.values(component.events).forEach(event => {
      // Apply filters
      if (query && !event.name.toLowerCase().includes(query.toLowerCase()) && 
          !(event.description || '').toLowerCase().includes(query.toLowerCase())) {
        return;
      }
      
      if (cancelable !== undefined && event.cancelable !== cancelable) return;
      
      results.push({
        componentId: compId,
        componentName: component.name,
        event
      });
    });
  });
  
  return results;
}

/**
 * Search for functions across components
 * @param options - Search options
 * @returns Matching functions with component information
 */
export function searchFunctions(options: {
  query?: string;
  returnType?: string;
  componentId?: string;
}): Array<{ componentId: string; componentName: string; function: FunctionMetadata }> {
  const { query, returnType, componentId } = options;
  const results: Array<{ componentId: string; componentName: string; function: FunctionMetadata }> = [];
  
  // Ensure components are loaded
  const components = getAllComponents();
  
  // Search through all components or specific component
  const componentsToSearch = componentId 
    ? { [componentId]: components[componentId] } 
    : components;
  
  Object.entries(componentsToSearch).forEach(([compId, component]) => {
    if (!component) return;
    
    Object.values(component.functions).forEach(func => {
      // Apply filters
      if (query && !func.name.toLowerCase().includes(query.toLowerCase()) && 
          !(func.description || '').toLowerCase().includes(query.toLowerCase())) {
        return;
      }
      
      if (returnType && func.returnType !== returnType) return;
      
      results.push({
        componentId: compId,
        componentName: component.name,
        function: func
      });
    });
  });
  
  return results;
}

/**
 * Get detailed example content by ID
 * @param exampleId - Example ID
 * @returns Example metadata with full code
 */
export function getExampleById(exampleId: string): ExampleMetadata | undefined {
  // Ensure components are loaded
  getAllComponents();
  
  return exampleCache[exampleId];
}

/**
 * Search for patterns
 * @param options - Search options
 * @returns Matching patterns
 */
export function searchPatterns(options: {
  query?: string;
  component?: string;
  tags?: string[];
}): PatternMetadata[] {
  const { query, component, tags } = options;
  const results: PatternMetadata[] = [];
  
  // Get all patterns
  const patterns = getAllPatterns();
  
  Object.values(patterns).forEach(pattern => {
    // Apply filters
    if (query && !pattern.name.toLowerCase().includes(query.toLowerCase()) && 
        !(pattern.description || '').toLowerCase().includes(query.toLowerCase())) {
      return;
    }
    
    if (component && !pattern.components.includes(component)) {
      return;
    }
    
    if (tags && tags.length > 0) {
      // For patterns, we can search in component list as tags
      const hasMatchingTag = tags.some(tag => 
        pattern.components.some(comp => comp.toLowerCase().includes(tag.toLowerCase()))
      );
      if (!hasMatchingTag) {
        return;
      }
    }
    
    results.push(pattern);
  });
  
  return results;
}

/**
 * Get component usage guidelines from usage.md file
 * @param componentId - Component ID
 * @returns Usage guidelines content
 */
export function getComponentUsage(componentId: string): string | null {
  try {
    // Check if component exists
    const component = getComponent(componentId);
    if (!component) {
      return null;
    }
    
    // Return the usage guidelines already loaded in the component metadata
    return component.usageGuidelines || null;
  } catch (error) {
    console.error(`Error getting usage for ${componentId}:`, error);
    return null;
  }
}

/**
 * Search usage guidelines across components
 * @param options - Search options
 * @returns Matching usage content with component information
 */
export function searchUsageGuidelines(options: {
  query?: string;
  section?: string;
  componentId?: string;
}): Array<{ componentId: string; componentName: string; content: string; matchedSections?: string[] }> {
  const { query, section, componentId } = options;
  const results: Array<{ componentId: string; componentName: string; content: string; matchedSections?: string[] }> = [];
  
  // Get all components
  const components = getAllComponents();
  
  // Search through all components or specific component
  const componentsToSearch = componentId 
    ? { [componentId]: components[componentId] } 
    : components;
  
  Object.entries(componentsToSearch).forEach(([compId, component]) => {
    if (!component || !component.usageGuidelines) return;
    
    const usageContent = component.usageGuidelines;
    let matches = false;
    const matchedSections: string[] = [];
    
    // If no query, include all components with usage guidelines
    if (!query && !section) {
      matches = true;
    } else {
      let queryMatches = true;  // Default to true if no query
      let sectionMatches = true;  // Default to true if no section
      
      // Search in content
      if (query) {
        queryMatches = usageContent.toLowerCase().includes(query.toLowerCase());
        
        if (queryMatches) {
          // Try to identify which sections contain the query
          const lines = usageContent.split('\n');
          let currentSection = '';
          lines.forEach(line => {
            if (line.startsWith('## ')) {
              currentSection = line.replace('## ', '').trim();
            } else if (line.startsWith('### ')) {
              currentSection = line.replace('### ', '').trim();
            }
            
            if (line.toLowerCase().includes(query.toLowerCase()) && currentSection) {
              if (!matchedSections.includes(currentSection)) {
                matchedSections.push(currentSection);
              }
            }
          });
        }
      }
      
      // Search by section
      if (section) {
        const sectionRegex = new RegExp(`^##\\s+${section}`, 'im');
        sectionMatches = sectionRegex.test(usageContent);
        
        if (sectionMatches && !matchedSections.includes(section)) {
          matchedSections.push(section);
        }
      }
      
      // Use AND logic: both conditions must be true
      matches = queryMatches && sectionMatches;
    }
    
    if (matches) {
      results.push({
        componentId: compId,
        componentName: component.name,
        content: usageContent,
        matchedSections: matchedSections.length > 0 ? matchedSections : undefined
      });
    }
  });
  
  return results;
}

/**
 * Get demos for a specific component
 * @param componentId - Component ID
 * @param options - Demo search options
 * @returns Demo search result
 */
export function getComponentDemos(componentId: string, options: Omit<DemoSearchOptions, 'componentId'> = {}): DemoSearchResult {
  return demoProvider.getComponentDemos({
    componentId,
    ...options
  });
}

/**
 * Search demos across all components
 * @param options - Demo search options
 * @returns Array of demos
 */
export function searchDemos(options: DemoSearchOptions = {}): Demo[] {
  return demoProvider.getAllDemos(options);
}

/**
 * Get demo by ID
 * @param demoId - Demo ID
 * @returns Demo or undefined
 */
export function getDemoById(demoId: string): Demo | undefined {
  return demoProvider.getDemo(demoId);
}

/**
 * Get demo statistics
 * @returns Demo statistics
 */
export function getDemoStats() {
  return demoProvider.getDemoStats();
}

/**
 * Get available demo types
 * @returns Array of demo type strings
 */
export function getDemoTypes(): string[] {
  return demoProvider.getDemoTypes();
}

/**
 * Get components that have demos available
 * @returns Array of component IDs with demos
 */
export function getComponentsWithDemos(): string[] {
  return demoProvider.getComponentsWithDemos();
}

/**
 * Validate demo data integrity
 * @returns Validation result with errors if any
 */
export function validateDemoData(): { valid: boolean; errors: string[] } {
  return demoProvider.validateDemos();
}

/**
 * Search patterns with various filters
 * @param options - Pattern search options
 * @returns Pattern search result
 */
export function searchPatternsByProvider(options: PatternSearchOptions = {}): PatternSearchResult {
  return patternProvider.searchPatterns(options);
}

/**
 * Get detailed information about a specific pattern
 * @param options - Pattern details options
 * @returns Pattern with requested details
 */
export function getPatternDetails(options: PatternDetailsOptions): Pattern {
  return patternProvider.getPatternDetails(options);
}

/**
 * Get all pattern categories with optional details
 * @param options - Category options
 * @returns Pattern categories
 */
export function getPatternCategories(options: {
  includePatternCount?: boolean;
  includePatternList?: boolean;
} = {}): { categories: PatternCategory[] } {
  return patternProvider.getPatternCategories(options);
}

/**
 * Get patterns by category
 * @param categoryId - Category ID
 * @returns Array of patterns in the category
 */
export function getPatternsByCategory(categoryId: string): Pattern[] {
  return patternProvider.getPatternsByCategory(categoryId);
}

/**
 * Get patterns that use a specific component
 * @param componentId - Component ID
 * @returns Array of patterns using the component
 */
export function getPatternsByComponent(componentId: string): Pattern[] {
  return patternProvider.getPatternsByComponent(componentId);
}

/**
 * Get pattern statistics
 * @returns Pattern statistics
 */
export function getPatternStats() {
  return patternProvider.getPatternStats();
}

/**
 * Get available pattern categories
 * @returns Array of category IDs
 */
export function getAvailablePatternCategories(): string[] {
  return patternProvider.getAvailableCategories();
}

/**
 * Get all tags used across patterns
 * @returns Array of pattern tags
 */
export function getAllPatternTags(): string[] {
  return patternProvider.getAllTags();
}

/**
 * Get components used across all patterns
 * @returns Array of component IDs used in patterns
 */
export function getAllPatternComponents(): string[] {
  return patternProvider.getAllComponents();
}

/**
 * Find patterns similar to a given pattern
 * @param patternId - Pattern ID to find similar patterns for
 * @param limit - Maximum number of similar patterns to return
 * @returns Array of similar patterns
 */
export function findSimilarPatterns(patternId: string, limit: number = 5): Pattern[] {
  return patternProvider.findSimilarPatterns(patternId, limit);
}

/**
 * Validate pattern data integrity
 * @returns Validation result with errors if any
 */
export function validatePatternData(): { valid: boolean; errors: string[] } {
  return patternProvider.validatePatterns();
}

// Export the module
export default {
  getAllComponents,
  getComponent,
  getAllCategories,
  getCategory,
  getAllPatterns,
  getPattern,
  getComponentExamples,
  searchProperties,
  searchEvents,
  searchFunctions,
  getExampleById,
  searchPatterns,
  getComponentUsage,
  searchUsageGuidelines,
  // Demo methods
  getComponentDemos,
  searchDemos,
  getDemoById,
  getDemoStats,
  getDemoTypes,
  getComponentsWithDemos,
  validateDemoData,
  // Pattern methods
  searchPatternsByProvider,
  getPatternDetails,
  getPatternCategories,
  getPatternsByCategory,
  getPatternsByComponent,
  getPatternStats,
  getAvailablePatternCategories,
  getAllPatternTags,
  getAllPatternComponents,
  findSimilarPatterns,
  validatePatternData
};