import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProductFormValue, ProductResponse } from 'src/app/models/product.models';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly productsUrl = `${environment.apiBaseUrl}/Products`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.productsUrl).pipe(
      map((products) => products.map((product) => this.normalizeProductImage(product)))
    );
  }

  create(payload: ProductFormValue): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.productsUrl, this.buildFormData(payload)).pipe(
      map((product) => this.normalizeProductImage(product))
    );
  }

  update(productId: number, payload: ProductFormValue): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.productsUrl}/${productId}`, this.buildFormData(payload)).pipe(
      map((product) => this.normalizeProductImage(product))
    );
  }

  delete(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}/${productId}`);
  }

  private normalizeProductImage(product: ProductResponse): ProductResponse {
    const normalizedImage = this.toDisplayableImageSrc(product.image, product.imageContentType);

    if (normalizedImage === product.image) {
      return product;
    }

    return {
      ...product,
      image: normalizedImage
    };
  }

  private toDisplayableImageSrc(image: string, contentType: string): string {
    const normalizedImage = (image || '').trim();

    if (!normalizedImage) {
      return '';
    }

    if (normalizedImage.startsWith('data:') || normalizedImage.startsWith('http://') || normalizedImage.startsWith('https://')) {
      return normalizedImage;
    }

    if (this.isBase64Payload(normalizedImage)) {
      return `data:${contentType || 'image/jpeg'};base64,${normalizedImage.replace(/\s+/g, '')}`;
    }

    return normalizedImage;
  }

  private isBase64Payload(value: string): boolean {
    return value.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(value);
  }

  private buildFormData(payload: ProductFormValue): FormData {
    const formData = new FormData();
    formData.append('Code', payload.code.trim());
    formData.append('Name', payload.name.trim());
    formData.append('Description', payload.name.trim());
    formData.append('Category', payload.category.trim());
    formData.append('Price', String(payload.price ?? 0));
    formData.append('Quantity', '0');
    formData.append('InternalReference', payload.internalReference.trim());
    formData.append('ShellId', '0');
    formData.append('InventoryStatus', 'OUTOFSTOCK');
    formData.append('Rating', '0');

    if (payload.imageFile) {
      formData.append('ImageFile', payload.imageFile, payload.imageFile.name);
    }

    return formData;
  }
}
