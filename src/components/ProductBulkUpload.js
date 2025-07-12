import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { productAPI } from '../services/api';
import LoadingButton from './LoadingButton';

const ProductBulkUpload = ({ isOpen, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setError('Please select a valid Excel file (.xlsx)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const result = await productAPI.bulkUpload(file);
      setUploadResult(result);
      if (result.successfulRecords > 0) {
        onSuccess && onSuccess();
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      setError(error.message || 'Failed to upload products. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError('');

    try {
      const blob = await productAPI.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      setError(error.message || 'Failed to download template. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: theme.shadowModal,
        border: `1px solid ${theme.border}`,
        transition: 'all 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `2px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📊
            </div>
            <div>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                Bulk Upload Products
              </h3>
              <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                Upload multiple products using Excel file
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              color: theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.errorBg;
              e.currentTarget.style.color = theme.error;
              e.currentTarget.style.borderColor = theme.error;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.textSecondary;
              e.currentTarget.style.borderColor = theme.border;
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Download Template Section */}
          <div style={{
            backgroundColor: theme.backgroundSecondary,
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${theme.border}`
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: theme.textPrimary, fontSize: '16px' }}>
              Step 1: Download Template
            </h4>
            <p style={{ margin: '0 0 12px 0', color: theme.textSecondary, fontSize: '14px' }}>
              Download the Excel template with sample data and instructions
            </p>
            <LoadingButton
              onClick={handleDownloadTemplate}
              loading={downloading}
              style={{
                padding: '8px 16px',
                border: `1px solid ${theme.buttonPrimary}`,
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: theme.buttonPrimary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Download Template
            </LoadingButton>
          </div>

          {/* Upload Section */}
          <div style={{
            backgroundColor: theme.backgroundSecondary,
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${theme.border}`
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: theme.textPrimary, fontSize: '16px' }}>
              Step 2: Upload File
            </h4>
            <p style={{ margin: '0 0 12px 0', color: theme.textSecondary, fontSize: '14px' }}>
              Select your completed Excel file to upload products
            </p>
            
            <div style={{
              border: `2px dashed ${theme.border}`,
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: theme.cardBackground,
              marginBottom: '12px'
            }}>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: theme.buttonPrimary,
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Choose File
              </label>
              {file && (
                <p style={{ margin: '8px 0 0 0', color: theme.textPrimary, fontSize: '14px' }}>
                  Selected: {file.name}
                </p>
              )}
            </div>

            <LoadingButton
              onClick={handleUpload}
              loading={uploading}
              disabled={!file}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: theme.success,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: file ? 'pointer' : 'not-allowed',
                opacity: file ? 1 : 0.6
              }}
            >
              Upload Products
            </LoadingButton>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: theme.errorBg,
              border: `1px solid ${theme.errorBorder}`,
              color: theme.error,
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div style={{
              backgroundColor: uploadResult.failedRecords > 0 ? theme.warningBg : theme.successBg,
              border: `1px solid ${uploadResult.failedRecords > 0 ? theme.warningBorder : theme.successBorder}`,
              color: uploadResult.failedRecords > 0 ? theme.warning : theme.success,
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Upload Results</h4>
              <p style={{ margin: '4px 0' }}>Total Records: {uploadResult.totalRecords}</p>
              <p style={{ margin: '4px 0' }}>Successful: {uploadResult.successfulRecords}</p>
              <p style={{ margin: '4px 0' }}>Failed: {uploadResult.failedRecords}</p>
              
              {uploadResult.errorMessages && uploadResult.errorMessages.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Error Details:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {uploadResult.errorMessages.map((error, index) => (
                      <li key={index} style={{ margin: '4px 0' }}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p style={{ margin: '12px 0 0 0', fontStyle: 'italic' }}>
                {uploadResult.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '10px 20px',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              backgroundColor: theme.cardBackground,
              color: theme.textPrimary,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductBulkUpload;