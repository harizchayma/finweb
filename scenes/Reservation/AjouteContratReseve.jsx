import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Snackbar,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import {
  AccountCircle,
  CalendarToday,
  Close as CloseIcon,
  DirectionsCar,
  AttachMoney,
  CheckCircle,
} from "@mui/icons-material";
import axios from "axios";
import PropTypes from "prop-types";
import ArrowBack from "@mui/icons-material/ArrowBack";
import YourComponent from "../Contrat/YourComponent";
import { useAuth } from "../context/AuthContext";
import moment from "moment"; // Import moment

const steps = [
  {
    label: "Informations Client",
    icon: <AccountCircle sx={{ color: "#1976d2" }} />,
  },
  {
    label: "Sélectionner Temps et Date",
    icon: <CalendarToday sx={{ color: "#1976d2" }} />,
  },
  {
    label: "Informations sur le Véhicule",
    icon: <DirectionsCar sx={{ color: "#1976d2" }} />,
  },
  { label: "Prix Total", icon: <AttachMoney sx={{ color: "#1976d2" }} /> },
  {
    label: "Informations de Garantie",
    icon: <CheckCircle sx={{ color: "#1976d2" }} />,
  },
];
const stepLabelStyle = (index, activeStep) => {
  return {
    color: activeStep === index ? "red" : "#1976d2",
    fontWeight: activeStep === index ? "normal" : "bold"
  };
};

const AjouteContratReseve = ({ open, handleClose, selectedReservation, activeStep }) => {
  const [openYourComponent, setOpenYourComponent] = useState(false);
  const { role, userId } = useAuth();

  // Initialize localActiveStep with the prop value
  const [localActiveStep, setLocalActiveStep] = useState(activeStep || 0);
  const [errorMessage, setErrorMessage] = useState("");
  const [clientInfo, setClientInfo] = useState({
    cin_client: "",
    firstName: "",
    lastName: "",
  });
  const [newContract, setNewContract] = useState({
    Date_debut: "",
    Heure_debut: "",
    Date_retour: "",
    Heure_retour: "",
    num_immatriculation: "",
    Duree_location: "",
    prix_jour: "",
    fraisCarburat: 0,
    fraisRetour: 0,
    fraisChauffeur: 0,
    prix_ht: 0,
    Prix_total: 0,
    id_reservation: "",
    login_id: userId,
    mode_reglement_garantie: "", // Add for Step 4
    montant: "", // Add for Step 4
    echeance: "", // Add for Step 4
    numero_piece: "", // Add for Step 4
    banque: "", // Add for Step 4
  });

  const [duration, setDuration] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [vehicleSelectionError, setVehicleSelectionError] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [contractNumber, setContractNumber] = useState("");

   // Helper function to combine date and time into a Moment object
  // Handles both YYYY-MM-DDTHH:mm:ss.SSSZ and YYYY-MM-DD formats for date
  // Handles HH:mm format for time
  const toDateTimeMoment = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    // Use Moment to parse the date string first.
    // Moment is usually good at recognizing ISO 8601 format.
    const dateMoment = moment(dateStr);

    if (!dateMoment.isValid()) {
       console.warn("Failed to parse date part:", dateStr);
       return null;
    }

    // Parse the time string separately
    const timeParts = timeStr.split(':');
    if (timeParts.length !== 2) {
        console.warn("Invalid time format:", timeStr);
        return null;
    }
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
         console.warn("Invalid time values:", timeStr);
         return null;
    }

    // Combine the date and time.
    // We set the hours and minutes on the parsed date object.
    // This assumes the time is in the local timezone relative to the date.
    const combinedDateTime = dateMoment.clone().set({
        hour: hours,
        minute: minutes,
        second: 0,
        millisecond: 0
    });

    if (!combinedDateTime.isValid()) {
         console.warn("Failed to combine date and time:", dateStr, timeStr);
         return null;
    }

    return combinedDateTime;
  };


  useEffect(() => {
    // Set localActiveStep from the prop
    setLocalActiveStep(activeStep || 0);

    if (selectedReservation) {
      setClientInfo({
        cin_client: selectedReservation.cin_client || "",
        firstName: selectedReservation.prenom_fr || "",
        lastName: selectedReservation.nom_fr || "",
      });
      setNewContract({
        ...newContract, // Keep other newContract fields
        Date_debut: selectedReservation.Date_debut || "", // Use original date string
        Heure_debut: selectedReservation.Heure_debut || "",
        Date_retour: selectedReservation.Date_retour || "", // Use original date string
        Heure_retour: selectedReservation.Heure_retour || "",
        num_immatriculation: selectedReservation.num_immatriculation || "",
        id_reservation: selectedReservation.id_reservation || "",
      });
      setSelectedVehicle(
        selectedReservation.num_immatriculation
          ? {
              num_immatriculation: selectedReservation.num_immatriculation,
            }
          : null
      );

      if (selectedReservation.num_immatriculation) {
        fetch(
          `http://localhost:7001/vehicules?num_immatriculation=${selectedReservation.num_immatriculation}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.data && data.data.length > 0) {
              setNewContract((prev) => ({
                ...prev,
                prix_jour: data.data[0].prix_jour,
              }));
            }
          })
          .catch((error) =>
            console.error(
              "Erreur lors de la récupération du prix du véhicule :",
              error
            )
          );
      }
    }
  }, [selectedReservation, activeStep]); // Add activeStep to dependency array

  const calculateDureeLocation = () => {
    const debut = toDateTimeMoment(newContract.Date_debut, newContract.Heure_debut);
    const retour = toDateTimeMoment(newContract.Date_retour, newContract.Heure_retour);

    if (!debut || !retour || !debut.isValid() || !retour.isValid() || retour.isSameOrBefore(debut)) {
      return 0; // Return 0 if dates are invalid or return is before or same as start
    }

    const diffInMs = retour.diff(debut);
    // Calculate difference in days, rounding up to the nearest whole day
    const diffInDays = Math.ceil(moment.duration(diffInMs).asDays());

    return diffInDays > 0 ? diffInDays : 1; // Ensure at least 1 day
  };

  useEffect(() => {
    if (newContract.Date_debut && newContract.Heure_debut && newContract.Date_retour && newContract.Heure_retour) {
      const duree = calculateDureeLocation();
      setDuration(duree);
      setNewContract((prev) => ({
        ...prev,
        Duree_location: duree,
      }));
    }
  }, [newContract.Date_debut, newContract.Heure_debut, newContract.Date_retour, newContract.Heure_retour]);

  useEffect(() => {
    if (
      localActiveStep === 2 &&
      newContract.Date_debut &&
      newContract.Heure_debut &&
      newContract.Date_retour &&
      newContract.Heure_retour
    ) {
      fetchAvailableVehicles();
    }
  }, [localActiveStep, newContract.Date_debut, newContract.Heure_debut, newContract.Date_retour, newContract.Heure_retour]);

  const fetchAvailableVehicles = async () => {
    try {
      const [vehiclesRes, contractsRes, reservationsRes] = await Promise.all([
        fetch("http://localhost:7001/vehicules"),
        fetch(`http://localhost:7001/contrat`),
        fetch(`http://localhost:7001/reservation`),
      ]);

      if (!vehiclesRes.ok || !contractsRes.ok || !reservationsRes.ok) {
        throw new Error("Échec de récupération des données depuis l'API.");
      }

      const [vehiclesData, contractsData, reservationsData] = await Promise.all([
        vehiclesRes.json(),
        contractsRes.json(),
        reservationsRes.json()
      ]);

      if (!vehiclesData.data || !contractsData.data || !reservationsData.data) {
        throw new Error("Données invalides reçues de l'API.");
      }

      const searchStart = toDateTimeMoment(newContract.Date_debut, newContract.Heure_debut);
      const searchEnd = toDateTimeMoment(newContract.Date_retour, newContract.Heure_retour);

      if (!searchStart || !searchStart.isValid() || !searchEnd || !searchEnd.isValid()) {
           console.warn("Invalid search dates provided for vehicle availability check.");
           setAvailableVehicles([]);
           setVehicleSelectionError("Dates de recherche invalides.");
           return;
      }

      // Helper function to check for overlap between two intervals [start1, end1) and [start2, end2)
      const checkOverlap = (start1, end1, start2, end2) => {
          if (!start1 || !end1 || !start2 || !end2 || !start1.isValid() || !end1.isValid() || !start2.isValid() || !end2.isValid()) {
              return false; // Cannot check overlap with invalid dates
          }
          return start1.isBefore(end2) && end1.isAfter(start2);
      };


      // 1. Get booked vehicles from Contracts
      const bookedVehicleNumbersFromContracts = contractsData.data
        .filter((contract) => {
          // Directly access properties if dataValues is consistent
          const contractStart = toDateTimeMoment(contract.Date_debut, contract.Heure_debut);
          const contractEnd = toDateTimeMoment(contract.Date_retour, contract.Heure_retour);

          return checkOverlap(contractStart, contractEnd, searchStart, searchEnd);
        })
        .map((c) => c.num_immatriculation); // Directly access num_immatriculation

      // 2. Get booked vehicles from Reservations with status 'en attent'
      const bookedVehicleNumbersFromReservations = reservationsData.data
        .filter((reservation) => {
          // Exclude the currently selected reservation from the check
          if (reservation.id_reservation === selectedReservation?.id_reservation) {
              return false;
          }

          // Directly access properties if dataValues is consistent
          const reservationStart = toDateTimeMoment(reservation.Date_debut, reservation.Heure_debut);
          const reservationEnd = toDateTimeMoment(reservation.Date_retour, reservation.Heure_retour);

          // Only consider 'en attent' reservations as booked for this availability check
          return (
            reservation.action === "en attent" &&
            checkOverlap(reservationStart, reservationEnd, searchStart, searchEnd)
          );
        })
        .map((r) => r.num_immatriculation); // Directly access num_immatriculation

      // Combine booked vehicles from contracts and 'en attent' reservations
      const allBookedVehicles = [
        ...new Set([
          ...bookedVehicleNumbersFromContracts,
          ...bookedVehicleNumbersFromReservations,
        ]),
      ];

      const available = vehiclesData.data.filter(
        (v) => !allBookedVehicles.includes(v.num_immatriculation)
      );

      if (available.length === 0) {
        setVehicleSelectionError("Aucun véhicule disponible pour cette période.");
        setSnackbarMessage("Aucun véhicule disponible pour cette période.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } else {
        setVehicleSelectionError("");
      }

      setAvailableVehicles(available);

      console.log("Search Date Range:", searchStart?.format("YYYY-MM-DD HH:mm"), "to", searchEnd?.format("YYYY-MM-DD HH:mm"));
      console.log("Contracts Data:", contractsData?.data);
      console.log("Reservations Data:", reservationsData?.data);
      console.log("Booked from Contracts:", bookedVehicleNumbersFromContracts);
      console.log("Booked from Reservations (en attent):", bookedVehicleNumbersFromReservations);
      console.log("All Booked Vehicles:", allBookedVehicles);
      console.log("Available Vehicles:", available);


    } catch (err) {
      console.error("Erreur:", err.message);
      setErrorMessage("Erreur lors de la récupération des véhicules.");
      setSnackbarMessage("Erreur lors de la récupération des véhicules.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setAvailableVehicles([]);
    }
  };

  const handleVehicleSelection = (e) => {
    const selectedId = parseInt(e.target.value);
    const vehicle = availableVehicles.find((v) => v.id_vehicule === selectedId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setNewContract((prev) => ({
        ...prev,
        num_immatriculation: vehicle.num_immatriculation,
        prix_jour: vehicle.prix_jour,
      }));
      setVehicleSelectionError(""); // Effacer l'erreur de sélection
    } else {
        // This case should ideally not happen if availableVehicles is correct,
        // but good to handle if the selected vehicle somehow disappears from the list.
         setSelectedVehicle(null);
         setNewContract((prev) => ({
            ...prev,
            num_immatriculation: "",
            prix_jour: 0,
         }));
    }
  };

  useEffect(() => {
    const prixHT = (newContract.prix_jour || 0) * (duration || 1);
    setNewContract((prev) => ({
      ...prev,
      prix_ht: prixHT,
    }));
  }, [newContract.prix_jour, duration]);

  const handleChange = (name, value) => {
    setNewContract((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setErrorMessage(""); // Clear previous error messages
    if (localActiveStep === 0 && !clientInfo.cin_client) {
      setErrorMessage("Veuillez entrer un CIN valide.");
      return;
    }
    if (
      localActiveStep === 1 &&
      (!newContract.Date_debut ||
        !newContract.Heure_debut ||
        !newContract.Date_retour ||
        !newContract.Heure_retour)
    ) {
      setErrorMessage("Veuillez remplir tous les champs de date/heure.");
      return;
    }
     if (localActiveStep === 1) {
        const debut = toDateTimeMoment(newContract.Date_debut, newContract.Heure_debut);
        const retour = toDateTimeMoment(newContract.Date_retour, newContract.Heure_retour);
        if (!debut || !retour || !debut.isValid() || !retour.isValid() || retour.isSameOrBefore(debut)) { // Use isSameOrBefore
            setErrorMessage("La date et l'heure de retour doivent être strictement après la date et l'heure de début.");
            return;
        }
    }
    if (localActiveStep === 2 && !selectedVehicle) {
      setSnackbarMessage("Veuillez sélectionner un véhicule avant de continuer.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setLocalActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setLocalActiveStep((prev) => prev - 1);
  };

  const calculateTotalPrice = () => {
    const fraisCarburat = Number(newContract.fraisCarburat) || 0;
    const fraisRetour = Number(newContract.fraisRetour) || 0;
    const fraisChauffeur = Number(newContract.fraisChauffeur) || 0; // Corrected typo fauffeur -> fraisChauffeur

    const totalFees = fraisCarburat + fraisRetour + fraisChauffeur;
    const prixHT = (newContract.prix_jour || 0) * (duration || 1);
    const totalPrice = (prixHT + totalFees) * 1.19;

    return totalPrice;
  };

  const handleSubmit = async () => {
     setErrorMessage(""); // Clear previous error messages

    if (localActiveStep === 4) {
        if (!newContract.mode_reglement_garantie || !newContract.montant || !newContract.echeance || !newContract.numero_piece || !newContract.banque) {
            setErrorMessage("Veuillez remplir toutes les informations de garantie.");
            return;
        }
    }

    try {
      const prixTotal = calculateTotalPrice();
      const contractData = {
        ...newContract,
        cin_client: clientInfo.cin_client,
        Duree_location: duration,
        Prix_total: prixTotal,
        frais_carburant: Number(newContract.fraisCarburat) || 0,
        frais_retour: Number(newContract.fraisRetour) || 0,
        frais_chauffeur: Number(newContract.fraisChauffeur) || 0,
        login_id: userId,
        // Include warranty information
        mode_reglement_garantie: newContract.mode_reglement_garantie,
        montant: newContract.montant,
        echeance: newContract.echeance,
        numero_piece: newContract.numero_piece,
        banque: newContract.banque,
      };

      contractData.id_reservation = newContract.id_reservation;

      await axios.post("http://localhost:7001/contrat", contractData);
      await axios.patch(`http://localhost:7001/reservation/${newContract.id_reservation}/action`, { action: "accepte", login_id: userId });

      setOpenYourComponent(true); // Open YourComponent
      handleClose(); // Close the main dialog
      setSnackbarMessage("Contrat ajouté avec succès et réservation acceptée!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setSnackbarMessage("Erreur lors de la création du contrat.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  const fetchLastContractNumber = async () => {
    try {
      const response = await axios.get("http://localhost:7001/contrat/last");
      if (response.data && response.data.data) {
        const lastNumber = response.data.data;
        const prefix = lastNumber.slice(0, 2);
        const numericPart = parseInt(lastNumber.slice(2), 10);
        const nextNumericPart = numericPart + 1;
        const nextContractNumber = `${prefix}${String(nextNumericPart).padStart(4, '0')}`;
        setContractNumber(nextContractNumber);
      } else {
        setContractNumber("AC0001");
        console.warn("No last contract number found, setting default.");
      }
    } catch (error) {
      console.error("Error fetching last contract number:", error);
      setContractNumber("AC0001");
    }
  };

  useEffect(() => {
    fetchLastContractNumber();
  }, []);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TextField
            fullWidth
            label="CIN Client"
            value={clientInfo.cin_client}
            onChange={(e) =>
              setClientInfo({ ...clientInfo, cin_client: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: "#1976d2" }} />
                </InputAdornment>
              ),
            }}
            disabled
          />
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Date Début"
                type="date"
                value={newContract.Date_debut}
                onChange={(e) => handleChange("Date_debut", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Heure Début"
                type="time"
                value={newContract.Heure_debut}
                onChange={(e) => handleChange("Heure_debut", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date Retour"
                type="date"
                value={newContract.Date_retour}
                onChange={(e) => handleChange("Date_retour", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Heure Retour"
                type="time"
                value={newContract.Heure_retour}
                onChange={(e) => handleChange("Heure_retour", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ color: "#f0112b" }}>
                Durée de location : {duration} jours
              </Typography>
            </Grid>
            {errorMessage && (
              <Typography color="error">{errorMessage}</Typography>
            )}
          </Grid>
        );

      case 2:
        return (
          <RadioGroup
            name="vehicle-selection"
            value={selectedVehicle?.id_vehicule?.toString() || ""} // Use id_vehicule for value
            onChange={handleVehicleSelection}
          >
            <Grid container spacing={2}>
              {availableVehicles.length > 0 ? (
                availableVehicles.map((v) => (
                  <Grid item xs={12} sm={4} key={v.id_vehicule}>
                    <Paper
                      elevation={3}
                      sx={{
                        padding: 2,
                        borderRadius: 2,
                        transition: "0.3s",
                        "&:hover": { boxShadow: 7 },
                        minHeight: "150px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        textAlign: "left",
                      }}
                    >
                      <FormControlLabel
                        value={v.id_vehicule.toString()}
                        control={<Radio sx={{ color: "#1976d2" }} />}
                        label={
                          <>
                            <Typography
                              variant="h6"
                              sx={{ color: "#f0112b", fontWeight: "bold" }}
                            >
                              {v.num_immatriculation}
                            </Typography>
                            <Typography variant="body1">
                              Modèle: {v.modele}
                            </Typography>
                            <Typography variant="body1">
                              Marque: {v.marque}
                            </Typography>
                            <Typography variant="body1">
                              Prix par jour: {v.prix_jour} dt
                            </Typography>
                          </>
                        }
                        checked={
                          selectedVehicle?.id_vehicule === v.id_vehicule
                        }
                      />
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Typography color="error" sx={{ mt: 2 }}>
                  {vehicleSelectionError || "Aucun véhicule disponible pour cette période."}
                </Typography>
              )}
            </Grid>
            {vehicleSelectionError && availableVehicles.length === 0 && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {vehicleSelectionError}
                </Typography>
            )}
          </RadioGroup>
        );

      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Prix par jour"
                value={newContract.prix_jour || 0}
                onChange={(e) =>
                  handleChange("prix_jour", parseFloat(e.target.value) || 0)
                }
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Prix HT"
                value={newContract.prix_ht ? newContract.prix_ht.toFixed(2) : 0}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ padding: 1.5, borderRadius: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ marginBottom: 1, color: "#1976d2" }}
                >
                  Frais
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Frais carburant"
                      value={newContract.fraisCarburat || 0}
                      onChange={(e) =>
                        handleChange(
                          "fraisCarburat",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "#1976d2" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Frais retour"
                      value={newContract.fraisRetour || 0}
                      onChange={(e) =>
                        handleChange(
                          "fraisRetour",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "#1976d2" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Frais chauffeur"
                      value={newContract.fraisChauffeur || 0}
                      onChange={(e) =>
                        handleChange(
                          "fraisChauffeur",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "#1976d2" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: "#f0112b",
                  fontWeight: "bold",
                }}
              >
                Prix Total TTC: {calculateTotalPrice().toFixed(2)} dt
              </Typography>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                variant="outlined"
                label="Mode de règlement garantie"
                value={newContract.mode_reglement_garantie || ""}
                onChange={(e) =>
                  handleChange("mode_reglement_garantie", e.target.value)
                }
                displayEmpty
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1976d2" },
                    "&:hover fieldset": { borderColor: "#115293" },
                    "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="" disabled>
                  Sélectionner un mode de règlement
                </MenuItem>
                <MenuItem value="virement_bancaire">Virement bancaire</MenuItem>
                <MenuItem value="cheque">Chèque</MenuItem>
                <MenuItem value="carte_bancaire">Carte bancaire</MenuItem>
                <MenuItem value="especes">Espèces</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Montant"
                name="montant"
                value={newContract.montant || ""}
                onChange={(e) => handleChange("montant", e.target.value)}
                type="number" // Changed to number for consistency
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1976d2" },
                    "&:hover fieldset": { borderColor: "#115293" },
                    "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Échéance"
                name="echeance"
                value={newContract.echeance || ""}
                type="date"
                onChange={(e) => handleChange("echeance", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1976d2" },
                    "&:hover fieldset": { borderColor: "#115293" },
                    "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Numéro de pièce"
                name="numero_piece"
                value={newContract.numero_piece || ""}
                onChange={(e) => handleChange("numero_piece", e.target.value)}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1976d2" },
                    "&:hover fieldset": { borderColor: "#115293" },
                    "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                variant="outlined"
                label="Banque"
                value={newContract.banque || ""}
                onChange={(e) => handleChange("banque", e.target.value)}
                displayEmpty
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1976d2" },
                    "&:hover fieldset": { borderColor: "#115293" },
                    "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="" disabled>
                  Sélectionner une banque
                </MenuItem>
                 {/* Add your bank options here */}
                 <MenuItem value="BNA">BNA</MenuItem>
                 <MenuItem value="BIAT">BIAT</MenuItem>
                 <MenuItem value="STB">STB</MenuItem>
                 <MenuItem value="AMEN BANK">AMEN BANK</MenuItem>
                 {/* Add more banks as needed */}
              </Select>
            </Grid>
             {errorMessage && (
              <Typography color="error">{errorMessage}</Typography>
            )}
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose(); // Utiliser la fonction de fermeture
        }
      }}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "#1976d2",
          marginBottom: 1,
        }}
      >
        Ajouter un Contrat
        <CloseIcon
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 20,
            cursor: "pointer",
            color: "#f0112b",
          }}
        />
        <Typography
          variant="h4"
          align="center"
          sx={{ marginBottom: 1, color: "#f0112b" }}
        >
          [Numéro de Contrat: {contractNumber || "N/A"}]
        </Typography>
        <Typography
          variant="h4"
          align="center"
          sx={{ marginBottom: 1, color: "#f011cb" }}
        >
          [Numéro de Réservation: R{selectedReservation?.id_reservation || "N/A"}]
        </Typography>
      </DialogTitle>
      <Typography
        variant="h5"
        align="center"
        sx={{
          marginBottom: 1,
          color: "#00a86b",
          fontWeight: "normal",
          fontSize: "1rem",
        }}
      >
        <Typography component="span">Durée de Location:</Typography>
        <Typography component="span" sx={{ fontWeight: "bold" }}>
          {` ${duration} jours`}
        </Typography>
        {"  "}
        <span>Numéro d'immatriculation:</span>
        {selectedVehicle ? (
          <Typography component="span" sx={{ fontWeight: "bold" }}>
            {` (${selectedVehicle.num_immatriculation})`}
          </Typography>
        ) : null}
      </Typography>


      <DialogContent>
        <Stepper
          activeStep={localActiveStep}
          alternativeLabel
          sx={{ marginBottom: 3 }}
        >
          {steps.map(({ label, icon }, index) => (
            <Step key={label}>
              <StepLabel icon={icon}
                sx={{ "& .MuiStepLabel-label": stepLabelStyle(index, localActiveStep) }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(localActiveStep)}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleBack}
          disabled={localActiveStep === 0}
          variant="outlined"
          color="primary"
          sx={{ borderRadius: "20px", marginRight: 1 }}
          startIcon={<ArrowBack />}
        >
          Retour
        </Button>
        <Button
          onClick={localActiveStep === steps.length - 1 ? handleSubmit : handleNext}
          color="primary"
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#155a8a" },
            borderRadius: "20px",
          }}
        >
          {localActiveStep === steps.length - 1 ? "Valider" : "Suivant"}
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <YourComponent
        open={openYourComponent}
        handleClose={() => setOpenYourComponent(false)} // Close YourComponent
        contractNumber={contractNumber}
        cinClient={clientInfo.cin_client}
      />
    </Dialog>
  );
};

AjouteContratReseve.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedReservation: PropTypes.shape({
    cin_client: PropTypes.string,
    prenom_fr: PropTypes.string,
    nom_fr: PropTypes.string,
    Date_debut: PropTypes.string,
    Heure_debut: PropTypes.string,
    Date_retour: PropTypes.string,
    Heure_retour: PropTypes.string,
    id_reservation: PropTypes.number,
    num_immatriculation: PropTypes.string, // Add this prop type
  }),
  activeStep: PropTypes.number, // Add activeStep prop type
};

export default AjouteContratReseve;