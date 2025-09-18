import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('english');

  const handleEmailClick = () => {
    window.open('mailto:tarunbatchu2000@gmail.com?subject=BrokerHub Support Request', '_blank');
  };

  const handlePhoneClick = () => {
    window.open('tel:+918332827443', '_blank');
  };

  const handleBugReport = () => {
    window.open('mailto:tarunbatchu2000@gmail.com?subject=BrokerHub Bug Report&body=Please describe the bug you encountered:', '_blank');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'telugu' : 'english');
  };

  const navigateToPage = (path) => {
    navigate(path);
  };

  const features = {
    english: [
      {
        title: "Dashboard",
        icon: "🏠",
        description: "Main control center showing overview of all activities, transactions, and key metrics.",
        howToAccess: "Click 'Dashboard' in navigation menu or use shortcut Alt+D",
        path: "/dashboard"
      },
      {
        title: "Brokerage Management",
        icon: "💰",
        description: "Manage user brokerage rates, bulk operations, and commission calculations.",
        howToAccess: "Navigation → Brokerage → User Brokerage or Bulk Operations",
        path: "/brokerage"
      },
      {
        title: "Ledger Management",
        icon: "📋",
        description: "Track daily transactions, view calendar-based entries, and manage financial records.",
        howToAccess: "Navigation → Ledger → Ledger Management",
        path: "/ledger-management"
      },
      {
        title: "Payment Management",
        icon: "💳",
        description: "Handle payments, track pending amounts, and manage receivables.",
        howToAccess: "Navigation → Payments → Payment Management",
        path: "/payments"
      },
      {
        title: "Merchants",
        icon: "🏢",
        description: "Add, edit, and manage merchant information and their transaction history.",
        howToAccess: "Navigation → Entities → Merchants",
        path: "/merchants"
      },
      {
        title: "Products",
        icon: "🌾",
        description: "Manage product catalog, pricing, and inventory for trading operations.",
        howToAccess: "Navigation → Entities → Products",
        path: "/products"
      },
      {
        title: "Calendar View",
        icon: "📅",
        description: "View transactions and activities in a calendar format for better planning.",
        howToAccess: "Navigation → Ledger → Calendar View",
        path: "/calendar-view"
      },
      {
        title: "Financial Years",
        icon: "📈",
        description: "Manage financial year settings and generate year-end reports.",
        howToAccess: "Navigation → Entities → Financial Years",
        path: "/financial-years"
      }
    ],
    telugu: [
      {
        title: "డాష్‌బోర్డ్",
        icon: "🏠",
        description: "అన్ని కార్యకలాపాలు, లావాదేవీలు మరియు ముఖ్య మెట్రిక్స్ యొక్క అవలోకనను చూపించే ప్రధాన నియంత్రణ కేంద్రం.",
        howToAccess: "నావిగేషన్ మెనూలో 'డాష్‌బోర్డ్' క్లిక్ చేయండి లేదా Alt+D షార్ట్‌కట్ ఉపయోగించండి",
        path: "/dashboard"
      },
      {
        title: "బ్రోకరేజ్ నిర్వహణ",
        icon: "💰",
        description: "వినియోగదారు బ్రోకరేజ్ రేట్లు, బల్క్ ఆపరేషన్లు మరియు కమీషన్ లెక్కలను నిర్వహించండి.",
        howToAccess: "నావిగేషన్ → బ్రోకరేజ్ → యూజర్ బ్రోకరేజ్ లేదా బల్క్ ఆపరేషన్స్",
        path: "/brokerage"
      },
      {
        title: "లెడ్జర్ నిర్వహణ",
        icon: "📋",
        description: "రోజువారీ లావాదేవీలను ట్రాక్ చేయండి, క్యాలెండర్ ఆధారిత ఎంట్రీలను వీక్షించండి మరియు ఆర్థిక రికార్డులను నిర్వహించండి.",
        howToAccess: "నావిగేషన్ → లెడ్జర్ → లెడ్జర్ మేనేజ్‌మెంట్",
        path: "/ledger-management"
      },
      {
        title: "చెల్లింపు నిర్వహణ",
        icon: "💳",
        description: "చెల్లింపులను నిర్వహించండి, పెండింగ్ మొత్తాలను ట్రాక్ చేయండి మరియు రిసీవబుల్స్‌ను నిర్వహించండి.",
        howToAccess: "నావిగేషన్ → పేమెంట్స్ → పేమెంట్ మేనేజ్‌మెంట్",
        path: "/payments"
      },
      {
        title: "వ్యాపారులు",
        icon: "🏢",
        description: "వ్యాపారుల సమాచారం మరియు వారి లావాదేవీల చరిత్రను జోడించండి, సవరించండి మరియు నిర్వహించండి.",
        howToAccess: "నావిగేషన్ → ఎంటిటీస్ → మర్చంట్స్",
        path: "/merchants"
      },
      {
        title: "ఉత్పత్తులు",
        icon: "🌾",
        description: "వ్యాపార కార్యకలాపాల కోసం ఉత్పత్తి కేటలాగ్, ధర మరియు ఇన్వెంటరీని నిర్వహించండి.",
        howToAccess: "నావిగేషన్ → ఎంటిటీస్ → ప్రొడక్ట్స్",
        path: "/products"
      },
      {
        title: "క్యాలెండర్ వ్యూ",
        icon: "📅",
        description: "మెరుగైన ప్రణాళిక కోసం క్యాలెండర్ ఫార్మాట్‌లో లావాదేవీలు మరియు కార్యకలాపాలను వీక్షించండి.",
        howToAccess: "నావిగేషన్ → లెడ్జర్ → క్యాలెండర్ వ్యూ",
        path: "/calendar-view"
      },
      {
        title: "ఆర్థిక సంవత్సరాలు",
        icon: "📈",
        description: "ఆర్థిక సంవత్సర సెట్టింగ్‌లను నిర్వహించండి మరియు సంవత్సరాంతపు నివేదికలను రూపొందించండి.",
        howToAccess: "నావిగేషన్ → ఎంటిటీస్ → ఫైనాన్షియల్ ఇయర్స్",
        path: "/financial-years"
      }
    ]
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      padding: '20px',
      paddingTop: '80px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: theme.cardBackground,
        borderRadius: '12px',
        padding: '40px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          borderBottom: `2px solid ${theme.border}`,
          paddingBottom: '30px'
        }}>
          <h1 style={{
            color: theme.textPrimary,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
          }}>
            <span>🏢</span>
            BrokerHub
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '1.2rem',
            margin: 0
          }}>
            Professional Brokerage Management Software
          </p>
        </div>

        {/* About Software */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '1.5rem',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>💼</span>
            About BrokerHub
          </h2>
          <p style={{
            color: theme.textSecondary,
            lineHeight: '1.6',
            fontSize: '1rem'
          }}>
            BrokerHub is a comprehensive multi-user brokerage management software designed specifically for brokers. 
            It provides powerful tools for managing transactions, payments, ledgers, merchants, and financial operations 
            with an intuitive and modern interface.
          </p>
        </div>

        {/* Developer Info */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '1.5rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>👨‍💻</span>
            Developer Information
          </h2>
          
          <div style={{
            background: theme.hoverBg,
            padding: '25px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              color: theme.textPrimary,
              fontSize: '1.3rem',
              margin: '0 0 15px 0',
              fontWeight: '600'
            }}>
              Designed & Developed by BATCHU TARUN
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: theme.cardBackground,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={handlePhoneClick}
              onMouseEnter={(e) => e.target.style.background = theme.border}
              onMouseLeave={(e) => e.target.style.background = theme.cardBackground}
              >
                <span style={{ fontSize: '1.2rem' }}>📞</span>
                <span style={{ color: theme.textPrimary, fontWeight: '500' }}>
                  Phone: +91 8332827443
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: theme.cardBackground,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={handleEmailClick}
              onMouseEnter={(e) => e.target.style.background = theme.border}
              onMouseLeave={(e) => e.target.style.background = theme.cardBackground}
              >
                <span style={{ fontSize: '1.2rem' }}>📧</span>
                <span style={{ color: theme.textPrimary, fontWeight: '500' }}>
                  Email: tarunbatchu2000@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: theme.textPrimary,
              fontSize: '1.5rem',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📚</span>
              {language === 'english' ? 'How to Use BrokerHub' : 'బ్రోకర్‌హబ్ ఎలా ఉపయోగించాలి'}
            </h2>
            
            <button
              onClick={toggleLanguage}
              style={{
                background: theme.buttonPrimary,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🌐</span>
              {language === 'english' ? 'తెలుగు' : 'English'}
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gap: '15px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
          }}>
            {features[language].map((feature, index) => (
              <div key={index} style={{
                background: theme.hoverBg,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => navigateToPage(feature.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme.shadowModal;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                  <h3 style={{
                    color: theme.textPrimary,
                    fontSize: '1.1rem',
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    {feature.title}
                  </h3>
                </div>
                
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  margin: '0 0 12px 0'
                }}>
                  {feature.description}
                </p>
                
                <div style={{
                  background: theme.cardBackground,
                  padding: '10px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.border}`
                }}>
                  <p style={{
                    color: theme.textPrimary,
                    fontSize: '0.8rem',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    <span style={{ color: theme.buttonPrimary }}>📍 {language === 'english' ? 'Access:' : 'యాక్సెస్:'}</span> {feature.howToAccess}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '25px',
            padding: '20px',
            background: theme.cardBackground,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              color: theme.textPrimary,
              fontSize: '1.1rem',
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⌨️</span>
              {language === 'english' ? 'Quick Tips' : 'త్వరిత చిట్కాలు'}
            </h3>
            
            <ul style={{
              color: theme.textSecondary,
              fontSize: '0.9rem',
              lineHeight: '1.6',
              margin: 0,
              paddingLeft: '20px'
            }}>
              <li>{language === 'english' ? 'Use the ⚙️ button (top-right) to access all features quickly' : 'అన్ని ఫీచర్లను త్వరగా యాక్సెస్ చేయడానికి ⚙️ బటన్ (టాప్-రైట్) ఉపయోగించండి'}</li>
              <li>{language === 'english' ? 'Click on any feature card above to navigate directly to that section' : 'ఆ విభాగానికి నేరుగా వెళ్లడానికి పైన ఉన్న ఏదైనా ఫీచర్ కార్డ్‌పై క్లిక్ చేయండి'}</li>
              <li>{language === 'english' ? 'Use the theme toggle (☀️/🌙) to switch between light and dark modes' : 'లైట్ మరియు డార్క్ మోడ్‌ల మధ్య మారడానికి థీమ్ టోగుల్ (☀️/🌙) ఉపయోగించండి'}</li>
              <li>{language === 'english' ? 'All data is automatically saved as you work' : 'మీరు పని చేస్తున్నప్పుడు అన్ని డేటా స్వయంచాలకంగా సేవ్ చేయబడుతుంది'}</li>
            </ul>
          </div>
        </div>

        {/* Bug Report Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '1.5rem',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>🐛</span>
            Report Issues
          </h2>
          
          <div style={{
            background: theme.hoverBg,
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            textAlign: 'center'
          }}>
            <p style={{
              color: theme.textSecondary,
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Found a bug or need support? We're here to help! Click the button below to report issues or request assistance.
            </p>
            
            <button
              onClick={handleBugReport}
              style={{
                background: theme.buttonPrimary,
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <span>📧</span>
              Report Bug / Get Support
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          paddingTop: '30px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <p style={{
            color: theme.textSecondary,
            fontSize: '0.9rem',
            margin: '0 0 10px 0'
          }}>
            © {new Date().getFullYear()} BrokerHub. All rights reserved.
          </p>
          <p style={{
            color: theme.textSecondary,
            fontSize: '0.8rem',
            margin: 0
          }}>
            Developed with ❤️ by BATCHU TARUN
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;