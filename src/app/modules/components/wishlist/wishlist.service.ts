import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WishlistToggleResult } from 'src/app/models/wishlist.models';
import { AuthenticationService } from 'src/app/modules/authentication-module/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly storageKeyPrefix = 'wishlistProductIds:';
  private readonly wishlistProductIdsSubject = new BehaviorSubject<number[]>([]);

  readonly wishlistProductIds$ = this.wishlistProductIdsSubject.asObservable();
  readonly wishlistCount$ = this.wishlistProductIds$.pipe(
    map((productIds) => productIds.length)
  );

  constructor(private readonly authenticationService: AuthenticationService) {}

  loadCurrentUserWishlist(): Observable<number[]> {
    const productIds = this.readCurrentUserWishlist();
    this.wishlistProductIdsSubject.next(productIds);
    return of(productIds);
  }

  toggleProduct(productId: number): Observable<WishlistToggleResult> {
    const productIds = this.readCurrentUserWishlist();
    const exists = productIds.includes(productId);
    const nextProductIds = exists
      ? productIds.filter((id) => id !== productId)
      : [productId, ...productIds];

    this.writeCurrentUserWishlist(nextProductIds);
    this.wishlistProductIdsSubject.next(nextProductIds);

    return of({
      productId,
      action: exists ? 'removed' : 'added',
      productIds: nextProductIds
    });
  }

  removeProduct(productId: number): Observable<number[]> {
    const nextProductIds = this.readCurrentUserWishlist().filter((id) => id !== productId);
    this.writeCurrentUserWishlist(nextProductIds);
    this.wishlistProductIdsSubject.next(nextProductIds);
    return of(nextProductIds);
  }

  private readCurrentUserWishlist(): number[] {
    const storageKey = this.getCurrentUserStorageKey();
    if (!storageKey) {
      return [];
    }

    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(rawValue) as unknown;
      if (!Array.isArray(parsedValue)) {
        return [];
      }

      return parsedValue
        .filter((value): value is number => typeof value === 'number' && Number.isInteger(value))
        .filter((value, index, values) => values.indexOf(value) === index);
    } catch {
      return [];
    }
  }

  private writeCurrentUserWishlist(productIds: number[]): void {
    const storageKey = this.getCurrentUserStorageKey();
    if (!storageKey) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(productIds));
  }

  private getCurrentUserStorageKey(): string | null {
    const currentUser = this.authenticationService.getCurrentUserValue();
    return currentUser ? `${this.storageKeyPrefix}${currentUser.id}` : null;
  }
}
