export interface Request {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  status: RequestStatus;
  priority: Priority;
  applicantId: string;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
  };
  currentValidatorId?: string;
  currentValidator?: {
    firstName: string;
    lastName: string;
  };
  documents: Document[];
  history: RequestHistory[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export enum RequestType {
  LEAVE = 'leave',
  BUDGET = 'budget',
  PROCUREMENT = 'procurement',
  HR = 'hr',
  IT = 'it',
  OTHER = 'other'
}

export enum RequestStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface RequestHistory {
  id: string;
  action: string;
  description: string;
  performedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  performedAt: Date;
  oldStatus?: RequestStatus;
  newStatus?: RequestStatus;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  isInternal: boolean;
}

export interface CreateRequestDto {
  title: string;
  description: string;
  type: RequestType;
  priority: Priority;
  dueDate?: Date;
}

export interface UpdateRequestStatusDto {
  status: RequestStatus;
  comment?: string;
  assignTo?: string;
}