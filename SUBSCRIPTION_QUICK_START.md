# Subscription Module - Quick Start Guide

## 🚀 Quick Setup

### 1. Files Added
```
src/
├── services/
│   └── subscriptionAPI.js          # API service
├── pages/
│   ├── SubscriptionPlans.js        # Plans listing
│   ├── Subscribe.js                # Payment flow
│   ├── CurrentSubscription.js      # User subscription
│   └── AdminSubscriptions.js       # Admin panel
└── components/
    └── SubscriptionModal.js        # Error modal
```

### 2. Routes Added to App.js
```javascript
/subscriptions/plans              // View plans
/subscriptions/subscribe/:planId  // Subscribe to plan
/subscriptions/current            // Current subscription
/admin/subscriptions              // Admin panel
```

## 📋 Usage Examples

### Navigate to Plans
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/subscriptions/plans');
```

### Check Subscription Status
```javascript
import { subscriptionAPI } from '../services/subscriptionAPI';

const checkSubscription = async () => {
  try {
    const subscription = await subscriptionAPI.getCurrentSubscription();
    console.log('Status:', subscription.status);
  } catch (error) {
    if (error.errorCode === 'NO_SUBSCRIPTION') {
      // Redirect to plans
    }
  }
};
```

### Handle Login Errors
```javascript
// Already implemented in Login.js
if (error.errorCode === 'SUBSCRIPTION_INACTIVE') {
  setShowSubscriptionModal(true);
}
```

## 🎨 UI Components

### Subscription Modal
```javascript
import SubscriptionModal from '../components/SubscriptionModal';

<SubscriptionModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  errorCode="SUBSCRIPTION_INACTIVE"
/>
```

## 🔧 API Methods

### User APIs
```javascript
// Get all plans
const plans = await subscriptionAPI.getPlans();

// Request subscription
await subscriptionAPI.requestSubscription(planId);

// Get current subscription
const subscription = await subscriptionAPI.getCurrentSubscription();
```

### Admin APIs
```javascript
// Search user
const subs = await subscriptionAPI.searchUserSubscription(email);

// Activate subscription
await subscriptionAPI.activateSubscription(subId, chargeBreakup);

// Expire subscription
await subscriptionAPI.expireSubscription(subId);
```

## 🎯 Key Features

### 1. Plans Page
- Grid layout of all plans
- Hover effects
- Subscribe button per plan

### 2. Subscribe Page
- Plan summary
- UPI QR code (placeholder)
- Payment instructions
- Confirmation button

### 3. Current Subscription
- Status badge with colors
- Feature limits display
- Renewal option for expired

### 4. Admin Panel
- Email search
- Activate/Expire actions
- Charge breakup input

## ⚠️ Error Codes

| Code | Action |
|------|--------|
| `NO_SUBSCRIPTION` | Redirect to plans |
| `SUBSCRIPTION_EXPIRED` | Show renewal prompt |
| `SUBSCRIPTION_SUSPENDED` | Show contact support |
| `401` | Logout user |

## 🎨 Status Colors

```javascript
ACTIVE    → Green (success)
PENDING   → Yellow (warning)
EXPIRED   → Red (error)
SUSPENDED → Red (error)
```

## 📱 Responsive Design

All pages are fully responsive:
- Desktop: Grid layout
- Tablet: Adjusted columns
- Mobile: Single column

## 🔐 Protected Routes

All subscription routes are protected:
```javascript
<ProtectedRoute>
  <SubscriptionPlans />
</ProtectedRoute>
```

## 🧪 Testing

### Test User Flow
1. Login → Subscription error → Modal
2. View plans → Select plan
3. Subscribe → Confirm payment
4. View current subscription

### Test Admin Flow
1. Search user email
2. View subscription
3. Activate with charge breakup
4. Expire subscription

## 💡 Tips

1. **Always check subscription status** before allowing critical operations
2. **Use loading states** to prevent double submissions
3. **Handle all error codes** from API responses
4. **Theme-aware styling** - use theme context
5. **Disable buttons** during async operations

## 🚫 What NOT to Build

- ❌ Auto-renew logic
- ❌ Payment gateway integration
- ❌ Invoice generation
- ❌ Coupon system

These are intentionally excluded for simplicity.

## 📞 Support

For backend API issues, contact backend team.
For frontend issues, check browser console for errors.

---

**Happy Coding! 🎉**
