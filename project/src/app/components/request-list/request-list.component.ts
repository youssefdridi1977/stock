import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { Request, RequestStatus, RequestType, Priority } from '../../models/request.model';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            @if (isApplicant()) {
              Mes demandes
            } @else {
              Gestion des demandes
            }
          </h1>
          <p class="text-gray-600">
            @if (isApplicant()) {
              Suivez l'état de vos demandes administratives
            } @else {
              Vue d'ensemble de toutes les demandes
            }
          </p>
        </div>
        @if (canCreateRequests()) {
          <a routerLink="/requests/new" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle demande
          </a>
        }
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="label">Statut</label>
              <select class="select" [(ngModel)]="filters.status" (ngModelChange)="applyFilters()">
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_review">En révision</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
            
            <div>
              <label class="label">Type</label>
              <select class="select" [(ngModel)]="filters.type" (ngModelChange)="applyFilters()">
                <option value="">Tous les types</option>
                <option value="leave">Congés</option>
                <option value="budget">Budget</option>
                <option value="procurement">Achat</option>
                <option value="hr">RH</option>
                <option value="it">IT</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label class="label">Priorité</label>
              <select class="select" [(ngModel)]="filters.priority" (ngModelChange)="applyFilters()">
                <option value="">Toutes les priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label class="label">Recherche</label>
              <input 
                type="text" 
                class="input" 
                placeholder="Titre ou description..."
                [(ngModel)]="filters.search"
                (ngModelChange)="applyFilters()"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Requests List -->
      <div class="card">
        <div class="card-body">
          @if (isLoading()) {
            <div class="text-center py-8">
              <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-500">Chargement des demandes...</p>
            </div>
          } @else if (filteredRequests().length > 0) {
            <div class="space-y-4">
              @for (request of filteredRequests(); track request.id) {
                <div class="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-semibold text-gray-900">{{ request.title }}</h3>
                        <span [class]="getStatusBadgeClass(request.status)">
                          {{ getStatusLabel(request.status) }}
                        </span>
                        <span [class]="getPriorityBadgeClass(request.priority)">
                          {{ getPriorityLabel(request.priority) }}
                        </span>
                      </div>
                      
                      <p class="text-gray-600 mb-3">{{ request.description }}</p>
                      
                      <div class="flex items-center gap-4 text-sm text-gray-500">
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                          </svg>
                          {{ getTypeLabel(request.type) }}
                        </span>
                        
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 0a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2"/>
                          </svg>
                          {{ formatDate(request.createdAt) }}
                        </span>
                        
                        @if (request.applicant && !isApplicant()) {
                          <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            {{ request.applicant.firstName }} {{ request.applicant.lastName }}
                          </span>
                        }
                        
                        @if (request.dueDate) {
                          <span class="flex items-center gap-1" [class.text-error-600]="isOverdue(request.dueDate)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Échéance: {{ formatDate(request.dueDate) }}
                          </span>
                        }
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-2 ml-4">
                      <a 
                        [routerLink]="['/requests', request.id]"
                        class="btn btn-sm btn-secondary"
                      >
                        Voir
                      </a>
                      
                      @if (canValidate() && needsValidation(request.status)) {
                        <a 
                          [routerLink]="['/validation', request.id]"
                          class="btn btn-sm btn-primary"
                        >
                          Valider
                        </a>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
              <p class="text-gray-500 mb-4">
                @if (hasActiveFilters()) {
                  Aucune demande ne correspond aux filtres appliqués.
                } @else if (isApplicant()) {
                  Vous n'avez pas encore créé de demande.
                } @else {
                  Aucune demande n'a été créée.
                }
              </p>
              @if (canCreateRequests()) {
                <a routerLink="/requests/new" class="btn btn-primary">
                  Créer ma première demande
                </a>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class RequestListComponent implements OnInit {
  requests = signal<Request[]>([]);
  filteredRequests = signal<Request[]>([]);
  isLoading = signal(true);
  
  filters = {
    status: '',
    type: '',
    priority: '',
    search: ''
  };

  constructor(
    private requestService: RequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  private loadRequests(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) return;

    if (this.isApplicant()) {
      this.requestService.getRequestsByUser(currentUser.id).subscribe({
        next: (requests) => {
          this.requests.set(requests);
          this.applyFilters();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      this.requestService.getRequests().subscribe({
        next: (requests) => {
          this.requests.set(requests);
          this.applyFilters();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.requests()];

    if (this.filters.status) {
      filtered = filtered.filter(r => r.status === this.filters.status);
    }

    if (this.filters.type) {
      filtered = filtered.filter(r => r.type === this.filters.type);
    }

    if (this.filters.priority) {
      filtered = filtered.filter(r => r.priority === this.filters.priority);
    }

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search)
      );
    }

    // Trier par date de mise à jour (plus récent en premier)
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    this.filteredRequests.set(filtered);
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.status || this.filters.type || this.filters.priority || this.filters.search);
  }

  isApplicant(): boolean {
    return this.authService.hasRole(UserRole.APPLICANT);
  }

  canCreateRequests(): boolean {
    return this.authService.hasAnyRole([UserRole.APPLICANT, UserRole.ADMIN]);
  }

  canValidate(): boolean {
    return this.authService.hasAnyRole([UserRole.VALIDATOR, UserRole.ADMIN]);
  }

  needsValidation(status: RequestStatus): boolean {
    return [RequestStatus.PENDING, RequestStatus.IN_REVIEW].includes(status);
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  getStatusLabel(status: RequestStatus): string {
    const labels = {
      [RequestStatus.DRAFT]: 'Brouillon',
      [RequestStatus.PENDING]: 'En attente',
      [RequestStatus.IN_REVIEW]: 'En révision',
      [RequestStatus.APPROVED]: 'Approuvé',
      [RequestStatus.REJECTED]: 'Rejeté',
      [RequestStatus.CANCELLED]: 'Annulé'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: RequestStatus): string {
    const classes = {
      [RequestStatus.DRAFT]: 'badge badge-pending',
      [RequestStatus.PENDING]: 'badge badge-pending',
      [RequestStatus.IN_REVIEW]: 'badge badge-in-progress',
      [RequestStatus.APPROVED]: 'badge badge-approved',
      [RequestStatus.REJECTED]: 'badge badge-rejected',
      [RequestStatus.CANCELLED]: 'badge badge-rejected'
    };
    return classes[status] || 'badge';
  }

  getPriorityLabel(priority: Priority): string {
    const labels = {
      [Priority.LOW]: 'Faible',
      [Priority.MEDIUM]: 'Moyenne',
      [Priority.HIGH]: 'Élevée',
      [Priority.URGENT]: 'Urgente'
    };
    return labels[priority] || priority;
  }

  getPriorityBadgeClass(priority: Priority): string {
    const baseClass = 'badge';
    switch (priority) {
      case Priority.LOW:
        return `${baseClass} badge-approved`;
      case Priority.MEDIUM:
        return `${baseClass} badge-in-progress`;
      case Priority.HIGH:
        return `${baseClass} badge-pending`;
      case Priority.URGENT:
        return `${baseClass} badge-rejected`;
      default:
        return baseClass;
    }
  }

  getTypeLabel(type: RequestType): string {
    const labels = {
      [RequestType.LEAVE]: 'Congés',
      [RequestType.BUDGET]: 'Budget',
      [RequestType.PROCUREMENT]: 'Achat',
      [RequestType.HR]: 'RH',
      [RequestType.IT]: 'IT',
      [RequestType.OTHER]: 'Autre'
    };
    return labels[type] || type;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}