import { ProductResponse } from './product.models';

export interface WishlistToggleResult {
  productId: number;
  action: 'added' | 'removed';
  productIds: number[];
}

export interface WishlistProductItem {
  product: ProductResponse;
}
