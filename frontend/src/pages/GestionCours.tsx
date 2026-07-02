import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Cours, CoursFormData, Professeur, Salle } from '../types';
import { coursService, professeurService, salleService } from '../services/api';
import Loading from '../components/Loading';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1'];
const GROUPES = ['Grp1', 'Grp2', 'Grp1+Grp2'];
const COULEURS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

interface Props {
  onCoursChange: () => void;
}

export default function GestionCours({ onCoursChange }: Props) {
  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cours | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CoursFormData>({
    titre: '', professeur_id: '', salle_id: '', niveau: 'L1', groupe: 'Grp1',
    jour: 'Lundi', heure_debut: '08:00', heure_fin: '09:00', couleur: '#3B82F6',
  });

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const [coursRes, profRes, salleRes] = await Promise.all([
        coursService.getAll(),
        professeurService.getAll(),
        salleService.getAll(),
      ]);
      setCoursList(coursRes.data);
      setProfesseurs(profRes.data);
      setSalles(salleRes.data);
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
        await coursService.update(editing.id, form);
        toast.success('Cours modifié avec succès');
      } else {
        await coursService.create(form);
        toast.success('Cours ajouté avec succès');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ titre: '', professeur_id: '', salle_id: '', niveau: 'L1', groupe: 'Grp1', jour: 'Lundi', heure_debut: '08:00', heure_fin: '09:00', couleur: '#3B82F6' });
      charger();
      onCoursChange();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (c: Cours) => {
    setEditing(c);
    setForm({ titre: c.titre, professeur_id: c.professeur_id, salle_id: c.salle_id, niveau: c.niveau, groupe: c.groupe, jour: c.jour, heure_debut: c.heure_debut.substring(0,5), heure_fin: c.heure_fin.substring(0,5), couleur: c.couleur });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    try {
      await coursService.delete(id);
      toast.success('Cours supprimé');
      charger();
      onCoursChange();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading message="Chargement des cours..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gestion des cours</h2>
        <button onClick={() => { setEditing(null); setForm({ titre: '', professeur_id: '', salle_id: '', niveau: 'L1', groupe: 'Grp1', jour: 'Lundi', heure_debut: '08:00', heure_fin: '09:00', couleur: '#3B82F6' }); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Modifier' : 'Ajouter'} un cours</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Titre du cours" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} required className="w-full border rounded-lg px-3 py-2"/>
              
              <select value={form.professeur_id} onChange={e => setForm({...form, professeur_id: e.target.value})} required className="w-full border rounded-lg px-3 py-2">
                <option value="">Sélectionner un professeur</option>
                {professeurs.map(p => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>

              <select value={form.salle_id} onChange={e => setForm({...form, salle_id: e.target.value})} required className="w-full border rounded-lg px-3 py-2">
                <option value="">Sélectionner une salle</option>
                {salles.map(s => (
                  <option key={s.id} value={s.id}>{s.nom} ({s.capacite} places)</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <select value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})} className="border rounded-lg px-3 py-2">
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={form.groupe} onChange={e => setForm({...form, groupe: e.target.value})} className="border rounded-lg px-3 py-2">
                  {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <select value={form.jour} onChange={e => setForm({...form, jour: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Début</label>
                  <input type="time" value={form.heure_debut} onChange={e => setForm({...form, heure_debut: e.target.value})} required className="w-full border rounded-lg px-3 py-2"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fin</label>
                  <input type="time" value={form.heure_fin} onChange={e => setForm({...form, heure_fin: e.target.value})} required className="w-full border rounded-lg px-3 py-2"/>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Couleur</label>
                <div className="flex gap-2">
                  {COULEURS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, couleur: c})}
                      className={`w-7 h-7 rounded-full border-2 ${form.couleur === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{editing ? 'Modifier' : 'Ajouter'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 border py-2 rounded-lg">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left font-semibold">Titre</th>
              <th className="p-3 text-left font-semibold">Professeur</th>
              <th className="p-3 text-left font-semibold">Salle</th>
              <th className="p-3 text-left font-semibold">Niveau</th>
              <th className="p-3 text-left font-semibold">Jour</th>
              <th className="p-3 text-left font-semibold">Horaire</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coursList.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{c.titre}</td>
                <td className="p-3">{c.professeur_prenom} {c.professeur_nom}</td>
                <td className="p-3">{c.salle_nom}</td>
                <td className="p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{c.niveau} {c.groupe}</span>
                </td>
                <td className="p-3">{c.jour}</td>
                <td className="p-3 text-gray-500">{c.heure_debut.substring(0,5)} - {c.heure_fin.substring(0,5)}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline mr-3">Modifier</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Supprimer</button>
                </td>
              </tr>
            ))}
            {coursList.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">Aucun cours</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}