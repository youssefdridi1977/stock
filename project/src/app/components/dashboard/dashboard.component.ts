import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { MovementService } from '../../services/movement.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 text-gradient fw-bold">Tableau de bord</h1>
          <p class="text-muted">Vue d'ensemble de votre stock</p>
        </div>
        @if (canManageProducts()) {
          <a routerLink="/products/new" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>
            Nouveau produit
          </a>
        }
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="stats-card text-center">
            <i class="bi bi-box stats-icon"></i>
            <div class="stats-number">{{ stats()['totalProducts'] || 0 }}</div>
            <div>Produits</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
            <i class="bi bi-arrow-up-circle stats-icon"></i>
            <div class="stats-number">{{ stats()['totalIn'] || 0 }}</div>
            <div>Entrées</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);">
            <i class="bi bi-arrow-down-circle stats-icon"></i>
            <div class="stats-number">{{ stats()['totalOut'] || 0 }}</div>
            <div>Sorties</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stats-card text-center" style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);">
            <i class="bi bi-exclamation-triangle stats-icon"></i>
            <div class="stats-number">{{ lowStockProducts().length }}</div>
            <div>Stock faible</div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Low Stock Alert -->
        @if (lowStockProducts().length > 0) {
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="bi bi-exclamation-triangle text-warning me-2"></i>
                  Alertes Stock Faible
                </h5>
                <span class="badge bg-warning">{{ lowStockProducts().length }}</span>
              </div>
              <div class="card-body">
                @if (lowStockProducts().length > 0) {
                  <div class="list-group list-group-flush">
                    @for (product of lowStockProducts().slice(0, 5); track product.id) {
                      <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div>
                          <h6 class="mb-1">{{ product.name }}</h6>
                          <small class="text-muted">{{ product.sku }}</small>
                        </div>
                        <div class="text-end">
                          <span class="badge bg-danger">{{ product.currentStock }}</span>
                          <small class="text-muted d-block">Min: {{ product.minStock }}</small>
                        </div>
                      </div>
                    }
                  </div>
                  @if (lowStockProducts().length > 5) {
                    <div class="text-center mt-3">
                      <a routerLink="/inventory" class="btn btn-outline-primary btn-sm">
                        Voir tous ({{ lowStockProducts().length - 5 }} de plus)
                      </a>
                    </div>
                  }
                } @else {
                  <div class="text-center py-4">
                    <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-2">Aucune alerte de stock</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Recent Products -->
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="bi bi-clock text-primary me-2"></i>
                Produits Récents
              </h5>
              <a routerLink="/products" class="btn btn-outline-primary btn-sm">Voir tout</a>
            </div>
            <div class="card-body">
              @if (recentProducts().length > 0) {
                <div class="list-group list-group-flush">
                  @for (product of recentProducts(); track product.id) {
                    <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <h6 class="mb-1">{{ product.name }}</h6>
                        <small class="text-muted">{{ product.category }} • {{ product.sku }}</small>
                      </div>
                      <div class="text-end">
                        <span class="badge bg-primary">{{ product.currentStock }}</span>
                        <small class="text-muted d-block">{{ product.price | currency:'EUR':'symbol':'1.2-2' }}</small>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-4">
                  <i class="bi bi-box text-muted" style="font-size: 3rem;"></i>
                  <p class="text-muted mt-2">Aucun produit</p>
                  @if (canManageProducts()) {
                    <a routerLink="/products/new" class="btn btn-primary btn-sm">
                      Ajouter un produit
                    </a>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-lightning text-warning me-2"></i>
                Actions Rapides
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                @if (canManageProducts()) {
                  <div class="col-md-3">
                    <a routerLink="/products/new" class="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i class="bi bi-plus-circle" style="font-size: 2rem;"></i>
                      <span class="mt-2">Nouveau Produit</span>
                    </a>
                  </div>
                }
                
                <div class="col-md-3">
                  <a routerLink="/inventory" class="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i class="bi bi-clipboard-data" style="font-size: 2rem;"></i>
                    <span class="mt-2">Inventaire</span>
                  </a>
                </div>
                
                <div class="col-md-3">
                  <a routerLink="/movements" class="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i class="bi bi-arrow-left-right" style="font-size: 2rem;"></i>
                    <span class="mt-2">Mouvements</span>
                  </a>
                </div>
                
                @if (canAccessReports()) {
                  <div class="col-md-3">
                    <a routerLink="/reports" class="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i class="bi bi-graph-up" style="font-size: 2rem;"></i>
                      <span class="mt-2">Rapports</span>
                    </a>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = signal<{[key: string]: number}>({});
  lowStockProducts = signal<Product[]>([]);
  recentProducts = signal<Product[]>([]);

  constructor(
    private productService: ProductService,
    private movementService: MovementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Charger les statistiques des mouvements
    this.movementService.getMovementStats().subscribe(stats => {
      this.stats.set(stats);
    });

    // Charger les produits en stock faible
    this.productService.getLowStockProducts().subscribe(products => {
      this.lowStockProducts.set(products);
    });

    // Charger les produits récents
    this.productService.getProducts().subscribe(products => {
      const recent = products
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      this.recentProducts.set(recent);
      
      // Mettre à jour le nombre total de produits
      this.stats.update(current => ({ ...current, totalProducts: products.length }));
    });
  }

  canManageProducts(): boolean {
    return this.authService.hasAnyRole([UserRole.ADMIN, UserRole.MANAGER]);
  }

  canAccessReports(): boolean {
    return this.authService.hasAnyRole([UserRole.ADMIN, UserRole.MANAGER]);
  }
}