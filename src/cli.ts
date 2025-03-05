#!/usr/bin/env node
/**
 * Command-line interface for OpenAPI to TypeScript converter
 */

import { Command } from 'commander';
import { generateTypesFromFile } from './index';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Get package version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

interface CommandOptions {
  prefix?: string;
}

const program = new Command();

program
  .name('openapi-ts-converter')
  .description('Convert OpenAPI schema definitions to TypeScript type definitions')
  .version(version)
  .argument('<input-file>', 'Path to the OpenAPI schema JSON file')
  .argument('<output-file>', 'Path where the TypeScript definitions will be written')
  .option('-p, --prefix <prefix>', 'Prefix to add to all type names')
  .action((inputFile: string, outputFile: string, options: CommandOptions) => {
    try {
      // Check if input file exists
      if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file '${inputFile}' does not exist`);
        process.exit(1);
      }

      // Create output directory if it doesn't exist
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate types
      generateTypesFromFile(inputFile, outputFile, options.prefix || '');
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();