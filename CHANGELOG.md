# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-03-09

### Added
- Support for generating request parameter types:
  - Query parameter types for API endpoints
  - Path parameter types for API endpoints
  - Request body types for API endpoints
- New functions:
  - `pathToTypeName`: Converts API paths to valid TypeScript identifiers
  - `generateRequestTypes`: Generates TypeScript types for request parameters

### Updated
- Enhanced documentation with examples of generated request parameter types
- Updated example files to demonstrate the new functionality

## [1.0.0] - 2025-03-05

### Added
- Initial release
- Support for converting OpenAPI schema definitions to TypeScript type definitions
- Support for handling complex schema structures (enums, objects, nested types)
- Support for preserving schema descriptions as JSDoc comments
- Support for identifying and documenting which API endpoints use each type 