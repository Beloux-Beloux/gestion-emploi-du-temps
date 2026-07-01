export interface Professeur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
  created_at: string;
  updated_at: string;
}

export interface Salle {
  id: string;
  nom: string;
  capacite: number;
  created_at: string;
  updated_at: string;
}

export interface Cours {
  id: string;
  titre: string;
  professeur_id: string;
  professeur_nom: string;
  professeur_prenom: string;
  salle_id: string;
  salle_nom: string;
  niveau: string;
  groupe: string;
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
  groupe: string;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  couleur: string;
}