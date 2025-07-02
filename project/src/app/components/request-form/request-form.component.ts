import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { CreateRequestDto, RequestType, Priority } from '../../models/request.model';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-form.component.html',
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
export class RequestFormComponent {
  formData: CreateRequestDto = {
    title: '',
    description: '',
    type: '' as RequestType,
    priority: '' as Priority,
    dueDate: undefined
  };

  dueDateString = '';
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  constructor(
    private requestService: RequestService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    // Convertir la date string en Date si fournie
    if (this.dueDateString) {
      this.formData.dueDate = new Date(this.dueDateString + 'T23:59:59');
    }

    this.requestService.createRequest(this.formData).subscribe({
      next: (request) => {
        this.router.navigate(['/requests', request.id]);
      },
      error: (error) => {
        this.error.set(error.message || 'Erreur lors de la création de la demande');
        this.isSubmitting.set(false);
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.formData.title?.trim() &&
      this.formData.description?.trim() &&
      this.formData.type &&
      this.formData.priority
    );
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  goBack(): void {
    this.router.navigate(['/requests']);
  }
}