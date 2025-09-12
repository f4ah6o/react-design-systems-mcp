/**
 * Unit Tests for Demo Data Validation
 * 
 * These tests verify the validation functions used to ensure demo data integrity.
 * Tests cover demo structure validation, property validation, and consistency checks.
 */

import { describe, test, expect } from '@jest/globals';
import { Demo, DemoVariation, DemoMetadata, demos } from '../../src/components/data/demos';
import { componentDemoMap, validateComponentDemoMappings } from '../../src/components/data/component-demo-map';

describe('Demo Data Validation', () => {
  describe('Demo interface validation', () => {
    test('all demos should have required properties', () => {
      demos.forEach(demo => {
        expect(demo).toHaveProperty('id');
        expect(demo).toHaveProperty('name');
        expect(demo).toHaveProperty('description');
        expect(demo).toHaveProperty('componentId');
        expect(demo).toHaveProperty('type');
        expect(demo).toHaveProperty('variations');
        expect(demo).toHaveProperty('tags');
        expect(demo).toHaveProperty('code');
        expect(demo).toHaveProperty('metadata');

        expect(typeof demo.id).toBe('string');
        expect(typeof demo.name).toBe('string');
        expect(typeof demo.description).toBe('string');
        expect(typeof demo.componentId).toBe('string');
        expect(typeof demo.type).toBe('string');
        expect(Array.isArray(demo.variations)).toBe(true);
        expect(Array.isArray(demo.tags)).toBe(true);
        expect(typeof demo.code).toBe('string');
        expect(typeof demo.metadata).toBe('object');
      });
    });

    test('demo IDs should be unique', () => {
      const ids = demos.map(demo => demo.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    test('demo IDs should follow naming convention', () => {
      demos.forEach(demo => {
        expect(demo.id).toMatch(/^[a-z-]+$/);
        expect(demo.id).not.toContain('_');
        expect(demo.id).not.toContain(' ');
      });
    });

    test('demo names should not be empty', () => {
      demos.forEach(demo => {
        expect(demo.name.length).toBeGreaterThan(0);
        expect(demo.name.trim()).toBe(demo.name);
      });
    });

    test('demo descriptions should be meaningful', () => {
      demos.forEach(demo => {
        expect(demo.description.length).toBeGreaterThan(10);
        expect(demo.description.trim()).toBe(demo.description);
      });
    });

    test('demo types should be valid', () => {
      const validTypes = ['basic', 'advanced', 'interactive', 'example', 'pattern'];
      demos.forEach(demo => {
        expect(validTypes).toContain(demo.type);
      });
    });

    test('demo component IDs should be valid', () => {
      demos.forEach(demo => {
        expect(demo.componentId).toMatch(/^[a-z-]+$/);
        expect(demo.componentId).not.toContain('_');
        expect(demo.componentId).not.toContain(' ');
      });
    });

    test('demo code should not be empty', () => {
      demos.forEach(demo => {
        expect(demo.code.length).toBeGreaterThan(0);
        expect(demo.code.trim()).toBe(demo.code);
      });
    });

    test('demo tags should be valid', () => {
      demos.forEach(demo => {
        expect(demo.tags.length).toBeGreaterThanOrEqual(0);
        demo.tags.forEach(tag => {
          expect(typeof tag).toBe('string');
          expect(tag.length).toBeGreaterThan(0);
          expect(tag.trim()).toBe(tag);
        });
      });
    });
  });

  describe('DemoVariation validation', () => {
    test('all variations should have required properties', () => {
      demos.forEach(demo => {
        demo.variations.forEach(variation => {
          expect(variation).toHaveProperty('id');
          expect(variation).toHaveProperty('name');
          expect(variation).toHaveProperty('description');
          expect(variation).toHaveProperty('code');
          expect(variation).toHaveProperty('props');

          expect(typeof variation.id).toBe('string');
          expect(typeof variation.name).toBe('string');
          expect(typeof variation.description).toBe('string');
          expect(typeof variation.code).toBe('string');
          expect(typeof variation.props).toBe('object');
        });
      });
    });

    test('variation IDs should be unique within demo', () => {
      demos.forEach(demo => {
        if (demo.variations.length > 1) {
          const variationIds = demo.variations.map(v => v.id);
          const uniqueIds = new Set(variationIds);
          expect(variationIds.length).toBe(uniqueIds.size);
        }
      });
    });

    test('variations should have meaningful names and descriptions', () => {
      demos.forEach(demo => {
        demo.variations.forEach(variation => {
          expect(variation.name.length).toBeGreaterThan(0);
          expect(variation.description.length).toBeGreaterThan(5);
        });
      });
    });

    test('variation code should not be empty', () => {
      demos.forEach(demo => {
        demo.variations.forEach(variation => {
          expect(variation.code.length).toBeGreaterThan(0);
          expect(variation.code.trim()).toBe(variation.code);
        });
      });
    });
  });

  describe('DemoMetadata validation', () => {
    test('all metadata should have required properties', () => {
      demos.forEach(demo => {
        const metadata = demo.metadata;
        expect(metadata).toHaveProperty('complexity');
        expect(metadata).toHaveProperty('lastUpdated');
        expect(metadata).toHaveProperty('version');

        expect(typeof metadata.complexity).toBe('string');
        expect(typeof metadata.lastUpdated).toBe('string');
        expect(typeof metadata.version).toBe('string');
      });
    });

    test('complexity levels should be valid', () => {
      const validComplexityLevels = ['basic', 'intermediate', 'advanced'];
      demos.forEach(demo => {
        expect(validComplexityLevels).toContain(demo.metadata.complexity);
      });
    });

    test('lastUpdated should be valid date format', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      demos.forEach(demo => {
        expect(demo.metadata.lastUpdated).toMatch(dateRegex);
        
        const date = new Date(demo.metadata.lastUpdated);
        expect(date.getTime()).not.toBeNaN();
      });
    });

    test('version should follow semantic versioning', () => {
      const semverRegex = /^\d+\.\d+\.\d+$/;
      demos.forEach(demo => {
        expect(demo.metadata.version).toMatch(semverRegex);
      });
    });

    test('optional metadata properties should be valid when present', () => {
      demos.forEach(demo => {
        const metadata = demo.metadata;
        
        if (metadata.author) {
          expect(typeof metadata.author).toBe('string');
          expect(metadata.author.length).toBeGreaterThan(0);
        }
        
        if (metadata.dependencies) {
          expect(Array.isArray(metadata.dependencies)).toBe(true);
          metadata.dependencies.forEach(dep => {
            expect(typeof dep).toBe('string');
          });
        }
        
        if (metadata.category) {
          expect(typeof metadata.category).toBe('string');
          expect(metadata.category.length).toBeGreaterThan(0);
        }
        
        if (metadata.sourceUrl) {
          expect(typeof metadata.sourceUrl).toBe('string');
          expect(metadata.sourceUrl).toMatch(/^https?:\/\//);
        }
      });
    });
  });

  describe('Cross-validation with component-demo mappings', () => {
    test('all demos should exist in component-demo mapping', () => {
      const mappedDemoIds = Object.values(componentDemoMap)
        .flatMap(mapping => mapping.demoIds);
      
      demos.forEach(demo => {
        expect(mappedDemoIds).toContain(demo.id);
      });
    });

    test('component-demo mappings should be consistent', () => {
      const validation = validateComponentDemoMappings();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    test('demo component IDs should match mapping keys', () => {
      demos.forEach(demo => {
        const componentMapping = componentDemoMap[demo.componentId];
        expect(componentMapping).toBeDefined();
        expect(componentMapping.demoIds).toContain(demo.id);
      });
    });
  });

  describe('Demo data consistency', () => {
    test('demo variations should be consistent with parent demo', () => {
      demos.forEach(demo => {
        demo.variations.forEach(variation => {
          expect(variation.id).toContain(demo.componentId);
        });
      });
    });

    test('demo tags should be consistent with component and type', () => {
      demos.forEach(demo => {
        expect(demo.tags).toContain(demo.componentId);
        expect(demo.tags).toContain(demo.type);
      });
    });

    test('demos should have at least one variation', () => {
      demos.forEach(demo => {
        expect(demo.variations.length).toBeGreaterThanOrEqual(1);
      });
    });

    test('basic demos should have appropriate complexity', () => {
      const basicDemos = demos.filter(demo => demo.type === 'basic');
      basicDemos.forEach(demo => {
        expect(['basic', 'intermediate']).toContain(demo.metadata.complexity);
      });
    });

    test('advanced demos should have appropriate complexity', () => {
      const advancedDemos = demos.filter(demo => demo.type === 'advanced');
      advancedDemos.forEach(demo => {
        expect(['intermediate', 'advanced']).toContain(demo.metadata.complexity);
      });
    });
  });

  describe('Demo code validation', () => {
    test('demo code should contain React imports', () => {
      demos.forEach(demo => {
        expect(demo.code).toMatch(/import.*React/);
      });
    });

    test('demo code should contain component import from Cloudscape', () => {
      demos.forEach(demo => {
        expect(demo.code).toMatch(/@cloudscape-design\/components/);
      });
    });

    test('demo code should contain valid JSX', () => {
      demos.forEach(demo => {
        expect(demo.code).toMatch(/<[A-Z]/); // JSX component
        expect(demo.code).toMatch(/export default/);
      });
    });

    test('variation code should be valid', () => {
      demos.forEach(demo => {
        demo.variations.forEach(variation => {
          expect(variation.code).toMatch(/<[A-Z]/); // JSX component
          expect(variation.code.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe('Performance and data size validation', () => {
    test('demo data should not be excessively large', () => {
      demos.forEach(demo => {
        const demoSize = JSON.stringify(demo).length;
        expect(demoSize).toBeLessThan(50000); // 50KB per demo
      });
    });

    test('total demo count should be reasonable', () => {
      expect(demos.length).toBeGreaterThan(0);
      expect(demos.length).toBeLessThan(1000); // Reasonable upper limit
    });

    test('demo descriptions should not be excessively long', () => {
      demos.forEach(demo => {
        expect(demo.description.length).toBeLessThan(500);
      });
    });

    test('demo code should not be excessively long', () => {
      demos.forEach(demo => {
        expect(demo.code.length).toBeLessThan(10000); // 10KB code limit
        demo.variations.forEach(variation => {
          expect(variation.code.length).toBeLessThan(5000); // 5KB per variation
        });
      });
    });
  });

  describe('Security validation', () => {
    test('demo code should not contain dangerous patterns', () => {
      const dangerousPatterns = [
        /eval\(/,
        /Function\(/,
        /dangerouslySetInnerHTML/,
        /document\.write/,
        /innerHTML/,
        /__html:/
      ];

      demos.forEach(demo => {
        dangerousPatterns.forEach(pattern => {
          expect(demo.code).not.toMatch(pattern);
        });

        demo.variations.forEach(variation => {
          dangerousPatterns.forEach(pattern => {
            expect(variation.code).not.toMatch(pattern);
          });
        });
      });
    });

    test('demo metadata should not contain suspicious URLs', () => {
      demos.forEach(demo => {
        const metadata = demo.metadata;
        if (metadata.sourceUrl) {
          expect(metadata.sourceUrl).toMatch(/^https:\/\/(github\.com|cloudscape\.design)/);
        }
      });
    });
  });

  describe('Accessibility validation', () => {
    test('demos should include accessibility considerations', () => {
      const accessibilityKeywords = ['aria-', 'role=', 'alt=', 'label'];
      
      demos.forEach(demo => {
        const hasAccessibilityFeatures = accessibilityKeywords.some(keyword => 
          demo.code.includes(keyword) || 
          demo.variations.some(v => v.code.includes(keyword))
        );
        
        // For now, just ensure we're aware of accessibility - not all demos need it
        if (demo.componentId === 'button' || demo.componentId === 'input' || demo.componentId === 'form') {
          expect(hasAccessibilityFeatures).toBe(true);
        }
      });
    });
  });
});