import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import { marketAPI } from '../services/marketAPI';

// Dummy data for development and testing
const DUMMY_PRODUCTS = [
  {
    productId: "1",
    productName: "Premium Rice",
    quality: "Grade A",
    quantity: 1000,
    price: 50.00,
    description: "High-quality premium rice from local farmers",
    availableUntil: "2024-01-15T18:00:00Z",
    seller: {
      firmName: "ABC Traders",
      location: "Mumbai"
    }
  },
  {
    productId: "2",
    productName: "Organic Wheat",
    quality: "Premium",
    quantity: 500,
    price: 45.00,
    description: "Organic wheat from certified farmers",
    availableUntil: "2024-01-15T18:00:00Z",
    seller: {
      firmName: "XYZ Organics",
      location: "Pune"
    }
  },
  {
    productId: "3",
    productName: "Yellow Corn",
    quality: "Grade B",
    quantity: 750,
    price: 35.00,
    description: "Fresh yellow corn for animal feed",
    availableUntil: "2024-01-15T18:00:00Z",
    seller: {
      firmName: "PQR Agro",
      location: "Delhi"
    }
  }
];

const TodayMarket = ({ isBroker }) => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  
  const [marketProducts, setMarketProducts] = useState(DUMMY_PRODUCTS);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [buyerRequests, setBuyerRequests] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [newProduct, setNewProduct] = useState({
    productName: '',
    quality: '',
    quantity: '',
    price: '',
    description: '',
    availableUntil: ''
  });

  // Load market data
  useEffect(() => {
    const loadMarketData = async () => {
      setLoading(true);
      setError(null);
      try {
        // In development, use dummy data
        if (process.env.NODE_ENV === 'development') {
          setMarketProducts(DUMMY_PRODUCTS);
          setLoading(false);
          return;
        }

        const [products, sellerReqs, buyerReqs] = await Promise.all([
          marketAPI.getMarketProducts(),
          isBroker ? marketAPI.getSellerRequests() : Promise.resolve([]),
          isBroker ? marketAPI.getBuyerRequests() : Promise.resolve([])
        ]);
        setMarketProducts(products);
        setSellerRequests(sellerReqs);
        setBuyerRequests(buyerReqs);
      } catch (err) {
        setError(err.message || 'Failed to load market data');
        console.error('Error loading market data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
  }, [isBroker]);

  // Filter products based on search and filters
  const filteredProducts = marketProducts.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.seller.firmName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesQuality = selectedQuality === 'all' || product.quality === selectedQuality;
    const matchesLocation = selectedLocation === 'all' || product.seller.location === selectedLocation;

    return matchesSearch && matchesQuality && matchesLocation;
  });

  // Get unique quality and location options for filters
  const qualityOptions = ['all', ...new Set(marketProducts.map(p => p.quality))];
  const locationOptions = ['all', ...new Set(marketProducts.map(p => p.seller.location))];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      padding: '20px'
    }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          backgroundColor: theme.cardBackground,
          borderRadius: '8px',
          padding: '20px',
          height: '300px',
          animation: 'pulse 1.5s infinite',
          opacity: 0.7
        }}>
          <div style={{ width: '60%', height: '24px', backgroundColor: theme.border, marginBottom: '12px', borderRadius: '4px' }} />
          <div style={{ width: '40%', height: '16px', backgroundColor: theme.border, marginBottom: '8px', borderRadius: '4px' }} />
          <div style={{ width: '80%', height: '16px', backgroundColor: theme.border, marginBottom: '8px', borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  );

  // Error message component
  const ErrorMessage = ({ message }) => (
    <div style={{
      padding: '20px',
      backgroundColor: '#ffebee',
      color: '#c62828',
      borderRadius: '8px',
      margin: '20px',
      textAlign: 'center'
    }}>
      <h3>Error Loading Market Data</h3>
      <p>{message}</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          backgroundColor: '#c62828',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '12px'
        }}
      >
        Retry
      </button>
    </div>
  );

  // Product card component
  const ProductCard = ({ product }) => (
    <div style={{
      backgroundColor: theme.cardBackground,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <h3 style={{ color: theme.textPrimary, margin: 0 }}>{product.productName}</h3>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{
          backgroundColor: theme.buttonPrimary,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {product.quality}
        </span>
        <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
          {product.seller.location}
        </span>
      </div>
      <p style={{ color: theme.textSecondary, margin: 0, flex: 1 }}>
        {product.description}
      </p>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${theme.border}`,
        paddingTop: '12px'
      }}>
        <div>
          <div style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
            ₹{product.price.toFixed(2)}/unit
          </div>
          <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
            {product.quantity} units available
          </div>
        </div>
        <button
          onClick={() => alert('Contact seller functionality to be implemented')}
          style={{
            backgroundColor: theme.buttonPrimary,
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Contact Seller
        </button>
      </div>
    </div>
  );

  const [activeTab, setActiveTab] = useState('market');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '20px'
    }}>
      {/* Tab Navigation */}
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: theme.shadowCard,
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => setActiveTab('market')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'market' ? theme.buttonPrimary : 'transparent',
            color: activeTab === 'market' ? 'white' : theme.textPrimary,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Market
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'analytics' ? theme.buttonPrimary : 'transparent',
            color: activeTab === 'analytics' ? 'white' : theme.textPrimary,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'market' ? (
        <>
          {/* Search and Filters */}
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '8px',
        padding: '20px',
        boxShadow: theme.shadowCard
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr',
          gap: '16px',
          marginBottom: isMobile ? '16px' : '0'
        }}>
          <input
            type="text"
            placeholder="Search products, sellers, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.backgroundSecondary,
              color: theme.textPrimary
            }}
          />
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.backgroundSecondary,
              color: theme.textPrimary
            }}
          >
            <option value="all">All Qualities</option>
            {qualityOptions.filter(q => q !== 'all').map(quality => (
              <option key={quality} value={quality}>{quality}</option>
            ))}
          </select>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.backgroundSecondary,
              color: theme.textPrimary
            }}
          >
            <option value="all">All Locations</option>
            {locationOptions.filter(l => l !== 'all').map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
      </>
      ) : (
        /* Analytics Tab Content */
        <div style={{
          backgroundColor: theme.cardBackground,
          borderRadius: '8px',
          padding: '20px',
          boxShadow: theme.shadowCard
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {/* Market Overview Card */}
            <div style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '16px' }}>Market Overview</h3>
              <div style={{ color: theme.textSecondary }}>
                <p>Total Products: {marketProducts.length}</p>
                <p>Active Sellers: {new Set(marketProducts.map(p => p.seller.firmName)).size}</p>
                <p>Locations: {new Set(marketProducts.map(p => p.seller.location)).size}</p>
              </div>
            </div>

            {/* Quality Distribution Card */}
            <div style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '16px' }}>Quality Distribution</h3>
              <div style={{ color: theme.textSecondary }}>
                {qualityOptions.filter(q => q !== 'all').map(quality => {
                  const count = marketProducts.filter(p => p.quality === quality).length;
                  return (
                    <div key={quality} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{quality}:</span>
                      <span>{count} products</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Distribution Card */}
            <div style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '16px' }}>Location Distribution</h3>
              <div style={{ color: theme.textSecondary }}>
                {locationOptions.filter(l => l !== 'all').map(location => {
                  const count = marketProducts.filter(p => p.seller.location === location).length;
                  return (
                    <div key={location} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{location}:</span>
                      <span>{count} products</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Range Card */}
            <div style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '16px' }}>Price Analysis</h3>
              <div style={{ color: theme.textSecondary }}>
                {marketProducts.length > 0 && (
                  <>
                    <p>Lowest Price: ₹{Math.min(...marketProducts.map(p => p.price)).toFixed(2)}</p>
                    <p>Highest Price: ₹{Math.max(...marketProducts.map(p => p.price)).toFixed(2)}</p>
                    <p>Average Price: ₹{(marketProducts.reduce((acc, p) => acc + p.price, 0) / marketProducts.length).toFixed(2)}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayMarket;