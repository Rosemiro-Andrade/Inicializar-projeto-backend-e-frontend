import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getStages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stages`);
  }

  createStage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/stages`, data);
  }

  getMaquinas(stageId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/maquinas/${stageId}`);
  }

  createMaquina(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/maquinas`, data);
  }

  getRegistros(maquinaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/registros/${maquinaId}`);
  }

  createRegistro(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registros`, data);
  }

}