export interface DashboardTotals {
  medicines: number;
  categories: number;
  suppliers: number;
  customers: number;
  lowStock: number;
  expiringSoon: number;
  outOfStock: number;
}

export interface DashboardRevenue {
  today: number;
  thisMonth: number;
  salesToday: number;
  averageBasket: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  count: number;
}

export interface TopSellingMedicine {
  medicineId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface CategoryStock {
  categoryId: string;
  name: string;
  stock: number;
  value: number;
}

export interface DashboardStats {
  totals: DashboardTotals;
  revenue: DashboardRevenue;
  salesLast7Days: DailySales[];
  topSelling: TopSellingMedicine[];
  stockByCategory: CategoryStock[];
}