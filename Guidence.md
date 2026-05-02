# Rwanda Administrative Levels – Implementation Guide (No Code)

## 1. Goal

Build a structured digital representation of Rwanda’s administrative hierarchy and expose it through a simple JavaScript-based backend system.

The system should allow you to retrieve data by level:

Country → Province → District → Sector → Cell → Village

---

## 2. Data Preparation

### Step 1: Collect Source Data
Obtain an official or structured document containing Rwanda administrative divisions (Excel, PDF, or government dataset).

### Step 2: Clean the Data
Ensure the following before structuring:
- Remove duplicate entries
- Standardize spelling of names
- Ensure consistent naming conventions
- Confirm each administrative level is correctly placed under its parent

### Step 3: Normalize the Structure
Convert the flat data into a hierarchical structure:
- Group villages under cells
- Group cells under sectors
- Group sectors under districts
- Group districts under provinces
- Attach all provinces under Rwanda

---

## 3. JSON Design Rules

Your JSON file must follow these rules:

### 3.1 Root Level
- Must contain:
  - country name
  - version
  - list of provinces

### 3.2 Province Level
Each province must include:
- Unique identifier (id)
- Name
- List of districts

### 3.3 District Level
Each district must include:
- Unique identifier
- Name
- List of sectors

### 3.4 Sector Level
Each sector must include:
- Unique identifier
- Name
- List of cells

### 3.5 Cell Level
Each cell must include:
- Unique identifier
- Name
- List of villages

### 3.6 Village Level
Each village must include:
- Unique identifier
- Name only (no further nesting)

---

## 4. File Organization

Place your dataset in a dedicated data folder inside your project.

Keep it separate from application logic so it can be:
- Updated without changing code
- Replaced with a database later if needed

---

## 5. Backend Design (JavaScript / Node.js)

### 5.1 Data Loading Strategy
- Load the JSON file once at startup or first request
- Store it in memory (cache it)
- Avoid reading the file repeatedly for each request

---

### 5.2 API Design Principles

Design endpoints that follow the hierarchy:

- Retrieve full dataset
- Retrieve all provinces
- Retrieve districts by province
- Retrieve sectors by district
- Retrieve cells by sector
- Retrieve villages by cell

Each endpoint should:
- Accept a parent identifier when needed
- Return only relevant child data
- Return a clear error if not found

---

### 5.3 Data Search Logic

To retrieve nested data:
- Start from provinces
- Drill down step-by-step
- Stop when matching ID is found
- Return children of that level

Avoid skipping levels (do not search villages directly without context).

---

## 6. Performance Considerations

To improve performance:

- Cache loaded JSON in memory
- Avoid repeated file system reads
- Consider indexing data using maps (for large datasets)
- Keep JSON structure consistent and clean

---

## 7. Data Integrity Rules

Ensure:
- Every entity has a unique ID
- No orphan records (every child must have a valid parent)
- No duplicate names within the same level
- Consistent hierarchy depth across all regions

---

## 8. Scalability Plan

When the dataset grows:

### Option 1: Keep JSON (small to medium projects)
- Simple and fast
- Good for prototypes and internal tools

### Option 2: Move to Database (recommended for large systems)
- Store each level in separate tables/collections
- Use relational links or references
- Enable indexing and faster queries

---

## 9. Testing Strategy

Verify:
- Each endpoint returns correct hierarchy
- Invalid IDs return proper error messages
- Deep nesting works correctly (village level access)
- No missing or broken relationships

---

## 10. Common Mistakes to Avoid

- Mixing levels (e.g., putting sectors under provinces directly)
- Using non-unique IDs
- Overloading JSON with unnecessary fields
- Re-reading file on every request
- Skipping data validation during transformation

---

## 11. Final Output Behavior

The system should allow:

- Browsing full administrative structure
- Navigating step-by-step through levels
- Fetching specific subdivisions efficiently
- Maintaining clean separation between data and logic

---

## 12. Summary Flow

Data Source → Cleaning → Hierarchical JSON → Cached Load → API Layer → Structured Responses