import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 text-gradient fw-bold">Gestion des Produits</h1>
          <p class="text-muted">Gérez votre catalogue de produits</p>
        </div>
        @if (canManageProducts()) {
          <a routerLink="/products/new" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>
            Nouveau produit
          </a>
        }
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
                placeholder="Nom, SKU ou description..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="applyFilters()"
              >
            </div>
            <div class="col-md-3">
              <label class="form-label">Catégorie</label>
              <select class="form-select" [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()">
                <option value="">Toutes les catégories</option>
                @for (category of categories(); track category) {
                  <option [value]="category">{{ category }}</option>
                }
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Stock</label>
              <select class="form-select" [(ngModel)]="stockFilter" (ngModelChange)="applyFilters()">
                <option value="">Tous</option>
                <option value="low">Stock faible</option>
                <option value="normal">Stock normal</option>
                <option value="high">Stock élevé</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Statut</label>
              <select class="form-select" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="bi bi-box me-2"></i>
            Produits ({{ filteredProducts().length }})
          </h5>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [class.active]="viewMode === 'table'" (click)="viewMode = 'table'">
              <i class="bi bi-table"></i>
            </button>
            <button class="btn btn-outline-secondary" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
              <i class="bi bi-grid"></i>
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          @if (isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
              <p class="text-muted mt-2">Chargement des produits...</p>
            </div>
          } @else if (filteredProducts().length === 0) {
            <div class="text-center py-5">
              <i class="bi bi-box text-muted" style="font-size: 4rem;"></i>
              <h5 class="text-muted mt-3">Aucun produit trouvé</h5>
              <p class="text-muted">
                @if (hasFilters()) {
                  Aucun produit ne correspond aux critères de recherche.
                } @else {
                  Commencez par ajouter votre premier produit.
                }
              </p>
              @if (canManageProducts() && !hasFilters()) {
                <a routerLink="/products/new" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-2"></i>
                  Ajouter un produit
                </a>
              }
            </div>
          } @else {
            @if (viewMode === 'table') {
              <!-- Table View -->
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>SKU</th>
                      <th>Catégorie</th>
                      <th>Prix</th>
                      <th>Stock</th>
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
                        <td class="fw-bold">{{ product.price | currency:'EUR':'symbol':'1.2-2' }}</td>
                        <td>
                          <span [class]="getStockBadgeClass(product)">
                            {{ product.currentStock }} {{ product.unit }}
                          </span>
                          <small class="text-muted d-block">Min: {{ product.minStock }}</small>
                        </td>
                        <td>
                          <span [class]="product.isActive ? 'badge bg-success' : 'badge bg-danger'">
                            {{ product.isActive ? 'Actif' : 'Inactif' }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" title="Voir">
                              <i class="bi bi-eye"></i>
                            </button>
                            @if (canManageProducts()) {
                              <a [routerLink]="['/products', product.id, 'edit']" class="btn btn-outline-warning" title="Modifier">
                                <i class="bi bi-pencil"></i>
                              </a>
                              <button class="btn btn-outline-danger" (click)="deleteProduct(product)" title="Supprimer">
                                <i class="bi bi-trash"></i>
                              </button>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <!-- Grid View -->
              <div class="row g-3 p-3">
                @for (product of filteredProducts(); track product.id) {
                  <div class="col-md-6 col-lg-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <h6 class="card-title mb-0">{{ product.name }}</h6>
                          <span [class]="product.isActive ? 'badge bg-success' : 'badge bg-danger'">
                            {{ product.isActive ? 'Actif' : 'Inactif' }}
                          </span>
                        </div>
                        <p class="card-text text-muted small">{{ product.description }}</p>
                        <div class="row g-2 mb-3">
                          <div class="col-6">
                            <small class="text-muted">SKU</small>
                            <div><code>{{ product.sku }}</code></div>
                          </div>
                          <div class="col-6">
                            <small class="text-muted">Catégorie</small>
                            <div><span class="badge bg-secondary">{{ product.category }}</span></div>
                          </div>
                          <div class="col-6">
                            <small class="text-muted">Prix</small>
                            <div class="fw-bold">{{ product.price | currency:'EUR':'symbol':'1.2-2' }}</div>
                          </div>
                          <div class="col-6">
                            <small class="text-muted">Stock</small>
                            <div>
                              <span [class]="getStockBadgeClass(product)">
                                {{ product.currentStock }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="btn-group w-100">
                          <button class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-eye"></i>
                          </button>
                          @if (canManageProducts()) {
                            <a [routerLink]="['/products', product.id, 'edit']" class="btn btn-outline-warning btn-sm">
                              <i class="bi bi-pencil"></i>
                            </a>
                            <button class="btn btn-outline-danger btn-sm" (click)="deleteProduct(product)">
                              <i class="bi bi-trash"></i>
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  categories = signal<string[]>([]);
  isLoading = signal(true);
  
  searchTerm = '';
  selectedCategory = '';
  stockFilter = '';
  statusFilter = '';
  viewMode: 'table' | 'grid' = 'table';

  constructor(
    private productService: ProductService,
    private authService: AuthService
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

    // Filtre de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    // Filtre de catégorie
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Filtre de stock
    if (this.stockFilter) {
      switch (this.stockFilter) {
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

    // Filtre de statut
    if (this.statusFilter) {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(p => p.isActive === isActive);
    }

    this.filteredProducts.set(filtered);
  }

  hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategory || this.stockFilter || this.statusFilter);
  }

  canManageProducts(): boolean {
    return this.authService.hasAnyRole([UserRole.ADMIN, UserRole.MANAGER]);
  }

  getStockBadgeClass(product: Product): string {
    if (product.currentStock <= product.minStock) {
      return 'badge bg-danger';
    } else if (product.currentStock >= product.maxStock) {
      return 'badge bg-warning';
    }
    return 'badge bg-success';
  }

  deleteProduct(product: Product): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }
}