export interface SaleItemRequest {
  medicineId: string;
  quantity: number;
}

export interface SaleRequest {
  customerId: string | null;
  items: SaleItemRequest[];
  discount: number;
  taxRate: number;
  paymentMethod: 'cash' | 'card' | 'insurance';
  prescriptionUrl: string | null;
}

export interface SaleItemResult {
  medicineId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string | null;
  customerName: string | null;
  soldById: string;
  soldByName: string;
  items: SaleItemResult[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'insurance';
  prescriptionUrl: string | null;
  status: string;
  createdAt: string;
}