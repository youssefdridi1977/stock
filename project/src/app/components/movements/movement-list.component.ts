import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementService } from '../../services/movement.service';
import { ProductService } from '../../services/product.service';
import { StockMovement, MovementType } from '../../models/movement.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 text-gradient fw-bold">Mouvements de Stock</h1>
          <p class="text-muted">Historique des entrées et sorties de stock</p>
        </div>
        <button class="btn btn-primary" (click)="loadMovements()">
          <i class="bi bi-arrow-clockwise me-2"></i>
          Actualiser
        </button>
      </div>

      <!-- Stats -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="stats-card text-center">
            <i class="bi bi-arrow-left-right stats-icon"></i>
            <div class="stats-number">{{ movements().length }}</div>
            <div>Total mouvements</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
            <i class="bi bi-arrow-up-circle stats-icon"></i>
            <div class="stats-number">{{ getMovementsByType('IN').length }}</div>
            <div>Entrées</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);">
            <i class="bi bi-arrow-down-circle stats-icon"></i>
            <div class="stats-number">{{ getMovementsByType('OUT').length }}</div>
            <div>Sorties</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);">
            <i class="bi bi-gear stats-icon"></i>
            <div class="stats-number">{{ getMovementsByType('ADJUSTMENT').length }}</div>
            <div>Ajustements</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Type de mouvement</label>
              <select class="form-select" [(ngModel)]="typeFilter" (ngModelChange)="applyFilters()">
                <option value="">Tous</option>
                <option value="IN">Entrées</option>
                <option value="OUT">Sorties</option>
                <option value="ADJUSTMENT">Ajustements</option>
                <option value="TRANSFER">Transferts</option>
              </select>
            </div>
            
            <div class="col-md-3">
              <label class="form-label">Produit</label>
              <select class="form-select" [(ngModel)]="productFilter" (ngModelChange)="applyFilters()">
                <option value="">Tous les produits</option>
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.name }}</option>
                }
              </select>
            </div>
            
            <div class="col-md-3">
              <label class="form-label">Date début</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="dateFromFilter"
                (ngModelChange)="applyFilters()"
              >
            </div>
            
            <div class="col-md-3">
              <label class="form-label">Date fin</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="dateToFilter"
                (ngModelChange)="applyFilters()"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Movements Table -->
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="bi bi-list-ul me-2"></i>
            Historique des mouvements ({{ filteredMovements().length }})
          </h5>
        </div>
        <div class="card-body p-0">
          @if (isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
          } @else if (filteredMovements().length === 0) {
            <div class="text-center py-5">
              <i class="bi bi-arrow-left-right text-muted" style="font-size: 4rem;"></i>
              <h5 class="text-muted mt-3">Aucun mouvement trouvé</h5>
              <p class="text-muted">
                @if (hasFilters()) {
                  Aucun mouvement ne correspond aux critères sélectionnés.
                } @else {
                  Aucun mouvement de stock enregistré.
                }
              </p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Produit</th>
                    <th>Type</th>
                    <th>Quantité</th>
                    <th>Motif</th>
                    <th>Référence</th>
                    <th>Utilisateur</th>
                  </tr>
                </thead>
                <tbody>
                  @for (movement of filteredMovements(); track movement.id) {
                    <tr>
                      <td>
                        <div>
                          <div class="fw-medium">{{ movement.createdAt | date:'short':'fr' }}</div>
                          <small class="text-muted">{{ movement.createdAt | date:'EEEE':'fr' }}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <h6 class="mb-1">{{ getProductName(movement.productId) }}</h6>
                          <small class="text-muted">{{ getProductSku(movement.productId) }}</small>
                        </div>
                      </td>
                      <td>
                        <span [class]="getMovementTypeClass(movement.type)">
                          <i [class]="getMovementTypeIcon(movement.type)" class="me-1"></i>
                          {{ getMovementTypeLabel(movement.type) }}
                        </span>
                      </td>
                      <td>
                        <span [class]="getQuantityClass(movement.type, movement.quantity)">
                          {{ getQuantityDisplay(movement.type, movement.quantity) }}
                        </span>
                      </td>
                      <td>{{ movement.reason }}</td>
                      <td>
                        @if (movement.reference) {
                          <code>{{ movement.reference }}</code>
                        } @else {
                          <span class="text-muted">-</span>
                        }
                      </td>
                      <td>
                        @if (movement.user) {
                          <div>
                            <div class="fw-medium">{{ movement.user.firstName }} {{ movement.user.lastName }}</div>
                            <small class="text-muted">ID: {{ movement.userId }}</small>
                          </div>
                        } @else {
                          <span class="text-muted">Utilisateur {{ movement.userId }}</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class MovementListComponent implements OnInit {
  movements = signal<StockMovement[]>([]);
  filteredMovements = signal<StockMovement[]>([]);
  products = signal<Product[]>([]);
  isLoading = signal(true);

  typeFilter = '';
  productFilter = '';
  dateFromFilter = '';
  dateToFilter = '';

  constructor(
    private movementService: MovementService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Charger les produits et mouvements en parallèle
    Promise.all([
      this.productService.getProducts().toPromise(),
      this.movementService.getMovements().toPromise()
    ]).then(([products, movements]) => {
      this.products.set(products || []);
      this.movements.set(movements || []);
      this.applyFilters();
      this.isLoading.set(false);
    }).catch(() => {
      this.isLoading.set(false);
    });
  }

  loadMovements(): void {
    this.isLoading.set(true);
    this.loadData();
  }

  applyFilters(): void {
    let filtered = [...this.movements()];

    // Filtre par type
    if (this.typeFilter) {
      filtered = filtered.filter(m => m.type === this.typeFilter);
    }

    // Filtre par produit
    if (this.productFilter) {
      filtered = filtered.filter(m => m.productId === parseInt(this.productFilter));
    }

    // Filtre par date de début
    if (this.dateFromFilter) {
      const fromDate = new Date(this.dateFromFilter);
      filtered = filtered.filter(m => new Date(m.createdAt) >= fromDate);
    }

    // Filtre par date de fin
    if (this.dateToFilter) {
      const toDate = new Date(this.dateToFilter);
      toDate.setHours(23, 59, 59, 999); // Fin de journée
      filtered = filtered.filter(m => new Date(m.createdAt) <= toDate);
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredMovements.set(filtered);
  }

  hasFilters(): boolean {
    return !!(this.typeFilter || this.productFilter || this.dateFromFilter || this.dateToFilter);
  }

  getMovementsByType(type: string): StockMovement[] {
    return this.movements().filter(m => m.type === type);
  }

  getProductName(productId: number): string {
    const product = this.products().find(p => p.id === productId);
    return product?.name || `Produit ${productId}`;
  }

  getProductSku(productId: number): string {
    const product = this.products().find(p => p.id === productId);
    return product?.sku || '';
  }

  getMovementTypeLabel(type: MovementType): string {
    switch (type) {
      case MovementType.IN: return 'Entrée';
      case MovementType.OUT: return 'Sortie';
      case MovementType.ADJUSTMENT: return 'Ajustement';
      case MovementType.TRANSFER: return 'Transfert';
      default: return type;
    }
  }

  getMovementTypeClass(type: MovementType): string {
    switch (type) {
      case MovementType.IN: return 'badge bg-success';
      case MovementType.OUT: return 'badge bg-danger';
      case MovementType.ADJUSTMENT: return 'badge bg-warning';
      case MovementType.TRANSFER: return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  getMovementTypeIcon(type: MovementType): string {
    switch (type) {
      case MovementType.IN: return 'bi bi-arrow-up-circle';
      case MovementType.OUT: return 'bi bi-arrow-down-circle';
      case MovementType.ADJUSTMENT: return 'bi bi-gear';
      case MovementType.TRANSFER: return 'bi bi-arrow-left-right';
      default: return 'bi bi-circle';
    }
  }

  getQuantityDisplay(type: MovementType, quantity: number): string {
    if (type === MovementType.ADJUSTMENT) {
      return quantity >= 0 ? `+${quantity}` : `${quantity}`;
    }
    return quantity.toString();
  }

  getQuantityClass(type: MovementType, quantity: number): string {
    if (type === MovementType.IN || (type === MovementType.ADJUSTMENT && quantity > 0)) {
      return 'fw-bold text-success';
    } else if (type === MovementType.OUT || (type === MovementType.ADJUSTMENT && quantity < 0)) {
      return 'fw-bold text-danger';
    }
    return 'fw-bold';
  }
}