import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/fr"; // Import French locale
import FrenchCalendar from "./FrenchCalendar"; // Import our FrenchCalendar component
import ContractDetails from "./ContractDetails";

const CalendarSchedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);

  const colors = [
    "#ec44a0e8", "#008000", "#346dc4", "#FFA500", "#a836a8",
    "#4682B4", "#f0d955", "#3CB371", "#6e076e", "#0f5b98",
    "#c1a711", "#05a24c", "#c809c8", "#0f6f98", "#cd4797", "#51d08a",
  ];

  const handleEventDoubleClick = (event) => {
   
    setSelectedContract(event.resource); // Set the selected contract in state
  };

  useEffect(() => {
    const fetchContractsWithClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:7001/contrat");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Failed to fetch contracts: ${response.status} ${response.statusText}`);
        }

        if (!data || !Array.isArray(data.data)) {
          throw new Error("Invalid data format received from the server");
        }

        const eventsWithClients = await Promise.all(
          data.data.map(async (item, index) => {
            let startDate = null;
            let endDate = null;
            let clientName = `CIN: ${item?.cin_client || 'N/A'}`;

            if (item?.Date_debut) {
              startDate = item.Heure_debut
                ? moment(`${item.Date_debut} ${item.Heure_debut}`, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"]).toDate()
                : new Date(item.Date_debut);
            }
            if (item?.Date_retour) {
              endDate = item.Heure_retour
                ? moment(`${item.Date_retour} ${item.Heure_retour}`, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"]).toDate()
                : new Date(item.Date_retour);
            }

            if (!startDate || !endDate || !item?.Numero_contrat || !item?.cin_client) {
              console.warn("Skipping contract with missing data:", item);
              return null;
            }

            try {
              const clientResponse = await fetch(`http://localhost:7001/client?cin_client=${item.cin_client}`);
              const clientData = await clientResponse.json();

              if (clientResponse.ok && Array.isArray(clientData?.data) && clientData.data.length > 0) {
                const client = clientData.data.find(c => c.cin_client === item.cin_client);
                if (client) {
                  clientName = `${client.nom_fr} ${client.prenom_fr}`;
                } else {
                  console.warn("Client not found in fetched data for CIN:", item.cin_client);
                }
              } else {
                console.warn("Error fetching client or client data invalid for CIN:", item.cin_client, clientData);
              }
            } catch (clientError) {
              console.error("Error fetching client:", clientError);
            }

            return {
              title: `${item.Numero_contrat} ( ${item.num_immatriculation} - ${clientName} )`,
              start: startDate,
              end: endDate,
              allDay: !item.Heure_debut,
              resource: item,
              style: {
                backgroundColor: colors[index % colors.length],
                color: "white",
                borderRadius: "4px",
                padding: "4px",
              },
            };
          })
        );

        setEvents(eventsWithClients.filter(event => event !== null));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContractsWithClients();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "10px" }}>Chargement des contrats...</div>;
  }

  if (error) {
    return <div style={{ color: "red", textAlign: "center", marginTop: "30px" }}>Erreur: {error}</div>;
  }

  return (
    <div style={{ height: "80vh", backgroundColor: "#f0eeee", padding: "10px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", backgroundColor: "#fff", padding: "10px", borderRadius: "20px", boxShadow: "0 4px 12px rgba(159, 160, 236, 0.411)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "5px", color: "#0483cc" }}>Planning des Véhicules</h2>
        <FrenchCalendar events={events} onEventDoubleClick={handleEventDoubleClick} />

        {selectedContract && (
          <ContractDetails
            contract={selectedContract}
            onClose={() => setSelectedContract(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarSchedule;