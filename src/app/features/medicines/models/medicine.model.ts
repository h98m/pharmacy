export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  supplierName: string;
  description: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  isLowStock: boolean;
  expiryDate: string;
  isExpired: boolean;
  batchNumber: string;
  requiresPrescription: boolean;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}