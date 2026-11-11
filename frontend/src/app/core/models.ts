export type Role = 'ADMIN' | 'ORG_CONTACT' | 'MEMBER';
export type OrgType = 'COLLEGE' | 'COMPANY';
export type OrgStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  organizationId: number | null;
  organizationName: string | null;
  organizationType: OrgType | null;
}

export interface LoginResponse { token: string; user: User; }
export interface MessageResponse { message: string; }

export interface Organization {
  id: number;
  name: string;
  type: OrgType;
  status: OrgStatus;
  createdAt: string;
}

export interface Equipment {
  id: number;
  assetCode: string;
  name: string;
  category: string;
  description: string;
  location: string;
  ratePerDay: number;
  organizationId: number;
  organizationName: string;
}

export interface UnavailablePeriod {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface Availability { available: boolean; message: string; }

export interface Booking {
  id: number;
  equipmentId: number;
  equipmentName: string;
  assetCode: string;
  requesterName: string;
  requesterOrganization: string | null;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: BookingStatus;
}
