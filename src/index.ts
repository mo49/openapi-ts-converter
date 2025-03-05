/**
 * OpenAPI schema to TypeScript type definitions converter
 *
 * This module exports functions to convert OpenAPI schema definitions into TypeScript type definitions.
 * It handles complex schema structures including enums, objects, and nested types.
 */

import * as fs from 'node:fs';

/**
 * Converts a string to UpperCamelCase
 */
export function toUpperCamelCase(str: string): string {
  return str.replace(/^[a-z]/, letter => letter.toUpperCase());
}

/**
 * Finds all API endpoints that use a specific schema
 */
export function findEndpointsForSchema(paths: any, schemaRef: string): string[] {
  const endpoints: string[] = [];
  const searchRef = `#/components/schemas/${schemaRef}`;

  Object.entries(paths).forEach(([path, pathObj]: [string, any]) => {
    Object.entries(pathObj).forEach(([method, methodObj]: [string, any]) => {
      // Search in responses
      Object.values(methodObj.responses || {}).forEach((response: any) => {
        if (response?.content?.['application/json']?.schema?.$ref === searchRef) {
          endpoints.push(`${method.toUpperCase()} ${path} - ${methodObj.summary || ''}`);
        }
      });

      // Search in request body
      if (methodObj.requestBody?.content?.['application/json']?.schema?.$ref === searchRef) {
        endpoints.push(`${method.toUpperCase()} ${path} - ${methodObj.summary || ''}`);
      }
    });
  });

  return endpoints;
}

/**
 * Generates a JSDoc comment listing the endpoints that use a schema
 */
export function generateEndpointComment(endpoints: string[]): string {
  if (endpoints.length === 0) return '';

  const endpointList = endpoints.map(endpoint => ` * ${endpoint}`).join('\n');
  return `/**\n * Used in:\n${endpointList}\n */\n`;
}

/**
 * Cleans a schema name by removing common prefixes and converting dots to underscores
 */
export function cleanName(name: string): string {
  // Remove common prefixes and convert dots to underscores
  const cleanedName = name
    .replace(/^(common\.|entities\.|responses\.)/, '')
    .replace(/\./g, '_');

  // Convert to UpperCamelCase
  return toUpperCamelCase(cleanedName);
}

/**
 * Maps an OpenAPI type to a TypeScript type
 */
export function mapType(schema: any, prefix = ''): string {
  // Handle $ref
  if (schema.$ref) {
    return `${prefix}${cleanName(schema.$ref.split('/').pop()!)}`;
  }

  // Handle arrays
  if (schema.type === 'array' && schema.items) {
    const itemType = schema.items.$ref
      ? `${prefix}${cleanName(schema.items.$ref.split('/').pop()!)}`
      : mapType(schema.items, prefix);
    return `${itemType}[]`;
  }

  // Handle enums
  if (schema['x-enum-varnames']) {
    const values = schema['x-enum-varnames'];
    return values.map((value: string) => `'${value}'`).join(' | ');
  }

  // Handle primitive types
  switch (schema.type) {
    case 'string': return 'string';
    case 'integer': return 'number';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'object': {
      // Handle objects with properties
      if (schema.properties) {
        const props = Object.entries(schema.properties).map(([key, value]: [string, any]) => {
          const propType = mapType(value, prefix);
          const isRequired = schema.required?.includes(key);
          return `${key}${isRequired ? '' : '?'}: ${propType}`;
        }).join(';\n  ');
        return `{\n  ${props}\n}`;
      }
      return 'Record<string, any>';
    }
    default: return 'any';
  }
}

/**
 * Generates a TypeScript enum type from an OpenAPI enum schema
 */
export function generateEnum(name: string, schema: any): string {
  const varnames = schema['x-enum-varnames'];
  if (!varnames || !Array.isArray(varnames)) return '';

  const comments = schema['x-enum-comments'] || {};
  const values = varnames.map(value => {
    const comment = comments[value] ? ` /** ${comments[value]} */` : '';
    return `${comment}\n  | '${value}'`;
  }).join('');

  return `export type ${cleanName(name)} =${values};`;
}

/**
 * Generates a TypeScript type or interface from an OpenAPI schema definition
 */
export function generateType(name: string, definition: any, prefix = ''): string {
  const comments: string[] = [];
  if (definition.description) {
    comments.push(definition.description);
  }
  const commentString = comments.length > 0
    ? `/** ${comments.join('\n * ')} */\n`
    : '';

  // Handle complex type definitions
  if (definition.allOf) {
    // allOf: intersection type
    const types = definition.allOf
      .map((subschema: any) => mapType(subschema, prefix))
      .join(' & ');
    return `${commentString}export type ${cleanName(name)} = ${types};`;
  }
  if (definition.oneOf || definition.anyOf) {
    // oneOf/anyOf: union type
    const key = definition.oneOf ? 'oneOf' : 'anyOf';
    const types = definition[key]
      .map((subschema: any) => mapType(subschema, prefix))
      .join(' | ');
    return `${commentString}export type ${cleanName(name)} = ${types};`;
  }

  // Handle objects with properties
  if (definition.properties) {
    const properties = Object.entries(definition.properties).map(([propName, propDef]: [string, any]) => {
      const isRequired = definition.required?.includes(propName);
      const propType = propDef.$ref
        ? `${prefix}${cleanName(propDef.$ref.split('/').pop()!)}`
        : mapType(propDef, prefix);

      const propComments: string[] = [];
      if (propDef.description) {
        propComments.push(propDef.description);
      }
      const propCommentStr = propComments.length > 0
        ? `  /** ${propComments.join('\n   * ')} */\n`
        : '';
      return `${propCommentStr}  ${propName}${isRequired ? '' : '?'}: ${propType};`;
    }).join('\n');

    return `${commentString}export interface ${cleanName(name)} {\n${properties}\n}`;
  }

  // Skip if no properties and not a complex structure
  return '';
}

/**
 * Generates TypeScript types from an OpenAPI schema
 */
export function generateTypes(schema: any, prefix = ''): string {
  if (!schema || !schema.components || !schema.components.schemas) {
    throw new Error('Invalid schema: Missing components.schemas');
  }

  const schemas = schema.components.schemas;
  const types: string[] = [];
  const paths = schema.paths || {};

  // First generate enum definitions
  Object.entries(schemas).forEach(([name, definition]: [string, any]) => {
    if (definition['x-enum-varnames']) {
      const endpoints = findEndpointsForSchema(paths, name);
      const endpointComment = generateEndpointComment(endpoints);
      const enumDef = generateEnum(name, definition);
      if (enumDef) types.push(`${endpointComment}${enumDef}`);
    }
  });

  // Then generate object and complex type definitions
  Object.entries(schemas).forEach(([name, definition]: [string, any]) => {
    if (definition.properties || definition.allOf || definition.oneOf || definition.anyOf) {
      const endpoints = findEndpointsForSchema(paths, name);
      const endpointComment = generateEndpointComment(endpoints);
      const typeDef = generateType(name, definition, prefix);
      if (typeDef) types.push(`${endpointComment}${typeDef}`);
    }
  });

  return types.join('\n\n');
}

/**
 * Generates TypeScript types from an OpenAPI schema file and writes them to an output file
 */
export function generateTypesFromFile(inputFile: string, outputFile: string, prefix = ''): void {
  const schema = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const types = generateTypes(schema, prefix);
  fs.writeFileSync(outputFile, types, 'utf-8');
  console.log(`TypeScript types written to ${outputFile}`);
}