# Subscription Module - Flow Diagrams

## 1. User Subscription Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Check Subscription  │
└──────┬──────────────┘
       │
       ├─── Active ────────────────────────┐
       │                                    │
       ├─── Inactive ──────┐                │
       │                   │                │
       └─── Expired ───────┤                │
                           │                │
                           ▼                │
                  ┌────────────────┐        │
                  │  Show Modal    │        │
                  │  "Subscribe"   │        │
                  └────────┬───────┘        │
                           │                │
                           ▼                │
                  ┌────────────────┐        │
                  │  Plans Page    │        │
                  └────────┬───────┘        │
                           │                │
                           ▼                │
                  ┌────────────────┐        │
                  │ Select Plan    │        │
                  └────────┬───────┘        │
                           │                │
                           ▼                │
                  ┌────────────────┐        │
                  │ Subscribe Page │        │
                  │  - View QR     │        │
                  │  - Pay UPI     │        │
                  │  - Confirm     │        │
                  └────────┬───────┘        │
                           │                │
                           ▼                │
                  ┌────────────────┐        │
                  │ Request Sent   │        │
                  │ Status: PENDING│        │
                  └────────┬───────┘        │
                           │                │
                           ▼                │
                  ┌────────────────┐        │
                  │ Admin Activates│        │
                  └────────┬───────┘        │
                           │                │
                           ▼                │
                  ┌────────────────┐        │
                  │ Status: ACTIVE │        │
                  └────────┬───────┘        │
                           │                │
                           └────────────────┤
                                            │
                                            ▼
                                   ┌────────────────┐
                                   │   Dashboard    │
                                   └────────────────┘
```

## 2. Admin Workflow

```
┌─────────────────┐
│  Admin Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Admin Dashboard │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Subscriptions Panel │
└────────┬────────────┘
         │
         ▼
┌─────────────────┐
│ Search User     │
│ (by email)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ View Subscription   │
│ - User details      │
│ - Plan info         │
│ - Status            │
│ - Dates             │
└────────┬────────────┘
         │
         ├─── PENDING ────┐
         │                │
         └─── ACTIVE ─────┤
                          │
         ┌────────────────┘
         │
         ▼
┌─────────────────────┐
│  Choose Action      │
└────────┬────────────┘
         │
         ├─── Activate ───────┐
         │                    │
         └─── Expire ─────────┤
                              │
         ┌────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Enter Charge Breakup│ (for Activate)
│ or Confirm          │ (for Expire)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Update Status       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Show Success        │
└─────────────────────┘
```

## 3. Payment Flow

```
┌─────────────────┐
│ Subscribe Page  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ View Plan       │
│ Summary         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display UPI QR  │
│ & Instructions  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Pays       │
│ via UPI App     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "I Paid"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Success Message │
│ "Will activate  │
│ after verify"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ Current Sub     │
└─────────────────┘
```

## 4. Error Handling Flow

```
┌─────────────────┐
│  API Call       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Check Response         │
└────────┬────────────────┘
         │
         ├─── Success ──────────────┐
         │                          │
         ├─── NO_SUBSCRIPTION ──────┤
         │                          │
         ├─── SUBSCRIPTION_EXPIRED ─┤
         │                          │
         ├─── SUBSCRIPTION_INACTIVE ┤
         │                          │
         └─── 401 Unauthorized ─────┤
                                    │
         ┌──────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Handle Error           │
└────────┬────────────────┘
         │
         ├─── Show Modal ──────────┐
         │                         │
         ├─── Redirect to Plans ───┤
         │                         │
         ├─── Show Error Message ──┤
         │                         │
         └─── Logout User ─────────┤
                                   │
         ┌─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  User Takes Action      │
└─────────────────────────┘
```

## 5. Component Hierarchy

```
App.js
│
├── AuthProvider
│   │
│   └── Login.js
│       │
│       └── SubscriptionModal.js
│
├── ProtectedRoute
│   │
│   ├── SubscriptionPlans.js
│   │   └── (Plan Cards)
│   │
│   ├── Subscribe.js
│   │   ├── Plan Summary
│   │   ├── UPI QR Code
│   │   └── Payment Instructions
│   │
│   ├── CurrentSubscription.js
│   │   ├── Status Badge
│   │   ├── Subscription Details
│   │   └── Feature Limits
│   │
│   └── AdminSubscriptions.js
│       ├── Search Bar
│       ├── Subscription List
│       └── Action Buttons
│
└── Services
    └── subscriptionAPI.js
```

## 6. State Management

```
Login Component
├── showSubscriptionModal (boolean)
├── subscriptionError (string)
└── apiError (string)

SubscriptionPlans Component
├── plans (array)
├── loading (boolean)
└── error (string)

Subscribe Component
├── plan (object)
├── loading (boolean)
├── submitting (boolean)
├── error (string)
└── success (string)

CurrentSubscription Component
├── subscription (object)
├── loading (boolean)
└── error (string)

AdminSubscriptions Component
├── subscriptions (array)
├── loading (boolean)
├── searchEmail (string)
├── selectedSub (number)
├── chargeBreakup (string)
└── message (object)
```

## 7. API Call Sequence

```
User Journey:
1. Login → Check subscription status
2. If inactive → Show modal
3. View plans → GET /api/plans
4. Select plan → Navigate with planId
5. Subscribe → POST /api/subscriptions/request
6. View current → GET /api/subscriptions/current

Admin Journey:
1. Login as admin
2. Search user → GET /admin/subscriptions/search?email=...
3. View details → Display subscription
4. Activate → POST /admin/subscriptions/{id}/activate
5. Expire → POST /admin/subscriptions/{id}/expire
```

---

These diagrams provide a visual understanding of the subscription module flows.
