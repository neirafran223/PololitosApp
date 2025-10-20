import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface PasswordResetRequestResponse {
  message: string;
  code?: string;
  expiresIn?: number;
}

interface PasswordResetActionResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  requestReset(email: string): Promise<PasswordResetRequestResponse> {
    return firstValueFrom(this.http.post<PasswordResetRequestResponse>(`${this.baseUrl}/api/password-reset/request`, { email }));
  }

  verifyCode(email: string, code: string): Promise<PasswordResetActionResponse> {
    return firstValueFrom(this.http.post<PasswordResetActionResponse>(`${this.baseUrl}/api/password-reset/verify`, { email, code }));
  }

  confirmReset(email: string, code: string): Promise<PasswordResetActionResponse> {
    return firstValueFrom(this.http.post<PasswordResetActionResponse>(`${this.baseUrl}/api/password-reset/reset`, { email, code }));
  }
}
