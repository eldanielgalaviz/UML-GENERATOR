import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  private apiUrl = 'api/horarios'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getHorarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getHorario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createHorario(horario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, horario);
  }

  updateHorario(id: number, horario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, horario);
  }

  deleteHorario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}