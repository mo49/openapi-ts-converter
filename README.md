# OpenAPI TypeScript Converter

A command-line tool to convert OpenAPI schema definitions into TypeScript type definitions.

## Features

- Converts OpenAPI schema objects to TypeScript interfaces and types
- Handles complex schema structures including enums, objects, and nested types
- Preserves schema descriptions as JSDoc comments
- Identifies and documents which API endpoints use each type
- Supports custom type name prefixes

## Installation

### Global Installation

```bash
npm install -g openapi-ts-converter
```

### Local Installation

```bash
npm install --save-dev openapi-ts-converter
```

## Usage

### Command Line

```bash
# Using global installation
openapi-ts-converter <input-schema.json> <output-types.ts> [prefix]

# Using npx
npx openapi-ts-converter <input-schema.json> <output-types.ts> [prefix]
```

### Options

- `<input-schema.json>`: Path to the OpenAPI schema JSON file
- `<output-types.ts>`: Path where the TypeScript definitions will be written
- `[prefix]` (optional): Prefix to add to all type names

### Example

```bash
openapi-ts-converter ./api-schema.json ./src/types/api-types.ts
```

### Programmatic Usage

You can also use the library programmatically in your code:

```typescript
import { generateTypesFromFile } from 'openapi-ts-converter';

// Generate types from a schema file
generateTypesFromFile('api-schema.json', 'api-types.ts', 'API');
```

## Type Generation Details

The converter handles various OpenAPI schema constructs:

- **Objects** → TypeScript interfaces
- **Enums** → TypeScript union types
- **allOf** → TypeScript intersection types (&)
- **oneOf/anyOf** → TypeScript union types (|)
- **Arrays** → TypeScript array types
- **Primitive types** → Corresponding TypeScript types

## License

MIT