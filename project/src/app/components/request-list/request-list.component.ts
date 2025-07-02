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
  templateUrl: './request-list.component.html',
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