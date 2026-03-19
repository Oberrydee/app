import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProductResponse } from 'src/app/models/product.models';
import { WishlistProductItem } from 'src/app/models/wishlist.models';
import { ProductService } from 'src/app/modules/components/product/product.service';
import { WishlistService } from 'src/app/modules/components/wishlist/wishlist.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistProductItem[] = [];
  isLoading = false;
  pageError = '';

  constructor(
    private readonly wishlistService: WishlistService,
    private readonly productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  get totalItems(): number {
    return this.wishlistItems.length;
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.pageError = '';

    forkJoin({
      productIds: this.wishlistService.loadCurrentUserWishlist(),
      products: this.productService.getAll()
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: ({ productIds, products }) => {
        this.wishlistItems = this.mapWishlistProducts(productIds, products);
      },
      error: (error: Error) => {
        this.pageError = 'Impossible de charger la wishlist.\n ' + error.message;
      }
    });
  }

  removeProduct(product: ProductResponse): void {
    this.pageError = '';

    this.wishlistService.removeProduct(product.id).subscribe({
      next: (productIds) => {
        this.wishlistItems = this.wishlistItems.filter((item) => productIds.includes(item.product.id));
      },
      error: (error: Error) => {
        this.pageError = 'Impossible de retirer le produit de la wishlist.\n ' + error.message;
      }
    });
  }

  trackByProductId(_: number, item: WishlistProductItem): number {
    return item.product.id;
  }

  private mapWishlistProducts(productIds: number[], products: ProductResponse[]): WishlistProductItem[] {
    return productIds.reduce<WishlistProductItem[]>((items, productId) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product) {
        return items;
      }

      items.push({ product });
      return items;
    }, []);
  }

}
