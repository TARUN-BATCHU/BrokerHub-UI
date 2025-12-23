# 🎨 Subscription Module – Frontend (React)

## Overview

Complete frontend implementation of the subscription management system for BrokerHub. This module handles subscription plans, payment requests, subscription status tracking, and admin management.

## 🚀 Features

### User Features
- ✅ View available subscription plans
- ✅ Subscribe to plans with UPI payment
- ✅ View current subscription status
- ✅ Renew expired subscriptions
- ✅ Login blocking for inactive subscriptions

### Admin Features
- ✅ Search users by email
- ✅ View user subscription details
- ✅ Activate pending subscriptions
- ✅ Expire active subscriptions
- ✅ Manual charge breakup entry

## 📁 Project Structure

```
src/
├── services/
│   └── subscriptionAPI.js          # API service layer
├── pages/
│   ├── SubscriptionPlans.js        # /subscriptions/plans
│   ├── Subscribe.js                # /subscriptions/subscribe/:planId
│   ├── CurrentSubscription.js      # /subscriptions/current
│   └── AdminSubscriptions.js       # /admin/subscriptions
└── components/
    └── SubscriptionModal.js        # Error modal for login
```

## 🛣️ Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/subscriptions/plans` | SubscriptionPlans | User | View all plans |
| `/subscriptions/subscribe/:planId` | Subscribe | User | Subscribe to plan |
| `/subscriptions/current` | CurrentSubscription | User | View subscription |
| `/admin/subscriptions` | AdminSubscriptions | Admin | Manage subscriptions |

## 🔌 API Integration

### User Endpoints

```javascript
// Get all plans
GET /api/plans
Response: [{ id, name, price, duration, features }]

// Request subscription
POST /api/subscriptions/request
Body: { planId: number }
Response: { message: string }

// Get current subscription
GET /api/subscriptions/current
Response: { id, planName, status, startDate, endDate, featureLimits }
```

### Admin Endpoints

```javascript
// Search user subscription
GET /admin/subscriptions/search?email={email}
Response: [{ id, userEmail, planName, status, endDate }]

// Activate subscription
POST /admin/subscriptions/{id}/activate
Body: { chargeBreakup: string }
Response: { message: string }

// Expire subscription
POST /admin/subscriptions/{id}/expire
Response: { message: string }
```

## 🎯 Usage

### Navigate to Plans
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/subscriptions/plans');
```

### Check Subscription
```javascript
import { subscriptionAPI } from '../services/subscriptionAPI';

const subscription = await subscriptionAPI.getCurrentSubscription();
console.log(subscription.status); // ACTIVE, PENDING, EXPIRED
```

### Handle Subscription Errors
```javascript
// In Login.js
if (error.errorCode === 'SUBSCRIPTION_INACTIVE') {
  setShowSubscriptionModal(true);
}
```

## 🎨 UI Components

### Subscription Modal
```javascript
<SubscriptionModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  errorCode="SUBSCRIPTION_INACTIVE"
/>
```

### Status Badge Colors
- **ACTIVE**: Green (success)
- **PENDING**: Yellow (warning)
- **EXPIRED**: Red (error)
- **SUSPENDED**: Red (error)

## ⚠️ Error Handling

| Error Code | Action |
|------------|--------|
| `NO_SUBSCRIPTION` | Redirect to plans page |
| `SUBSCRIPTION_EXPIRED` | Show renewal prompt |
| `SUBSCRIPTION_INACTIVE` | Block login, show modal |
| `SUBSCRIPTION_SUSPENDED` | Show contact support |
| `401` | Logout user |

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test User Flow
1. Login with inactive subscription
2. Modal appears blocking login
3. Click "View Plans"
4. Select a plan
5. View payment instructions
6. Confirm payment
7. View current subscription

### Test Admin Flow
1. Login as admin
2. Navigate to `/admin/subscriptions`
3. Search user by email
4. View subscription details
5. Activate or expire subscription

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop**: Grid layout with multiple columns
- **Tablet**: Adjusted grid columns
- **Mobile**: Single column layout

## 🎨 Theme Support

All components support light and dark themes:
```javascript
import { useTheme } from '../contexts/ThemeContext';

const { theme } = useTheme();
// Use theme.textPrimary, theme.background, etc.
```

## 🔐 Security

- All routes are protected with `ProtectedRoute`
- API calls include JWT token
- Input validation on all forms
- XSS protection enabled

## 📚 Documentation

- **[Implementation Guide](SUBSCRIPTION_MODULE_IMPLEMENTATION.md)** - Complete implementation details
- **[Quick Start](SUBSCRIPTION_QUICK_START.md)** - Developer quick reference
- **[Flow Diagrams](SUBSCRIPTION_FLOW_DIAGRAMS.md)** - Visual flow charts
- **[Checklist](SUBSCRIPTION_CHECKLIST.md)** - Testing and deployment checklist
- **[Summary](SUBSCRIPTION_SUMMARY.md)** - Project summary

## 🚫 Not Implemented (By Design)

The following features are intentionally excluded for simplicity:
- ❌ Auto-renewal
- ❌ Payment gateway integration
- ❌ Invoice generation
- ❌ Coupon system

These can be added later without schema changes.

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## 📦 Dependencies

All dependencies are already included in the project:
- React Router DOM (routing)
- Axios (API calls)
- Theme Context (styling)
- Auth Context (authentication)

## 🐛 Troubleshooting

### Plans not loading
- Check API endpoint configuration
- Verify backend is running
- Check browser console for errors

### Payment not confirming
- Ensure button is not disabled
- Check network tab for API call
- Verify backend endpoint

### Modal not showing
- Check error code from API
- Verify modal component imported
- Check state management

## 📞 Support

- **Frontend Issues**: Check browser console
- **Backend Issues**: Contact backend team
- **Documentation**: Refer to docs folder

## 🎉 Credits

Built with ❤️ for BrokerHub
- Clean, maintainable code
- Production-ready
- Interview-grade quality

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2024
