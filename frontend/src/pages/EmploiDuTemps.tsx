import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import type { Cours } from '../types';
import { coursService } from '../services/api';
import jsPDF from 'jspdf';

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
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chargerCours(); }, [refresh]);

  const chargerCours = async () => {
    setLoading(true);
    try {
      const response = await coursService.getAll();
      setCoursList(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setLoading(false);
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

  const handleExportPDF = async () => {
    setExporting(true);

    try {
      toast.loading('Génération du PDF...', { id: 'pdf-export' });

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Titre
      pdf.setFontSize(16);
      pdf.setTextColor(30, 64, 175);
      pdf.text(`Emploi du temps - ${niveauSelectionne}`, pageWidth / 2, 15, { align: 'center' });

      // Sous-titre
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Généré le ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 22, { align: 'center' });

      const heures = HEURES;
      const jours = JOURS.map(j => j.substring(0, 3));

      const startX = 10;
      const startY = 30;
      const colWidth = (pageWidth - 50) / jours.length;
      const timeColWidth = 20;
      const cellPadding = 2;

      // --- Hauteur de ligne calculée dynamiquement pour tenir sur une seule page ---
      const headerRowHeight = 10;
      const footerSpace = 15;
      const availableHeight = pageHeight - startY - headerRowHeight - footerSpace;
      const rowHeight = availableHeight / heures.length;

      // --- En-tête du tableau : même style que les cellules du corps ---
      const headerFillColor: [number, number, number] = [255, 255, 255];
      const headerBorderColor: [number, number, number] = [210, 210, 210];

      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');

      // En-tête colonne heure
      pdf.setFillColor(...headerFillColor);
      pdf.setDrawColor(...headerBorderColor);
      pdf.rect(startX, startY, timeColWidth, headerRowHeight, 'FD');
      pdf.text('Heure', startX + cellPadding, startY + headerRowHeight / 2 + 1);

      // En-têtes des jours
      jours.forEach((jour, i) => {
        const x = startX + timeColWidth + i * colWidth;
        pdf.setFillColor(...headerFillColor);
        pdf.setDrawColor(...headerBorderColor);
        pdf.rect(x, startY, colWidth, headerRowHeight, 'FD');
        pdf.text(jour, x + colWidth / 2, startY + headerRowHeight / 2 + 1, { align: 'center' });
      });

      pdf.setFont(undefined, 'normal');

      let y = startY + headerRowHeight;

      heures.forEach((heure) => {
        const hours = parseInt(heure.split(':')[0]);

        // Cellule heure
        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(200, 200, 200);
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.rect(startX, y, timeColWidth, rowHeight, 'F');
        pdf.rect(startX, y, timeColWidth, rowHeight, 'S');
        pdf.text(heure, startX + cellPadding, y + cellPadding + 3);

        // Cellules des jours
        jours.forEach((jour, jIndex) => {
          const x = startX + timeColWidth + jIndex * colWidth;
          const jourComplet = JOURS[jIndex];

          const coursCell = coursFiltres.filter(c => {
            const debut = c.heure_debut.substring(0, 5);
            const fin = c.heure_fin.substring(0, 5);
            return c.jour === jourComplet && debut <= heure && fin > heure;
          });

          const coursPrincipal = coursCell[0];

          if (coursPrincipal && coursPrincipal.heure_debut.substring(0, 5) === heure) {
            const span = Math.max(parseInt(coursPrincipal.heure_fin.split(':')[0]) - hours, 1);
            const cellHeight = rowHeight * span;

            // Fond clair/transparent, comme le fond de la page
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(210, 210, 210);
            pdf.rect(x, y, colWidth, cellHeight, 'F');
            pdf.rect(x, y, colWidth, cellHeight, 'S');

            // Texte sombre, comme "Généré le"
            pdf.setTextColor(100, 100, 100);
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'bold');
            pdf.text(coursPrincipal.titre, x + cellPadding, y + cellPadding + 4);

            pdf.setFontSize(7);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(120, 120, 120);

            const profText = `${coursPrincipal.professeur_prenom?.substring(0, 1)}. ${coursPrincipal.professeur_nom}`;
            pdf.text(`Prof: ${profText}`, x + cellPadding, y + cellPadding + 11);
            pdf.text(`Salle: ${coursPrincipal.salle_nom}`, x + cellPadding, y + cellPadding + 17);

            pdf.setTextColor(150, 150, 150);
            pdf.setFontSize(6);
            pdf.text(`${coursPrincipal.heure_debut.substring(0, 5)}-${coursPrincipal.heure_fin.substring(0, 5)}`, x + cellPadding, y + cellPadding + 22);

            if (coursPrincipal.groupe === 'Grp1+Grp2') {
              pdf.setTextColor(130, 130, 130);
              pdf.text('G1+G2', x + cellPadding, y + cellPadding + 27);
            }
          } else if (!coursPrincipal) {
            // Cellule vide
            pdf.setFillColor(255, 255, 255);
            pdf.rect(x, y, colWidth, rowHeight, 'F');
            pdf.rect(x, y, colWidth, rowHeight, 'S');
          }
          // sinon : cellule couverte par le rowSpan d'un cours précédent -> rien à dessiner
        });

        y += rowHeight; // avance fixe, garantit une seule page
      });

      // Pied de page
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Généré par Gestion d\'Emploi du Temps', pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.save(`Emploi_du_temps_${niveauSelectionne.replace(' ', '_')}.pdf`);
      toast.success('PDF téléchargé avec succès !', { id: 'pdf-export' });

    } catch (error) {
      console.error('Erreur PDF:', error);
      toast.error('Erreur lors de la génération du PDF', { id: 'pdf-export' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-gray-500">Chargement de l'emploi du temps...</p>
      </div>
    );
  }

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
            onClick={handleExportPDF}
            disabled={exporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? '⏳' : '📄'} {exporting ? 'Génération...' : 'Exporter PDF'}
          </button>
        </div>
      </div>

      <div ref={printRef} className="bg-white rounded-xl shadow-sm overflow-x-auto print:overflow-visible print:shadow-none">
        <div className="p-4 print:p-2">
          <h3 className="text-center text-lg font-bold mb-4">
            Emploi du temps - {niveauSelectionne}
          </h3>
          <table className="w-full border-collapse text-xs" style={{ minWidth: '750px' }}>
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50 text-xs font-semibold text-gray-600 w-16" style={{ fontSize: '11px' }}>
                  Heure
                </th>
                {JOURS.map(jour => (
                  <th key={jour} className="border p-2 bg-gray-50 text-xs font-semibold text-gray-600" style={{ fontSize: '11px' }}>
                    {jour.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEURES.map((heure) => (
                <tr key={heure}>
                  <td className="border p-1.5 text-[10px] text-gray-500 text-center bg-gray-50" style={{ fontSize: '10px' }}>
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
                          className="border p-1.5 relative"
                          style={{ backgroundColor: coursPrincipal.couleur + '20', fontSize: '10px' }}
                        >
                          <div className="font-semibold" style={{ color: coursPrincipal.couleur, fontSize: '11px' }}>
                            {coursPrincipal.titre}
                          </div>
                          <div className="text-gray-600" style={{ fontSize: '9px' }}>
                            {coursPrincipal.professeur_prenom?.substring(0, 1)}. {coursPrincipal.professeur_nom}
                          </div>
                          <div className="text-gray-500" style={{ fontSize: '9px' }}>
                            S.{coursPrincipal.salle_nom}
                          </div>
                          <div className="text-gray-400" style={{ fontSize: '8px' }}>
                            {coursPrincipal.heure_debut.substring(0, 5)}-{coursPrincipal.heure_fin.substring(0, 5)}
                          </div>
                          {coursPrincipal.groupe === 'Grp1+Grp2' && (
                            <div className="mt-0.5 bg-gray-200 rounded px-1 inline-block" style={{ fontSize: '8px' }}>
                              G1+G2
                            </div>
                          )}
                        </td>
                      );
                    }

                    if (coursSlot.length > 0) return null;

                    return <td key={jour} className="border p-1.5"></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}