import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations = {
  en: {
    // Navigation
    'Dashboard': 'Dashboard',
    'Main Dashboard': 'Main Dashboard',
    'Overview': 'Overview',
    'Analytics': 'Analytics',
    'Grain Analytics': 'Grain Analytics',
    'Payments': 'Payments',
    'Merchants': 'Merchants',
    'Products': 'Products',
    'Addresses': 'Addresses',
    'Profile': 'Profile',
    'All Services': 'All Services',
    'Profile Settings': 'Profile Settings',
    'Brokerage': 'Brokerage',
    'Ledger': 'Ledger',
    'Entities': 'Entities',
    'About': 'About',
    'User Brokerage': 'User Brokerage',
    'Bulk Operations': 'Bulk Operations',
    'Daily Ledger': 'Daily Ledger',
    'Calendar View': 'Calendar View',
    'JSON Transaction Input': 'JSON Transaction Input',
    'Payment Management': 'Payment Management',
    'Financial Years': 'Financial Years',
    'Create Merchant': 'Create Merchant',
    'Phone Directory': 'Phone Directory',
    'About BrokerHub': 'About BrokerHub',
    'Logout': 'Logout',
    'NAVIGATION': 'NAVIGATION',
    
    // Common
    'Welcome back': 'Welcome back',
    'Loading...': 'Loading...',
    'Save': 'Save',
    'Cancel': 'Cancel',
    'Edit': 'Edit',
    'Delete': 'Delete',
    'Add': 'Add',
    'Search': 'Search',
    'Filter': 'Filter',
    'Export': 'Export',
    'Import': 'Import',
    'Refresh': 'Refresh',
    'Back': 'Back',
    'Next': 'Next',
    'Previous': 'Previous',
    'Submit': 'Submit',
    'Close': 'Close',
    'View': 'View',
    
    // Dashboard
    'BrokerHub Dashboard': 'BrokerHub Dashboard',
    'Total Sales': 'Total Sales',
    'Total Quantity': 'Total Quantity',
    'Total Transactions': 'Total Transactions',
    'Total Brokerage Earned': 'Total Brokerage Earned',
    'Total Transaction Value': 'Total Transaction Value',
    'Active Merchants': 'Active Merchants',
    'Open Ledger Detail': 'Open Ledger Detail',
    'Ledger Management': 'Ledger Management',
    'Brokerage Dashboard': 'Brokerage Dashboard',
    'Top Buyers': 'Top Buyers',
    'Top Sellers': 'Top Sellers',
    'Coming Soon': 'Coming Soon',
    'Audit Ledger Management': 'Audit Ledger Management',
    'Monthly Sales Performance': 'Monthly Sales Performance',
    'Product Distribution': 'Product Distribution',
    
    // Payments
    'Brokerage Payments': 'Brokerage Payments',
    'Pending Payments': 'Pending Payments',
    'Receivable Payments': 'Receivable Payments',
    'Payment Dashboard': 'Payment Dashboard',
    'Total Pending': 'Total Pending',
    'Firm Name': 'Firm Name',
    'Total Bags': 'Total Bags',
    'Rate': 'Rate',
    'Net Brokerage': 'Net Brokerage',
    'Paid Amount': 'Paid Amount',
    'Pending Amount': 'Pending Amount',
    'Status': 'Status',
    'Actions': 'Actions',
    'View Details': 'View Details',
    'Add Payment': 'Add Payment',
    
    // Merchants
    'Merchant Directory': 'Merchant Directory',
    'Add New Merchant': 'Add New Merchant',
    'Bulk Upload': 'Bulk Upload',
    'City': 'City',
    'Total Brokerage': 'Total Brokerage',
    'No Merchants Found': 'No Merchants Found',
    
    // Products
    'Product Catalog': 'Product Catalog',
    'Add New Product': 'Add New Product',
    'No Products Found': 'No Products Found',
    
    // Profile
    'Broker Information': 'Broker Information',
    'Broker ID': 'Broker ID',
    'Name': 'Name',
    'Username': 'Username',
    'Phone': 'Phone',
    'Email': 'Email',
    'Address & Banking': 'Address & Banking',
    'Settings & Actions': 'Settings & Actions',
    'Change Password': 'Change Password',
    'Update Profile': 'Update Profile',
    'Verify Account': 'Verify Account',
    'Current Financial Year': 'Current Financial Year',
    'Quick Actions': 'Quick Actions',
    'Refresh Profile': 'Refresh Profile',
    
    // Addresses
    'Address Management': 'Address Management',
    'Route Explorer': 'Route Explorer',
    'Add Address': 'Add Address',
    
    // Calendar
    'Analytics Overview': 'Analytics Overview',
    
    // Audit Ledger
    'Manage financial years, track transactions, and audit your business records with our comprehensive ledger system.': 'Manage financial years, track transactions, and audit your business records with our comprehensive ledger system.',
    'Financial Year Management': 'Financial Year Management',
    'Transaction Tracking': 'Transaction Tracking',
    'Audit Reports': 'Audit Reports',
    'Start managing your financial records': 'Start managing your financial records',
    
    // All Services
    'All services will be available here soon.': 'All services will be available here soon.',
    
    // Financial Years
    'Financial Year Management': 'Financial Year Management',
    'Manage your financial years': 'Manage your financial years',
    'Add Financial Year': 'Add Financial Year',
    'Year Name': 'Year Name',
    'Start Date': 'Start Date',
    'End Date': 'End Date',
    'Set as Current': 'Set as Current',
    
    // Daily Ledger
    'Daily Ledger': 'Daily Ledger',
    'Transaction Details': 'Transaction Details',
    'Date': 'Date',
    'Seller': 'Seller',
    'Buyer': 'Buyer',
    'Product': 'Product',
    'Quantity': 'Quantity',
    'Price': 'Price',
    'Amount': 'Amount',
    
    // Brokerage
    'User Brokerage Details': 'User Brokerage Details',
    'Brokerage Summary': 'Brokerage Summary',
    'Total Earned': 'Total Earned',
    'Pending Collection': 'Pending Collection',
    'Collected': 'Collected',
    'Per Bag Rate': 'Per Bag Rate',
    'Total Bags': 'Total Bags',
    
    // Grain Analytics
    'Grain Analytics': 'Grain Analytics',
    'Market Trends': 'Market Trends',
    'Price Analysis': 'Price Analysis',
    'Supply & Demand': 'Supply & Demand',
    'Forecast': 'Forecast',
  },
  te: {
    // Navigation
    'Dashboard': 'డాష్బోర్డ్',
    'Main Dashboard': 'ప్రధాన డాష్బోర్డ్',
    'Overview': 'అవలోకనం',
    'Analytics': 'విశ్లేషణలు',
    'Grain Analytics': 'ధాన్యం విశ్లేషణలు',
    'Payments': 'చెల్లింపులు',
    'Merchants': 'వ్యాపారులు',
    'Products': 'ఉత్పత్తులు',
    'Addresses': 'చిరునామాలు',
    'Profile': 'ప్రొఫైల్',
    'All Services': 'అన్ని సేవలు',
    'Profile Settings': 'ప్రొఫైల్ సెట్టింగ్లు',
    'Brokerage': 'బ్రోకరేజ్',
    'Ledger': 'లెడ్జర్',
    'Entities': 'సంస్థలు',
    'About': 'గురించి',
    'User Brokerage': 'యూజర్ బ్రోకరేజ్',
    'Bulk Operations': 'బల్క్ కార్యకలాపాలు',
    'Daily Ledger': 'రోజువారీ లెడ్జర్',
    'Calendar View': 'క్యాలెండర్ వీక్షణ',
    'JSON Transaction Input': 'JSON లావాదేవీ ఇన్పుట్',
    'Payment Management': 'చెల్లింపు నిర్వహణ',
    'Financial Years': 'ఆర్థిక సంవత్సరాలు',
    'Create Merchant': 'వ్యాపారి సృష్టించండి',
    'Phone Directory': 'ఫోన్ డైరెక్టరీ',
    'About BrokerHub': 'బ్రోకర్హబ్ గురించి',
    'Logout': 'లాగ్అవుట్',
    'NAVIGATION': 'నావిగేషన్',
    
    // Common
    'Welcome back': 'తిరిగి స్వాగతం',
    'Loading...': 'లోడ్ అవుతోంది...',
    'Save': 'సేవ్ చేయండి',
    'Cancel': 'రద్దు చేయండి',
    'Edit': 'సవరించండి',
    'Delete': 'తొలగించండి',
    'Add': 'జోడించండి',
    'Search': 'వెతకండి',
    'Filter': 'ఫిల్టర్',
    'Export': 'ఎగుమతి',
    'Import': 'దిగుమతి',
    'Refresh': 'రిఫ్రెష్',
    'Back': 'వెనుకకు',
    'Next': 'తదుపరి',
    'Previous': 'మునుపటి',
    'Submit': 'సమర్పించండి',
    'Close': 'మూసివేయండి',
    'View': 'చూడండి',
    
    // Dashboard
    'BrokerHub Dashboard': 'బ్రోకర్హబ్ డాష్బోర్డ్',
    'Total Sales': 'మొత్తం అమ్మకాలు',
    'Total Quantity': 'మొత్తం పరిమాణం',
    'Total Transactions': 'మొత్తం లావాదేవీలు',
    'Total Brokerage Earned': 'మొత్తం బ్రోకరేజ్ సంపాదన',
    'Total Transaction Value': 'మొత్తం లావాదేవీ విలువ',
    'Active Merchants': 'క్రియాశీల వ్యాపారులు',
    'Open Ledger Detail': 'లెడ్జర్ వివరాలు తెరవండి',
    'Ledger Management': 'లెడ్జర్ నిర్వహణ',
    'Brokerage Dashboard': 'బ్రోకరేజ్ డాష్బోర్డ్',
    'Top Buyers': 'టాప్ కొనుగోలుదారులు',
    'Top Sellers': 'టాప్ అమ్మకందారులు',
    'Coming Soon': 'త్వరలో వస్తోంది',
    'Audit Ledger Management': 'ఆడిట్ లెడ్జర్ నిర్వహణ',
    'Monthly Sales Performance': 'నెలవారీ అమ్మకాల పనితీరు',
    'Product Distribution': 'ఉత్పత్తి పంపిణీ',
    
    // Payments
    'Brokerage Payments': 'బ్రోకరేజ్ చెల్లింపులు',
    'Pending Payments': 'పెండింగ్ చెల్లింపులు',
    'Receivable Payments': 'స్వీకరించదగిన చెల్లింపులు',
    'Payment Dashboard': 'చెల్లింపు డాష్బోర్డ్',
    'Total Pending': 'మొత్తం పెండింగ్',
    'Firm Name': 'సంస్థ పేరు',
    'Total Bags': 'మొత్తం సంచులు',
    'Rate': 'రేటు',
    'Net Brokerage': 'నికర బ్రోకరేజ్',
    'Paid Amount': 'చెల్లించిన మొత్తం',
    'Pending Amount': 'పెండింగ్ మొత్తం',
    'Status': 'స్థితి',
    'Actions': 'చర్యలు',
    'View Details': 'వివరాలు చూడండి',
    'Add Payment': 'చెల్లింపు జోడించండి',
    
    // Merchants
    'Merchant Directory': 'వ్యాపారుల డైరెక్టరీ',
    'Add New Merchant': 'కొత్త వ్యాపారి జోడించండి',
    'Bulk Upload': 'బల్క్ అప్లోడ్',
    'City': 'నగరం',
    'Total Brokerage': 'మొత్తం బ్రోకరేజ్',
    'No Merchants Found': 'వ్యాపారులు కనుగొనబడలేదు',
    
    // Products
    'Product Catalog': 'ఉత్పత్తి జాబితా',
    'Add New Product': 'కొత్త ఉత్పత్తి జోడించండి',
    'No Products Found': 'ఉత్పత్తులు కనుగొనబడలేదు',
    
    // Profile
    'Broker Information': 'బ్రోకర్ సమాచారం',
    'Broker ID': 'బ్రోకర్ ID',
    'Name': 'పేరు',
    'Username': 'యూజర్నేమ్',
    'Phone': 'ఫోన్',
    'Email': 'ఇమెయిల్',
    'Address & Banking': 'చిరునామా & బ్యాంకింగ్',
    'Settings & Actions': 'సెట్టింగ్లు & చర్యలు',
    'Change Password': 'పాస్వర్డ్ మార్చండి',
    'Update Profile': 'ప్రొఫైల్ అప్డేట్ చేయండి',
    'Verify Account': 'ఖాతా ధృవీకరించండి',
    'Current Financial Year': 'ప్రస్తుత ఆర్థిక సంవత్సరం',
    'Quick Actions': 'త్వరిత చర్యలు',
    'Refresh Profile': 'ప్రొఫైల్ రిఫ్రెష్ చేయండి',
    
    // Addresses
    'Address Management': 'చిరునామా నిర్వహణ',
    'Route Explorer': 'రూట్ ఎక్స్ప్లోరర్',
    'Add Address': 'చిరునామా జోడించండి',
    
    // Calendar
    'Analytics Overview': 'విశ్లేషణల అవలోకనం',
    
    // Audit Ledger
    'Manage financial years, track transactions, and audit your business records with our comprehensive ledger system.': 'మా సమగ్ర లెడ్జర్ వ్యవస్థతో ఆర్థిక సంవత్సరాలను నిర్వహించండి, లావాదేవీలను ట్రాక్ చేయండి మరియు మీ వ్యాపార రికార్డులను ఆడిట్ చేయండి.',
    'Financial Year Management': 'ఆర్థిక సంవత్సర నిర్వహణ',
    'Transaction Tracking': 'లావాదేవీ ట్రాకింగ్',
    'Audit Reports': 'ఆడిట్ నివేదికలు',
    'Start managing your financial records': 'మీ ఆర్థిక రికార్డులను నిర్వహించడం ప్రారంభించండి',
    
    // All Services
    'All services will be available here soon.': 'అన్ని సేవలు త్వరలో ఇక్కడ అందుబాటులో ఉంటాయి.',
    
    // Financial Years
    'Manage your financial years': 'మీ ఆర్థిక సంవత్సరాలను నిర్వహించండి',
    'Add Financial Year': 'ఆర్థిక సంవత్సరం జోడించండి',
    'Year Name': 'సంవత్సర పేరు',
    'Start Date': 'ప్రారంభ తేదీ',
    'End Date': 'ముగింపు తేదీ',
    'Set as Current': 'ప్రస్తుతంగా సెట్ చేయండి',
    
    // Daily Ledger
    'Transaction Details': 'లావాదేవీ వివరాలు',
    'Date': 'తేదీ',
    'Seller': 'అమ్మకందారుడు',
    'Buyer': 'కొనుగోలుదారుడు',
    'Product': 'ఉత్పత్తి',
    'Quantity': 'పరిమాణం',
    'Price': 'ధర',
    'Amount': 'మొత్తం',
    
    // Brokerage
    'User Brokerage Details': 'యూజర్ బ్రోకరేజ్ వివరాలు',
    'Brokerage Summary': 'బ్రోకరేజ్ సారాంశం',
    'Total Earned': 'మొత్తం సంపాదన',
    'Pending Collection': 'పెండింగ్ సేకరణ',
    'Collected': 'సేకరించబడింది',
    'Per Bag Rate': 'ప్రతి సంచి రేటు',
    
    // Grain Analytics
    'Market Trends': 'మార్కెట్ ట్రెండ్స్',
    'Price Analysis': 'ధర విశ్లేషణ',
    'Supply & Demand': 'సరఫరా & డిమాండ్',
    'Forecast': 'అంచనా',
  }
};

export default translations;
