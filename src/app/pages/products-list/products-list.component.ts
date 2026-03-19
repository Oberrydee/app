import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ProductResponse } from 'src/app/models/product.models';
import { CartService } from 'src/app/modules/components/cart/cart.service';
import { ProductService } from 'src/app/modules/components/product/product.service';

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
  cartCount$ = this.cartService.cartCount$;
  pendingProductId: number | null = null;

  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCart();
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

  trackByProductId(_: number, product: ProductResponse): number {
    return product.id;
  }


}
