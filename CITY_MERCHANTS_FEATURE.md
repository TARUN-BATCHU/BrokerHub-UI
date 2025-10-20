# City Merchants Feature Implementation

## Overview
This feature allows users to browse and search merchants organized by their city location. It provides a two-level search functionality:
1. Search at the city level
2. Search at the merchant level within a selected city

## Files Created/Modified

### 1. New Page Component
**File:** `src/pages/CityMerchantsPage.js`
- Main page component for the city merchants feature
- Displays a list of available cities on the left
- Shows merchants for the selected city on the right
- Includes search functionality at both city and merchant levels
- Responsive design for mobile and desktop

### 2. API Service Updates
**File:** `src/services/api.js`
- Added `getAllCities()` - Fetches all available cities
- Added `getMerchantsByCity(city)` - Fetches merchants for a specific city

### 3. Routing Updates
**File:** `src/App.js`
- Added import for `CityMerchantsPage`
- Added route `/city-merchants` as a protected route

### 4. Dashboard Updates
**File:** `src/pages/Dashboard.js`
- Updated "All Services" tab to include a clickable card for "Merchants by City"
- Card navigates to `/city-merchants` when clicked

### 5. Language Context Updates
**File:** `src/contexts/LanguageContext.js`
- Added English translations for all new UI elements
- Added Telugu translations for all new UI elements

## API Contracts Used

### 1. Get All Cities API
```
Endpoint: GET /BrokerHub/user/cities
Headers: Authorization (JWT token)
Response: Array of city names
```

### 2. Get Merchants by City API
```
Endpoint: GET /BrokerHub/user/merchants?city={cityName}
Headers: Authorization (JWT token)
Query Parameters: city (required, string)
Response: Array of merchant objects
```

## Features Implemented

### City Level
- Display all available cities in a scrollable list
- Search functionality to filter cities by name
- Visual indication of selected city
- Click on any city to load its merchants

### Merchant Level
- Display all merchants in the selected city
- Search functionality to filter merchants by:
  - Firm name
  - Owner name
  - Phone numbers
- Display comprehensive merchant information:
  - Firm name and owner name
  - User type (TRADER, etc.)
  - Brokerage rate per bag
  - Total bags sold and bought
  - Payable and receivable amounts
  - Total brokerage
  - Contact phone numbers (clickable for calling)
  - Complete address with shop number and hints

### UI/UX Features
- Responsive design for mobile and desktop
- Hover effects on interactive elements
- Loading states for API calls
- Empty states with helpful messages
- Theme-aware styling (supports light/dark themes)
- Smooth transitions and animations
- Back button to return to dashboard

## Navigation Flow
1. User goes to Dashboard
2. Clicks on "All Services" tab
3. Clicks on "Merchants by City" card
4. Redirected to `/city-merchants` page
5. Selects a city from the list
6. Views and searches merchants in that city
7. Can click "Back" button to return to dashboard

## Responsive Design
- Mobile: Single column layout, stacked views
- Desktop: Two-column layout (cities on left, merchants on right)
- Touch-friendly buttons and inputs
- Optimized font sizes for different screen sizes

## Error Handling
- API error messages displayed to user
- Graceful fallback for empty data
- Loading indicators during API calls
- Proper error boundaries

## Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Clear visual feedback for interactions

## Future Enhancements (Optional)
- Add filters for merchant type (TRADER, BUYER, SELLER)
- Add sorting options (by name, brokerage, etc.)
- Add export functionality for merchant lists
- Add merchant detail modal with more information
- Add map view showing merchant locations
- Add favorites/bookmarks for frequently accessed cities
- Add recent searches history
