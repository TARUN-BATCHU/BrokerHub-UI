// Mock data for analytics dashboard

export const mockSalesData = {
  totalSales: 2450000,
  totalQuantity: 15600,
  totalTransactions: 342,
  monthlyGrowth: 12.5,
  monthlySales: [
    { month: 'Jan', sales: 180000, quantity: 1200 },
    { month: 'Feb', sales: 220000, quantity: 1450 },
    { month: 'Mar', sales: 195000, quantity: 1300 },
    { month: 'Apr', sales: 240000, quantity: 1600 },
    { month: 'May', sales: 280000, quantity: 1850 },
    { month: 'Jun', sales: 320000, quantity: 2100 },
    { month: 'Jul', sales: 290000, quantity: 1900 },
    { month: 'Aug', sales: 350000, quantity: 2300 },
    { month: 'Sep', sales: 310000, quantity: 2050 },
    { month: 'Oct', sales: 380000, quantity: 2500 },
    { month: 'Nov', sales: 420000, quantity: 2750 },
    { month: 'Dec', sales: 455000, quantity: 3000 }
  ]
};

export const mockTopBuyers = [
  {
    id: 1,
    name: 'Rajesh Rice Mills',
    city: 'Hyderabad',
    totalPurchases: 450000,
    quantity: 3200,
    transactions: 45,
    type: 'MILLER'
  },
  {
    id: 2,
    name: 'Srinivas Traders',
    city: 'Vijayawada',
    totalPurchases: 380000,
    quantity: 2800,
    transactions: 38,
    type: 'TRADER'
  },
  {
    id: 3,
    name: 'Krishna Dal Mills',
    city: 'Guntur',
    totalPurchases: 320000,
    quantity: 2400,
    transactions: 32,
    type: 'MILLER'
  },
  {
    id: 4,
    name: 'Venkat Grains',
    city: 'Warangal',
    totalPurchases: 280000,
    quantity: 2100,
    transactions: 28,
    type: 'TRADER'
  },
  {
    id: 5,
    name: 'Lakshmi Rice Center',
    city: 'Karimnagar',
    totalPurchases: 250000,
    quantity: 1900,
    transactions: 25,
    type: 'MILLER'
  }
];

export const mockTopSellers = [
  {
    id: 1,
    name: 'Ramesh Agro Farms',
    city: 'Nizamabad',
    totalSales: 520000,
    quantity: 3800,
    transactions: 52,
    type: 'TRADER'
  },
  {
    id: 2,
    name: 'Suresh Rice Suppliers',
    city: 'Khammam',
    totalSales: 480000,
    quantity: 3500,
    transactions: 48,
    type: 'MILLER'
  },
  {
    id: 3,
    name: 'Mahesh Dal Trading',
    city: 'Nalgonda',
    totalSales: 420000,
    quantity: 3100,
    transactions: 42,
    type: 'TRADER'
  },
  {
    id: 4,
    name: 'Ganesh Grains Hub',
    city: 'Medak',
    totalSales: 380000,
    quantity: 2800,
    transactions: 38,
    type: 'MILLER'
  },
  {
    id: 5,
    name: 'Ravi Commodity Center',
    city: 'Adilabad',
    totalSales: 340000,
    quantity: 2500,
    transactions: 34,
    type: 'TRADER'
  }
];

export const mockCityAnalytics = [
  {
    city: 'Hyderabad',
    buyers: 12,
    sellers: 8,
    totalVolume: 4500,
    totalValue: 650000,
    avgPrice: 144.44
  },
  {
    city: 'Vijayawada',
    buyers: 10,
    sellers: 15,
    totalVolume: 4200,
    totalValue: 580000,
    avgPrice: 138.10
  },
  {
    city: 'Guntur',
    buyers: 8,
    sellers: 12,
    totalVolume: 3800,
    totalValue: 520000,
    avgPrice: 136.84
  },
  {
    city: 'Warangal',
    buyers: 6,
    sellers: 9,
    totalVolume: 3200,
    totalValue: 440000,
    avgPrice: 137.50
  },
  {
    city: 'Karimnagar',
    buyers: 5,
    sellers: 7,
    totalVolume: 2800,
    totalValue: 380000,
    avgPrice: 135.71
  }
];

export const mockProductAnalytics = [
  {
    product: 'Basmati Rice',
    quantity: 4500,
    value: 720000,
    percentage: 28.5,
    avgPrice: 160
  },
  {
    product: 'Sona Masoori Rice',
    quantity: 3800,
    value: 456000,
    percentage: 24.2,
    avgPrice: 120
  },
  {
    product: 'Channa Dal',
    quantity: 2200,
    value: 330000,
    percentage: 14.1,
    avgPrice: 150
  },
  {
    product: 'Toor Dal',
    quantity: 1900,
    value: 285000,
    percentage: 12.2,
    avgPrice: 150
  },
  {
    product: 'Moong Dal',
    quantity: 1600,
    value: 240000,
    percentage: 10.3,
    avgPrice: 150
  },
  {
    product: 'Urad Dal',
    quantity: 1200,
    value: 180000,
    percentage: 7.7,
    avgPrice: 150
  },
  {
    product: 'Masoor Dal',
    quantity: 500,
    value: 75000,
    percentage: 3.2,
    avgPrice: 150
  }
];

export const mockMerchants = [
  {
    id: 1,
    userType: 'MILLER',
    gstNumber: 'GST123456789',
    firmName: 'Rajesh Rice Mills',
    ownerName: 'Rajesh Kumar',
    city: 'Hyderabad',
    area: 'Secunderabad',
    pincode: '500003',
    email: 'rajesh@ricemills.com',
    bankName: 'SBI Bank',
    accountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
    branch: 'Secunderabad Branch',
    phoneNumbers: ['9876543210', '9876543211'],
    brokerageRate: 12,
    shopNumber: '45',
    byProduct: 'Basmati Rice',
    status: 'Active',
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    userType: 'TRADER',
    gstNumber: 'GST987654321',
    firmName: 'Srinivas Traders',
    ownerName: 'Srinivas Reddy',
    city: 'Vijayawada',
    area: 'Gandhi Nagar',
    pincode: '520003',
    email: 'srinivas@traders.com',
    bankName: 'HDFC Bank',
    accountNumber: '0987654321',
    ifscCode: 'HDFC0001234',
    branch: 'Gandhi Nagar Branch',
    phoneNumbers: ['9876543212', '9876543213'],
    brokerageRate: 10,
    shopNumber: '67',
    byProduct: 'Channa Dal',
    status: 'Active',
    createdDate: '2024-02-20'
  },
  {
    id: 3,
    userType: 'MILLER',
    gstNumber: 'GST456789123',
    firmName: 'Krishna Dal Mills',
    ownerName: 'Krishna Murthy',
    city: 'Guntur',
    area: 'Lakshmipuram',
    pincode: '522007',
    email: 'krishna@dalmills.com',
    bankName: 'ICICI Bank',
    accountNumber: '4567891230',
    ifscCode: 'ICIC0001234',
    branch: 'Lakshmipuram Branch',
    phoneNumbers: ['9876543214', '9876543215'],
    brokerageRate: 15,
    shopNumber: '89',
    byProduct: 'Toor Dal',
    status: 'Active',
    createdDate: '2024-03-10'
  }
];
