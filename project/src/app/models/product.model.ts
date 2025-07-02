export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  unit: string;
  supplierId: number;
  supplier?: Supplier;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplierId: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}