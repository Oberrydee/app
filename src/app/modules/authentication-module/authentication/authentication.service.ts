//class with methods to get current users, gettoken, remove token, etc
import { Injectable } from '@angular/core';
import { environment } from 'src/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
    private tokenKey = 'authToken';

    constructor() { }
  
    // Method to set the token in local storage
    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    // Method to get the token from local storage
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    // Method to remove the token from local storage
    removeToken(): void {
        localStorage.removeItem(this.tokenKey);
    }

    // Method to check if the user is authenticated

    isAuthenticated(): boolean {
        const token = this.getToken();
        // Here you can add additional logic to check if the token is valid (e.g., check expiration)
        return !!token; // Returns true if token exists, false otherwise
    }
}