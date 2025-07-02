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
  templateUrl: './movement-list.component.html',
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