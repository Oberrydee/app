import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsConfigComponent } from './products-config.component';

describe('ProductsConfigComponent', () => {
  let component: ProductsConfigComponent;
  let fixture: ComponentFixture<ProductsConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductsConfigComponent]
    });
    fixture = TestBed.createComponent(ProductsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
