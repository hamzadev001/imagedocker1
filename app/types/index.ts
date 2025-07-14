export interface Comment {
  id: number;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  etablissementId: string;
}

export interface Etablissement {
  Etablissement: string;
  "Nature etablissement": string;
  Commune: string;
  Gestionnaire: string;
  Directeur: string;
  Contact: string;
  Localisation: string;
  status: "urgent" | "pending" | "archived";
  lastComment?: string;
  lastCommentDate?: string;
  comments?: Comment[];
  isRead?: boolean;
}

export interface Investigation {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestedById: string;
  respondedById?: string;
  etablissementId: string;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'investigation' | 'comment' | 'status_change';
  userId: string;
  isRead: boolean;
  createdAt: Date;
  investigationId?: string;
  etablissementId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CONTROLEUR' | 'ETABLISSEMENT';
}
