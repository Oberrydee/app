import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProductFormValue, ProductResponse } from 'src/app/models/product.models';
import { ProductService } from 'src/app/modules/components/product/product.service';

@Component({
  selector: 'app-products-config',
  templateUrl: './products-config.component.html',
  styleUrls: ['./products-config.component.scss']
})
export class ProductsConfigComponent implements OnInit {
  products: ProductResponse[] = [];
  selectedProduct: ProductResponse | null = null;
  isDialogVisible = false;
  dialogMode: 'create' | 'edit' = 'create';
  isLoading = false;
  isSaving = false;
  pageError = '';
  dialogError = '';
  selectedImageName = '';

  readonly productForm = this.formBuilder.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    imageFile: [null as File | null, [Validators.required]],
    category: ['', [Validators.required]],
    price: [null as number | null, [Validators.required]],
    internalReference: ['', [Validators.required]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
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

        if (this.selectedProduct) {
          this.selectedProduct = products.find((product) => product.id === this.selectedProduct?.id) ?? null;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.pageError = this.extractErrorMessage(error, 'Impossible de charger les produits.');
      }
    });
  }

  openCreateDialog(): void {
    this.dialogMode = 'create';
    this.dialogError = '';
    this.selectedImageName = '';
    this.productForm.reset({
      code: '',
      name: '',
      imageFile: null,
      category: '',
      price: null,
      internalReference: ''
    });
    this.isDialogVisible = true;
  }

  openEditDialog(product: ProductResponse = this.selectedProduct as ProductResponse): void {
    if (!product) {
      return;
    }

    this.selectedProduct = product;
    this.dialogMode = 'edit';
    this.dialogError = '';
    this.selectedImageName = product.imageFileName || '';
    this.productForm.reset({
      code: product.code,
      name: product.name,
      imageFile: null,
      category: product.category,
      price: product.price,
      internalReference: product.internalReference
    });
    this.productForm.controls.imageFile.setErrors({ required: true });
    this.isDialogVisible = true;
  }

  closeDialog(): void {
    this.isDialogVisible = false;
    this.dialogError = '';
    this.selectedImageName = '';
  }

  selectProduct(product: ProductResponse): void {
    this.selectedProduct = this.selectedProduct?.id === product.id ? null : product;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.productForm.patchValue({ imageFile: file });
    this.productForm.controls.imageFile.markAsTouched();
    this.productForm.controls.imageFile.updateValueAndValidity();
    this.selectedImageName = file?.name ?? '';
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const payload = this.productForm.getRawValue() as ProductFormValue;
    const request$ = this.dialogMode === 'create' || !this.selectedProduct
      ? this.productService.create(payload)
      : this.productService.update(this.selectedProduct.id, payload);

    this.isSaving = true;
    this.dialogError = '';

    request$.pipe(
      finalize(() => {
        this.isSaving = false;
      })
    ).subscribe({
      next: (product) => {
        this.closeDialog();
        this.selectedProduct = product;
        this.loadProducts();
      },
      error: (error: HttpErrorResponse) => {
        this.dialogError = this.extractErrorMessage(error, 'Impossible de sauvegarder le produit.');
      }
    });
  }

  deleteProduct(product: ProductResponse = this.selectedProduct as ProductResponse): void {
    if (!product) {
      return;
    }

    const confirmed = window.confirm(`Supprimer le produit "${product.name}" ?`);
    if (!confirmed) {
      return;
    }

    this.selectedProduct = this.selectedProduct?.id === product.id ? this.selectedProduct : product;
    this.pageError = '';
    this.isLoading = true;

    this.productService.delete(product.id).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.selectedProduct = null;
        this.loadProducts();
      },
      error: (error: HttpErrorResponse) => {
        this.pageError = this.extractErrorMessage(error, 'Impossible de supprimer le produit.');
      }
    });
  }

  trackByProductId(_: number, product: ProductResponse): number {
    return product.id;
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const errorPayload = error.error as
      | { title?: string; errors?: Record<string, string[] | string> }
      | undefined;

    if (typeof errorPayload?.title === 'string' && errorPayload.title.trim()) {
      return errorPayload.title;
    }

    const validationErrors = errorPayload?.errors;
    if (validationErrors) {
      const firstError = Object.values(validationErrors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }

      if (typeof firstError === 'string' && firstError.trim()) {
        return firstError;
      }
    }

    return fallback;
  }
}
