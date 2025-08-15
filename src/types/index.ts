export interface User {
  name: string;
  avatar: string;
  email: string;
  displayName: string;
}

export interface Users {
  [key: string]: User;
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  claimedBy: string | null;
}

export interface Item {
  id: string;
  title: string;
  images: { gcsUrl: string; analysis: any; }[]; 
  totalPayable: number;
  balance: number; 
  claimed: boolean; 
  date: string;
  uploaderId: string;
  participantIds: string[];
  users: Users;
}

export interface Receipt {
  id: string;
  title: string;
  date: string;
  images: { gcsUrl: string; analysis: any; }[];
  uploaderId: string;
  participantIds: string[];
  items: ReceiptItem[];
  users: Users;
  totalAmount: number;
  createdAt: string;
  tax: number;
  serviceCharge: number;
}