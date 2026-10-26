export interface PriceItem {
  plan: string;
  entry: string;
  installments: string;
  total: string;
  notes: string;
}

export interface DocumentInfoItem {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface ResponseSuggestion {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  mapLink: string;
  coverImage: string;
  status: 'published' | 'draft' | 'archived';
  updatedAt: string;
  prices: PriceItem[];
  photos: string[];
  videos: string[];
  documents: DocumentInfoItem[];
}

export interface Realtor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'deactivated';
  createdAt: string;
  lastLogin: string | null;
}

export interface User {
  userId: string;
  email: string;
  role: 'admin' | 'corretor';
  name: string;
}
