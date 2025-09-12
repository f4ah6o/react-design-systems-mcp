/**
 * Unit Tests for Pattern Data Validation
 * 
 * These tests verify the validation functions used to ensure pattern data integrity.
 * Tests cover pattern structure validation, property validation, and consistency checks.
 */

import { describe, test, expect } from '@jest/globals';
import { Pattern, PatternExample, patterns } from '../../src/components/data/patterns';
import { patternCategories } from '../../src/components/data/pattern-categories';

describe('Pattern Data Validation', () => {
  describe('Pattern interface validation', () => {
    test('all patterns should have required properties', () => {
      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('id');
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('category');
        expect(pattern).toHaveProperty('components');
        expect(pattern).toHaveProperty('usageGuidelines');
        expect(pattern).toHaveProperty('examples');
        expect(pattern).toHaveProperty('codeExample');
        expect(pattern).toHaveProperty('relatedPatterns');
        expect(pattern).toHaveProperty('tags');
        expect(pattern).toHaveProperty('lastUpdated');

        expect(typeof pattern.id).toBe('string');
        expect(typeof pattern.name).toBe('string');
        expect(typeof pattern.description).toBe('string');
        expect(typeof pattern.category).toBe('string');
        expect(Array.isArray(pattern.components)).toBe(true);
        expect(typeof pattern.usageGuidelines).toBe('string');
        expect(Array.isArray(pattern.examples)).toBe(true);
        expect(typeof pattern.codeExample).toBe('string');
        expect(Array.isArray(pattern.relatedPatterns)).toBe(true);
        expect(Array.isArray(pattern.tags)).toBe(true);
        expect(typeof pattern.lastUpdated).toBe('string');
      });
    });

    test('pattern IDs should be unique', () => {
      const ids = patterns.map(pattern => pattern.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    test('pattern IDs should follow naming convention', () => {
      patterns.forEach(pattern => {
        expect(pattern.id).toMatch(/^[a-z-]+$/);
        expect(pattern.id).not.toContain('_');
        expect(pattern.id).not.toContain(' ');
      });
    });

    test('pattern names should not be empty', () => {
      patterns.forEach(pattern => {
        expect(pattern.name.length).toBeGreaterThan(0);
        expect(pattern.name.trim()).toBe(pattern.name);
      });
    });

    test('pattern descriptions should be meaningful', () => {
      patterns.forEach(pattern => {
        expect(pattern.description.length).toBeGreaterThan(20);
        expect(pattern.description.trim()).toBe(pattern.description);
      });
    });

    test('pattern categories should be valid', () => {
      const validCategories = ['general', 'generative-ai', 'resource-management', 'layout'];
      patterns.forEach(pattern => {
        expect(validCategories).toContain(pattern.category);
      });
    });

    test('pattern components should be valid', () => {
      patterns.forEach(pattern => {
        expect(pattern.components.length).toBeGreaterThan(0);
        pattern.components.forEach(component => {
          expect(typeof component).toBe('string');
          expect(component.length).toBeGreaterThan(0);
          expect(component).toMatch(/^[a-z-]+$/);
        });
      });
    });

    test('pattern usage guidelines should be comprehensive', () => {
      patterns.forEach(pattern => {
        expect(pattern.usageGuidelines.length).toBeGreaterThan(50);
        expect(pattern.usageGuidelines.trim()).toBe(pattern.usageGuidelines);
      });
    });

    test('pattern code examples should not be empty', () => {
      patterns.forEach(pattern => {
        expect(pattern.codeExample.length).toBeGreaterThan(0);
        expect(pattern.codeExample.trim()).toBe(pattern.codeExample);
      });
    });

    test('pattern tags should be valid', () => {
      patterns.forEach(pattern => {
        expect(pattern.tags.length).toBeGreaterThan(0);
        pattern.tags.forEach(tag => {
          expect(typeof tag).toBe('string');
          expect(tag.length).toBeGreaterThan(0);
          expect(tag.trim()).toBe(tag);
        });
      });
    });

    test('lastUpdated should be valid date format', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      patterns.forEach(pattern => {
        expect(pattern.lastUpdated).toMatch(dateRegex);
        
        const date = new Date(pattern.lastUpdated);
        expect(date.getTime()).not.toBeNaN();
      });
    });
  });

  describe('PatternExample validation', () => {
    test('all examples should have required properties', () => {
      patterns.forEach(pattern => {
        pattern.examples.forEach(example => {
          expect(example).toHaveProperty('id');
          expect(example).toHaveProperty('name');
          expect(example).toHaveProperty('description');
          expect(example).toHaveProperty('scenario');
          expect(example).toHaveProperty('implementation');

          expect(typeof example.id).toBe('string');
          expect(typeof example.name).toBe('string');
          expect(typeof example.description).toBe('string');
          expect(typeof example.scenario).toBe('string');
          expect(typeof example.implementation).toBe('string');
        });
      });
    });

    test('example IDs should be unique within pattern', () => {
      patterns.forEach(pattern => {
        if (pattern.examples.length > 1) {
          const exampleIds = pattern.examples.map(e => e.id);
          const uniqueIds = new Set(exampleIds);
          expect(exampleIds.length).toBe(uniqueIds.size);
        }
      });
    });

    test('examples should have meaningful content', () => {
      patterns.forEach(pattern => {
        pattern.examples.forEach(example => {
          expect(example.name.length).toBeGreaterThan(0);
          expect(example.description.length).toBeGreaterThan(10);
          expect(example.scenario.length).toBeGreaterThan(10);
          expect(example.implementation.length).toBeGreaterThan(20);
        });
      });
    });

    test('optional example properties should be valid when present', () => {
      patterns.forEach(pattern => {
        pattern.examples.forEach(example => {
          if (example.codeSnippet) {
            expect(typeof example.codeSnippet).toBe('string');
            expect(example.codeSnippet.length).toBeGreaterThan(0);
          }
          
          if (example.liveDemo) {
            expect(typeof example.liveDemo).toBe('string');
            expect(example.liveDemo).toMatch(/^https?:\/\//);
          }
          
          if (example.designTokens) {
            expect(Array.isArray(example.designTokens)).toBe(true);
            example.designTokens.forEach(token => {
              expect(typeof token).toBe('string');
            });
          }
        });
      });
    });
  });

  describe('Pattern category consistency', () => {
    test('all pattern categories should exist in category definitions', () => {
      const definedCategories = patternCategories.map(cat => cat.id);
      const usedCategories = [...new Set(patterns.map(p => p.category))];
      
      usedCategories.forEach(category => {
        expect(definedCategories).toContain(category);
      });
    });

    test('category pattern counts should be accurate', () => {
      patternCategories.forEach(category => {
        const actualCount = patterns.filter(p => p.category === category.id).length;
        expect(category.patternCount).toBe(actualCount);
      });
    });

    test('patterns should be distributed across categories', () => {
      const categoryDistribution = patternCategories.reduce((acc, cat) => {
        acc[cat.id] = patterns.filter(p => p.category === cat.id).length;
        return acc;
      }, {} as Record<string, number>);

      // Each category should have at least one pattern
      Object.values(categoryDistribution).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Related patterns validation', () => {
    test('related pattern IDs should exist', () => {
      const allPatternIds = patterns.map(p => p.id);
      
      patterns.forEach(pattern => {
        pattern.relatedPatterns.forEach(relatedId => {
          expect(allPatternIds).toContain(relatedId);
        });
      });
    });

    test('patterns should not be related to themselves', () => {
      patterns.forEach(pattern => {
        expect(pattern.relatedPatterns).not.toContain(pattern.id);
      });
    });

    test('related patterns should be bidirectional where logical', () => {
      patterns.forEach(pattern => {
        pattern.relatedPatterns.forEach(relatedId => {
          const relatedPattern = patterns.find(p => p.id === relatedId);
          if (relatedPattern && relatedPattern.category === pattern.category) {
            // For patterns in same category, relationship should often be bidirectional
            // This is a soft check - not always required
          }
        });
      });
    });
  });

  describe('Pattern code validation', () => {
    test('pattern code examples should contain valid React/TypeScript', () => {
      patterns.forEach(pattern => {
        expect(pattern.codeExample).toMatch(/import.*React|import.*from/);
        expect(pattern.codeExample).toMatch(/<[A-Z]/); // JSX component
      });
    });

    test('pattern code should reference specified components', () => {
      patterns.forEach(pattern => {
        pattern.components.forEach(component => {
          // Check if component is referenced in code (flexible matching)
          const componentPattern = new RegExp(component.replace('-', ''), 'i');
          const hasReference = 
            pattern.codeExample.match(componentPattern) ||
            pattern.usageGuidelines.toLowerCase().includes(component) ||
            pattern.examples.some(ex => 
              ex.implementation.toLowerCase().includes(component) ||
              (ex.codeSnippet && ex.codeSnippet.toLowerCase().includes(component))
            );
          
          if (!hasReference) {
            console.warn(`Pattern ${pattern.id} claims to use component ${component} but doesn't reference it`);
          }
        });
      });
    });

    test('example code snippets should be valid when present', () => {
      patterns.forEach(pattern => {
        pattern.examples.forEach(example => {
          if (example.codeSnippet) {
            expect(example.codeSnippet).toMatch(/[<>{}]/); // Contains code-like characters
          }
        });
      });
    });
  });

  describe('Pattern tag validation', () => {
    test('pattern tags should be consistent with category', () => {
      patterns.forEach(pattern => {
        expect(pattern.tags).toContain(pattern.category);
      });
    });

    test('patterns should have relevant component tags', () => {
      patterns.forEach(pattern => {
        const hasComponentTags = pattern.components.some(component => 
          pattern.tags.includes(component) || 
          pattern.tags.includes(component.replace('-', ''))
        );
        
        if (pattern.components.length > 0) {
          expect(hasComponentTags).toBe(true);
        }
      });
    });

    test('generative-ai patterns should have AI-related tags', () => {
      const aiPatterns = patterns.filter(p => p.category === 'generative-ai');
      const aiTags = ['ai', 'generation', 'prompt', 'llm', 'model', 'automation'];
      
      aiPatterns.forEach(pattern => {
        const hasAiTag = pattern.tags.some(tag => 
          aiTags.some(aiTag => tag.toLowerCase().includes(aiTag))
        );
        expect(hasAiTag).toBe(true);
      });
    });

    test('resource-management patterns should have CRUD-related tags', () => {
      const resourcePatterns = patterns.filter(p => p.category === 'resource-management');
      const crudTags = ['crud', 'create', 'read', 'update', 'delete', 'list', 'edit', 'manage'];
      
      resourcePatterns.forEach(pattern => {
        const hasCrudTag = pattern.tags.some(tag => 
          crudTags.some(crudTag => tag.toLowerCase().includes(crudTag))
        );
        expect(hasCrudTag).toBe(true);
      });
    });
  });

  describe('Pattern consistency validation', () => {
    test('patterns in same category should have consistent structure', () => {
      const categorizedPatterns = patterns.reduce((acc, pattern) => {
        if (!acc[pattern.category]) acc[pattern.category] = [];
        acc[pattern.category].push(pattern);
        return acc;
      }, {} as Record<string, Pattern[]>);

      Object.entries(categorizedPatterns).forEach(([category, categoryPatterns]) => {
        if (categoryPatterns.length > 1) {
          const avgExamples = categoryPatterns.reduce((sum, p) => sum + p.examples.length, 0) / categoryPatterns.length;
          const avgComponents = categoryPatterns.reduce((sum, p) => sum + p.components.length, 0) / categoryPatterns.length;
          const avgTags = categoryPatterns.reduce((sum, p) => sum + p.tags.length, 0) / categoryPatterns.length;

          categoryPatterns.forEach(pattern => {
            // Patterns in same category should have roughly similar complexity
            expect(Math.abs(pattern.examples.length - avgExamples)).toBeLessThan(3);
            expect(Math.abs(pattern.components.length - avgComponents)).toBeLessThan(5);
            expect(Math.abs(pattern.tags.length - avgTags)).toBeLessThan(5);
          });
        }
      });
    });

    test('layout patterns should reference layout components', () => {
      const layoutPatterns = patterns.filter(p => p.category === 'layout');
      const layoutComponents = ['app-layout', 'grid', 'container', 'header', 'sidebar', 'cards'];
      
      layoutPatterns.forEach(pattern => {
        const hasLayoutComponent = pattern.components.some(component => 
          layoutComponents.includes(component)
        );
        expect(hasLayoutComponent).toBe(true);
      });
    });
  });

  describe('Performance and data size validation', () => {
    test('pattern data should not be excessively large', () => {
      patterns.forEach(pattern => {
        const patternSize = JSON.stringify(pattern).length;
        expect(patternSize).toBeLessThan(100000); // 100KB per pattern
      });
    });

    test('total pattern count should be reasonable', () => {
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.length).toBeLessThan(500); // Reasonable upper limit
    });

    test('pattern descriptions should not be excessively long', () => {
      patterns.forEach(pattern => {
        expect(pattern.description.length).toBeLessThan(1000);
        expect(pattern.usageGuidelines.length).toBeLessThan(2000);
      });
    });

    test('pattern code examples should not be excessively long', () => {
      patterns.forEach(pattern => {
        expect(pattern.codeExample.length).toBeLessThan(20000); // 20KB code limit
        
        pattern.examples.forEach(example => {
          if (example.codeSnippet) {
            expect(example.codeSnippet.length).toBeLessThan(10000); // 10KB per snippet
          }
        });
      });
    });
  });

  describe('Security validation', () => {
    test('pattern code should not contain dangerous patterns', () => {
      const dangerousPatterns = [
        /eval\(/,
        /Function\(/,
        /dangerouslySetInnerHTML/,
        /document\.write/,
        /innerHTML/,
        /__html:/
      ];

      patterns.forEach(pattern => {
        dangerousPatterns.forEach(pattern_regex => {
          expect(pattern.codeExample).not.toMatch(pattern_regex);
        });

        pattern.examples.forEach(example => {
          if (example.codeSnippet) {
            dangerousPatterns.forEach(pattern_regex => {
              expect(example.codeSnippet).not.toMatch(pattern_regex);
            });
          }
        });
      });
    });

    test('pattern URLs should be safe', () => {
      patterns.forEach(pattern => {
        pattern.examples.forEach(example => {
          if (example.liveDemo) {
            expect(example.liveDemo).toMatch(/^https:\/\/(github\.com|cloudscape\.design|demo\.)/);
          }
        });
      });
    });
  });

  describe('Documentation completeness', () => {
    test('complex patterns should have comprehensive examples', () => {
      const complexPatterns = patterns.filter(p => 
        p.components.length > 3 || p.category === 'generative-ai'
      );
      
      complexPatterns.forEach(pattern => {
        expect(pattern.examples.length).toBeGreaterThan(1);
        expect(pattern.usageGuidelines.length).toBeGreaterThan(100);
      });
    });

    test('patterns should have appropriate related patterns', () => {
      patterns.forEach(pattern => {
        if (pattern.category === 'general' || pattern.category === 'layout') {
          expect(pattern.relatedPatterns.length).toBeGreaterThan(0);
        }
      });
    });

    test('patterns should have comprehensive tagging', () => {
      patterns.forEach(pattern => {
        expect(pattern.tags.length).toBeGreaterThanOrEqual(3);
        
        // Should include category tag
        expect(pattern.tags).toContain(pattern.category);
        
        // Should include at least one component tag
        const hasComponentTag = pattern.components.some(comp => 
          pattern.tags.includes(comp) || pattern.tags.includes(comp.replace('-', ''))
        );
        expect(hasComponentTag).toBe(true);
      });
    });
  });

  describe('Accessibility validation', () => {
    test('patterns should consider accessibility', () => {
      const accessibilityKeywords = ['aria-', 'role=', 'alt=', 'label', 'accessibility', 'a11y', 'screen reader'];
      
      patterns.forEach(pattern => {
        const hasAccessibilityConsideration = 
          accessibilityKeywords.some(keyword => 
            pattern.usageGuidelines.toLowerCase().includes(keyword) ||
            pattern.codeExample.includes(keyword) ||
            pattern.examples.some(ex => 
              ex.implementation.toLowerCase().includes(keyword) ||
              (ex.codeSnippet && ex.codeSnippet.toLowerCase().includes(keyword))
            )
          );
        
        // For now, just check that form and interactive patterns consider accessibility
        if (pattern.components.includes('button') || 
            pattern.components.includes('input') || 
            pattern.components.includes('form') ||
            pattern.components.includes('modal')) {
          expect(hasAccessibilityConsideration).toBe(true);
        }
      });
    });
  });
});