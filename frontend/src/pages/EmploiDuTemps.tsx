import { useState, useEffect, useRef } from 'react';
import type { Cours } from '../types';
import { coursService } from '../services/api';

const HEURES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TOUS_NIVEAUX = ['L1 Grp1', 'L1 Grp2', 'L2 Grp1', 'L2 Grp2', 'L3 Grp1', 'L3 Grp2', 'M1 Grp1', 'M1 Grp2'];

interface Props {
  refresh: number;
}

export default function EmploiDuTemps({ refresh }: Props) {
  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [niveauSelectionne, setNiveauSelectionne] = useState('L1 Grp1');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chargerCours();
  }, [refresh]);

  const chargerCours = async () => {
    try {
      const response = await coursService.getAll();
      setCoursList(response.data);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
    }
  };

  const [niveauFilter, groupeFilter] = niveauSelectionne.split(' ');

  const coursFiltres = coursList.filter(c => {
    if (c.niveau !== niveauFilter) return false;
    if (groupeFilter === 'Grp1+Grp2') return true;
    if (c.groupe === 'Grp1+Grp2') return true;
    return c.groupe === groupeFilter;
  });

  const getCoursForSlot = (jour: string, heure: string) => {
    return coursFiltres.filter(c => {
      const debut = c.heure_debut.substring(0, 5);
      const fin = c.heure_fin.substring(0, 5);
      return c.jour === jour && debut <= heure && fin > heure;
    });
  };

  const getCoursSpan = (coursItem: Cours) => {
    const debut = parseInt(coursItem.heure_debut.split(':')[0]);
    const fin = parseInt(coursItem.heure_fin.split(':')[0]);
    return Math.max(fin - debut, 1);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
        <h2 className="text-xl font-bold">Emploi du temps</h2>
        <div className="flex items-center gap-3">
          <select
            value={niveauSelectionne}
            onChange={e => setNiveauSelectionne(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white shadow-sm"
          >
            {TOUS_NIVEAUX.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            🖨️ Imprimer
          </button>
        </div>
      </div>

      <div ref={printRef} className="bg-white rounded-xl shadow-sm overflow-x-auto print:overflow-visible print:shadow-none">
        <style>{`
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
            header, nav, button, select, .fixed { display: none !important; }
            @page { 
              size: landscape;
              margin: 10mm;
            }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:overflow-visible { overflow: visible !important; }
            table { font-size: 9px !important; width: 100% !important; }
            td, th { padding: 3px 2px !important; }
          }
        `}</style>
        
        <div className="p-2 print:p-0">
          <h3 className="text-center text-base font-bold mb-2 hidden print:block">
            Emploi du temps - {niveauSelectionne}
          </h3>
          <div className="min-w-[700px] print:min-w-0">
            <table className="w-full border-collapse text-xs print:text-[9px]">
              <thead>
                <tr>
                  <th className="border p-1.5 bg-gray-50 text-xs font-semibold text-gray-600 w-14 print:w-12 print:p-1">
                    Heure
                  </th>
                  {JOURS.map(jour => (
                    <th key={jour} className="border p-1.5 bg-gray-50 text-xs font-semibold text-gray-600 print:p-1">
                      {jour.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEURES.map((heure) => (
                  <tr key={heure}>
                    <td className="border p-1.5 text-[10px] text-gray-500 text-center bg-gray-50 print:p-1">
                      {heure}
                    </td>
                    {JOURS.map(jour => {
                      const coursSlot = getCoursForSlot(jour, heure);
                      const coursPrincipal = coursSlot[0];
                      
                      if (coursPrincipal && coursPrincipal.heure_debut.substring(0, 5) === heure) {
                        const span = getCoursSpan(coursPrincipal);
                        return (
                          <td
                            key={jour}
                            rowSpan={span}
                            className="border p-1 relative"
                            style={{ backgroundColor: coursPrincipal.couleur + '20' }}
                          >
                            <div className="font-semibold text-[10px] print:text-[8px] leading-tight" style={{ color: coursPrincipal.couleur }}>
                              {coursPrincipal.titre}
                            </div>
                            <div className="text-gray-600 text-[9px] print:text-[7px] leading-tight">
                              {coursPrincipal.professeur_prenom?.substring(0, 1)}. {coursPrincipal.professeur_nom}
                            </div>
                            <div className="text-gray-500 text-[9px] print:text-[7px] leading-tight">
                              S.{coursPrincipal.salle_nom?.substring(0, 8)}
                            </div>
                            <div className="text-gray-400 text-[8px] print:text-[6px] leading-tight">
                              {coursPrincipal.heure_debut.substring(0, 5)}-{coursPrincipal.heure_fin.substring(0, 5)}
                            </div>
                            {coursPrincipal.groupe === 'Grp1+Grp2' && (
                              <div className="text-[8px] print:text-[6px] mt-0.5 bg-gray-200 rounded px-0.5 inline-block leading-tight">
                                G1+G2
                              </div>
                            )}
                          </td>
                        );
                      }
                      
                      if (coursSlot.length > 0) return null;
                      
                      return <td key={jour} className="border p-1.5 print:p-1"></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}