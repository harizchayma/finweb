import React, { useState, useEffect } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  Header,
  StatBox,
  LineChart
} from "../../components";
import { tokens } from "../../theme";
import ContratCounter from "./ContratCounter";
import ReservationCounter from "./ReservationCounter";
import ClientCounter from "./ClientCounter";
import VehiculeCounter from "./VehiculeCounter";
import UtilisateurCounter from "./UtilisateurCounter";
import { FcUp } from "react-icons/fc";
import MyBarChart from "../../components/MyBarChart";
import {
  FcConferenceCall,
  FcAutomotive,
  FcSmartphoneTablet,
  FcSurvey,
  FcManager,
} from "react-icons/fc";

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXlDevices = useMediaQuery("(min-width: 1260px)");
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const vehicleColors = ["#559fe1", "#bf3be7", "#c5c514", "#c51616", "#23d5d5"];

  const monthOrder = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const [monthlyData, setMonthlyData] = useState([
    {
      id: "Total Prix",
      data: monthOrder.map((month) => ({ x: month, y: 0 })),
    },
    {
      id: "Total Réservations",
      data: monthOrder.map((month) => ({ x: month, y: 0 })),
    },
  ]);
  const [totalContracts, setTotalContracts] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalReservations, setTotalReservations] = useState(0);
  const [totalVehicules, setTotalVehicules] = useState(0);
  const [totalUtilisateurs, setTotalUtilisateurs] = useState(0);
  const [contracts, setContracts] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [monthlData, setMonthlData] = useState([]);

  const fetchDataAvance = async () => {
    try {
      // Récupérer les avances
      const responseAvance = await fetch("http://localhost:7001/avance");
      if (!responseAvance.ok) {
        throw new Error(
          `HTTP error! status: ${responseAvance.status} (avance)`
        );
      }
      const dataAvance = await responseAvance.json();
      const avancesArray = dataAvance.data || [];

      // Récupérer les paiements
      const responsePaiement = await fetch("http://localhost:7001/paiement");
      if (!responsePaiement.ok) {
        throw new Error(
          `HTTP error! status: ${responsePaiement.status} (paiement)`
        );
      }
      const dataPaiement = await responsePaiement.json();
      const paiementsArray = dataPaiement.data || [];

      const aggregatedData = {};

      // Fonction pour ajouter les montants à l'objet d'agrégation
      const addAmounts = (dataArray, isAvance = true) => {
        dataArray.forEach((item) => {
          const date = isAvance ? item.date : item.date_paiement;
          if (date) {
            const month = new Date(date).toLocaleString("default", {
              month: "long",
            });
            if (!aggregatedData[month]) {
              aggregatedData[month] = {
                month,
                cheque: 0,
                espace: 0,
                virement: 0,
              };
            }
            aggregatedData[month].cheque +=
              parseFloat(item.montant_cheque1 || 0) +
              parseFloat(item.montant_cheque2 || 0);
            aggregatedData[month].espace += parseFloat(
              item.montant_espace || 0
            );
            aggregatedData[month].virement += parseFloat(
              item.montant_virement || 0
            );
          }
        });
      };

      // Ajouter les montants des avances
      addAmounts(avancesArray, true);

      // Ajouter les montants des paiements
      addAmounts(paiementsArray, false);

      // Créer le tableau final avec tous les mois
      const finalMonthlyData = monthOrder.map((month) => ({
        month,
        cheque: aggregatedData[month]?.cheque || 0,
        espace: aggregatedData[month]?.espace || 0,
        virement: aggregatedData[month]?.virement || 0,
      }));
      setMonthlData(finalMonthlyData);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données d'avance et de paiement:",
        error
      );
      setMonthlData(
        monthOrder.map((month) => ({
          month,
          cheque: 0,
          espace: 0,
          virement: 0,
        }))
      );
    }
  };
  // Fonction pour récupérer les contrats
  const fetchContracts = async () => {
    try {
      const response = await fetch("http://localhost:7001/contrat");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setContracts(result.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des contrats:", error);
    }
  };

  // Fonction pour récupérer les informations des clients
  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:7001/client");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setClientsData(result.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
    }
  };

  // Fonction pour récupérer les informations des véhicules
  const fetchVehicules = async () => {
    try {
      const response = await fetch("http://localhost:7001/vehicules");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setVehiclesData(result.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des véhicules:", error);
    }
  };
  const fetchMonthlyTotals = async () => {
    try {
      // Fetch contract data
      const responseContracts = await fetch("http://localhost:7001/contrat");
      if (!responseContracts.ok) {
        throw new Error(`HTTP error! status: ${responseContracts.status} (contrats)`);
      }
      const resultContracts = await responseContracts.json();
      const monthlyTotalsRaw = {};
      if (Array.isArray(resultContracts.data)) {
        resultContracts.data.forEach((contrat) => {
          const dateDebut = new Date(contrat.Date_debut);
          const month = dateDebut.toLocaleString("default", { month: "long" });
          monthlyTotalsRaw[month] =
            (monthlyTotalsRaw[month] || 0) + parseFloat(contrat.Prix_total);
        });
      }

      const monthlyTotalsWithZeros = monthOrder.reduce((acc, month) => {
        acc[month] = monthlyTotalsRaw[month] || 0;
        return acc;
      }, {});

      // Fetch reservation data
      const responseReservations = await fetch("http://localhost:7001/reservation");
      if (!responseReservations.ok) {
        throw new Error(`HTTP error! status: ${responseReservations.status} (reservations)`);
      }
      const resultReservations = await responseReservations.json();
      const monthlyReservationsRaw = {};
      if (Array.isArray(resultReservations.data)) {
        resultReservations.data.forEach((reservation) => {
          const dateDebut = new Date(reservation.Date_debut);
          const month = dateDebut.toLocaleString("default", { month: "long" });
          monthlyReservationsRaw[month] = (monthlyReservationsRaw[month] || 0)  + parseFloat(reservation.Prix_total);
        });
      }

      const monthlyReservationsWithZeros = monthOrder.reduce((acc, month) => {
        acc[month] = monthlyReservationsRaw[month] || 0;
        return acc;
      }, {});

      const lineData = [
        {
          id: "Contrats",
          color: "#ec2df2", // Couleur pour "Total Prix"
          data: monthOrder.map((month) => ({
            x: month,
            y: monthlyTotalsWithZeros[month],
          })),
        },
        {
          id: "Réservations",
          color: "#06cbd9", // Ici, tu peux changer cette couleur en rouge
          data: monthOrder.map((month) => ({
            x: month,
            y: monthlyReservationsWithZeros[month],
          })),
        },
      ];

      setMonthlyData(lineData);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des totaux mensuels et des réservations:",
        error
      );
      setMonthlyData([
        {
          id: "Total Prix",
          data: monthOrder.map((month) => ({ x: month, y: 0 })),
        },
        {
          id: "Total Réservations",
          data: monthOrder.map((month) => ({ x: month, y: 0 })),
        },
      ]);
    }
  };

  useEffect(() => {
    fetchDataAvance();
    fetchContracts();
    fetchClients();
    fetchVehicules();
    fetchMonthlyTotals(); // This function now fetches both contract and reservation data
  }, []);

  // Fonction pour calculer le top 5 des véhicules
  const calculateTopVehicles = (contracts, vehicles) => {
    const vehicleCount = {};
    contracts.forEach((contract) => {
      const numImmatriculation = contract.num_immatriculation;
      if (numImmatriculation) {
        vehicleCount[numImmatriculation] =
          (vehicleCount[numImmatriculation] || 0) + 1;
      }
    });
    const sortedVehicles = Object.entries(vehicleCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([numImmatriculation, count]) => {
        const vehiculeInfo = vehicles.find(
          (vehicule) => vehicule.num_immatriculation === numImmatriculation
        );
        return {
          numImmatriculation,
          count,
          marque: vehiculeInfo ? vehiculeInfo.marque : "N/A",
          modele: vehiculeInfo ? vehiculeInfo.modele : "N/A",
        };
      });
    setTopVehicles(sortedVehicles);
  };

  // Fonction pour calculer le top 5 des clients et récupérer leurs noms
  const calculateTopClients = (contracts, clients) => {
    const clientCount = {};
    contracts.forEach((contract) => {
      const cinClient = contract.cin_client;
      if (cinClient) {
        clientCount[cinClient] = (clientCount[cinClient] || 0) + 1;
      }
    });

    const sortedClients = Object.entries(clientCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([cinClient, count]) => {
        const clientInfo = clients.find(
          (client) => client.cin_client === cinClient
        );
        return {
          cinClient,
          count,
          nom_fr: clientInfo ? clientInfo.nom_fr : "N/A",
          prenom_fr: clientInfo ? clientInfo.prenom_fr : "N/A",
        };
      });
    setTopClients(sortedClients);
  };

  useEffect(() => {
    if (contracts.length > 0 && vehiclesData.length > 0) {
      calculateTopVehicles(contracts, vehiclesData);
    }
    if (contracts.length > 0 && clientsData.length > 0) {
      calculateTopClients(contracts, clientsData);
    }
  }, [contracts, vehiclesData, clientsData]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between">
        <Header title="TABLEAU DE BORD" />
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={
          isXlDevices
            ? "repeat(15, 1fr)"
            : isMdDevices
              ? "repeat(3, 1fr)"
              : "repeat(1, 1fr)"
        }
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ... (vos autres composants StatBox et Compteurs) ... */}
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalContracts !== 0 ? totalContracts : ""}
            subtitle="Contrats"
            icon={<FcSurvey />}
          />
        </Box>
        <ContratCounter onCountFetched={setTotalContracts} />
        <ReservationCounter onCountFetched={setTotalReservations} />
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalReservations !== 0 ? totalReservations : ""}
            subtitle="Réservations"
            icon={<FcSmartphoneTablet />}
          />
        </Box>
        <ClientCounter onCountFetched={setTotalClients} />
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalClients !== 0 ? totalClients : ""}
            subtitle="Clients"
            icon={<FcConferenceCall />}
          />
        </Box>
        <VehiculeCounter onCountFetched={setTotalVehicules} />
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalVehicules !== 0 ? totalVehicules : ""}
            subtitle="Véhicules"
            icon={<FcAutomotive />}
          />
        </Box>
        <UtilisateurCounter onCountFetched={setTotalUtilisateurs} />
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalUtilisateurs !== 0 ? totalUtilisateurs : ""}
            subtitle="Utilisateurs"
            icon={<FcManager />}
          />
        </Box>

        <Box
          gridColumn={
            isXlDevices ? "span 7" : isMdDevices ? "span 8" : "span 3"
          }
          gridRow="span 2"
          bgcolor={colors.primary[400]}
        >
          <Box
            mt="25px"
            px="30px"
            display="flex"
            justifyContent="space-between"
          >
            <Typography
              variant="h4"
              fontWeight="600"
              sx={{
                textAlign: "center",
                color: "#3c55e2",
                marginLeft: isMdDevices ? '170px' : '80px',
              }}
            >
              Revenu Mensuel 
            </Typography>
          </Box>
          <Box height="250px" mt="-20px">
            <LineChart data={monthlyData} isDashboard={true} /> {/* Passing the combined data */}
          </Box>
        </Box>

        {/* Affichage des 5 véhicules les plus loués */}

        <Box
          gridColumn={isXlDevices ? "span 4" : "span 4"}
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
            display="flex"
            alignItems="center"
          >
            <FcUp style={{ marginRight: "8px" }} />
            <Typography color="#3c55e2" variant="h4" fontWeight="600">
              Top 5 véhicules
            </Typography>
          </Box>
          {topVehicles.length === 0 ? (
            <Typography color={colors.gray[100]} p="15px">
              Aucune voiture disponible.
            </Typography>
          ) : (
            topVehicles.map((vehicle, index) => (
              <Box
                key={`${vehicle.numImmatriculation}-${index}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Typography color={vehicleColors[index % vehicleColors.length]}>
                  {vehicle.marque} {vehicle.modele} (
                  {vehicle.numImmatriculation})
                </Typography>
              </Box>
            ))
          )}
        </Box>

        {/* Top 5 Clients */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
            display="flex"
            alignItems="center"
          >
            <FcUp style={{ marginRight: "8px" }} />
            <Typography color="#3c55e2" variant="h4" fontWeight="600">
              Top 5 Clients
            </Typography>
          </Box>
          {topClients.length === 0 ? (
            <Typography color={colors.gray[100]} p="15px">
              Aucun client n'a effectué de contrat.
            </Typography>
          ) : (
            topClients.map((client, index) => (
              <Box
                key={`${client.cinClient}-${index}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Typography color={vehicleColors[index % vehicleColors.length]}>
                  {client.nom_fr} {client.prenom_fr}
                </Typography>
              </Box>
            ))
          )}
        </Box>
        {/* ... (vos autres composants Box pour Campagne, BarChart, GeographyChart) ... */}
        <Box
          gridColumn={isXlDevices ? "span 13" : "span 7"}
          gridRow="span 3"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h4"
            fontWeight="600"
            sx={{
              p: "30px 30px 60px 30px",
              textAlign: "center",
              mb: "30px",
              color: "#3c55e2",
            }}
          >
            Encaissement
          </Typography>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="250px"
            mt="-20px"
          >
            <MyBarChart data={monthlData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
