import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Product, CreateProductRequest, UpdateProductRequest, Supplier } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'http://localhost:8080/api/products';

  // Mock data pour la démo
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Ordinateur Portable Dell',
      description: 'Ordinateur portable Dell Latitude 5520',
      sku: 'DELL-LAT-5520',
      category: 'Informatique',
      price: 899.99,
      cost: 650.00,
      minStock: 5,
      maxStock: 50,
      currentStock: 15,
      unit: 'pièce',
      supplierId: 1,
      supplier: { id: 1, name: 'Dell Technologies', email: 'contact@dell.com', phone: '01 23 45 67 89', address: '123 Rue de la Tech', isActive: true },
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 2,
      name: 'Souris Logitech MX Master 3',
      description: 'Souris sans fil ergonomique',
      sku: 'LOG-MX-M3',
      category: 'Accessoires',
      price: 99.99,
      cost: 65.00,
      minStock: 10,
      maxStock: 100,
      currentStock: 25,
      unit: 'pièce',
      supplierId: 2,
      supplier: { id: 2, name: 'Logitech', email: 'sales@logitech.com', phone: '01 34 56 78 90', address: '456 Avenue Innovation', isActive: true },
      isActive: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: 3,
      name: 'Écran Samsung 27"',
      description: 'Moniteur LED 27 pouces Full HD',
      sku: 'SAM-MON-27',
      category: 'Écrans',
      price: 299.99,
      cost: 200.00,
      minStock: 3,
      maxStock: 30,
      currentStock: 8,
      unit: 'pièce',
      supplierId: 3,
      supplier: { id: 3, name: 'Samsung Electronics', email: 'pro@samsung.com', phone: '01 45 67 89 01', address: '789 Boulevard Digital', isActive: true },
      isActive: true,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-22')
    }
  ];

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    // Simulation - remplacer par un vrai appel API
    return of(this.mockProducts).pipe(delay(500));
    // return this.http.get<Product[]>(this.API_URL);
  }

  getProduct(id: number): Observable<Product | undefined> {
    const product = this.mockProducts.find(p => p.id === id);
    return of(product).pipe(delay(300));
    // return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    const newProduct: Product = {
      id: Math.max(...this.mockProducts.map(p => p.id)) + 1,
      ...product,
      currentStock: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockProducts.push(newProduct);
    return of(newProduct).pipe(delay(800));
    // return this.http.post<Product>(this.API_URL, product);
  }

  updateProduct(product: UpdateProductRequest): Observable<Product> {
    const index = this.mockProducts.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.mockProducts[index] = { ...this.mockProducts[index], ...product, updatedAt: new Date() };
      return of(this.mockProducts[index]).pipe(delay(600));
    }
    throw new Error('Produit non trouvé');
    // return this.http.put<Product>(`${this.API_URL}/${product.id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProducts.splice(index, 1);
    }
    return of(void 0).pipe(delay(400));
    // return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getLowStockProducts(): Observable<Product[]> {
    const lowStock = this.mockProducts.filter(p => p.currentStock <= p.minStock);
    return of(lowStock).pipe(delay(300));
  }

  getProductsByCategory(): Observable<{[key: string]: number}> {
    const categories = this.mockProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});
    return of(categories).pipe(delay(200));
  }
}