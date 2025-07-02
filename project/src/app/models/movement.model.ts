export interface StockMovement {
  id: number;
  productId: number;
  product?: Product;
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
  userId: number;
  user?: User;
  createdAt: Date;
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER'
}

export interface CreateMovementRequest {
  productId: number;
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
}

import { Product } from './product.model';
import { User } from './user.model';