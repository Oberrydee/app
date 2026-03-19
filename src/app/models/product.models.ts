export interface ProductResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  image: string;
  imageFileName: string;
  imageContentType: string;
  imageSizeInBytes: number;
  category: string;
  price: number;
  quantity: number;
  internalReference: string;
  shellId: number;
  inventoryStatus: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormValue {
  code: string;
  name: string;
  imageFile: File | null;
  category: string;
  price: number | null;
  internalReference: string;
}
