import React, { useState, useEffect } from 'react';

const ContratCounter = ({ onCountFetched }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalContracts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:7001/contrat");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Mettez à jour cette ligne pour accéder correctement aux données
        onCountFetched(data.data.length); // Utilisez data.data.length maintenant
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalContracts();
  }, [onCountFetched]);

  if (loading) {
    return null; // Ne rien retourner pendant le chargement
  }

  if (error) {
    return <span>Erreur: {error}</span>; // Gérer les erreurs ici si nécessaire
  }

  return null; // Retourne rien après le chargement
};

export default ContratCounter;