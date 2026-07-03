export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:5000';

export const ROLES = {
  TENANT: 'TENANT',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
};

export const STATUS_COLORS = {
  ACTIVE: '#10b981',   // Emerald
  PENDING: '#f59e0b',  // Amber
  ACCEPTED: '#3b82f6', // Blue
  REJECTED: '#ef4444', // Red
  FILLED: '#8b5cf6',   // Purple
  HIDDEN: '#6b7280',   // Gray
};

export const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
];
