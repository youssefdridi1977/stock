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
  templateUrl: './product-list.component.html',
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