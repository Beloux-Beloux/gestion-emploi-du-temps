import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Salle } from '../types';
import { salleService } from '../services/api';
import Loading from '../components/Loading';

export default function GestionSalles() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Salle | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nom: '', capacite: 30 });

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await salleService.getAll();
      setSalles(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await salleService.update(editing.id, form);
        toast.success('Salle modifiée avec succès');
      } else {
        await salleService.create(form);
        toast.success('Salle ajoutée avec succès');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nom: '', capacite: 30 });
      charger();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (s: Salle) => {
    setEditing(s);
    setForm({ nom: s.nom, capacite: s.capacite });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette salle ?')) return;
    try {
      await salleService.delete(id);
      toast.success('Salle supprimée');
      charger();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading message="Chargement des salles..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gestion des salles</h2>
        <button onClick={() => { setEditing(null); setForm({ nom: '', capacite: 30 }); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Modifier' : 'Ajouter'} une salle</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Nom de la salle" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required className="w-full border rounded-lg px-3 py-2"/>
              <input placeholder="Capacité" type="number" value={form.capacite} onChange={e => setForm({...form, capacite: parseInt(e.target.value) || 30})} required className="w-full border rounded-lg px-3 py-2"/>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">{editing ? 'Modifier' : 'Ajouter'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 border py-2 rounded-lg">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">Nom</th>
              <th className="p-3 text-left text-sm font-semibold">Capacité</th>
              <th className="p-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{s.nom}</td>
                <td className="p-3 text-gray-500">{s.capacite} places</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline mr-3">Modifier</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Supprimer</button>
                </td>
              </tr>
            ))}
            {salles.length === 0 && (
              <tr><td colSpan={3} className="p-6 text-center text-gray-400">Aucune salle</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}