# Grain Analytics Feature

## Overview
The Grain Analytics feature allows brokers to track and visualize grain price trends over time. This feature provides comprehensive price analytics with interactive charts and data management capabilities.

## Features

### 📊 Price Visualization
- **Line Chart**: Shows price trends over time
- **Bar Chart**: Displays price data in bar format
- **Multi-Product View**: View all products on a single chart
- **Single Product View**: Focus on individual product analytics

### 📈 Interactive Charts
- Grafana-style visualization
- Product selection dropdown
- Chart type toggle (Line/Bar)
- Real-time data updates
- Responsive design for mobile and desktop

### 📝 Data Management
- Add new price entries with date/time
- View recent price entries in table format
- Product name and cost tracking
- Automatic timestamp recording

### 🎯 Key Capabilities
- Track grain prices over time
- Compare multiple products
- Analyze price trends
- Export-ready visualizations
- Mobile-responsive interface

## API Integration

### Endpoints Used
- `POST /BrokerHub/grain-costs/{brokerId}` - Add new grain cost entry
- `GET /BrokerHub/grain-costs/{brokerId}` - Get all grain costs for broker

### Authentication
Uses Basic Authentication with credentials:
- Username: `tarun`
- Password: `securePassword123`

## Usage

### Adding Price Entries
1. Navigate to Dashboard → Grain Analytics tab
2. Click "Add Price Entry" button
3. Fill in product name, price, and date/time
4. Submit to save the entry

### Viewing Analytics
1. Select chart type (Line or Bar)
2. Choose product filter (All Products or specific product)
3. View interactive charts with price trends
4. Hover over data points for detailed information

### Data Table
- View recent price entries in tabular format
- Sorted by date (newest first)
- Shows product name, price, and date

## Technical Implementation

### Components
- `GrainAnalytics.js` - Main component with charts and data management
- Chart.js integration with react-chartjs-2
- Responsive design using theme context

### API Services
- `grainCostsAPI` - Service functions for API calls
- Error handling and loading states
- Authentication headers included

### Features
- Real-time chart updates
- Mobile-responsive design
- Theme-aware styling
- Error handling and loading states
- Form validation

## File Structure
```
src/
├── components/
│   └── GrainAnalytics.js          # Main grain analytics component
├── services/
│   └── api.js                     # Updated with grainCostsAPI
└── pages/
    └── Dashboard.js               # Updated with grain analytics tab
```

## Dependencies
- chart.js (^4.4.9)
- react-chartjs-2 (^5.3.0)
- axios (for API calls)
- React hooks (useState, useEffect)

## Future Enhancements
- Export charts as images
- Advanced filtering options
- Price alerts and notifications
- Historical data comparison
- Bulk data import
- Advanced analytics (moving averages, trends)