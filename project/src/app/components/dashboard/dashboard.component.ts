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
  templateUrl: './dashboard.component.html',
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