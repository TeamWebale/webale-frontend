import { useState, useEffect } from 'react';

function AdvancedFilter({ pledges, members, onFilterChange, groupCurrency = 'USD' }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    member: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    sortBy: 'date_desc',
    searchTerm: ''
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.member !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.amountMin) count++;
    if (filters.amountMax) count++;
    if (filters.searchTerm) count++;
    setActiveFilterCount(count);

    // Apply filters
    applyFilters();
  }, [filters, pledges]);

  const applyFilters = () => {
    let filtered = [...pledges];

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        (p.first_name?.toLowerCase().includes(term)) ||
        (p.last_name?.toLowerCase().includes(term)) ||
        (p.email?.toLowerCase().includes(term)) ||
        (p.notes?.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Member filter
    if (filters.member !== 'all') {
      filtered = filtered.filter(p => p.user_id === parseInt(filters.member));
    }

    // Date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(p => new Date(p.created_at) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59);
      filtered = filtered.filter(p => new Date(p.created_at) <= toDate);
    }

    // Amount range
    if (filters.amountMin) {
      filtered = filtered.filter(p => parseFloat(p.amount) >= parseFloat(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(p => parseFloat(p.amount) <= parseFloat(filters.amountMax));
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'amount_asc':
          return parseFloat(a.amount) - parseFloat(b.amount);
        case 'amount_desc':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'name_asc':
          return (a.first_name || '').localeCompare(b.first_name || '');
        case 'name_desc':
          return (b.first_name || '').localeCompare(a.first_name || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    onFilterChange(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      member: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      sortBy: 'date_desc',
      searchTerm: ''
    });
  };

  const getCurrencySymbol = () => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', UGX: 'UGX ', KES: 'KES ' };
    return symbols[groupCurrency] || groupCurrency + ' ';
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Search Bar & Filter Toggle */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: showFilters ? '16px' : '0' }}>
        {/* Search */}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search pledges by name, email, notes..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="input"
            style={{ paddingLeft: '16px', paddingRight: '40px' }}
          />
          {filters.searchTerm && (
            <button
              onClick={() => handleFilterChange('searchTerm', '')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#a0aec0',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn"
          style={{
            background: activeFilterCount > 0 ? '#667eea' : '#e2e8f0',
            color: activeFilterCount > 0 ? 'white' : '#4a5568',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative'
          }}
        >
          🎛️ Filters
          {activeFilterCount > 0 && (
            <span style={{
              background: 'white',
              color: '#667eea',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="input"
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="date_desc">📅 Newest First</option>
          <option value="date_asc">📅 Oldest First</option>
          <option value="amount_desc">💰 Highest Amount</option>
          <option value="amount_asc">💰 Lowest Amount</option>
          <option value="name_asc">👤 Name A-Z</option>
          <option value="name_desc">👤 Name Z-A</option>
          <option value="status">📊 By Status</option>
        </select>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div style={{
          padding: '20px',
          background: '#f7fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="partial">📊 Partial</option>
                <option value="paid">✅ Paid</option>
                <option value="overdue">⚠️ Overdue</option>
              </select>
            </div>

            {/* Member Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
                Member
              </label>
              <select
                value={filters.member}
                onChange={(e) => handleFilterChange('member', e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="all">All Members</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>

            {/* Date To */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>

            {/* Min Amount */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
                Min Amount ({getCurrencySymbol().trim()})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                className="input"
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </div>

            {/* Max Amount */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
                Max Amount ({getCurrencySymbol().trim()})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                className="input"
                placeholder="No limit"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#e53e3e',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✕ Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AdvancedFilter;
