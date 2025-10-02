// Validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(phone);
};

export const validatePincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/; // Indian pincode format
  return pincodeRegex.test(pincode);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateIFSC = (ifsc) => {
  const ifscRegex = /^[A-Z]{4}[0-9]{7}$/;
  return ifscRegex.test(ifsc);
};

export const validateAccountNumber = (accountNumber) => {
  // Account number should be 9-18 digits
  const accountRegex = /^\d{9,18}$/;
  return accountRegex.test(accountNumber);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().trim().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().trim().length <= maxLength;
};

// Form validation for broker registration
export const validateBrokerForm = (formData) => {
  const errors = {};

  // Username validation
  if (!validateRequired(formData.userName)) {
    errors.userName = 'Username is required';
  } else if (!validateMinLength(formData.userName, 3)) {
    errors.userName = 'Username must be at least 3 characters';
  } else if (!validateMaxLength(formData.userName, 20)) {
    errors.userName = 'Username must be less than 20 characters';
  }

  // Password validation
  if (!validateRequired(formData.password)) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  // Confirm password validation
  if (!validateRequired(formData.confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Broker name validation
  if (!validateRequired(formData.brokerName)) {
    errors.brokerName = 'Broker name is required';
  } else if (!validateMinLength(formData.brokerName, 2)) {
    errors.brokerName = 'Broker name must be at least 2 characters';
  }

  // Brokerage firm name validation
  if (!validateRequired(formData.brokerageFirmName)) {
    errors.brokerageFirmName = 'Brokerage firm name is required';
  }

  // Email validation
  if (!validateRequired(formData.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation
  if (!validateRequired(formData.phoneNumber)) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!validatePhone(formData.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid 10-digit mobile number';
  }

  // Pincode validation
  if (!validateRequired(formData.pincode)) {
    errors.pincode = 'Pincode is required';
  } else if (!validatePincode(formData.pincode)) {
    errors.pincode = 'Please enter a valid 6-digit pincode';
  }

  // Bank details validation
  if (!validateRequired(formData.bankName)) {
    errors.bankName = 'Bank name is required';
  }

  if (!validateRequired(formData.accountNumber)) {
    errors.accountNumber = 'Account number is required';
  } else if (!validateAccountNumber(formData.accountNumber)) {
    errors.accountNumber = 'Please enter a valid account number (9-18 digits)';
  }

  if (!validateRequired(formData.ifscCode)) {
    errors.ifscCode = 'IFSC code is required';
  } else if (!validateIFSC(formData.ifscCode)) {
    errors.ifscCode = 'Please enter a valid IFSC code';
  }

  if (!validateRequired(formData.branch)) {
    errors.branch = 'Branch name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Login form validation
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.userName)) {
    errors.userName = 'Username is required';
  }

  if (!validateRequired(formData.password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

