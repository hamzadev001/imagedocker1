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
