// Mock data for payment tracking functionality

// Brokerage payments - merchants who need to pay brokerage
export const mockBrokeragePayments = [
  {
    id: 1,
    merchantId: 'M001',
    firmName: 'Tarun Traders',
    ownerName: 'Tarun Batchu',
    city: 'Vijayawada',
    userType: 'TRADER',
    soldBags: 80,
    boughtBags: 70,
    totalBags: 150, // sold + bought
    brokerageRate: 10, // ₹10 per bag (since 1 bag = 50kg)
    grossBrokerage: 1500, // totalBags * brokerageRate = 150 * 10 = 1500
    discount: 150, // 10% offer (10% of 1500)
    tds: 75, // 5% TDS (5% of 1500)
    netBrokerage: 1275, // grossBrokerage - discount - tds = 1500 - 150 - 75 = 1275
    paidAmount: 500, // partial payment made
    pendingAmount: 775, // netBrokerage - paidAmount
    lastPaymentDate: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'PARTIAL_PAID',
    partPayments: [
      {
        id: 'PP001',
        amount: 500,
        date: '2024-01-15',
        method: 'CASH',
        notes: 'Partial payment received'
      }
    ]
  },
  {
    id: 2,
    merchantId: 'M002',
    firmName: 'Siri Traders',
    ownerName: 'Santosh Kumar',
    city: 'Vijayawada',
    userType: 'TRADER',
    soldBags: 0,
    boughtBags: 120,
    totalBags: 120,
    brokerageRate: 10, // ₹10 per bag (since 1 bag = 50kg)
    grossBrokerage: 1200, // totalBags * brokerageRate = 120 * 10 = 1200
    discount: 120, // 10% offer (10% of 1200)
    tds: 60, // 5% TDS (5% of 1200)
    netBrokerage: 1020, // grossBrokerage - discount - tds = 1200 - 120 - 60 = 1020
    paidAmount: 0,
    pendingAmount: 1020,
    lastPaymentDate: null,
    dueDate: '2024-02-20',
    status: 'PENDING',
    partPayments: []
  },
  {
    id: 3,
    merchantId: 'M003',
    firmName: 'Krishna Mills',
    ownerName: 'Krishna Reddy',
    city: 'Guntur',
    userType: 'MILLER',
    soldBags: 200,
    boughtBags: 0,
    totalBags: 200,
    brokerageRate: 10, // ₹10 per bag (since 1 bag = 50kg)
    grossBrokerage: 2000, // totalBags * brokerageRate = 200 * 10 = 2000
    discount: 200, // 10% offer (10% of 2000)
    tds: 100, // 5% TDS (5% of 2000)
    netBrokerage: 1700, // grossBrokerage - discount - tds = 2000 - 200 - 100 = 1700
    paidAmount: 1700,
    pendingAmount: 0,
    lastPaymentDate: '2024-01-18',
    dueDate: '2024-02-18',
    status: 'PAID',
    partPayments: [
      {
        id: 'PP002',
        amount: 1700,
        date: '2024-01-18',
        method: 'BANK_TRANSFER',
        notes: 'Full payment received'
      }
    ]
  }
];

// Pending payments - buyers who need to pay sellers
export const mockPendingPayments = [
  {
    id: 1,
    buyerId: 'B001',
    buyerFirm: 'Siri Traders',
    buyerOwner: 'Santosh Kumar',
    buyerCity: 'Vijayawada',
    totalPendingAmount: 850000,
    transactionCount: 2,
    oldestTransactionDate: '2024-01-10',
    dueDate: '2024-02-10',
    status: 'OVERDUE',
    transactions: [
      {
        id: 'PT001',
        date: '2024-01-10',
        sellerFirm: 'Tarun Traders',
        sellerOwner: 'Tarun Batchu',
        product: 'Rice',
        quality: 'Premium',
        bags: 80,
        ratePerBag: 5000,
        totalAmount: 400000,
        paidAmount: 0,
        pendingAmount: 400000,
        dueDate: '2024-02-10',
        status: 'PENDING'
      },
      {
        id: 'PT002',
        date: '2024-01-14',
        sellerFirm: 'Krishna Mills',
        sellerOwner: 'Krishna Reddy',
        product: 'Wheat',
        quality: 'Standard',
        bags: 90,
        ratePerBag: 5000,
        totalAmount: 450000,
        paidAmount: 0,
        pendingAmount: 450000,
        dueDate: '2024-02-14',
        status: 'PENDING'
      }
    ]
  },
  {
    id: 2,
    buyerId: 'B002',
    buyerFirm: 'Rama Traders',
    buyerOwner: 'Rama Krishna',
    buyerCity: 'Guntur',
    totalPendingAmount: 300000,
    transactionCount: 1,
    oldestTransactionDate: '2024-01-18',
    dueDate: '2024-02-18',
    status: 'DUE_SOON',
    transactions: [
      {
        id: 'PT003',
        date: '2024-01-18',
        sellerFirm: 'Lakshmi Mills',
        sellerOwner: 'Lakshmi Devi',
        product: 'Rice',
        quality: 'Standard',
        bags: 60,
        ratePerBag: 5000,
        totalAmount: 300000,
        paidAmount: 0,
        pendingAmount: 300000,
        dueDate: '2024-02-18',
        status: 'PENDING'
      }
    ]
  }
];

// Receivable payments - sellers who need to receive money
export const mockReceivablePayments = [
  {
    id: 1,
    sellerId: 'S001',
    sellerFirm: 'Tarun Traders',
    sellerOwner: 'Tarun Batchu',
    sellerCity: 'Vijayawada',
    totalReceivableAmount: 400000,
    transactionCount: 1,
    oldestTransactionDate: '2024-01-10',
    dueDate: '2024-02-10',
    status: 'OVERDUE',
    owedBy: [
      {
        buyerFirm: 'Siri Traders',
        buyerOwner: 'Santosh Kumar',
        totalOwed: 400000,
        transactions: [
          {
            id: 'RT001',
            date: '2024-01-10',
            product: 'Rice',
            quality: 'Premium',
            bags: 80,
            ratePerBag: 5000,
            totalAmount: 400000,
            paidAmount: 0,
            pendingAmount: 400000,
            dueDate: '2024-02-10',
            status: 'PENDING'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    sellerId: 'S002',
    sellerFirm: 'Krishna Mills',
    sellerOwner: 'Krishna Reddy',
    sellerCity: 'Guntur',
    totalReceivableAmount: 750000,
    transactionCount: 2,
    oldestTransactionDate: '2024-01-14',
    dueDate: '2024-02-14',
    status: 'DUE_SOON',
    owedBy: [
      {
        buyerFirm: 'Siri Traders',
        buyerOwner: 'Santosh Kumar',
        totalOwed: 450000,
        transactions: [
          {
            id: 'RT002',
            date: '2024-01-14',
            product: 'Wheat',
            quality: 'Standard',
            bags: 90,
            ratePerBag: 5000,
            totalAmount: 450000,
            paidAmount: 0,
            pendingAmount: 450000,
            dueDate: '2024-02-14',
            status: 'PENDING'
          }
        ]
      },
      {
        buyerFirm: 'Rama Traders',
        buyerOwner: 'Rama Krishna',
        totalOwed: 300000,
        transactions: [
          {
            id: 'RT003',
            date: '2024-01-18',
            product: 'Rice',
            quality: 'Standard',
            bags: 60,
            ratePerBag: 5000,
            totalAmount: 300000,
            paidAmount: 0,
            pendingAmount: 300000,
            dueDate: '2024-02-18',
            status: 'PENDING'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    sellerId: 'S003',
    sellerFirm: 'Lakshmi Mills',
    sellerOwner: 'Lakshmi Devi',
    sellerCity: 'Guntur',
    totalReceivableAmount: 300000,
    transactionCount: 1,
    oldestTransactionDate: '2024-01-18',
    dueDate: '2024-02-18',
    status: 'DUE_SOON',
    owedBy: [
      {
        buyerFirm: 'Rama Traders',
        buyerOwner: 'Rama Krishna',
        totalOwed: 300000,
        transactions: [
          {
            id: 'RT004',
            date: '2024-01-18',
            product: 'Rice',
            quality: 'Standard',
            bags: 60,
            ratePerBag: 5000,
            totalAmount: 300000,
            paidAmount: 0,
            pendingAmount: 300000,
            dueDate: '2024-02-18',
            status: 'PENDING'
          }
        ]
      }
    ]
  }
];
