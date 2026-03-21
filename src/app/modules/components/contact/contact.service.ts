import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminContactResponse, UpdateAdminContactRequest } from 'src/app/models/contact.models';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly contactUrl = `${environment.apiBaseUrl}/Contact`;

  constructor(private readonly http: HttpClient) {}

  getAdminContact(): Observable<AdminContactResponse> {
    return this.http.get<AdminContactResponse>(`${this.contactUrl}/admin-contact`);
  }

  updateAdminContact(payload: UpdateAdminContactRequest): Observable<AdminContactResponse> {
    return this.http.put<AdminContactResponse>(`${this.contactUrl}/admin-contact`, payload);
  }
}
