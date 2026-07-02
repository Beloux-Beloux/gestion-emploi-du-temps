import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Professeur } from '../types';
import { professeurService } from '../services/api';
import Loading from '../components/Loading';

export default function GestionProfesseurs() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Professeur | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', specialite: '' });

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await professeurService.getAll();
      setProfesseurs(res.data);
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
        await professeurService.update(editing.id, form);
        toast.success('Professeur modifié avec succès');
      } else {
        await professeurService.create(form);
        toast.success('Professeur ajouté avec succès');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nom: '', prenom: '', email: '', specialite: '' });
      charger();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (p: Professeur) => {
    setEditing(p);
    setForm({ nom: p.nom, prenom: p.prenom, email: p.email, specialite: p.specialite });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce professeur ?')) return;
    try {
      await professeurService.delete(id);
      toast.success('Professeur supprimé');
      charger();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading message="Chargement des professeurs..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gestion des professeurs</h2>
        <button onClick={() => { setEditing(null); setForm({ nom: '', prenom: '', email: '', specialite: '' }); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Modifier' : 'Ajouter'} un professeur</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required className="w-full border rounded-lg px-3 py-2"/>
              <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required className="w-full border rounded-lg px-3 py-2"/>
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              <input placeholder="Spécialité" value={form.specialite} onChange={e => setForm({...form, specialite: e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
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
              <th className="p-3 text-left text-sm font-semibold">Prénom</th>
              <th className="p-3 text-left text-sm font-semibold">Email</th>
              <th className="p-3 text-left text-sm font-semibold">Spécialité</th>
              <th className="p-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {professeurs.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.nom}</td>
                <td className="p-3">{p.prenom}</td>
                <td className="p-3 text-gray-500">{p.email}</td>
                <td className="p-3 text-gray-500">{p.specialite}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline mr-3">Modifier</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Supprimer</button>
                </td>
              </tr>
            ))}
            {professeurs.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">Aucun professeur</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}