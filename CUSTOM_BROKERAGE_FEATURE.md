# Custom Brokerage Feature Implementation

## Overview
This feature allows users to optionally specify a custom brokerage rate when downloading bills or generating bulk reports from the `/brokerage/users` page. The custom brokerage rate is applied per bag for each transaction without making any changes to the database.

## Key Features
- **Optional Parameter**: Custom brokerage is completely optional
- **No Database Changes**: All calculations are done in-memory during bill generation
- **Per-Bag Calculation**: Custom brokerage is applied per bag for each transaction
- **Multiple Formats**: Supports both Excel and HTML/PDF bill formats
- **Bulk Operations**: Supports custom brokerage for bulk bill and Excel generation

## Implementation Details

### New Components Added

#### 1. CustomBrokerageModal.js
- Modal component for custom brokerage input
- Provides options to use original or custom brokerage rates
- Validates custom brokerage input (positive numbers only)
- Responsive design with modern UI styling

### Modified Components

#### 1. BrokerageUsers.js
- Added custom brokerage modal state management
- Updated download functions to show modal before downloading
- Added support for bulk operations with custom brokerage
- Enhanced user experience with descriptive tooltips

#### 2. brokerageAPI.js
- Updated `downloadUserBill()` to accept optional `customBrokerage` parameter
- Updated `downloadUserExcel()` to accept optional `customBrokerage` parameter
- Updated `bulkBillsByUsers()` to accept optional `customBrokerage` parameter
- Updated `bulkExcelByUsers()` to accept optional `customBrokerage` parameter
- Enhanced filename generation to include custom brokerage rate

#### 3. modern-ui.css
- Added RGB color variables for modal backgrounds
- Added shadow modal variable for enhanced modal styling

## User Experience Flow

### Individual Bill Download
1. User clicks "Download Bill" or "Download Excel" button
2. Custom Brokerage Modal opens with two options:
   - Use Original Brokerage (default)
   - Use Custom Brokerage (with input field)
3. If custom brokerage is selected, user enters rate per bag
4. User clicks "Download" to proceed
5. File downloads with appropriate filename indicating custom rate if used

### Bulk Operations
1. User selects multiple users and clicks "Bulk Bills" or "Bulk Excel"
2. Custom Brokerage Modal opens with same options as individual downloads
3. Custom rate (if specified) is applied to all selected users
4. Bulk generation starts with progress tracking via document status

## API Integration

### Individual Downloads
```javascript
// HTML Bill with custom brokerage
GET /BrokerHub/Brokerage/bill/{userId}/{financialYearId}?customBrokerage=2.5

// Excel with custom brokerage
GET /BrokerHub/Brokerage/excel/user/{userId}/{financialYearId}?customBrokerage=2.5
```

### Bulk Operations
```javascript
// Bulk Bills with custom brokerage
POST /BrokerHub/Brokerage/bulk-bills/users/{financialYearId}?customBrokerage=2.5
Body: [userId1, userId2, ...]

// Bulk Excel with custom brokerage
POST /BrokerHub/Brokerage/bulk-excel/users/{financialYearId}?customBrokerage=2.5
Body: [userId1, userId2, ...]
```

## File Naming Convention

### Individual Downloads
- **Original**: `bill_123.html`, `bill_123.xlsx`
- **Custom**: `bill_123_custom_2.5.html`, `bill_123_custom_2.5.xlsx`

### Bulk Operations
- Bulk operations maintain their existing naming conventions
- Custom brokerage is applied during generation but doesn't affect bulk file names

## Validation Rules
- Custom brokerage must be a positive number
- Decimal values are supported (e.g., 2.50)
- Zero is allowed as a valid custom brokerage rate
- Empty or negative values disable the download button

## Backward Compatibility
- All existing functionality remains unchanged
- API endpoints work with or without custom brokerage parameter
- Default behavior (no custom brokerage) produces identical results to before

## Testing Scenarios
1. **Normal Downloads**: Verify existing functionality works without custom brokerage
2. **Custom Brokerage**: Test with various custom rates (whole numbers, decimals, zero)
3. **Bulk Operations**: Test bulk generation with and without custom brokerage
4. **Edge Cases**: Test with very large numbers, many decimal places
5. **UI/UX**: Test modal interactions, validation, error handling

## Future Enhancements
- Save frequently used custom rates for quick selection
- Apply different custom rates for different cities or products
- Add custom brokerage to city-based bulk operations
- Export custom brokerage settings for reuse