export interface Address {
  id: string;
  customerId: string;
  label: string | null;
  governorate: string;
  city: string;
  district: string | null;
  street: string | null;
  nearestLandmark: string | null;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressWritePayload {
  label?: string;
  governorate: string;
  city: string;
  district?: string;
  street?: string;
  nearestLandmark?: string;
  phone?: string;
  isDefault?: boolean;
}
