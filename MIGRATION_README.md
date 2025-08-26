# Payload CMS Migration Guide

This project uses Payload CMS's built-in migration system for database schema management.

## Migration Commands

### Generate New Migration
```bash
# Generate a new migration based on current collection changes
pnpm payload migrate:create

# This will automatically:
# - Detect schema changes in your collections
# - Generate appropriate SQL migration
# - Create timestamped migration file
# - Handle both up and down migrations
```

### Run Migrations
```bash
# Run all pending migrations
pnpm payload migrate

# Check migration status
pnpm payload migrate:status

# Run specific migration
pnpm payload migrate:up <migration_name>
```

### Rollback Migrations
```bash
# Rollback last migration
pnpm payload migrate:down

# Rollback specific migration
pnpm payload migrate:down <migration_name>

# Reset all migrations (⚠️ DANGEROUS - deletes all data)
pnpm payload migrate:reset

# Fresh start (reset + run all migrations)
pnpm payload migrate:fresh
```

## Current Migrations

### 1. `20250821_183907_initial`
- **Purpose**: Initial database setup
- **Status**: Applied
- **Description**: Creates basic tables and structure

### 2. `20250826_104125` (Auto-generated)
- **Purpose**: Survey collections schema
- **Status**: Pending
- **Description**: Creates complete survey system tables including:
  - `surveys` - Survey definitions
  - `questions` - Question definitions with form elements
  - `participants` - Participant tracking
  - `responses` - Response data with timing
  - All necessary indexes and foreign keys

## How Payload Migrations Work

### Automatic Schema Detection
Payload automatically detects changes in your collection configurations:
- New fields added/removed
- Field type changes
- Relationship changes
- Access control modifications
- Admin UI changes

### Migration Generation
When you run `pnpm payload migrate:create`:
1. Payload compares current collections with database schema
2. Generates SQL to bring database in sync
3. Creates both `up()` and `down()` functions
4. Handles complex relationships and constraints

### Best Practices

1. **Always use `migrate:create`** instead of manual migrations
2. **Test migrations** in development before production
3. **Review generated SQL** before applying
4. **Use descriptive names** when creating migrations
5. **Keep migrations small** and focused

## Example Workflow

```bash
# 1. Make changes to your collection files
# (e.g., add new fields to Surveys.ts)

# 2. Generate migration
pnpm payload migrate:create

# 3. Review generated migration file
# (check src/migrations/YYYYMMDD_HHMMSS.ts)

# 4. Apply migration
pnpm payload migrate

# 5. Verify changes
pnpm payload migrate:status
```

## Migration File Structure

```typescript
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // SQL to apply changes
  await db.execute(sql`...`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // SQL to reverse changes
  await db.execute(sql`...`)
}
```

## Benefits of Auto-generated Migrations

✅ **Accuracy** - No manual SQL errors  
✅ **Completeness** - Handles all schema changes  
✅ **Consistency** - Matches collection definitions exactly  
✅ **Maintainability** - Easy to understand and modify  
✅ **Safety** - Built-in rollback functionality  
✅ **Performance** - Optimized SQL with proper indexes  

## Troubleshooting

### Migration Fails
```bash
# Check migration status
pnpm payload migrate:status

# Rollback to previous state
pnpm payload migrate:down

# Fix collection configuration and regenerate
pnpm payload migrate:create
```

### Schema Out of Sync
```bash
# Reset and recreate all migrations
pnpm payload migrate:fresh

# ⚠️ WARNING: This will delete all data
```

### Development vs Production
- Always test migrations in development first
- Use `migrate:status` to check what's applied
- Consider data backup before major migrations
- Use staging environment for testing

## Integration with Build Process

The project automatically runs migrations during CI:
```json
{
  "scripts": {
    "ci": "payload migrate && pnpm build"
  }
}
```

This ensures database schema is always up-to-date before building.
