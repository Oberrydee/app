import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CartProductItem } from 'src/app/models/cart.models';
import { ProductResponse } from 'src/app/models/product.models';
import { CartService } from 'src/app/modules/components/cart/cart.service';
import { ProductService } from 'src/app/modules/components/product/product.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartProductItem[] = [];
  isLoading = false;
  pageError = '';

  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  get totalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  get totalAmount(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  loadCart(): void {
    this.isLoading = true;
    this.pageError = '';

    forkJoin({
      cartItems: this.cartService.loadCurrentUserCart(),
      products: this.productService.getAll()
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: ({ cartItems, products }) => {
        this.cartItems = this.mapCartProducts(cartItems, products);
      },
      error: (error: HttpErrorResponse) => {
        this.pageError = 'Impossible de charger le panier.\n '+error.message;
      }
    });
  }

  removeItem(item: CartProductItem): void {
    this.pageError = '';

    this.cartService.removeItem(item.cartItemId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter((cartItem) => cartItem.cartItemId !== item.cartItemId);
      },
      error: (error: HttpErrorResponse) => {
        this.pageError = 'Impossible de retirer le produit du panier.\n '+error.message;
      }
    });
  }

  trackByCartItemId(_: number, item: CartProductItem): number {
    return item.cartItemId;
  }

  private mapCartProducts(cartItems: Array<{ id: number; productId: number; quantity: number }>, products: ProductResponse[]): CartProductItem[] {
    return cartItems.reduce<CartProductItem[]>((items, cartItem) => {
      const product = products.find((entry) => entry.id === cartItem.productId);
      if (!product) {
        return items;
      }

      items.push({
        cartItemId: cartItem.id,
        quantity: cartItem.quantity,
        product
      });

      return items;
    }, []);
  }


}
