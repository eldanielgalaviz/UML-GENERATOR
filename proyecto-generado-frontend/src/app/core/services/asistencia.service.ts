import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  private apiUrl = 'api/asistencias'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getAsistencias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAsistencia(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAsistencia(asistencia: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, asistencia);
  }

  updateAsistencia(id: number, asistencia: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, asistencia);
  }

  deleteAsistencia(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}