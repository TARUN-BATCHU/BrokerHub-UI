import React, { useEffect, useMemo, useState } from 'react';
import { contactsAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';

const EmptyState = ({ title, subtitle, actionLabel, onAction }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      gap: '8px'
    }}>
      <div style={{ fontSize: '40px' }}>📇</div>
      <div style={{ fontWeight: 700 }}>{title}</div>
      {subtitle && <div style={{ opacity: 0.7, fontSize: '13px', textAlign: 'center' }}>{subtitle}</div>}
      {onAction && (
        <button onClick={onAction} style={{ marginTop: '8px' }}>{actionLabel || 'Add'}</button>
      )}
    </div>
  );
};

const Chip = ({ label, onRemove }) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 10px',
      borderRadius: '999px',
      background: 'rgba(0,0,0,0.06)',
      fontSize: '12px'
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          opacity: 0.7
        }}>✕</button>
      )}
    </span>
  );
};

const PhoneDirectory = () => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [currentSections, setCurrentSections] = useState([]);
  const [sectionBreadcrumb, setSectionBreadcrumb] = useState([]); // array of {id, sectionName}
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Section modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ id: null, sectionName: '', description: '', parentSectionId: '' });

  // Contact modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const emptyContact = { id: null, userName: '', firmName: '', gstNumber: '', additionalInfo: '', sectionIds: [], phoneNumbers: [{ phoneNumber: '', phoneType: 'Primary' }], addresses: [{ address: '', city: '', state: '', pincode: '', addressType: 'Shop' }] };
  const [contactForm, setContactForm] = useState(emptyContact);

  const loadSections = async () => {
    try {
      const resRoot = await contactsAPI.getRootSections();
      const rootData = resRoot?.data || resRoot;
      setSections(Array.isArray(rootData) ? rootData : []);
      setCurrentSections(Array.isArray(rootData) ? rootData : []);
      setSectionBreadcrumb([]);
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'Failed to load sections');
    }
  };

  const openSection = async (section) => {
    try {
      setError(null);
      setSelectedSectionId(section?.id || null);
      const res = await contactsAPI.getChildSections(section.id);
      const children = res?.data || res;
      setCurrentSections(Array.isArray(children) ? children : []);
      setSectionBreadcrumb(prev => [...prev, { id: section.id, sectionName: section.sectionName }]);
      setPage(0);
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'Failed to open section');
    }
  };

  const goToBreadcrumbIndex = async (index) => {
    try {
      // index = -1 means go to root
      setError(null);
      if (index < 0) {
        const resRoot = await contactsAPI.getRootSections();
        const rootData = resRoot?.data || resRoot;
        setCurrentSections(Array.isArray(rootData) ? rootData : []);
        setSectionBreadcrumb([]);
        setSelectedSectionId(null);
        setPage(0);
        return;
      }
      const target = sectionBreadcrumb[index];
      const res = await contactsAPI.getChildSections(target.id);
      const children = res?.data || res;
      setCurrentSections(Array.isArray(children) ? children : []);
      setSectionBreadcrumb(sectionBreadcrumb.slice(0, index + 1));
      setSelectedSectionId(target.id);
      setPage(0);
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'Failed to navigate');
    }
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      if (query?.trim()) {
        const res = await contactsAPI.searchContacts(query, page, size);
        const payload = res?.data || res;
        const paged = payload?.content ? payload : { content: payload || [], totalPages: 1 };
        setContacts(paged.content || []);
        setTotalPages(paged.totalPages || 1);
      } else if (selectedSectionId) {
        const res = await contactsAPI.getContactsBySection(selectedSectionId);
        const data = res?.data || res;
        setContacts(Array.isArray(data) ? data : []);
        setTotalPages(1);
      } else {
        const res = await contactsAPI.getPaginatedContacts(page, size);
        const payload = res?.data || res;
        const paged = payload?.content ? payload : { content: payload || [], totalPages: 1 };
        setContacts(paged.content || []);
        setTotalPages(paged.totalPages || 1);
      }
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    loadContacts();
  }, [query, page, size, selectedSectionId]);

  const onClearFilters = () => {
    setQuery('');
    setSelectedSectionId(null);
    setPage(0);
    // reset sections view to root
    (async () => {
      try {
        const resRoot = await contactsAPI.getRootSections();
        const rootData = resRoot?.data || resRoot;
        setCurrentSections(Array.isArray(rootData) ? rootData : []);
        setSectionBreadcrumb([]);
      } catch {}
    })();
  };

  const sectionMap = useMemo(() => {
    const byId = {};
    sections.forEach(s => { byId[s.id] = s; });
    return byId;
  }, [sections]);

  return (
    <div style={{
      padding: isMobile ? '12px' : '20px',
      marginTop: isMobile ? '52px' : '64px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => { setSectionForm({ id: null, sectionName: '', description: '', parentSectionId: '' }); setIsSectionModalOpen(true); }} style={{
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: theme.buttonPrimary,
            color: 'white',
            padding: '10px 12px',
            cursor: 'pointer'
          }}>➕ New Section</button>
          <button onClick={() => { setContactForm(emptyContact); setIsContactModalOpen(true); }} style={{
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: theme.modalBackground,
            color: theme.textPrimary,
            padding: '10px 12px',
            cursor: 'pointer'
          }}>👤 New Contact</button>
        </div>
        {/* Breadcrumbs for sections */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => goToBreadcrumbIndex(-1)} style={{ border: 'none', background: 'transparent', color: theme.buttonPrimary, cursor: 'pointer' }}>Root</button>
          {sectionBreadcrumb.map((b, idx) => (
            <React.Fragment key={b.id}>
              <span style={{ opacity: 0.5 }}>›</span>
              <button onClick={() => goToBreadcrumbIndex(idx)} style={{ border: 'none', background: 'transparent', color: theme.buttonPrimary, cursor: 'pointer' }}>{b.sectionName}</button>
            </React.Fragment>
          ))}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr auto',
          gap: '8px'
        }}>
          <input
            placeholder="Search by name, firm or GST"
            value={query}
            onChange={(e) => { setPage(0); setQuery(e.target.value); }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: theme.cardBackground,
              color: theme.textPrimary
            }}
          />
          <select
            value={selectedSectionId || ''}
            onChange={(e) => { setPage(0); setSelectedSectionId(e.target.value ? Number(e.target.value) : null); }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: theme.cardBackground,
              color: theme.textPrimary
            }}
          >
            <option value="">All Sections</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.sectionName}</option>
            ))}
          </select>
          <select
            value={size}
            onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: theme.cardBackground,
              color: theme.textPrimary
            }}
          >
            {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <button onClick={onClearFilters} style={{
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: theme.modalBackground,
            color: theme.textPrimary,
            padding: '10px 12px',
            cursor: 'pointer'
          }}>Clear</button>
        </div>
      </div>

      {/* Section grid for current level */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? '8px' : '10px',
        marginBottom: '12px'
      }}>
        {currentSections.map(sec => (
          <button key={sec.id} onClick={() => openSection(sec)} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '6px',
            borderRadius: '10px',
            border: `1px solid ${theme.border}`,
            background: theme.cardBackground,
            color: theme.textPrimary,
            padding: '10px',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: 18 }}>📁</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{sec.sectionName}</span>
            {sec.description && <span style={{ fontSize: 12, opacity: 0.7 }}>{sec.description}</span>}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: isMobile ? '10px' : '12px'
      }}>
        {loading && (
          <div style={{ padding: '16px' }}>Loading...</div>
        )}
        {!loading && error && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${theme.error}`,
            color: theme.error
          }}>{error}</div>
        )}
        {!loading && !error && contacts.length === 0 && (
          <div style={{
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            background: theme.cardBackground
          }}>
            <EmptyState title="No contacts found" subtitle="Try adjusting your filters or add new contacts." />
          </div>
        )}

        {!loading && !error && contacts.map(contact => (
          <div key={contact.id} style={{
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            background: theme.cardBackground,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: theme.hoverBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>👤</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{contact.userName}</div>
                  {contact.firmName && <div style={{ fontSize: '12px', opacity: 0.7 }}>{contact.firmName}</div>}
                </div>
              </div>
              {Array.isArray(contact.sectionNames) && contact.sectionNames.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {contact.sectionNames.slice(0, 2).map(name => (
                    <Chip key={name} label={name} />
                  ))}
                  {contact.sectionNames.length > 2 && (
                    <Chip label={`+${contact.sectionNames.length - 2}`} />
                  )}
                </div>
              )}
            </div>

            {Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {contact.phoneNumbers.map(p => (
                  <a key={p.id || p.phoneNumber} href={`tel:${p.phoneNumber}`} style={{
                    textDecoration: 'none'
                  }}>
                    <span style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.modalBackground,
                      fontSize: '13px'
                    }}>📞 {p.phoneNumber}{p.phoneType ? ` · ${p.phoneType}` : ''}</span>
                  </a>
                ))}
              </div>
            )}

            {Array.isArray(contact.addresses) && contact.addresses.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {contact.addresses.slice(0, 2).map(a => (
                  <span key={a.id || a.address} style={{ fontSize: '12px', opacity: 0.8 }}>📍 {a.address}{a.city ? `, ${a.city}` : ''}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {Array.isArray(contact.phoneNumbers) && contact.phoneNumbers[0] && (
                <a href={`https://wa.me/${contact.phoneNumbers[0].phoneNumber}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    background: theme.buttonPrimary,
                    color: 'white',
                    padding: '8px 10px',
                    cursor: 'pointer'
                  }}>WhatsApp</button>
                </a>
              )}
              <button onClick={() => { setContactForm({
                id: contact.id,
                userName: contact.userName || '',
                firmName: contact.firmName || '',
                gstNumber: contact.gstNumber || '',
                additionalInfo: contact.additionalInfo || '',
                sectionIds: contact.sectionIds || [],
                phoneNumbers: Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0 ? contact.phoneNumbers.map(p => ({ id: p.id, phoneNumber: p.phoneNumber, phoneType: p.phoneType || 'Primary' })) : [{ phoneNumber: '', phoneType: 'Primary' }],
                addresses: Array.isArray(contact.addresses) && contact.addresses.length > 0 ? contact.addresses.map(a => ({ id: a.id, address: a.address, city: a.city, state: a.state, pincode: a.pincode, addressType: a.addressType || 'Shop' })) : [{ address: '', city: '', state: '', pincode: '', addressType: 'Shop' }]
              }); setIsContactModalOpen(true); }} style={{
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.modalBackground,
                color: theme.textPrimary,
                padding: '8px 10px',
                cursor: 'pointer'
              }}>View</button>
              <button onClick={async () => {
                if (!window.confirm('Delete this contact?')) return;
                try {
                  await contactsAPI.deleteContact(contact.id);
                  loadContacts();
                } catch (e) {
                  setError(typeof e === 'string' ? e : e?.message || 'Delete failed');
                }
              }} style={{
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.modalBackground,
                color: theme.error,
                padding: '8px 10px',
                cursor: 'pointer'
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: theme.modalBackground,
            color: theme.textPrimary,
            padding: '8px 10px',
            cursor: page === 0 ? 'not-allowed' : 'pointer'
          }}>Prev</button>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', opacity: 0.7 }}>Page {page + 1} of {totalPages}</div>
          <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)} style={{
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: theme.modalBackground,
            color: theme.textPrimary,
            padding: '8px 10px',
            cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer'
          }}>Next</button>
        </div>
      )}

      {/* Sections Manager Modal */}
      {isSectionModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
          <div style={{ width: isMobile ? '92%' : 560, maxHeight: '80vh', overflow: 'auto', background: theme.modalBackground, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>Manage Sections</div>
              <button onClick={() => setIsSectionModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Section Name</div>
                <input value={sectionForm.sectionName} onChange={(e) => setSectionForm(f => ({ ...f, sectionName: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Parent Section</div>
                <select value={sectionForm.parentSectionId || ''} onChange={(e) => setSectionForm(f => ({ ...f, parentSectionId: e.target.value ? Number(e.target.value) : '' }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }}>
                  <option value="">None (Root)</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Description</div>
                <textarea value={sectionForm.description} onChange={(e) => setSectionForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setIsSectionModalOpen(false)} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.modalBackground, color: theme.textPrimary, padding: '8px 10px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => {
                try {
                  if (sectionForm.id) {
                    await contactsAPI.updateSection(sectionForm.id, { sectionName: sectionForm.sectionName, description: sectionForm.description });
                  } else {
                    await contactsAPI.createSection({ sectionName: sectionForm.sectionName, description: sectionForm.description, parentSectionId: sectionForm.parentSectionId || null });
                  }
                  await loadSections();
                  setIsSectionModalOpen(false);
                } catch (e) {
                  setError(typeof e === 'string' ? e : e?.message || 'Save failed');
                }
              }} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.buttonPrimary, color: 'white', padding: '8px 10px', cursor: 'pointer' }}>{sectionForm.id ? 'Update' : 'Create'}</button>
            </div>
            <div style={{ marginTop: 12, borderTop: `1px solid ${theme.border}`, paddingTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>All Sections</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {sections.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '8px 10px', background: theme.cardBackground }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontWeight: 600 }}>{s.sectionName}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{s.parentSectionName ? `Child of ${s.parentSectionName}` : 'Root'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setSectionForm({ id: s.id, sectionName: s.sectionName || '', description: s.description || '', parentSectionId: s.parentSectionId || '' })} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.modalBackground, color: theme.textPrimary, padding: '6px 8px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={async () => {
                        if (!window.confirm('Delete this section?')) return;
                        try {
                          await contactsAPI.deleteSection(s.id);
                          await loadSections();
                        } catch (e) {
                          setError(typeof e === 'string' ? e : e?.message || 'Delete failed');
                        }
                      }} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.modalBackground, color: theme.error, padding: '6px 8px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Editor Modal */}
      {isContactModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
          <div style={{ width: isMobile ? '92%' : 720, maxHeight: '82vh', overflow: 'auto', background: theme.modalBackground, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{contactForm.id ? 'Edit Contact' : 'New Contact'}</div>
              <button onClick={() => setIsContactModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>User Name *</div>
                <input value={contactForm.userName} onChange={(e) => setContactForm(f => ({ ...f, userName: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Firm Name</div>
                <input value={contactForm.firmName} onChange={(e) => setContactForm(f => ({ ...f, firmName: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>GST Number</div>
                <input value={contactForm.gstNumber} onChange={(e) => setContactForm(f => ({ ...f, gstNumber: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Sections *</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {sections.map(s => (
                    <label key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground }}>
                      <input
                        type="checkbox"
                        checked={contactForm.sectionIds.includes(s.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setContactForm(f => ({ ...f, sectionIds: checked ? [...f.sectionIds, s.id] : f.sectionIds.filter(id => id !== s.id) }));
                        }}
                      />
                      <span style={{ fontSize: 12 }}>{s.sectionName}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Additional Info</div>
                <textarea value={contactForm.additionalInfo} onChange={(e) => setContactForm(f => ({ ...f, additionalInfo: e.target.value }))} rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Phone Numbers *</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {contactForm.phoneNumbers.map((p, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr auto', gap: 8, alignItems: 'center' }}>
                    <input value={p.phoneNumber} onChange={(e) => setContactForm(f => {
                      const next = [...f.phoneNumbers];
                      next[idx] = { ...next[idx], phoneNumber: e.target.value };
                      return { ...f, phoneNumbers: next };
                    })} placeholder="Phone Number" style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
                    <select value={p.phoneType || 'Primary'} onChange={(e) => setContactForm(f => {
                      const next = [...f.phoneNumbers];
                      next[idx] = { ...next[idx], phoneType: e.target.value };
                      return { ...f, phoneNumbers: next };
                    })} style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }}>
                      {['Primary', 'Secondary', 'WhatsApp'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => setContactForm(f => ({ ...f, phoneNumbers: f.phoneNumbers.filter((_, i) => i !== idx) }))} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.modalBackground, color: theme.error, padding: '8px 10px', cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
                <button onClick={() => setContactForm(f => ({ ...f, phoneNumbers: [...f.phoneNumbers, { phoneNumber: '', phoneType: 'Primary' }] }))} style={{ width: 'fit-content', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.modalBackground, color: theme.textPrimary, padding: '8px 10px', cursor: 'pointer' }}>+ Add Phone</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Addresses</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {contactForm.addresses.map((a, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                    <input value={a.address} onChange={(e) => setContactForm(f => { const next = [...f.addresses]; next[idx] = { ...next[idx], address: e.target.value }; return { ...f, addresses: next }; })} placeholder="Address" style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
                    <input value={a.city || ''} onChange={(e) => setContactForm(f => { const next = [...f.addresses]; next[idx] = { ...next[idx], city: e.target.value }; return { ...f, addresses: next }; })} placeholder="City" style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
                    <input value={a.state || ''} onChange={(e) => setContactForm(f => { const next = [...f.addresses]; next[idx] = { ...next[idx], state: e.target.value }; return { ...f, addresses: next }; })} placeholder="State" style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
                    <input value={a.pincode || ''} onChange={(e) => setContactForm(f => { const next = [...f.addresses]; next[idx] = { ...next[idx], pincode: e.target.value }; return { ...f, addresses: next }; })} placeholder="Pincode" style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }} />
                    <select value={a.addressType || 'Shop'} onChange={(e) => setContactForm(f => { const next = [...f.addresses]; next[idx] = { ...next[idx], addressType: e.target.value }; return { ...f, addresses: next }; })} style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.cardBackground, color: theme.textPrimary }}>
                      {['Shop', 'Home', 'Service Area'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => setContactForm(f => ({ ...f, addresses: f.addresses.filter((_, i) => i !== idx) }))} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.modalBackground, color: theme.error, padding: '8px 10px', cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
                <button onClick={() => setContactForm(f => ({ ...f, addresses: [...f.addresses, { address: '', city: '', state: '', pincode: '', addressType: 'Shop' }] }))} style={{ width: 'fit-content', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.modalBackground, color: theme.textPrimary, padding: '8px 10px', cursor: 'pointer' }}>+ Add Address</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => setIsContactModalOpen(false)} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.modalBackground, color: theme.textPrimary, padding: '8px 10px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => {
                try {
                  const payload = { ...contactForm };
                  // Basic validation
                  if (!payload.userName?.trim()) { setError('User name is required'); return; }
                  if (!payload.sectionIds || payload.sectionIds.length === 0) { setError('Select at least one section'); return; }
                  if (!Array.isArray(payload.phoneNumbers) || payload.phoneNumbers.length === 0 || !payload.phoneNumbers[0].phoneNumber?.trim()) { setError('At least one phone number is required'); return; }
                  if (payload.id) {
                    await contactsAPI.updateContact(payload.id, payload);
                  } else {
                    await contactsAPI.createContact(payload);
                  }
                  setIsContactModalOpen(false);
                  await loadContacts();
                } catch (e) {
                  setError(typeof e === 'string' ? e : e?.message || 'Save failed');
                }
              }} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.buttonPrimary, color: 'white', padding: '8px 10px', cursor: 'pointer' }}>{contactForm.id ? 'Update Contact' : 'Create Contact'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneDirectory;


