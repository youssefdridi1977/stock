import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { 
  Request, 
  RequestStatus, 
  RequestType, 
  Priority, 
  CreateRequestDto, 
  UpdateRequestStatusDto,
  RequestHistory,
  Comment
} from '../models/request.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requests = signal<Request[]>([]);
  private nextId = 4;

  // Données de démo
  private mockRequests: Request[] = [
    {
      id: '1',
      title: 'Demande de congés - Février 2025',
      description: 'Demande de congés payés du 10 au 20 février 2025 pour vacances familiales.',
      type: RequestType.LEAVE,
      status: RequestStatus.PENDING,
      priority: Priority.MEDIUM,
      applicantId: '3',
      applicant: {
        firstName: 'Jean',
        lastName: 'Martin',
        email: 'user@workflow.com'
      },
      currentValidatorId: '2',
      currentValidator: {
        firstName: 'Marie',
        lastName: 'Dubois'
      },
      documents: [],
      history: [
        {
          id: '1',
          action: 'Création',
          description: 'Demande créée par Jean Martin',
          performedBy: { id: '3', firstName: 'Jean', lastName: 'Martin' },
          performedAt: new Date('2025-01-15T09:00:00'),
          newStatus: RequestStatus.DRAFT
        },
        {
          id: '2',
          action: 'Soumission',
          description: 'Demande soumise pour validation',
          performedBy: { id: '3', firstName: 'Jean', lastName: 'Martin' },
          performedAt: new Date('2025-01-15T09:15:00'),
          oldStatus: RequestStatus.DRAFT,
          newStatus: RequestStatus.PENDING
        }
      ],
      comments: [
        {
          id: '1',
          content: 'Demande urgente pour réservations déjà effectuées.',
          authorId: '3',
          author: { firstName: 'Jean', lastName: 'Martin' },
          createdAt: new Date('2025-01-15T09:20:00'),
          isInternal: false
        }
      ],
      createdAt: new Date('2025-01-15T09:00:00'),
      updatedAt: new Date('2025-01-15T09:20:00'),
      dueDate: new Date('2025-01-20T17:00:00')
    },
    {
      id: '2',
      title: 'Budget formation équipe développement',
      description: 'Demande de budget pour formation Angular et TypeScript pour l\'équipe de développement (5 personnes).',
      type: RequestType.BUDGET,
      status: RequestStatus.IN_REVIEW,
      priority: Priority.HIGH,
      applicantId: '3',
      applicant: {
        firstName: 'Jean',
        lastName: 'Martin',
        email: 'user@workflow.com'
      },
      currentValidatorId: '2',
      currentValidator: {
        firstName: 'Marie',
        lastName: 'Dubois'
      },
      documents: [],
      history: [
        {
          id: '3',
          action: 'Création',
          description: 'Demande créée par Jean Martin',
          performedBy: { id: '3', firstName: 'Jean', lastName: 'Martin' },
          performedAt: new Date('2025-01-10T14:00:00'),
          newStatus: RequestStatus.DRAFT
        },
        {
          id: '4',
          action: 'Mise en révision',
          description: 'Demande prise en charge par Marie Dubois',
          performedBy: { id: '2', firstName: 'Marie', lastName: 'Dubois' },
          performedAt: new Date('2025-01-12T10:00:00'),
          oldStatus: RequestStatus.PENDING,
          newStatus: RequestStatus.IN_REVIEW
        }
      ],
      comments: [
        {
          id: '2',
          content: 'Budget estimé : 15 000€ pour 5 personnes',
          authorId: '3',
          author: { firstName: 'Jean', lastName: 'Martin' },
          createdAt: new Date('2025-01-10T14:30:00'),
          isInternal: false
        },
        {
          id: '3',
          content: 'Demande justifiée, en cours de validation budgétaire.',
          authorId: '2',
          author: { firstName: 'Marie', lastName: 'Dubois' },
          createdAt: new Date('2025-01-12T10:30:00'),
          isInternal: true
        }
      ],
      createdAt: new Date('2025-01-10T14:00:00'),
      updatedAt: new Date('2025-01-12T10:30:00'),
      dueDate: new Date('2025-01-25T17:00:00')
    },
    {
      id: '3',
      title: 'Achat nouveaux ordinateurs portables',
      description: 'Commande de 10 ordinateurs portables pour les nouveaux employés du service commercial.',
      type: RequestType.PROCUREMENT,
      status: RequestStatus.APPROVED,
      priority: Priority.MEDIUM,
      applicantId: '3',
      applicant: {
        firstName: 'Jean',
        lastName: 'Martin',
        email: 'user@workflow.com'
      },
      documents: [],
      history: [
        {
          id: '5',
          action: 'Approbation',
          description: 'Demande approuvée par Marie Dubois',
          performedBy: { id: '2', firstName: 'Marie', lastName: 'Dubois' },
          performedAt: new Date('2025-01-08T16:00:00'),
          oldStatus: RequestStatus.IN_REVIEW,
          newStatus: RequestStatus.APPROVED
        }
      ],
      comments: [
        {
          id: '4',
          content: 'Commande approuvée. Fournisseur : TechCorp',
          authorId: '2',
          author: { firstName: 'Marie', lastName: 'Dubois' },
          createdAt: new Date('2025-01-08T16:00:00'),
          isInternal: false
        }
      ],
      createdAt: new Date('2025-01-05T10:00:00'),
      updatedAt: new Date('2025-01-08T16:00:00')
    }
  ];

  constructor(private authService: AuthService) {
    this.requests.set(this.loadRequests());
  }

  getRequests(): Observable<Request[]> {
    return of(this.requests()).pipe(delay(500));
  }

  getRequestsByUser(userId: string): Observable<Request[]> {
    const userRequests = this.requests().filter(r => r.applicantId === userId);
    return of(userRequests).pipe(delay(300));
  }

  getRequestsForValidator(validatorId: string): Observable<Request[]> {
    const validatorRequests = this.requests().filter(
      r => r.currentValidatorId === validatorId && 
          [RequestStatus.PENDING, RequestStatus.IN_REVIEW].includes(r.status)
    );
    return of(validatorRequests).pipe(delay(300));
  }

  getRequestById(id: string): Observable<Request | undefined> {
    const request = this.requests().find(r => r.id === id);
    return of(request).pipe(delay(200));
  }

  createRequest(dto: CreateRequestDto): Observable<Request> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    const newRequest: Request = {
      id: this.nextId.toString(),
      title: dto.title,
      description: dto.description,
      type: dto.type,
      status: RequestStatus.DRAFT,
      priority: dto.priority,
      applicantId: currentUser.id,
      applicant: {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email
      },
      documents: [],
      history: [{
        id: `${this.nextId}-1`,
        action: 'Création',
        description: `Demande créée par ${currentUser.firstName} ${currentUser.lastName}`,
        performedBy: {
          id: currentUser.id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName
        },
        performedAt: new Date(),
        newStatus: RequestStatus.DRAFT
      }],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: dto.dueDate
    };

    this.nextId++;
    const updatedRequests = [...this.requests(), newRequest];
    this.requests.set(updatedRequests);
    this.saveRequests();

    return of(newRequest).pipe(delay(800));
  }

  updateRequestStatus(id: string, dto: UpdateRequestStatusDto): Observable<Request> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    const requests = this.requests();
    const requestIndex = requests.findIndex(r => r.id === id);
    
    if (requestIndex === -1) {
      return throwError(() => new Error('Demande non trouvée'));
    }

    const request = { ...requests[requestIndex] };
    const oldStatus = request.status;
    request.status = dto.status;
    request.updatedAt = new Date();

    // Ajouter à l'historique
    const historyEntry: RequestHistory = {
      id: `${Date.now()}`,
      action: this.getActionLabel(dto.status),
      description: dto.comment || `Statut changé vers ${this.getStatusLabel(dto.status)}`,
      performedBy: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName
      },
      performedAt: new Date(),
      oldStatus,
      newStatus: dto.status
    };

    request.history = [...request.history, historyEntry];

    // Ajouter un commentaire si fourni
    if (dto.comment) {
      const comment: Comment = {
        id: `${Date.now()}-comment`,
        content: dto.comment,
        authorId: currentUser.id,
        author: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName
        },
        createdAt: new Date(),
        isInternal: true
      };
      request.comments = [...request.comments, comment];
    }

    // Assigner à un validateur si spécifié
    if (dto.assignTo) {
      request.currentValidatorId = dto.assignTo;
      // En production, récupérer les infos du validateur depuis l'API
    }

    const updatedRequests = [...requests];
    updatedRequests[requestIndex] = request;
    this.requests.set(updatedRequests);
    this.saveRequests();

    return of(request).pipe(delay(600));
  }

  addComment(requestId: string, content: string, isInternal: boolean = false): Observable<Comment> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    const comment: Comment = {
      id: `${Date.now()}`,
      content,
      authorId: currentUser.id,
      author: {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName
      },
      createdAt: new Date(),
      isInternal
    };

    const requests = this.requests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return throwError(() => new Error('Demande non trouvée'));
    }

    const request = { ...requests[requestIndex] };
    request.comments = [...request.comments, comment];
    request.updatedAt = new Date();

    const updatedRequests = [...requests];
    updatedRequests[requestIndex] = request;
    this.requests.set(updatedRequests);
    this.saveRequests();

    return of(comment).pipe(delay(400));
  }

  getStatusStats(): Observable<{ [key: string]: number }> {
    const requests = this.requests();
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === RequestStatus.PENDING).length,
      in_review: requests.filter(r => r.status === RequestStatus.IN_REVIEW).length,
      approved: requests.filter(r => r.status === RequestStatus.APPROVED).length,
      rejected: requests.filter(r => r.status === RequestStatus.REJECTED).length
    };

    return of(stats).pipe(delay(200));
  }

  private getActionLabel(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.PENDING: return 'Soumission';
      case RequestStatus.IN_REVIEW: return 'Mise en révision';
      case RequestStatus.APPROVED: return 'Approbation';
      case RequestStatus.REJECTED: return 'Rejet';
      case RequestStatus.CANCELLED: return 'Annulation';
      default: return 'Modification';
    }
  }

  private getStatusLabel(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.DRAFT: return 'Brouillon';
      case RequestStatus.PENDING: return 'En attente';
      case RequestStatus.IN_REVIEW: return 'En révision';
      case RequestStatus.APPROVED: return 'Approuvé';
      case RequestStatus.REJECTED: return 'Rejeté';
      case RequestStatus.CANCELLED: return 'Annulé';
      default: return status;
    }
  }

  private loadRequests(): Request[] {
    const saved = localStorage.getItem('workflow_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return this.mockRequests;
      }
    }
    return this.mockRequests;
  }

  private saveRequests(): void {
    localStorage.setItem('workflow_requests', JSON.stringify(this.requests()));
  }
}