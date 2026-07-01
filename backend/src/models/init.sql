CREATE TABLE IF NOT EXISTS professeur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  specialite VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL UNIQUE,
  capacite INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(255) NOT NULL,
  professeur_id UUID NOT NULL REFERENCES professeur(id) ON DELETE CASCADE,
  salle_id UUID NOT NULL REFERENCES salle(id) ON DELETE CASCADE,
  niveau VARCHAR(20) NOT NULL, -- L1, L2, L3, M1
  groupe VARCHAR(10) NOT NULL DEFAULT 'Grp1', -- Grp1, Grp2, Grp1+Grp2
  jour VARCHAR(20) NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  couleur VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les contraintes
CREATE INDEX IF NOT EXISTS idx_cours_professeur ON cours(professeur_id);
CREATE INDEX IF NOT EXISTS idx_cours_salle ON cours(salle_id);
CREATE INDEX IF NOT EXISTS idx_cours_niveau ON cours(niveau);
CREATE INDEX IF NOT EXISTS idx_cours_jour ON cours(jour);
CREATE INDEX IF NOT EXISTS idx_cours_groupe ON cours(groupe);