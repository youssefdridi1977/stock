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
  templateUrl: './inventory.component.html',
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