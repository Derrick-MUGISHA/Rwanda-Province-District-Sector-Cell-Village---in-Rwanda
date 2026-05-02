# Rwanda Administrative Hierarchy Technical Documentation

## 1. System Overview

This system models Rwanda's administrative hierarchy as structured hierarchical data and exposes it through a JavaScript/Node.js backend.

Administrative path:

`Country -> Province -> District -> Sector -> Cell -> Village`

The system is designed to support:
- Full hierarchy browsing
- Step-by-step navigation between levels
- Retrieval of child entities by parent
- Clear separation between data storage and application logic

## 2. Source of Truth and Scope

This documentation is derived from the implementation guidance document in this repository and only reflects instructions defined there.

Primary guidance scope:
- Data preparation and normalization process
- JSON design requirements for each hierarchy level
- File organization constraints
- Backend/API behavior principles
- Performance, integrity, scalability, and testing expectations

## 3. Data Model

## 3.1 Hierarchy Definition

The dataset must represent six nested levels:
1. Country
2. Province
3. District
4. Sector
5. Cell
6. Village

Each level contains only its direct children.

## 3.2 Required JSON Structure

### Root Object (Country Level)
Required fields:
- `country` (country name)
- `version`
- `provinces` (array of province objects)

### Province Object
Required fields:
- `id` (unique identifier)
- `name`
- `districts` (array of district objects)

### District Object
Required fields:
- `id` (unique identifier)
- `name`
- `sectors` (array of sector objects)

### Sector Object
Required fields:
- `id` (unique identifier)
- `name`
- `cells` (array of cell objects)

### Cell Object
Required fields:
- `id` (unique identifier)
- `name`
- `villages` (array of village objects)

### Village Object
Required fields:
- `id` (unique identifier)
- `name`

Constraint:
- Village is terminal and has no further nesting.

## 3.3 Canonical Data Shape

```json
{
  "country": "Rwanda",
  "version": "string",
  "provinces": [
    {
      "id": "string",
      "name": "string",
      "districts": [
        {
          "id": "string",
          "name": "string",
          "sectors": [
            {
              "id": "string",
              "name": "string",
              "cells": [
                {
                  "id": "string",
                  "name": "string",
                  "villages": [
                    {
                      "id": "string",
                      "name": "string"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 4. Data Preparation Pipeline

The required transformation pipeline is:

`Data Source -> Cleaning -> Hierarchical JSON -> Cached Load -> API Layer -> Structured Responses`

### 4.1 Collection
- Obtain an official or structured source document (for example, Excel, PDF, or government dataset).

### 4.2 Cleaning
- Remove duplicate entries.
- Standardize naming/spelling.
- Enforce consistent naming conventions.
- Verify each record is assigned to the correct parent level.

### 4.3 Normalization
Convert flat records into nested hierarchy:
- Villages under cells
- Cells under sectors
- Sectors under districts
- Districts under provinces
- Provinces under Rwanda

## 5. Data Organization and Usage

## 5.1 File Organization
- Store the dataset in a dedicated `data` folder.
- Keep data files separate from backend logic.

Rationale defined in guidance:
- Data can be updated without code changes.
- Data storage can later be replaced by a database.

## 5.2 Runtime Data Usage
- Load JSON once at startup (or on first request).
- Cache the loaded dataset in memory.
- Avoid repeated file reads per request.

## 6. API Behavior Requirements

The API should support hierarchical access patterns:
- Retrieve full dataset
- Retrieve all provinces
- Retrieve districts by province ID
- Retrieve sectors by district ID
- Retrieve cells by sector ID
- Retrieve villages by cell ID

Endpoint behavior constraints:
- Accept parent identifier when required.
- Return only relevant child records.
- Return clear not-found errors for invalid identifiers.

## 7. Lookup and Navigation Logic

Required traversal pattern:
1. Start at provinces.
2. Drill down one level at a time.
3. Stop when the target parent ID is matched.
4. Return that parent's direct children.

Navigation rule:
- Do not skip hierarchy levels (for example, no direct village search without valid hierarchy context).

## 8. Rules and Constraints

The following constraints are mandatory:
- Every entity must have a unique ID.
- No orphan records: each child must belong to a valid parent.
- No duplicate names within the same level.
- Maintain consistent hierarchy depth across regions.
- Keep JSON structure clean and consistent.
- Do not overload records with unnecessary fields.

Common mistakes to avoid:
- Mixing levels (such as placing sectors under provinces directly).
- Using non-unique IDs.
- Re-reading files for every request.
- Skipping validation during data transformation.

## 9. Performance and Scalability

## 9.1 Performance Requirements
- Use in-memory caching for loaded JSON.
- Minimize file system reads.
- For larger datasets, consider map-based indexing for faster lookup.

## 9.2 Scalability Path

### Option 1: Keep JSON (small to medium)
- Simple implementation.
- Suitable for prototypes/internal tools.

### Option 2: Move to Database (large systems)
- Store levels in separate tables/collections.
- Use links/references across levels.
- Add indexing to improve query performance.

## 10. Testing Expectations

Validation and testing should confirm:
- Correct hierarchical responses for each endpoint.
- Proper error behavior for invalid IDs.
- Correct retrieval at deepest level (village).
- No broken or missing parent-child relationships.

## 11. End-to-End System Behavior

End-to-end behavior should work as follows:
1. Ingest administrative source data.
2. Clean and validate records.
3. Build the hierarchical JSON model.
4. Persist dataset in the data folder.
5. Load and cache dataset in backend runtime.
6. Serve hierarchy-based API responses.
7. Return child subsets using parent IDs.
8. Emit clear errors for invalid lookups.
9. Maintain strict data integrity across all levels.

Outcome:
- The system remains predictable, navigable, and maintainable while preserving strict hierarchy semantics.
