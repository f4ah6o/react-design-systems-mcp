# Scripts

This directory contains utility scripts for the React Design Systems MCP project.

## update-markdown-links.py

A Python script that automatically updates internal links in usage.md files to use the `get_link_resource` tool call format instead of regular markdown links. This allows the MCP server to resolve internal references to components, patterns, and foundation resources.

### Usage

The script is automatically run as part of the build process, but can also be run manually:

```bash
# Process all usage.md files (run automatically during build)
pnpm run update-links

# Dry run to see what would be changed without modifying files
pnpm run update-links:dry-run

# Verbose output showing detailed processing information
pnpm run update-links:verbose

# Run directly with Python (from project root)
python3 scripts/update-markdown-links.py

# Process specific files
python3 scripts/update-markdown-links.py src/components/data/button/usage.md src/components/data/alert/usage.md

# Help and options
python3 scripts/update-markdown-links.py --help
```

### What it does

The script identifies markdown links that reference internal resources and converts them:

**Before:**
```markdown
See the [primary button](/components/button/?example=primary-button) for examples.
Check out [error handling patterns](/patterns/general/errors/validation/).
```

**After:**
```markdown
See the [primary button]({get_link_resource: /components/button/?example=primary-button}) for examples.
Check out [error handling patterns]({get_link_resource: /patterns/general/errors/validation/}).
```

### Supported link patterns

- `/components/...` - Component references
- `/patterns/...` - Design pattern references  
- `/foundation/...` - Foundation/design system references
- `/examples/...` - Example references

External links (starting with `http://` or `https://`) are left unchanged.

### Integration with build process

The script is automatically run during the build process after TypeScript compilation but before copying data files to the dist directory. This ensures that whenever usage.md files are regenerated, the internal links are automatically converted to the proper format.

The build sequence is:
1. `pnpm run clean` - Clean dist directory
2. `pnpm run prepare` - Compile TypeScript
3. `pnpm run update-links` - Update markdown links ← Script runs here
4. `pnpm run postbuild` - Copy data files and set permissions

### Error handling

The script includes robust error handling:
- Skips files that can't be read as UTF-8
- Continues processing if individual files fail
- Provides detailed error messages
- Returns appropriate exit codes for CI/CD integration

### Development

When regenerating usage.md files or adding new components:
1. The script will automatically run during the next build
2. For immediate testing, use `pnpm run update-links:dry-run` to see what would change
3. Run `pnpm run update-links` to apply changes manually if needed
