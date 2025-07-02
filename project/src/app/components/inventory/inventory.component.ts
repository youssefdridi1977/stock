import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { MovementService } from '../../services/movement.service';
import { Product } from '../../models/product.model';
import { CreateMovementRequest, MovementType } from '../../models/movement.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 text-gradient fw-bold">Inventaire</h1>
          <p class="text-muted">Gérez les niveaux de stock de vos produits</p>
        </div>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#movementModal">
          <i class="bi bi-plus-circle me-2"></i>
          Nouveau mouvement
        </button>
      </div>

      <!-- Stock Summary -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="stats-card text-center">
            <i class="bi bi-box stats-icon"></i>
            <div class="stats-number">{{ products().length }}</div>
            <div>Produits total</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);">
            <i class="bi bi-exclamation-triangle stats-icon"></i>
            <div class="stats-number">{{ lowStockCount() }}</div>
            <div>Stock faible</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
            <i class="bi bi-check-circle stats-icon"></i>
            <div class="stats-number">{{ normalStockCount() }}</div>
            <div>Stock normal</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);">
            <i class="bi bi-arrow-up-circle stats-icon"></i>
            <div class="stats-number">{{ highStockCount() }}</div>
            <div>Stock élevé</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Recherche</label>
              <input
                type="text"
                class="form-control"
                placeholder="Nom ou SKU..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="applyFilters()"
              >
            </div>
            <div class="col-md-4">
              <label class="form-label">Niveau de stock</label>
              <select class="form-select" [(ngModel)]="stockLevel" (ngModelChange)="applyFilters()">
                <option value="">Tous</option>
                <option value="low">Stock faible</option>
                <option value="normal">Stock normal</option>
                <option value="high">Stock élevé</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Catégorie</label>
              <select class="form-select" [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()">
                <option value="">Toutes</option>
                @for (category of categories(); track category) {
                  <option [value]="category">{{ category }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="bi bi-clipboard-data me-2"></i>
            État des stocks ({{ filteredProducts().length }})
          </h5>
        </div>
        <div class="card-body p-0">
          @if (isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
          } @else if (filteredProducts().length === 0) {
            <div class="text-center py-5">
              <i class="bi bi-clipboard-data text-muted" style="font-size: 4rem;"></i>
              <h5 class="text-muted mt-3">Aucun produit trouvé</h5>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>SKU</th>
                    <th>Catégorie</th>
                    <th>Stock actuel</th>
                    <th>Stock min/max</th>
                    <th>Valeur stock</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (product of filteredProducts(); track product.id) {
                    <tr>
                      <td>
                        <div>
                          <h6 class="mb-1">{{ product.name }}</h6>
                          <small class="text-muted">{{ product.description }}</small>
                        </div>
                      </td>
                      <td><code>{{ product.sku }}</code></td>
                      <td>
                        <span class="badge bg-secondary">{{ product.category }}</span>
                      </td>
                      <td>
                        <span class="fw-bold">{{ product.currentStock }}</span>
                        <small class="text-muted">{{ product.unit }}</small>
                      </td>
                      <td>
                        <small class="text-muted">
                          {{ product.minStock }} / {{ product.maxStock }}
                        </small>
                      </td>
                      <td class="fw-bold">
                        {{ (product.currentStock * product.cost) | currency:'EUR':'symbol':'1.2-2' }}
                      </td>
                      <td>
                        <span [class]="getStockStatusClass(product)">
                          {{ getStockStatusLabel(product) }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-success" 
                            (click)="openMovementModal(product, MovementType.IN)"
                            title="Entrée stock"
                          >
                            <i class="bi bi-plus"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            (click)="openMovementModal(product, MovementType.OUT)"
                            title="Sortie stock"
                          >
                            <i class="bi bi-dash"></i>
                          </button>
                          <button 
                            class="btn btn-outline-warning" 
                            (click)="openMovementModal(product, MovementType.ADJUSTMENT)"
                            title="Ajustement"
                          >
                            <i class="bi bi-gear"></i>
                          </button>
                        </div>
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

    <!-- Movement Modal -->
    <div class="modal fade" id="movementModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              @switch (movementForm.type) {
                @case ('IN') { Entrée de stock }
                @case ('OUT') { Sortie de stock }
                @case ('ADJUSTMENT') { Ajustement de stock }
                @default { Nouveau mouvement }
              }
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="submitMovement()" #movementFormRef="ngForm">
              @if (!selectedProduct()) {
                <div class="mb-3">
                  <label class="form-label">Produit *</label>
                  <select class="form-select" [(ngModel)]="movementForm.productId" name="productId" required>
                    <option value="">Sélectionner un produit</option>
                    @for (product of products(); track product.id) {
                      <option [value]="product.id">{{ product.name }} ({{ product.sku }})</option>
                    }
                  </select>
                </div>
              } @else {
                <div class="mb-3">
                  <label class="form-label">Produit</label>
                  <div class="form-control-plaintext">
                    <strong>{{ selectedProduct()?.name }}</strong>
                    <br><small class="text-muted">{{ selectedProduct()?.sku }} - Stock actuel: {{ selectedProduct()?.currentStock }}</small>
                  </div>
                </div>
              }

              <div class="mb-3">
                <label class="form-label">Type de mouvement *</label>
                <select class="form-select" [(ngModel)]="movementForm.type" name="type" required>
                  <option value="IN">Entrée</option>
                  <option value="OUT">Sortie</option>
                  <option value="ADJUSTMENT">Ajustement</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Quantité *</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="movementForm.quantity"
                  name="quantity"
                  required
                  min="1"
                  placeholder="Quantité"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Motif *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="movementForm.reason"
                  name="reason"
                  required
                  placeholder="Ex: Réception commande, Vente client..."
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Référence</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="movementForm.reference"
                  name="reference"
                  placeholder="Ex: CMD-2024-001, VTE-2024-015..."
                >
              </div>

              @if (movementError()) {
                <div class="alert alert-danger">
                  {{ movementError() }}
                </div>
              }
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              (click)="submitMovement()"
              [disabled]="!movementFormRef.valid || isSubmittingMovement()"
            >
              @if (isSubmittingMovement()) {
                <span class="spinner-border spinner-border-sm me-2"></span>
                Enregistrement...
              } @else {
                Enregistrer
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InventoryComponent implements OnInit {
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  categories = signal<string[]>([]);
  selectedProduct = signal<Product | null>(null);
  isLoading = signal(true);
  isSubmittingMovement = signal(false);
  movementError = signal<string | null>(null);

  searchTerm = '';
  stockLevel = '';
  selectedCategory = '';

  // Make MovementType accessible in template
  MovementType = MovementType;

  movementForm: CreateMovementRequest = {
    productId: 0,
    type: MovementType.IN,
    quantity: 0,
    reason: '',
    reference: ''
  };

  constructor(
    private productService: ProductService,
    private movementService: MovementService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.extractCategories(products);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private extractCategories(products: Product[]): void {
    const categories = [...new Set(products.map(p => p.category))].sort();
    this.categories.set(categories);
  }

  applyFilters(): void {
    let filtered = [...this.products()];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term)
      );
    }

    if (this.stockLevel) {
      switch (this.stockLevel) {
        case 'low':
          filtered = filtered.filter(p => p.currentStock <= p.minStock);
          break;
        case 'normal':
          filtered = filtered.filter(p => p.currentStock > p.minStock && p.currentStock < p.maxStock);
          break;
        case 'high':
          filtered = filtered.filter(p => p.currentStock >= p.maxStock);
          break;
      }
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts.set(filtered);
  }

  lowStockCount(): number {
    return this.products().filter(p => p.currentStock <= p.minStock).length;
  }

  normalStockCount(): number {
    return this.products().filter(p => p.currentStock > p.minStock && p.currentStock < p.maxStock).length;
  }

  highStockCount(): number {
    return this.products().filter(p => p.currentStock >= p.maxStock).length;
  }

  getStockStatusClass(product: Product): string {
    if (product.currentStock <= product.minStock) {
      return 'badge bg-danger';
    } else if (product.currentStock >= product.maxStock) {
      return 'badge bg-warning';
    }
    return 'badge bg-success';
  }

  getStockStatusLabel(product: Product): string {
    if (product.currentStock <= product.minStock) {
      return 'Stock faible';
    } else if (product.currentStock >= product.maxStock) {
      return 'Stock élevé';
    }
    return 'Stock normal';
  }

  openMovementModal(product?: Product, type?: MovementType): void {
    this.selectedProduct.set(product || null);
    this.movementForm = {
      productId: product?.id || 0,
      type: type || MovementType.IN,
      quantity: 0,
      reason: '',
      reference: ''
    };
    this.movementError.set(null);
  }

  submitMovement(): void {
    if (this.isSubmittingMovement()) return;

    this.isSubmittingMovement.set(true);
    this.movementError.set(null);

    this.movementService.createMovement(this.movementForm).subscribe({
      next: () => {
        this.isSubmittingMovement.set(false);
        this.loadProducts(); // Recharger pour mettre à jour les stocks
        // Fermer le modal (nécessite Bootstrap JS)
        const modal = document.getElementById('movementModal');
        if (modal) {
          const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
          if (bsModal) {
            bsModal.hide();
          }
        }
      },
      error: (error) => {
        this.movementError.set(error.message || 'Erreur lors de l\'enregistrement');
        this.isSubmittingMovement.set(false);
      }
    });
  }
}