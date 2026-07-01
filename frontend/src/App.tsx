import { useState } from 'react';
import GestionProfesseurs from './pages/GestionProfesseurs';
import GestionSalles from './pages/GestionSalles';
import GestionCours from './pages/GestionCours';
import EmploiDuTemps from './pages/EmploiDuTemps';

type Onglet = 'professeurs' | 'salles' | 'cours' | 'edt';

function App() {
  const [onglet, setOnglet] = useState<Onglet>('professeurs');
  const [refreshEdt, setRefreshEdt] = useState(0);

  const onglets: { key: Onglet; label: string }[] = [
    { key: 'professeurs', label: 'Professeurs' },
    { key: 'salles', label: 'Salles' },
    { key: 'cours', label: 'Cours' },
    { key: 'edt', label: 'Emploi du temps' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Gestion d'Emploi du Temps
          </h1>
          <nav className="flex gap-1">
            {onglets.map((o) => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                  onglet === o.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {o.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {onglet === 'professeurs' && <GestionProfesseurs />}
        {onglet === 'salles' && <GestionSalles />}
        {onglet === 'cours' && <GestionCours onCoursChange={() => setRefreshEdt(prev => prev + 1)} />}
        {onglet === 'edt' && <EmploiDuTemps refresh={refreshEdt} />}
      </main>
    </div>
  );
}

export default App;