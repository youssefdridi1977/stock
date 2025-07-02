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
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 text-gradient fw-bold">
            {{ isEditMode() ? 'Modifier le produit' : 'Nouveau produit' }}
          </h1>
          <p class="text-muted">
            {{ isEditMode() ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre catalogue' }}
          </p>
        </div>
        <button class="btn btn-outline-secondary" (click)="goBack()">
          <i class="bi bi-arrow-left me-2"></i>
          Retour
        </button>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-box me-2"></i>
                Informations du produit
              </h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #productForm="ngForm">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="name" class="form-label">Nom du produit *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      name="name"
                      [(ngModel)]="formData.name"
                      required
                      placeholder="Ex: Ordinateur portable Dell"
                      [disabled]="isSubmitting()"
                    >
                  </div>

                  <div class="col-md-6">
                    <label for="sku" class="form-label">SKU *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="sku"
                      name="sku"
                      [(ngModel)]="formData.sku"
                      required
                      placeholder="Ex: DELL-LAT-5520"
                      [disabled]="isSubmitting()"
                    >
                  </div>

                  <div class="col-12">
                    <label for="description" class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      [(ngModel)]="formData.description"
                      placeholder="Description détaillée du produit..."
                      [disabled]="isSubmitting()"
                    ></textarea>
                  </div>

                  <div class="col-md-6">
                    <label for="category" class="form-label">Catégorie *</label>
                    <select
                      class="form-select"
                      id="category"
                      name="category"
                      [(ngModel)]="formData.category"
                      required
                      [disabled]="isSubmitting()"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      <option value="Informatique">Informatique</option>
                      <option value="Accessoires">Accessoires</option>
                      <option value="Écrans">Écrans</option>
                      <option value="Mobilier">Mobilier</option>
                      <option value="Fournitures">Fournitures</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label for="unit" class="form-label">Unité *</label>
                    <select
                      class="form-select"
                      id="unit"
                      name="unit"
                      [(ngModel)]="formData.unit"
                      required
                      [disabled]="isSubmitting()"
                    >
                      <option value="">Sélectionner une unité</option>
                      <option value="pièce">Pièce</option>
                      <option value="kg">Kilogramme</option>
                      <option value="litre">Litre</option>
                      <option value="mètre">Mètre</option>
                      <option value="boîte">Boîte</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label for="price" class="form-label">Prix de vente (€) *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="price"
                      name="price"
                      [(ngModel)]="formData.price"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      [disabled]="isSubmitting()"
                    >
                  </div>

                  <div class="col-md-6">
                    <label for="cost" class="form-label">Coût d'achat (€) *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="cost"
                      name="cost"
                      [(ngModel)]="formData.cost"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      [disabled]="isSubmitting()"
                    >
                  </div>

                  <div class="col-md-6">
                    <label for="minStock" class="form-label">Stock minimum *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="minStock"
                      name="minStock"
                      [(ngModel)]="formData.minStock"
                      required
                      min="0"
                      placeholder="0"
                      [disabled]="isSubmitting()"
                    >
                  </div>

                  <div class="col-md-6">
                    <label for="maxStock" class="form-label">Stock maximum *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="maxStock"
                      name="maxStock"
                      [(ngModel)]="formData.maxStock"
                      required
                      min="0"
                      placeholder="0"
                      [disabled]="isSubmitting()"
                    >
                  </div>

                  <div class="col-12">
                    <label for="supplierId" class="form-label">Fournisseur *</label>
                    <select
                      class="form-select"
                      id="supplierId"
                      name="supplierId"
                      [(ngModel)]="formData.supplierId"
                      required
                      [disabled]="isSubmitting()"
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      <option value="1">Dell Technologies</option>
                      <option value="2">Logitech</option>
                      <option value="3">Samsung Electronics</option>
                    </select>
                  </div>
                </div>

                @if (error()) {
                  <div class="alert alert-danger mt-3" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    {{ error() }}
                  </div>
                }

                <div class="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="!productForm.valid || isSubmitting()"
                  >
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                      {{ isEditMode() ? 'Modification...' : 'Création...' }}
                    } @else {
                      <i class="bi bi-check-circle me-2"></i>
                      {{ isEditMode() ? 'Modifier' : 'Créer' }}
                    }
                  </button>
                  
                  <button type="button" class="btn btn-outline-secondary" (click)="goBack()" [disabled]="isSubmitting()">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Aide
              </h6>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <h6 class="fw-bold">SKU (Stock Keeping Unit)</h6>
                <p class="text-muted small">
                  Code unique d'identification du produit. Utilisez un format cohérent comme MARQUE-MODELE-VARIANT.
                </p>
              </div>

              <div class="mb-3">
                <h6 class="fw-bold">Gestion des stocks</h6>
                <p class="text-muted small">
                  Le stock minimum déclenche une alerte quand il est atteint. Le stock maximum aide à éviter le surstockage.
                </p>
              </div>

              <div class="mb-3">
                <h6 class="fw-bold">Prix et coûts</h6>
                <p class="text-muted small">
                  Le coût d'achat permet de calculer la marge. Le prix de vente est utilisé pour les valorisations.
                </p>
              </div>

              @if (isEditMode() && currentProduct()) {
                <div class="border-top pt-3">
                  <h6 class="fw-bold">Informations</h6>
                  <p class="text-muted small mb-1">
                    <strong>Créé le :</strong> {{ currentProduct()?.createdAt | date:'short':'fr' }}
                  </p>
                  <p class="text-muted small mb-1">
                    <strong>Modifié le :</strong> {{ currentProduct()?.updatedAt | date:'short':'fr' }}
                  </p>
                  <p class="text-muted small">
                    <strong>Stock actuel :</strong> {{ currentProduct()?.currentStock }} {{ currentProduct()?.unit }}
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
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