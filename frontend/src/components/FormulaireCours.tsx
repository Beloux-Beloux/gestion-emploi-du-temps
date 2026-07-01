import { useState, useEffect } from 'react';
import type { Cours, CoursFormData } from '../types';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const COULEURS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

interface Props {
  cours: Cours | null;
  onSave: (data: CoursFormData) => void;
  onCancel: () => void;
}

export default function FormulaireCours({ cours, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<CoursFormData>({
    titre: '',
    professeur: '',
    salle: '',
    jour: 'Lundi',
    heure_debut: '08:00',
    heure_fin: '09:00',
    couleur: '#3B82F6',
  });

  useEffect(() => {
    if (cours) {
      setFormData({
        titre: cours.titre,
        professeur: cours.professeur,
        salle: cours.salle,
        jour: cours.jour,
        heure_debut: cours.heure_debut.substring(0, 5),
        heure_fin: cours.heure_fin.substring(0, 5),
        couleur: cours.couleur,
      });
    }
  }, [cours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">
          {cours ? 'Modifier le cours' : 'Ajouter un cours'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre du cours</label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={e => setFormData({ ...formData, titre: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Mathématiques"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Professeur</label>
            <input
              type="text"
              required
              value={formData.professeur}
              onChange={e => setFormData({ ...formData, professeur: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="M. Randria"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salle</label>
            <input
              type="text"
              required
              value={formData.salle}
              onChange={e => setFormData({ ...formData, salle: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Salle 101"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jour</label>
              <select
                value={formData.jour}
                onChange={e => setFormData({ ...formData, jour: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Couleur</label>
              <div className="flex gap-1 mt-1">
                {COULEURS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, couleur: c })}
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.couleur === c ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Début</label>
              <input
                type="time"
                required
                value={formData.heure_debut}
                onChange={e => setFormData({ ...formData, heure_debut: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fin</label>
              <input
                type="time"
                required
                value={formData.heure_fin}
                onChange={e => setFormData({ ...formData, heure_fin: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {cours ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}