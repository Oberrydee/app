import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductFormValue, ProductResponse } from 'src/app/models/product.models';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly productsUrl = `${environment.apiBaseUrl}/Products`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.productsUrl);
  }

  create(payload: ProductFormValue): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.productsUrl, this.buildFormData(payload));
  }

  update(productId: number, payload: ProductFormValue): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.productsUrl}/${productId}`, this.buildFormData(payload));
  }

  delete(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}/${productId}`);
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
