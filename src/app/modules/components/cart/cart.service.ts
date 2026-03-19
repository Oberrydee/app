import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, switchMap, tap, throwError } from 'rxjs';
import { CartItemRequest, CartItemResponse } from 'src/app/models/cart.models';
import { AuthenticationService } from 'src/app/modules/authentication-module/authentication/authentication.service';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartUrl = `${environment.apiBaseUrl}/Cart`;
  private readonly cartItemsSubject = new BehaviorSubject<CartItemResponse[]>([]);

  readonly cartItems$ = this.cartItemsSubject.asObservable();
  readonly cartCount$ = this.cartItems$.pipe(
    map((items) => items.reduce((total, item) => total + item.quantity, 0))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly authenticationService: AuthenticationService
  ) {}

  getCurrentCartId(): number | null {
    const currentUser = this.authenticationService.getCurrentUserValue();

    // The backend creates one cart per user at registration time, but /Auth/me does not expose cartId.
    return currentUser?.id ?? null;
  }

  loadCurrentUserCart(): Observable<CartItemResponse[]> {
    const cartId = this.getCurrentCartId();
    if (!cartId) {
      this.cartItemsSubject.next([]);
      return of([]);
    }

    return this.fetchCartItems(cartId).pipe(
      tap((items) => this.cartItemsSubject.next(items))
    );
  }

  addProduct(productId: number): Observable<CartItemResponse> {
    const cartId = this.getCurrentCartId();
    if (!cartId) {
      return throwError(() => new Error('Aucun panier utilisateur disponible.'));
    }

    return this.fetchCartItems(cartId).pipe(
      switchMap((items) => {
        const existingItem = items.find((item) => item.productId === productId);

        if (existingItem) {
          return this.update(existingItem.id, {
            cartId,
            productId,
            quantity: existingItem.quantity + 1
          }).pipe(
            tap((updatedItem) => {
              this.cartItemsSubject.next(
                items.map((item) => item.id === updatedItem.id ? updatedItem : item)
              );
            })
          );
        }

        return this.create({
          cartId,
          productId,
          quantity: 1
        }).pipe(
          tap((createdItem) => {
            this.cartItemsSubject.next([createdItem, ...items]);
          })
        );
      })
    );
  }

  removeItem(itemId: number): Observable<void> {
    return this.delete(itemId).pipe(
      tap(() => {
        this.cartItemsSubject.next(
          this.cartItemsSubject.value.filter((item) => item.id !== itemId)
        );
      })
    );
  }

  private fetchCartItems(cartId: number): Observable<CartItemResponse[]> {
    return this.http.get<CartItemResponse[]>(this.cartUrl).pipe(
      map((items) => items.filter((item) => item.cartId === cartId))
    );
  }

  private create(payload: CartItemRequest): Observable<CartItemResponse> {
    return this.http.post<CartItemResponse>(this.cartUrl, payload);
  }

  private update(itemId: number, payload: CartItemRequest): Observable<CartItemResponse> {
    return this.http.put<CartItemResponse>(`${this.cartUrl}/${itemId}`, payload);
  }

  private delete(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.cartUrl}/${itemId}`);
  }
}
