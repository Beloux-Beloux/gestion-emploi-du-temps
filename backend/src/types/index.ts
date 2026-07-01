export interface Professeur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfesseurFormData {
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
  actif: boolean;
}

export interface Salle {
  id: string;
  nom: string;
  capacite: number;
  batiment: string;
  created_at: string;
  updated_at: string;
}

export interface SalleFormData {
  nom: string;
  capacite: number;
  batiment: string;
}

export interface Cours {
  id: string;
  titre: string;
  professeur_id: string;
  professeur_nom?: string;
  salle_id: string;
  salle_nom?: string;
  niveau: string;
  groupes: string[];
  jour: string;
  heure_debut: string;
  heure_fin: string;
  couleur: string;
  created_at: string;
  updated_at: string;
}

export interface CoursFormData {
  titre: string;
  professeur_id: string;
  salle_id: string;
  niveau: string;
  groupes: string[];
  jour: string;
  heure_debut: string;
  heure_fin: string;
  couleur: string;
}