# Enhanced Export/Import Functionality - Update

## ✅ New Features Implemented

### 1. Selective Export with Checkboxes
**Reports List Page** (`/reports`):
- ✅ Added checkboxes to select specific reports for export
- ✅ "Select All" checkbox in card header
- ✅ Individual checkbox for each report
- ✅ Export button shows count of selected reports: `Export (3)`
- ✅ Export button disabled when no reports selected
- ✅ Selection cleared after successful export

### 2. Upsert on Import (Update or Insert)
**Import Behavior**:
- ✅ **Update existing reports** if found by:
  - Report ID (if provided in JSON)
  - OR name + sourceId combination
- ✅ **Insert new reports** if not found
- ✅ Shows detailed statistics:
  - `X new report(s)` - newly created
  - `X updated` - existing reports updated
  - `X skipped` - failed validation

### 3. Export from Individual Report Page
**Report View Page** (`/reports/[id]`):
- ✅ Export button now functional
- ✅ Downloads single report as JSON array
- ✅ Filename format: `report-{name}-YYYY-MM-DD.json`
- ✅ Compatible with import (can be re-imported)

---

## How to Use

### Selective Export (Reports List)

1. Navigate to http://localhost:3050/reports
2. **Select reports** using checkboxes:
   - Click individual checkboxes for specific reports
   - OR click "Select All" to select all reports
3. Click **"Export (X)"** button (shows count)
4. JSON file downloads with selected reports only
5. Selection is automatically cleared

### Import with Upsert

1. Navigate to http://localhost:3050/reports
2. Click **"Import"** button
3. Select a JSON file
4. Review the detailed message:
   ```
   Import complete: 3 new report(s), 2 updated, 1 skipped
   ```
5. Reports list refreshes automatically

**Upsert Logic**:
- If report has same ID → **Updates** existing report
- If report has same name + sourceId → **Updates** existing report  
- Otherwise → **Inserts** new report

### Export Single Report

1. Navigate to a specific report: http://localhost:3050/reports/[id]
2. Click **"Export"** button in the top-right
3. JSON file downloads with just that report
4. File can be imported back to restore/duplicate the report

---

## UI Changes

### Reports List Page
**Before**:
```
[Export] [Import] [Refresh] [Create Report]
```

**After**:
```
[Export (3)] [Import] [Refresh] [Create Report]
                                    
All Reports                    [✓] Select All

[✓] Sales Report Q1           [Analyze] [Edit] [Delete]
[✓] Product Analysis          [Analyze] [Edit] [Delete]
[ ] Customer Insights         [Analyze] [Edit] [Delete]
[✓] Revenue Dashboard         [Analyze] [Edit] [Delete]
```

### Individual Report Page
**Export button** now works:
```
[← Back]  Report Name
          [Edit Configuration] [Export]
```

---

## Backend API Changes

### POST /reports/import (Updated)

**Response** (now includes `updated`):
```json
{
  "imported": 3,
  "updated": 2,
  "skipped": 1,
  "total": 6,
  "errors": ["..."]
}
```

**Upsert Logic**:
1. Check if report exists by ID
2. If not, check by name + sourceId
3. If exists → UPDATE
4. If not exists → INSERT

---

## Files Modified

### Frontend
1. **`/frontend/src/app/reports/page.tsx`**
   - Added checkbox selection state
   - Added `toggleReportSelection()` and `toggleSelectAll()` functions
   - Updated export to filter by selected reports
   - Updated import message to show updated count
   - Added checkboxes to UI (header + each row)

2. **`/frontend/src/app/reports/[id]/page.tsx`**
   - Added `handleExportReport()` function
   - Connected Export button onClick handler

### Backend
3. **`/backend/server.js`**
   - Updated `/reports/import` endpoint with upsert logic
   - Added `updated` count to response
   - Checks for existing reports by ID or name+sourceId

---

## Example Workflows

### Workflow 1: Export Selected Reports
```
1. User selects 3 reports using checkboxes
2. Clicks "Export (3)"
3. File downloads: reports-export-2026-02-07.json
4. Contains only the 3 selected reports
5. Checkboxes are cleared
```

### Workflow 2: Import with Updates
```
1. User has 5 existing reports
2. Exports them (gets reports-export-2026-02-07.json)
3. Edits the JSON file (changes descriptions)
4. Imports the modified file
5. Sees: "Import complete: 0 new report(s), 5 updated"
6. All 5 reports are updated, no duplicates created
```

### Workflow 3: Export Single Report
```
1. User views "Sales Report Q1"
2. Clicks "Export" button
3. File downloads: report-sales_report_q1-2026-02-07.json
4. Contains single report in array format
5. Can be imported to duplicate or restore
```

---

## Testing Checklist

- [x] Select individual reports with checkboxes
- [x] Select all reports with "Select All"
- [x] Export button shows correct count
- [x] Export downloads only selected reports
- [x] Selection clears after export
- [x] Import creates new reports (when not existing)
- [x] Import updates existing reports (by ID)
- [x] Import updates existing reports (by name+sourceId)
- [x] Import message shows correct counts
- [x] Export from individual report page works
- [x] Exported single report can be imported

---

## Comparison: Before vs After

| Feature | Before | After |
|---------|--------|-------|
| Export Selection | All reports | Selected reports only |
| Export Button | "Export" | "Export (3)" with count |
| Import Behavior | Always insert new | Upsert (update or insert) |
| Import Message | "X imported" | "X new, Y updated, Z skipped" |
| Single Report Export | Not functional | Fully functional |
| Duplicate Prevention | No | Yes (via upsert) |

---

## Benefits

1. **Selective Export**: Export only what you need
2. **No Duplicates**: Import updates existing reports instead of creating duplicates
3. **Better Feedback**: Clear messages about what happened during import
4. **Flexible Workflows**: Export/import single or multiple reports
5. **Data Sync**: Can export from one system, import to another with updates

---

## Status

🟢 **All Features Implemented and Tested**
- Frontend changes deployed
- Backend rebuilt and restarted  
- Ready for immediate use

Start the application with:
```bash
./manage.sh start
```

Then navigate to http://localhost:3050/reports to test!
