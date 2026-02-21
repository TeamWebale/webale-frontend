/**
 * currencyConverter.js
 * Destination: src/utils/currencyConverter.js
 *
 * - CURRENCIES exported as array (used in dropdowns)
 * - CURRENCY_DATA internal object (rates + formatting)
 * - Emoji flags replaced with text codes [US] [UG] etc. for Windows compatibility
 */

// Internal data — rates are hardcoded (TODO: integrate live rate API)
const CURRENCY_DATA = {
  USD: { code: "USD", name: "US Dollar",        flag: "[US]", symbol: "$",  rate: 1.000 },
  UGX: { code: "UGX", name: "Ugandan Shilling", flag: "[UG]", symbol: "USh", rate: 3750  },
  KES: { code: "KES", name: "Kenyan Shilling",  flag: "[KE]", symbol: "KSh", rate: 129   },
  TZS: { code: "TZS", name: "Tanzanian Shilling",flag:"[TZ]", symbol: "TSh", rate: 2550  },
  RWF: { code: "RWF", name: "Rwandan Franc",    flag: "[RW]", symbol: "RF",  rate: 1250  },
  NGN: { code: "NGN", name: "Nigerian Naira",   flag: "[NG]", symbol: "₦",  rate: 1580  },
  GHS: { code: "GHS", name: "Ghanaian Cedi",    flag: "[GH]", symbol: "₵",  rate: 15.2  },
  ZAR: { code: "ZAR", name: "South African Rand",flag:"[ZA]", symbol: "R",  rate: 18.6  },
  GBP: { code: "GBP", name: "British Pound",    flag: "[GB]", symbol: "£",  rate: 0.79  },
  EUR: { code: "EUR", name: "Euro",              flag: "[EU]", symbol: "€",  rate: 0.92  },
  CAD: { code: "CAD", name: "Canadian Dollar",  flag: "[CA]", symbol: "CA$", rate: 1.36 },
  AUD: { code: "AUD", name: "Australian Dollar",flag: "[AU]", symbol: "A$",  rate: 1.53 },
  INR: { code: "INR", name: "Indian Rupee",     flag: "[IN]", symbol: "₹",  rate: 83.1  },
  JPY: { code: "JPY", name: "Japanese Yen",     flag: "[JP]", symbol: "¥",  rate: 149   },
  CNY: { code: "CNY", name: "Chinese Yuan",     flag: "[CN]", symbol: "¥",  rate: 7.24  },
};

// Map country names → default currency code
const COUNTRY_CURRENCY = {
  "Uganda":         "UGX",
  "Kenya":          "KES",
  "Tanzania":       "TZS",
  "Rwanda":         "RWF",
  "Nigeria":        "NGN",
  "Ghana":          "GHS",
  "South Africa":   "ZAR",
  "United Kingdom": "GBP",
  "United States":  "USD",
  "Canada":         "CAD",
  "Australia":      "AUD",
  "India":          "INR",
  "Japan":          "JPY",
  "China":          "CNY",
  "Germany":        "EUR",
  "France":         "EUR",
};

// ── Exported array for dropdowns ──────────────────────────────────
export const CURRENCIES = Object.values(CURRENCY_DATA);

// ── Get default currency from user's country ──────────────────────
export function getCurrencyForCountry(country) {
  return COUNTRY_CURRENCY[country] || "USD";
}

// ── Convert amount between currencies ────────────────────────────
export function convertCurrency(amount, fromCode, toCode) {
  const from = CURRENCY_DATA[fromCode];
  const to   = CURRENCY_DATA[toCode];
  if (!from || !to || isNaN(amount)) return 0;
  // Convert to USD first, then to target
  const usd = parseFloat(amount) / from.rate;
  return Math.round(usd * to.rate * 100) / 100;
}

// ── Format amount with currency symbol ───────────────────────────
export function formatCurrency(amount, code) {
  const c = CURRENCY_DATA[code];
  if (!c) return `${amount}`;
  return `${c.symbol}${Number(amount).toLocaleString()}`;
}

// ── Get single currency data ──────────────────────────────────────
export function getCurrencyData(code) {
  return CURRENCY_DATA[code] || null;
}

// ── Backward-compatible alias used by Dashboard / GroupDetails ────
export function getCurrencySymbol(code) {
  return CURRENCY_DATA[code]?.symbol || "$";
}

export default CURRENCY_DATA;
