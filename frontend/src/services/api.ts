import axios from 'axios';
import type { Cours, CoursFormData, Professeur, Salle } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const professeurService = {
  getAll: () => api.get<Professeur[]>('/professeurs'),
  create: (data: { nom: string; prenom: string; email: string; specialite: string }) => api.post<Professeur>('/professeurs', data),
  update: (id: string, data: Partial<Professeur>) => api.put<Professeur>(`/professeurs/${id}`, data),
  delete: (id: string) => api.delete(`/professeurs/${id}`),
};

export const salleService = {
  getAll: () => api.get<Salle[]>('/salles'),
  create: (data: { nom: string; capacite: number }) => api.post<Salle>('/salles', data),
  update: (id: string, data: Partial<Salle>) => api.put<Salle>(`/salles/${id}`, data),
  delete: (id: string) => api.delete(`/salles/${id}`),
};

export const coursService = {
  getAll: () => api.get<Cours[]>('/cours'),
  getByNiveau: (niveau: string) => api.get<Cours[]>(`/cours/niveau/${encodeURIComponent(niveau)}`),
  getNiveaux: () => api.get<string[]>('/cours/niveaux'),
  create: (data: CoursFormData) => api.post<Cours>('/cours', data),
  update: (id: string, data: Partial<CoursFormData>) => api.put<Cours>(`/cours/${id}`, data),
  delete: (id: string) => api.delete(`/cours/${id}`),
};