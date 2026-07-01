import { useState, useEffect } from 'react';
import type { Professeur, ProfesseurFormData } from '../types';

interface Props {
  professeur: Professeur | null;
  onSave: (data: ProfesseurFormData) => void;
  onCancel: () => void;
}

export default function FormulaireProfesseur({ professeur, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<ProfesseurFormData>({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    actif: true,
  });

  useEffect(() => {
    if (professeur) {
      setFormData({
        nom: professeur.nom,
        prenom: professeur.prenom,
        email: professeur.email || '',
        specialite: professeur.specialite || '',
        actif: professeur.actif,
      });
    }
  }, [professeur]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">
          {professeur ? 'Modifier le professeur' : 'Ajouter un professeur'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Rakoto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Jean"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="jean.rakoto@exemple.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Spécialité</label>
            <input
              type="text"
              value={formData.specialite}
              onChange={e => setFormData({ ...formData, specialite: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Mathématiques"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="actif"
              checked={formData.actif}
              onChange={e => setFormData({ ...formData, actif: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="actif" className="text-sm font-medium">
              Professeur actif (en congé si décoché)
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {professeur ? 'Modifier' : 'Ajouter'}
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