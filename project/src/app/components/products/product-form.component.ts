import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CreateProductRequest, UpdateProductRequest, Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  formData: CreateProductRequest = {
    name: '',
    description: '',
    sku: '',
    category: '',
    price: 0,
    cost: 0,
    minStock: 0,
    maxStock: 0,
    unit: '',
    supplierId: 0
  };

  currentProduct = signal<Product | null>(null);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  productId: number | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId = parseInt(id, 10);
      this.loadProduct();
    }
  }

  private loadProduct(): void {
    if (this.productId) {
      this.productService.getProduct(this.productId).subscribe({
        next: (product) => {
          if (product) {
            this.currentProduct.set(product);
            this.formData = {
              name: product.name,
              description: product.description,
              sku: product.sku,
              category: product.category,
              price: product.price,
              cost: product.cost,
              minStock: product.minStock,
              maxStock: product.maxStock,
              unit: product.unit,
              supplierId: product.supplierId
            };
          } else {
            this.router.navigate(['/products']);
          }
        },
        error: () => {
          this.error.set('Erreur lors du chargement du produit');
        }
      });
    }
  }

  isEditMode(): boolean {
    return !!this.productId;
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const operation = this.isEditMode()
      ? this.productService.updateProduct({ ...this.formData, id: this.productId! } as UpdateProductRequest)
      : this.productService.createProduct(this.formData);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.error.set(error.message || 'Erreur lors de la sauvegarde');
        this.isSubmitting.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}