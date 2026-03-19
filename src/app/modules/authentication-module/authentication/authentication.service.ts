import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import {
  AuthResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest
} from 'src/app/models/auth.models';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
    private readonly tokenKey = 'authToken';
    private readonly currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
    readonly currentUser$ = this.currentUserSubject.asObservable();

    constructor(private readonly http: HttpClient) {}

    login(payload: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/Auth/login`, payload);
    }

    register(payload: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/Auth/register`, payload);
    }

    getCurrentUser(): Observable<CurrentUser> {
        return this.http.get<CurrentUser>(`${environment.apiBaseUrl}/Auth/me`);
    }

    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    removeToken(): void {
        localStorage.removeItem(this.tokenKey);
    }

    getCurrentUserValue(): CurrentUser | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    ensureSession(): Observable<boolean> {
        if (!this.getToken()) {
            this.currentUserSubject.next(null);
            return of(false);
        }

        if (this.currentUserSubject.value) {
            return of(true);
        }

        return this.getCurrentUser().pipe(
            tap((user) => this.currentUserSubject.next(user)),
            map(() => true),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.logout();
                }

                return of(false);
            })
        );
    }

    setCurrentUser(user: CurrentUser | null): void {
        this.currentUserSubject.next(user);
    }

    logout(): void {
        this.removeToken();
        this.currentUserSubject.next(null);
    }

    isAdmin(): Observable<boolean> {
        return this.currentUser$.pipe(
            map(user => user?.email === 'admin@admin.com')
        );
    }
}
