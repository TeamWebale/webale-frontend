// ============================================================
// ENHANCED CURRENCY CONVERTER UTILITY
// Features: IP-based detection, exchange rates, auto-conversion
// Location: frontend/src/utils/currencyConverter.js
// ============================================================

// Comprehensive currency data
const CURRENCY_DATA = {
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  UGX: { symbol: 'USh', name: 'Ugandan Shilling', flag: '🇺🇬' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
  TZS: { symbol: 'TSh', name: 'Tanzanian Shilling', flag: '🇹🇿' },
  RWF: { symbol: 'FRw', name: 'Rwandan Franc', flag: '🇷🇼' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  ZAR: { symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  ETB: { symbol: 'Br', name: 'Ethiopian Birr', flag: '🇪🇹' },
  CDF: { symbol: 'FC', name: 'Congolese Franc', flag: '🇨🇩' },
  SSP: { symbol: 'SSP', name: 'South Sudanese Pound', flag: '🇸🇸' },
  BIF: { symbol: 'FBu', name: 'Burundian Franc', flag: '🇧🇮' },
};

// Array format for dropdowns (used by CreateGroup.jsx and others)
export const CURRENCIES = Object.entries(CURRENCY_DATA).map(([code, info]) => ({
  code,
  symbol: info.symbol,
  name: info.name,
  flag: info.flag,
  label: `${info.flag} ${code} - ${info.name} (${info.symbol})`
}));

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
  US: 'USD', UG: 'UGX', KE: 'KES', TZ: 'TZS', RW: 'RWF',
  NG: 'NGN', GH: 'GHS', ZA: 'ZAR', GB: 'GBP', DE: 'EUR',
  FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
  CA: 'CAD', AU: 'AUD', IN: 'INR', CN: 'CNY', JP: 'JPY',
  BR: 'BRL', ET: 'ETB', CD: 'CDF', SS: 'SSP', BI: 'BIF',
};

// Approximate exchange rates to USD (updated periodically)
// In production, these would come from an API like exchangerate-api.com
const EXCHANGE_RATES_TO_USD = {
  USD: 1,
  UGX: 3750,
  KES: 155,
  TZS: 2650,
  RWF: 1350,
  NGN: 1600,
  GHS: 15.5,
  ZAR: 18.5,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.55,
  INR: 83.5,
  CNY: 7.25,
  JPY: 150,
  BRL: 5.0,
  ETB: 57,
  CDF: 2800,
  SSP: 1300,
  BIF: 2900,
};

/**
 * Get currency symbol for a given currency code
 */
export const getCurrencySymbol = (code) => {
  return CURRENCY_DATA[code]?.symbol || code;
};

/**
 * Get full currency info
 */
export const getCurrencyInfo = (code) => {
  return CURRENCY_DATA[code] || { symbol: code, name: code, flag: '🌍' };
};

/**
 * Get all supported currencies as array
 */
export const getAllCurrencies = () => {
  return CURRENCIES;
};

/**
 * Convert amount between currencies
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {{ converted: number, rate: number, display: string }}
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || fromCurrency === toCurrency) {
    return { converted: amount, rate: 1, display: '' };
  }

  const fromRate = EXCHANGE_RATES_TO_USD[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES_TO_USD[toCurrency] || 1;

  // Convert: from -> USD -> to
  const amountInUSD = amount / fromRate;
  const converted = amountInUSD * toRate;
  const rate = toRate / fromRate;

  const toSymbol = getCurrencySymbol(toCurrency);
  const display = `≈ ${toSymbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  return { converted, rate, display };
};

/**
 * Detect user's country and default currency from IP
 * Uses free ipapi.co service (no API key needed, 1000 req/day)
 * Caches result in localStorage
 */
export const detectUserCurrency = async () => {
  // Check cache first
  const cached = localStorage.getItem('webale_detected_currency');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Cache for 24 hours
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed;
      }
    } catch (e) { /* ignore parse errors */ }
  }

  try {
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    const data = await response.json();

    const countryCode = data.country_code || data.country || 'US';
    const currencyCode = COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
    const result = {
      country: countryCode,
      countryName: data.country_name || countryCode,
      currency: currencyCode,
      currencyInfo: getCurrencyInfo(currencyCode),
      city: data.city || '',
      timestamp: Date.now()
    };

    // Cache result
    localStorage.setItem('webale_detected_currency', JSON.stringify(result));
    return result;
  } catch (err) {
    console.log('Currency detection fallback to USD:', err.message);
    // Fallback: check user profile for country
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.country) {
        const code = user.country.toUpperCase().substring(0, 2);
        const currencyCode = COUNTRY_CURRENCY_MAP[code] || 'USD';
        return {
          country: code,
          countryName: user.country,
          currency: currencyCode,
          currencyInfo: getCurrencyInfo(currencyCode),
          city: '',
          timestamp: Date.now()
        };
      }
    } catch (e) { /* ignore */ }

    return {
      country: 'US',
      countryName: 'United States',
      currency: 'USD',
      currencyInfo: getCurrencyInfo('USD'),
      city: '',
      timestamp: Date.now()
    };
  }
};

/**
 * Format amount with currency
 */
export const formatCurrencyAmount = (amount, currencyCode) => {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = parseFloat(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol}${formatted}`;
};

export default {
  getCurrencySymbol,
  getCurrencyInfo,
  getAllCurrencies,
  convertCurrency,
  detectUserCurrency,
  formatCurrencyAmount,
  CURRENCIES,
  EXCHANGE_RATES_TO_USD,
  COUNTRY_CURRENCY_MAP
};
