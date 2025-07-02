import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { StockMovement, CreateMovementRequest, MovementType } from '../models/movement.model';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private readonly API_URL = 'http://localhost:8080/api/movements';

  // Mock data pour la démo
  private mockMovements: StockMovement[] = [
    {
      id: 1,
      productId: 1,
      type: MovementType.IN,
      quantity: 10,
      reason: 'Réception commande fournisseur',
      reference: 'CMD-2024-001',
      userId: 2,
      createdAt: new Date('2024-01-20T10:30:00')
    },
    {
      id: 2,
      productId: 2,
      type: MovementType.OUT,
      quantity: 5,
      reason: 'Vente client',
      reference: 'VTE-2024-015',
      userId: 3,
      createdAt: new Date('2024-01-21T14:15:00')
    },
    {
      id: 3,
      productId: 3,
      type: MovementType.ADJUSTMENT,
      quantity: -2,
      reason: 'Correction inventaire',
      userId: 1,
      createdAt: new Date('2024-01-22T09:00:00')
    }
  ];

  constructor(private http: HttpClient) {}

  getMovements(): Observable<StockMovement[]> {
    return of(this.mockMovements).pipe(delay(400));
    // return this.http.get<StockMovement[]>(this.API_URL);
  }

  getMovementsByProduct(productId: number): Observable<StockMovement[]> {
    const movements = this.mockMovements.filter(m => m.productId === productId);
    return of(movements).pipe(delay(300));
    // return this.http.get<StockMovement[]>(`${this.API_URL}/product/${productId}`);
  }

  createMovement(movement: CreateMovementRequest): Observable<StockMovement> {
    const newMovement: StockMovement = {
      id: Math.max(...this.mockMovements.map(m => m.id)) + 1,
      ...movement,
      userId: 1, // ID de l'utilisateur connecté
      createdAt: new Date()
    };
    this.mockMovements.unshift(newMovement);
    return of(newMovement).pipe(delay(600));
    // return this.http.post<StockMovement>(this.API_URL, movement);
  }

  getMovementStats(): Observable<{[key: string]: number}> {
    const stats = {
      totalIn: this.mockMovements.filter(m => m.type === MovementType.IN).reduce((sum, m) => sum + m.quantity, 0),
      totalOut: this.mockMovements.filter(m => m.type === MovementType.OUT).reduce((sum, m) => sum + m.quantity, 0),
      totalAdjustments: this.mockMovements.filter(m => m.type === MovementType.ADJUSTMENT).length,
      recentMovements: this.mockMovements.length
    };
    return of(stats).pipe(delay(200));
  }
}