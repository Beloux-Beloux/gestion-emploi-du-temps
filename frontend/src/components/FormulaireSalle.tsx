import { useState, useEffect } from 'react';
import type { Salle, SalleFormData } from '../types';

interface Props {
  salle: Salle | null;
  onSave: (data: SalleFormData) => void;
  onCancel: () => void;
}

export default function FormulaireSalle({ salle, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<SalleFormData>({
    nom: '',
    capacite: 30,
    batiment: '',
  });

  useEffect(() => {
    if (salle) {
      setFormData({
        nom: salle.nom,
        capacite: salle.capacite || 30,
        batiment: salle.batiment || '',
      });
    }
  }, [salle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">
          {salle ? 'Modifier la salle' : 'Ajouter une salle'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom de la salle *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={e => setFormData({ ...formData, nom: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Salle 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacité</label>
            <input
              type="number"
              min={1}
              value={formData.capacite}
              onChange={e => setFormData({ ...formData, capacite: parseInt(e.target.value) || 0 })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bâtiment</label>
            <input
              type="text"
              value={formData.batiment}
              onChange={e => setFormData({ ...formData, batiment: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Bâtiment A"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {salle ? 'Modifier' : 'Ajouter'}
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