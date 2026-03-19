import { ProductResponse } from './product.models';

export interface CartItemRequest {
  cartId: number;
  productId: number;
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartProductItem {
  cartItemId: number;
  quantity: number;
  product: ProductResponse;
}
