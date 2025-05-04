import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from "@mui/material";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Assignment as ContractIcon,
  DateRange as StartDateIcon,
  AccessTime as TimeIcon,
  MonetizationOn as PriceIcon,
  Person as ClientIcon,
  DirectionsCar as VehicleIcon,
} from "@mui/icons-material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MonetizationOn from "@mui/icons-material/MonetizationOn";
import BankIcon from "@mui/icons-material/AccountBalance";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"; // Icône pour frais en général
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation"; // Icône pour frais carburant
import DriveEtaIcon from "@mui/icons-material/DriveEta"; // Icône pour chauffeur
import PersonIcon from "@mui/icons-material/Person"; // Icône pour les noms et prénoms
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; // Icône pour la date de naissance
const iconStyles = {
  contract: { color: "#1976d2" },
  price: { color: "#c11205" },
  client: { color: "#4caf50" },
  vehicle: { color: "#f44336" },
  guarantee: { color: "#3f51b5" },
};

function getIconStyle(label) {
  if (label.includes("Contrat")) {
    return iconStyles.contract;
  }
  if (label.includes("frais")) {
    return iconStyles.price;
  }
  if (label.includes("Client")) {
    return iconStyles.client;
  }
  if (label.includes("Véhicule")) {
    return iconStyles.vehicle;
  }
  if (label.includes("Pièce de Garantie")) {
    return iconStyles.guarantee;
  }
  return { color: "#1976d2" };
}

const ContractDetails = ({ contract, onClose }) => {
  const [open, setOpen] = useState(!!contract); // Ouvrir si un contrat est passé
  const [selectedContrat, setSelectedContrat] = useState(contract);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    setSelectedContrat(contract);
    setOpen(!!contract);
    setSelectedVehicle(null);
    setSelectedClient(null);
    if (contract) {
      fetchVehicleDetails(contract.num_immatriculation);
      fetchClientDetails(contract.cin_client);
    }
  }, [contract]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString();
  };

  const getIconStyle = (type) => {
    switch (type) {
      case "Date":
        return { color: "#007bff" };
      case "frais":
        return { color: "#28a745" };
      default:
        return {};
    }
  };
  const fetchVehicleDetails = async (immatriculation) => {
    if (immatriculation) {
        try {
            const response = await fetch(`http://localhost:7001/vehicules`);
            const data = await response.json();
            
            if (response.ok && Array.isArray(data?.data)) {
                // Filtrer pour obtenir le véhicule correspondant
                const vehicle = data.data.find(v => v.num_immatriculation === immatriculation);
                if (vehicle) {
                    setSelectedVehicle(vehicle);
                } else {
                    console.warn("Vehicle not found for:", immatriculation);
                    setSelectedVehicle(null);
                }
            } else {
                console.warn("Vehicle details not found");
                setSelectedVehicle(null);
            }
        } catch (error) {
            console.error("Error fetching vehicle details:", error);
            setSelectedVehicle(null);
        }
    } else {
        setSelectedVehicle(null);
    }
};

const fetchClientDetails = async (cin) => {
    console.log("Fetching client with CIN:", cin); // Log pour vérifier le CIN
    if (cin) {
      try {
        const response = await fetch(`http://localhost:7001/client/cin_client?cin_client=${cin}`); // Corrected URL
        console.log("Response Status:", response.status); // Vérifiez le statut de la réponse
        const data = await response.json();
        
  
        if (response.ok) {
          setSelectedClient(data.data); // Access the client data correctly (it's in data.data based on your controller)
        } else {
          console.warn("Client details not found for CIN:", cin);
          setSelectedClient(null);
          alert(`Client non trouvé pour le CIN: ${cin}`); // Alert utilisateur
        }
      } catch (error) {
        console.error("Error fetching client details:", error);
        setSelectedClient(null);
      }
    } else {
      setSelectedClient(null);
    }
  };

  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          padding: "10px",
          borderRadius: "8px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose(); // Only close on close button click
        }
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "#d21919",
          marginBottom: 5,
        }}
      >
        Détails du Numéro Contrat:{" "}
        {selectedContrat?.Numero_contrat || "Non spécifié"}

      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {selectedContrat && (
          <Grid container spacing={1.4}>
            {[
              {
                label: "Date et Heure de Debut",
                value: `${formatDate(selectedContrat.Date_debut)} : ${selectedContrat.Heure_debut}`,
                icon: <StartDateIcon sx={getIconStyle("Date")} />,
              },
              {
                label: "Durée Location",
                value: selectedContrat.Duree_location,
                icon: <TimeIcon sx={{ color: "#1976d2" }} />, // Changez l'icône ici
              },
              {
                label: "Date et Heure de Retour",
                value: `${formatDate(selectedContrat.Date_retour)} : ${selectedContrat.Heure_retour}`,
                icon: <StartDateIcon sx={getIconStyle("Date")} />,
              },
              {
                label: "Prix Total",
                value: selectedContrat.Prix_total,
                icon: <PriceIcon sx={getIconStyle("frais")} />,
              },
            ].map((item) => (
              <Grid
                item
                xs={6}
                display="flex"
                alignItems="center"
                key={item.label}
                sx={{ mb: 2 }}
              >
                {item.icon}
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", color: "#333", ml: 1 }}
                >
                  {item.label}:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: item.label === "Prix Total" ? "red" : "#555",
                    fontWeight: "bold",
                    ml: 1,
                  }} // Changez la couleur en rouge uniquement pour Prix Total
                >
                  {item.value || ""}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}
        {/* Vehicle Details Accordion */}
        {selectedVehicle && (
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="vehicle-details-content"
              id="vehicle-details-header"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Détails du Véhicule
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1.4}>
                {[
                  {
                    label: "Numéro d'Immatriculation",
                    value: selectedVehicle.num_immatriculation || "Non spécifié",
                    icon: <VehicleIcon sx={{ color: "#1976d2" }} />,
                  },
                  {
                    label: "Marque",
                    value: selectedVehicle.marque || "Non spécifié",
                    icon: <VehicleIcon sx={{ color: "#1976d2" }} />,
                  },
                  {
                    label: "Modèle",
                    value: selectedVehicle.modele || "",
                    icon: <VehicleIcon sx={{ color: "#1976d2" }} />,
                  },
                ].map((item) => (
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    alignItems="center"
                    key={item.label}
                    sx={{ mb: 2 }}
                  >
                    {item.icon}
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#333", ml: 1 }}
                    >
                      {item.label}:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          item.label === "Numéro d'Immatriculation" &&
                            item.value !== ""
                            ? "red"
                            : "#000000", // Appliquer la couleur rouge si la valeur est spécifiée
                        fontWeight: "bold",
                        ml: 1,
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
        {/* Client Details Accordion */}
        {selectedClient && (
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="client-details-content"
              id="client-details-header"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Détails du Client
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1.4}>
                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  key="cin-client"
                >
                  <ContractIcon sx={{ color: "#1976d2", mr: 2 }} />
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "#333", mr: 2 }}
                  >
                    CIN client:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "red", fontWeight: "bold" }}
                  >
                    {selectedClient.cin_client || "Non spécifié"}
                  </Typography>
                </Grid>

                {/* Ligne pour le Nom et Prénom en Français */}
                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  key="name-prenome-fr"
                >
                  <PersonIcon sx={{ color: "#1976d2", mr: 2 }} />
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "#333", mr: 2 }}
                  >
                    Nom et Prénom (FR):
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold", color: "#000000", mr: 2 }}>
                    {selectedClient.nom_fr || ""}{" "}
                    {selectedClient.prenom_fr || ""}
                  </Typography>
                </Grid>

                {/* Ligne pour le Nom et Prénom en Arabe */}
                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  key="name-prenome-ar"
                >
                  <PersonIcon sx={{ color: "#1976d2", mr: 2 }} />
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "#333", mr: 2 }}
                  >
                    Nom et Prénom (AR):
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold", color: "#000000", mr: 2 }}>
                    {selectedClient.nom_ar || ""}{" "}
                    {selectedClient.prenom_ar || ""}
                  </Typography>
                </Grid>

                {/* Ligne pour la date de naissance */}
                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  key="date-naissance"
                >
                  <CalendarTodayIcon sx={{ color: "#1976d2", mr: 2 }} />
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "#333", mr: 2 }}
                  >
                    Date de Naissance:
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#000000" }}>
                    {selectedClient.date_naiss || "Non spécifié"}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
        {/* Accordion for Frais */}
        {selectedContrat && (
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="contract-details-content"
              id="contract-details-header"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Frais
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1.4}>
                {[
                  {
                    label: "Frais retour",
                    value: selectedContrat.frais_retour,
                    icon: <AttachMoneyIcon sx={{ color: "#1976d2" }} />, // Vous pouvez choisir l'icône appropriée ici
                  },
                  {
                    label: "Frais carburant",
                    value: selectedContrat.frais_carburant,
                    icon: <LocalGasStationIcon sx={{ color: "#1976d2" }} />, // Icône spécifique pour le carburant
                  },
                  {
                    label: "Frais chauffeur",
                    value: selectedContrat.frais_chauffeur,
                    icon: <DriveEtaIcon sx={{ color: "#1976d2" }} />, // Icône pour le chauffeur
                  },
                ].map((item) => (
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    alignItems="center"
                    key={item.label}
                    sx={{ mb: 2 }}
                  >
                    {item.icon}
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#333", ml: 1 }}
                    >
                      {item.label}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "red", ml: 2 }}>
                      {item.value || ""}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Additional Details Accordion */}
        {selectedContrat && (
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="contract-details-content"
              id="contract-details-header"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Pièce de Garantie
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1.4}>
                {[
                  {
                    label: "Échéance",
                    value: selectedContrat.echeance,
                      icon: <DateRangeIcon sx={{ color: "#1976d2" }} />,
                    },
                    {
                      label: "Mode de règlement",
                      value: selectedContrat.mode_reglement_garantie,
                      icon: <MonetizationOn sx={{ color: "#1976d2" }} />,
                    },
                    {
                      label: "Montant",
                      value: selectedContrat.montant,
                      icon: <PriceIcon sx={{ color: "#1976d2" }} />,
                    },
                    {
                      label: "Numéro de Pièce",
                      value: selectedContrat.numero_piece,
                      icon: <AssignmentIcon sx={{ color: "#1976d2" }} />, // Utilisez l'icône appropriée
                    },
                    {
                      label: "Banque",
                      value: selectedContrat.banque,
                      icon: <BankIcon sx={{ color: "#1976d2" }} />, // Remplacez par l'icône appropriée
                    },
                  ].map((item) => (
                    <Grid
                      item
                      xs={12}
                      display="flex"
                      alignItems="center"
                      key={item.label}
                      sx={{ mb: 2 }}
                    >
                      {item.icon}
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: "#333", ml: 1 }}
                      >
                        {item.label}:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold", color: "#000000", ml: 1 }}>
                        {item.value || ""}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
  
          {/* Accordion for Pièce de Garantie */}
          {selectedContrat && selectedContrat.piece_garantie && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="guarantee-document-content"
                id="guarantee-document-header"
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#1976d2" }}
                >
                  Pièce de Garantie
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1.4}>
                  {selectedContrat.piece_garantie.map((piece, index) => (
                    <Grid
                      item
                      xs={12}
                      display="flex"
                      alignItems="center"
                      key={index}
                      sx={{ mb: 2 }}
                    >
                      <PriceIcon sx={{ color: "#1976d2" }} />
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: "#333", ml: 1 }}
                      >
                        {piece.label}:
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#555", ml: 1 }}>
                        {piece.value || ""}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default ContractDetails;