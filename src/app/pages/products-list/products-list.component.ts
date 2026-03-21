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
  categoryDropdownOpen = false;
  sortOption: 'priceAsc' | 'priceDesc' | 'createdAtAsc' | 'createdAtDesc' = 'createdAtDesc';
  itemsPerPage = 10;
  currentPage = 1;
  priceFloor = 0;
  priceCeil = 0;
  currentPriceMin = 0;
  currentPriceMax = 0;
  cartCount$ = this.cartService.cartCount$;
  wishlistCount$ = this.wishlistService.wishlistCount$;
  wishlistProductIds = new Set<number>();
  selectedCategories = new Set<string>();
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
        this.initializeCatalogueControls(products);
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
        this.cartFeedback = `${product.name} a été ajouté au panier.`;
      },
      error: (error: HttpErrorResponse | Error) => {
        this.pageError = 'Impossible d\'ajouter le produit au panier.\n '+error.message;
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
          ? `${product.name} a été ajouté à la wishlist.`
          : `${product.name} a été retiré de la wishlist.`;
      },
      error: (error: Error) => {
        this.pageError = 'Impossible de mettre à jour la wishlist.\n ' + error.message;
      }
    });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistProductIds.has(productId);
  }

  get availableCategories(): string[] {
    return [...new Set(this.products.map((product) => product.category).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  }

  get filteredProducts(): ProductResponse[] {
    return this.products.filter((product) => {
      const matchesCategory = this.selectedCategories.size === 0 || this.selectedCategories.has(product.category);
      const matchesPrice = product.price >= this.currentPriceMin && product.price <= this.currentPriceMax;
      return matchesCategory && matchesPrice;
    });
  }

  get sortedProducts(): ProductResponse[] {
    const products = [...this.filteredProducts];

    switch (this.sortOption) {
      case 'priceAsc':
        return products.sort((left, right) => left.price - right.price);
      case 'priceDesc':
        return products.sort((left, right) => right.price - left.price);
      case 'createdAtAsc':
        return products.sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
      case 'createdAtDesc':
      default:
        return products.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedProducts.length / this.itemsPerPage));
  }

  get safeCurrentPage(): number {
    return Math.min(this.currentPage, this.totalPages);
  }

  get paginatedProducts(): ProductResponse[] {
    const startIndex = (this.safeCurrentPage - 1) * this.itemsPerPage;
    return this.sortedProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
  }

  toggleCategory(category: string): void {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }

    this.resetPagination();
  }

  clearCategories(): void {
    this.selectedCategories.clear();
    this.resetPagination();
  }

  setSortOption(option: 'priceAsc' | 'priceDesc' | 'createdAtAsc' | 'createdAtDesc'): void {
    this.sortOption = option;
    this.resetPagination();
  }

  setItemsPerPage(value: string): void {
    this.itemsPerPage = Math.max(1, Number(value) || 10);
    this.resetPagination();
  }

  setMinPrice(value: string): void {
    const nextValue = this.clampPrice(Number(value), this.priceFloor, this.currentPriceMax);
    this.currentPriceMin = nextValue;
    this.resetPagination();
  }

  setMaxPrice(value: string): void {
    const nextValue = this.clampPrice(Number(value), this.currentPriceMin, this.priceCeil);
    this.currentPriceMax = nextValue;
    this.resetPagination();
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  previousPage(): void {
    this.goToPage(this.safeCurrentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.safeCurrentPage + 1);
  }

  trackByProductId(_: number, product: ProductResponse): number {
    return product.id;
  }

  private initializeCatalogueControls(products: ProductResponse[]): void {
    if (products.length === 0) {
      this.priceFloor = 0;
      this.priceCeil = 0;
      this.currentPriceMin = 0;
      this.currentPriceMax = 0;
      this.currentPage = 1;
      return;
    }

    const prices = products.map((product) => product.price);
    this.priceFloor = Math.floor(Math.min(...prices));
    this.priceCeil = Math.ceil(Math.max(...prices));
    this.currentPriceMin = this.priceFloor;
    this.currentPriceMax = this.priceCeil;
    this.currentPage = 1;
  }

  private clampPrice(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) {
      return min;
    }

    return Math.min(Math.max(value, min), max);
  }

  private resetPagination(): void {
    this.currentPage = 1;
  }

}
