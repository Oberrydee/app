import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ProductResponse } from 'src/app/models/product.models';
import { CartService } from 'src/app/modules/components/cart/cart.service';
import { ProductService } from 'src/app/modules/components/product/product.service';
import { WishlistService } from 'src/app/modules/components/wishlist/wishlist.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  products: ProductResponse[] = [];
  isLoading = false;
  pageError = '';
  cartFeedback = '';
  wishlistFeedback = '';
  cartCount$ = this.cartService.cartCount$;
  wishlistCount$ = this.wishlistService.wishlistCount$;
  wishlistProductIds = new Set<number>();
  pendingProductId: number | null = null;
  pendingWishlistProductId: number | null = null;

  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCart();
    this.loadWishlist();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.pageError = '';

    this.productService.getAll().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error: HttpErrorResponse) => {
        this.pageError = 'Impossible de charger le catalogue.\n '+error.message;
      }
    });
  }

  loadCart(): void {
    this.cartService.loadCurrentUserCart().subscribe({
      error: (error: HttpErrorResponse | Error) => {
        this.pageError = 'Impossible de charger le panier.\n '+error.message;
      }
    });
  }

  addToCart(product: ProductResponse): void {
    this.pendingProductId = product.id;
    this.cartFeedback = '';
    this.wishlistFeedback = '';
    this.pageError = '';

    this.cartService.addProduct(product.id).pipe(
      finalize(() => {
        this.pendingProductId = null;
      })
    ).subscribe({
      next: () => {
        this.cartFeedback = `${product.name} a ete ajoute au panier.`;
      },
      error: (error: HttpErrorResponse | Error) => {
        this.pageError = 'Impossible d ajouter le produit au panier.\n '+error.message;
      }
    });
  }

  loadWishlist(): void {
    this.wishlistService.loadCurrentUserWishlist().subscribe({
      next: (productIds) => {
        this.wishlistProductIds = new Set(productIds);
      },
      error: (error: Error) => {
        this.pageError = 'Impossible de charger la wishlist.\n ' + error.message;
      }
    });
  }

  toggleWishlist(product: ProductResponse): void {
    this.pendingWishlistProductId = product.id;
    this.cartFeedback = '';
    this.wishlistFeedback = '';
    this.pageError = '';

    this.wishlistService.toggleProduct(product.id).pipe(
      finalize(() => {
        this.pendingWishlistProductId = null;
      })
    ).subscribe({
      next: (result) => {
        this.wishlistProductIds = new Set(result.productIds);
        this.wishlistFeedback = result.action === 'added'
          ? `${product.name} a ete ajoute a la wishlist.`
          : `${product.name} a ete retire de la wishlist.`;
      },
      error: (error: Error) => {
        this.pageError = 'Impossible de mettre a jour la wishlist.\n ' + error.message;
      }
    });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistProductIds.has(productId);
  }

  trackByProductId(_: number, product: ProductResponse): number {
    return product.id;
  }

}
