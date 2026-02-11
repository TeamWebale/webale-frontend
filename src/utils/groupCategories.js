export const GROUP_CATEGORIES = [
  { value: 'general', label: 'General Fundraising', icon: '💰', color: '#667eea' },
  { value: 'medical', label: 'Medical & Healthcare', icon: '🏥', color: '#e53e3e' },
  { value: 'education', label: 'Education & Learning', icon: '📚', color: '#38b2ac' },
  { value: 'community', label: 'Community Projects', icon: '🏘️', color: '#48bb78' },
  { value: 'emergency', label: 'Emergency Relief', icon: '🚨', color: '#ed8936' },
  { value: 'sports', label: 'Sports & Recreation', icon: '⚽', color: '#9f7aea' },
  { value: 'arts', label: 'Arts & Culture', icon: '🎨', color: '#f6ad55' },
  { value: 'environment', label: 'Environment & Nature', icon: '🌱', color: '#48bb78' },
  { value: 'technology', label: 'Technology & Innovation', icon: '💻', color: '#4299e1' },
  { value: 'charity', label: 'Charity & Nonprofit', icon: '❤️', color: '#fc8181' },
  { value: 'business', label: 'Business & Startups', icon: '💼', color: '#805ad5' },
  { value: 'event', label: 'Events & Celebrations', icon: '🎉', color: '#ecc94b' },
];

export const getCategoryByValue = (value) => {
  return GROUP_CATEGORIES.find(cat => cat.value === value) || GROUP_CATEGORIES[0];
};

export const getCategoryIcon = (value) => {
  const category = getCategoryByValue(value);
  return category.icon;
};

export const getCategoryColor = (value) => {
  const category = getCategoryByValue(value);
  return category.color;
};