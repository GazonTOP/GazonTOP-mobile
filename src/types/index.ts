export type Pitch = {
  id: string;
  name: string;
  distance: string;
  format: string;
  surface: string;
  type: 'outdoor' | 'indoor';
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  instantBook: boolean;
  image: string;
  imageUrl: string;
  address: string;
  size?: string;
  lights?: string;
  amenities?: string[];
};

export type FilterType = 'All Venues' | '5-a-side' | '7-a-side' | 'Indoor' | 'Tennis';

export type TimeSlot = {
  id: string;
  time: string;
  period: 'AM' | 'PM';
  available: boolean;
};  