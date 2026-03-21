export interface AdminContactResponse {
  id: string;
  email: string;
  userId: number;
  message: string;
  createdAt: string;
  status: string;
}

export interface UpdateAdminContactRequest {
  email: string;
}
