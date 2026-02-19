# Export/Import Functionality for Reports

## Overview

Added export and import functionality to the Reports page, allowing users to backup and restore their reports as JSON files.

## Features

### 1. Export Reports
- **Button**: "Export" button in the Reports page header
- **Functionality**: Downloads all reports as a JSON file
- **File Format**: `reports-export-YYYY-MM-DD.json`
- **What's Exported**: All report configurations including:
  - Report name and description
  - Data source ID reference
  - Chart configuration (type, axes, aggregates, etc.)
  - Timestamps (createdAt, updatedAt)

### 2. Import Reports
- **Button**: "Import" button in the Reports page header
- **Functionality**: Uploads a JSON file to restore reports
- **File Format**: Accepts `.json` files
- **Validation**: 
  - Checks for valid JSON format
  - Validates required fields (name, sourceId)
  - Verifies data source exists before importing
  - Skips invalid reports with detailed error messages
- **Duplicate Handling**: Creates new reports (generates new IDs)

## User Interface

### Reports Page (`/reports`)

**New Buttons Added:**
```
[Export] [Import] [Refresh] [Create Report]
```

- **Export Button**: 
  - Disabled when no reports exist
  - Shows "Exporting..." during download
  - Downloads JSON file to user's default download folder

- **Import Button**:
  - Opens file picker for `.json` files
  - Shows "Importing..." during upload
  - Displays success message with import statistics
  - Shows detailed error messages if import fails

## Backend API

### POST /reports/import

**Endpoint**: `POST /reports/import`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "reports": [
    {
      "name": "Sales Report",
      "description": "Monthly sales analysis",
      "sourceId": "1",
      "config": {
        "type": "bar",
        "xAxis": "month",
        "yAxis": "revenue",
        "aggregates": { "revenue": "SUM" }
      }
    }
  ]
}
```

**Response**:
```json
{
  "imported": 5,
  "skipped": 2,
  "total": 7,
  "errors": [
    "Skipped report \"Old Report\": Data source 999 not found",
    "Skipped report: Missing required fields (name or sourceId)"
  ]
}
```

**Validation Rules**:
1. Each report must have `name` and `sourceId`
2. Referenced data source must exist in the database
3. Config is automatically stringified if provided as object
4. Original IDs are ignored; new IDs are generated

## Files Modified

### Frontend
- **`/frontend/src/app/reports/page.tsx`**
  - Added export/import state management
  - Added `handleExport()` function for downloading reports
  - Added `handleImport()` function for uploading reports
  - Added Export and Import buttons to UI
  - Added hidden file input for import

### Backend
- **`/backend/server.js`**
  - Added `POST /reports/import` endpoint (line 270)
  - Validates and imports reports from JSON
  - Returns detailed import statistics

## Usage Instructions

### Exporting Reports

1. Navigate to the Reports page (`http://localhost:3050/reports`)
2. Click the **"Export"** button in the top-right corner
3. A JSON file will be downloaded with all your reports
4. Save this file for backup or transfer to another system

### Importing Reports

1. Navigate to the Reports page
2. Click the **"Import"** button
3. Select a previously exported JSON file
4. Review the success message showing:
   - Number of reports imported
   - Number of reports skipped
   - Any error messages
5. The reports list will automatically refresh

### Important Notes

- **Data Sources Must Exist**: Before importing reports, ensure the referenced data sources exist in your system
- **New IDs Generated**: Imported reports get new IDs; original IDs are not preserved
- **Duplicate Names Allowed**: The system allows multiple reports with the same name
- **Partial Import**: If some reports fail validation, others will still be imported
- **Error Details**: Check the alert message for specific errors on skipped reports

## Example Export File

```json
[
  {
    "id": "1",
    "name": "Monthly Sales",
    "description": "Sales analysis by month",
    "sourceId": "2",
    "config": {
      "type": "bar",
      "subType": "vertical",
      "xAxis": "month",
      "yAxis": "revenue",
      "aggregates": {
        "revenue": "SUM"
      }
    },
    "createdAt": "2026-02-07T20:00:00.000Z",
    "updatedAt": "2026-02-07T21:00:00.000Z"
  },
  {
    "id": "2",
    "name": "Product Distribution",
    "description": "Pie chart of product sales",
    "sourceId": "3",
    "config": {
      "type": "pie",
      "xAxis": "product",
      "yAxis": "sales",
      "aggregates": {
        "sales": "SUM"
      }
    },
    "createdAt": "2026-02-07T19:00:00.000Z"
  }
]
```

## Error Handling

### Frontend Errors
- **Invalid JSON**: "Invalid JSON file. Please check the file format."
- **Network Error**: "Failed to import reports: [error message]"
- **Export Error**: "Failed to export reports: [error message]"

### Backend Errors
- **Missing Fields**: "Skipped report: Missing required fields (name or sourceId)"
- **Data Source Not Found**: "Skipped report \"[name]\": Data source [id] not found"
- **Database Error**: "Failed to import report \"[name]\": [error message]"

## Testing

### Test Export
1. Create a few test reports
2. Click Export
3. Verify JSON file downloads
4. Open file and verify structure

### Test Import
1. Use an exported JSON file
2. Click Import and select the file
3. Verify success message
4. Check that reports appear in the list

### Test Validation
1. Create a JSON file with invalid data
2. Try to import it
3. Verify error messages are clear and helpful

## Future Enhancements

Potential improvements:
- Export/import individual reports
- Export with data sources included
- Import with automatic data source creation
- Batch operations (select multiple reports)
- Export to CSV format
- Schedule automatic exports
- Version control for reports
