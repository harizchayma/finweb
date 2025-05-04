import React, { useState, useEffect } from "react";
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
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Paper,
  ListItemIcon,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ClientSearchBar from "../Client/ClientSearchBar";
import axios from "axios";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import {
  DateRange,
  AccountCircle,
  CalendarToday,
  Search as SearchIcon,
  DirectionsCar,
  AttachMoney,
  AllOut as AllOutIcon,
  DirectionsCar as DirectionsCarIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const steps = [
  {
    label: "Informations Client",
    icon: <AccountCircle sx={{ color: "#1976d2" }} />,
  },
  {
    label: "Sélectionner Temps et Date",
    icon: <DateRange sx={{ color: "#1976d2" }} />,
  },
  {
    label: "Informations sur le Véhicule",
    icon: <DirectionsCar sx={{ color: "#1976d2" }} />,
  },
  { label: "Prix Total", icon: <AttachMoney sx={{ color: "#1976d2" }} /> },
];

const AjouteReservation = ({ open, handleClose }) => {
  const initialReservationState = {
    Date_debut: "",
    Heure_debut: "",
    Date_retour: "",
    Heure_retour: "",
    num_immatriculation: "",
    cin_client: "",
    Prix_total: "",
  };

  const { role } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [newReservation, setNewReservation] = useState(initialReservationState);
  const [clientInfo, setClientInfo] = useState({ cin_client: "" });
  const [clientExists, setClientExists] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [rentalDuration, setRentalDuration] = useState(0);
  const [customPricePerDay, setCustomPricePerDay] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [vehicleSelectionError, setVehicleSelectionError] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const stepLabelStyle = (index) => {
    if (activeStep === index) {
      return {
        color: "red",
        fontWeight: "bold",
      };
    } else {
      return {
        color: "#1976d2",
        fontWeight: "normal",
      };
    }
  };
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return 0;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diffInDays > 0 ? diffInDays : 0;
  };

  const handleCancelClose = () => {
    console.log("Cancel close action triggered");
    // Logic to close the dialog or reset state
  };
  useEffect(() => {
    const duration = calculateDuration(
      newReservation.Date_debut,
      newReservation.Date_retour
    );
    setRentalDuration(duration);
  }, [newReservation.Date_debut, newReservation.Date_retour]);

  useEffect(() => {
    if (selectedVehicle && rentalDuration > 0) {
      const calculatedPrice = rentalDuration * selectedVehicle.prix_jour;
      setTotalPrice(calculatedPrice);
      setNewReservation((prev) => ({ ...prev, Prix_total: calculatedPrice }));
    } else {
      setTotalPrice(0);
      setNewReservation((prev) => ({ ...prev, Prix_total: 0 }));
    }
  }, [rentalDuration, selectedVehicle]);

  const handleVehicleSelection = (event) => {
    const selectedId = parseInt(event.target.value);
    const selected = availableVehicles.find(
      (vehicle) => vehicle.id_vehicule === selectedId
    );

    if (selected) {
      setSelectedVehicle(selected);
      setCustomPricePerDay(selected.prix_jour);
      setNewReservation((prev) => ({
        ...prev,
        num_immatriculation: selected.num_immatriculation,
      }));
      setVehicleSelectionError(""); // Clear any previous selection error
    } else {
      setVehicleSelectionError("Sélectionnez un véhicule valide.");
    }
  };

  const filteredVehicles = availableVehicles.filter((vehicle) => {
    const matchesSearchQuery =
      vehicle.num_immatriculation
        .toLowerCase()
        .includes(vehicleSearchQuery.toLowerCase()) ||
      vehicle.modele.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      vehicle.marque.toLowerCase().includes(vehicleSearchQuery.toLowerCase());

    const matchesCategory = selectedCategory
      ? selectedCategory === "all" ||
        vehicle.id_categorie === parseInt(selectedCategory)
      : true;

    return matchesSearchQuery && matchesCategory;
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:7001/categorie");
        setVehicleCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching vehicle categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (newReservation.Date_debut && newReservation.Date_retour) {
      fetchAvailableVehicles(
        newReservation.Date_debut,
        newReservation.Date_retour
      );
    } else {
      setAvailableVehicles([]);
      setSelectedVehicle(null);
    }
  }, [newReservation.Date_debut, newReservation.Date_retour]);

  const fetchAvailableVehicles = async (startDate, endDate) => {
    try {
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formattedStartDate = formatDate(new Date(startDate));
      const formattedEndDate = formatDate(new Date(endDate));

      const [vehiclesRes, contractsRes, reservationsRes] = await Promise.all([
        axios.get("http://localhost:7001/vehicules"),
        axios.get("http://localhost:7001/contrat"),
        axios.get("http://localhost:7001/reservation"),
      ]);

      const vehiclesData = vehiclesRes.data.data;
      const contractsData = contractsRes.data.data || [];
      const reservationsData = reservationsRes.data.data || [];

      const searchStartDate = new Date(startDate);
      const searchEndDate = new Date(endDate);

      const bookedVehicleNumbersFromContracts = contractsData
        .filter((contract) => {
          const contractStartDate = new Date(contract.Date_debut);
          const contractEndDate = new Date(contract.Date_retour);
          return (
            contractStartDate < searchEndDate &&
            contractEndDate > searchStartDate
          );
        })
        .map((contract) => contract.num_immatriculation)
        .filter((num) => num !== null);

      const bookedVehicleNumbersFromReservations = reservationsData
        .filter((reservation) => {
          const reservationStartDate = new Date(reservation.Date_debut);
          const reservationEndDate = new Date(reservation.Date_retour);
          const isOverlapping =
            reservationStartDate < searchEndDate &&
            reservationEndDate > searchStartDate;
          return isOverlapping && reservation.action === "en attent";
        })
        .map((reservation) => reservation.num_immatriculation)
        .filter((num) => num !== null);

      const allBookedVehicles = [
        ...new Set([
          ...bookedVehicleNumbersFromContracts,
          ...bookedVehicleNumbersFromReservations,
        ]),
      ];

      const availableVehicles = vehiclesData.filter(
        (vehicle) => !allBookedVehicles.includes(vehicle.num_immatriculation)
      );

      setAvailableVehicles(availableVehicles);
    } catch (error) {
      console.error("Error fetching vehicles data:", error);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedClient || !selectedClient.cin_client) {
        setErrorMessage("Veuillez sélectionner un client.");
        return;
      }
      setClientInfo({ cin_client: selectedClient.cin_client });
      setClientExists(true);
    }

    if (activeStep === 1) {
      if (!newReservation.Date_debut || !newReservation.Date_retour) {
        setErrorMessage("Veuillez remplir tous les champs de date.");
        return;
      }
      const today = new Date();
      const startDate = new Date(newReservation.Date_debut);
      const endDate = new Date(newReservation.Date_retour);

      if (startDate < today) {
        setErrorMessage("La date de début ne peut pas être dans le passé.");
        return;
      }

      if (endDate < startDate) {
        setErrorMessage("La date de retour doit être après la date de début.");
        return;
      }
    }

    if (activeStep === 2) {
      if (!selectedVehicle) {
        setErrorMessage("Veuillez sélectionner un véhicule.");
        return;
      }
      setNewReservation((prev) => ({
        ...prev,
        num_immatriculation: selectedVehicle.num_immatriculation,
      }));
    }

    setActiveStep((prev) => prev + 1);
    setErrorMessage("");
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setErrorMessage("");
  };

  const handleChange = (name, value) => {
    setNewReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setIsClientSearchOpen(false);
  };

  const resetForm = () => {
    setSelectedClient(null);
    setClientInfo({ cin_client: "" });
    setClientExists(false);
  };

  const handleSubmit = async () => {
    try {
      const duration = calculateDuration(
        newReservation.Date_debut,
        newReservation.Date_retour
      );
      if (duration <= 0) {
        setSnackbarMessage("Durée de location invalide.");
        setSnackbarOpen(true);
        return;
      }

      const reservationData = {
        ...newReservation,
        cin_client: clientInfo.cin_client,
        Duree_location: duration,
      };

      const response = await axios.post(
        "http://localhost:7001/reservation",
        reservationData
      );
      handleClose();
      setNewReservation(initialReservationState);
      setActiveStep(0);
      setSnackbarMessage("Réservation créée avec succès !");
      setSnackbarOpen(true);
      resetForm();
      setSelectedVehicle(null);
    } catch (error) {
      setSnackbarMessage("Erreur lors de la création de la réservation.");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const prixHT =
      selectedVehicle && rentalDuration > 0
        ? (customPricePerDay > 0
            ? customPricePerDay
            : selectedVehicle.prix_jour) * rentalDuration
        : 0;
    const prixTotalCalculated = prixHT * 1.19;
    setTotalPrice(prixTotalCalculated);
    setNewReservation((prev) => ({ ...prev, Prix_total: prixTotalCalculated }));
  }, [customPricePerDay, rentalDuration, selectedVehicle]);

  const handleCloseDialog = () => {
    setIsConfirmationOpen(true); // Open confirmation dialog
  };

  const handleConfirmClose = () => {
    setIsConfirmationOpen(false); // Fermer la boite de dialogue de confirmation
    // Réinitialiser l'état de la réservation
    setNewReservation(initialReservationState);
    // Réinitialiser autres états si nécessaire
    setClientInfo({ cin_client: "" });
    setClientExists(false);
    setSelectedVehicle(null);
    setCustomPricePerDay(0);
    setActiveStep(0);
    handleClose(); // Fermer le dialog principal
  };
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box
            onClick={() => setIsClientSearchOpen(true)}
            sx={{
              padding: "12px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              border: `1px solid ${selectedClient ? "#4caf50" : "#9e9e9e"}`,
              borderRadius: "30px",
              cursor: "pointer",
              transition: "border-color 0.3s ease",
              "&:hover": {
                borderColor: "#1976d2",
              },
            }}
          >
            <IconButton disabled>
              <SearchIcon color={selectedClient ? "success" : "action"} />
            </IconButton>
            <Typography sx={{ ml: 1, flexGrow: 1 }}>
              {selectedClient
                ? `${selectedClient.nom_fr} ${selectedClient.prenom_fr} (CIN: ${selectedClient.cin_client})`
                : "Rechercher un client"}
            </Typography>
            {selectedClient && (
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  resetForm();
                }}
                sx={{
                  borderColor: "#f0112b",
                  color: "#f0112b",
                  "&:hover": { borderColor: "#d60000", color: "#d60000" },
                }}
              >
                Effacer
              </Button>
            )}
          </Box>
        );
      case 1:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={fr}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date Début"
                  name="Date_debut"
                  type="date"
                  value={newReservation.Date_debut || ""}
                  onChange={(e) => handleChange("Date_debut", e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
                  InputLabelProps={{ shrink: true }}
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
                  label="Heure Début"
                  name="Heure_debut"
                  type="time"
                  value={newReservation.Heure_debut || ""}
                  onChange={(e) => handleChange("Heure_debut", e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date Retour"
                  name="Date_retour"
                  type="date"
                  value={newReservation.Date_retour || ""}
                  onChange={(e) => handleChange("Date_retour", e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
                  InputLabelProps={{ shrink: true }}
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
                  label="Heure Retour"
                  name="Heure_retour"
                  type="time"
                  value={newReservation.Heure_retour || ""}
                  onChange={(e) => handleChange("Heure_retour", e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="h5"
                  sx={{ color: "#f0112b", fontWeight: "bold" }}
                >
                  Durée de location : {rentalDuration} jours
                </Typography>
              </Grid>
            </Grid>
          </LocalizationProvider>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                variant="outlined"
                label="Catégorie de véhicule"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setVehicleSearchQuery(""); // Clear search when changing the category
                  fetchAvailableVehicles(
                    newReservation.Date_debut,
                    newReservation.Date_retour
                  );
                }}
                displayEmpty
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1976d2" },
                    "&:hover fieldset": { borderColor: "#115293" },
                    "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                  },
                }}
              >
                <MenuItem
                  value=""
                  disabled
                  sx={{ fontWeight: "bold", color: "#f60000" }}
                >
                  <ListItemIcon>
                    <AllOutIcon fontSize="small" />
                  </ListItemIcon>
                  Sélectionner une catégorie
                </MenuItem>
                <MenuItem
                  value="all"
                  sx={{ fontWeight: "normal", color: "#1976d2" }}
                >
                  <ListItemIcon>
                    <AllOutIcon fontSize="small" />
                  </ListItemIcon>
                  Tous les catégories
                </MenuItem>
                {vehicleCategories.length > 0 &&
                  vehicleCategories.map((category) => (
                    <MenuItem
                      key={category.id_categorie}
                      value={category.id_categorie}
                    >
                      <ListItemIcon>
                        <DirectionsCarIcon
                          sx={{ fontSize: "small", color: "#1976d2" }}
                        />
                      </ListItemIcon>
                      {category.catégorie}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Rechercher un véhicule"
                value={vehicleSearchQuery}
                onChange={(e) => setVehicleSearchQuery(e.target.value)}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1976d2" },
                    "&:hover fieldset": { borderColor: "#115293" },
                    "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ marginBottom: 2, fontWeight: "bold", color: "#1976d2" }}
              >
                Liste des véhicules disponibles
              </Typography>
              <RadioGroup
                aria-label="vehicle-selection"
                name="vehicle-selection"
                value={
                  selectedVehicle ? selectedVehicle.id_vehicule.toString() : ""
                }
                onChange={handleVehicleSelection}
              >
                <Grid container spacing={2} justifyContent="center">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                      <Grid item xs={12} sm={4} key={vehicle.id_vehicule}>
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
                            value={vehicle.id_vehicule.toString()}
                            control={<Radio sx={{ color: "#1976d2" }} />}
                            label={
                              <>
                                <Typography
                                  variant="h6"
                                  sx={{ color: "#f0112b", fontWeight: "bold" }}
                                >
                                  {vehicle.num_immatriculation}
                                </Typography>
                                <Typography variant="body1">
                                  Modèle: {vehicle.modele}
                                </Typography>
                                <Typography variant="body1">
                                  Marque: {vehicle.marque}
                                </Typography>
                                <Typography variant="body1">
                                  Prix par jour: {vehicle.prix_jour} dt
                                </Typography>
                              </>
                            }
                          />
                        </Paper>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="h6" color="error" align="center">
                        Aucun véhicule disponible
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </RadioGroup>
              {vehicleSelectionError && (
                <Typography variant="body1" color="error">
                  {vehicleSelectionError}
                </Typography>
              )}
            </Grid>
          </Grid>
        );
        case 3:
  return (
    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', width: '500px', margin: '0 auto' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <Typography variant="subtitle1">Véhicule :</Typography>
        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{selectedVehicle?.num_immatriculation || "N/A"}</Typography>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <Typography variant="subtitle1" style={{ marginRight: '215px' }}>Prix par jour :</Typography>
        <TextField
          type="number"
          value={customPricePerDay}
          onChange={(e) => setCustomPricePerDay(Number(e.target.value))}
          variant="outlined"
          size="small"
          style={{ width: '120px' }}
        />
        
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <Typography variant="subtitle1">Durée de location :</Typography>
        <Typography variant="subtitle1">{rentalDuration} jours</Typography>
      </div>

      <div style={{ borderBottom: '1px dashed #ccc', marginBottom: '15px' }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <Typography variant="h6">Prix HT :</Typography>
        <Typography variant="h6">{totalPrice ? (totalPrice / 1.19).toFixed(2) : 0} DT</Typography>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h6">TVA (19%) :</Typography>
        <Typography variant="h6">{totalPrice ? (totalPrice - (totalPrice / 1.19)).toFixed(2) : 0} DT</Typography>
      </div>

      <Typography variant="h3" align="right" style={{ fontWeight: 'bold', color: 'red' }}>
        Total TTC : {totalPrice.toFixed(2)} DT
      </Typography>
    </div>
  );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClose(); // Call our new close method
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
          Ajouter une Réservation
          <CloseIcon
            onClick={handleCloseDialog} // Call the method to open confirmation dialog
            sx={{
              position: "absolute",
              right: 20,
              cursor: "pointer",
              color: "#f0112b",
            }}
          />
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map(({ label, icon }, index) => (
              <Step key={label}>
                <StepLabel icon={icon}  sx={{ "& .MuiStepLabel-label": stepLabelStyle(index) }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
          {errorMessage && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            color="error"
          >
            Retour
          </Button>
          <Box flexGrow={1} />
          <Button
            onClick={
              activeStep === steps.length - 1 ? handleSubmit : handleNext
            }
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#155a8a" },
              borderRadius: "20px",
            }}
            disabled={activeStep === 0 && !selectedClient}
          >
            {activeStep === steps.length - 1 ? "Valider" : "Suivant"}
          </Button>
        </DialogActions>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Dialog>
      <Dialog open={isConfirmationOpen} onClose={handleCancelClose}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir annuler? Toutes les données non
            enregistrées seront perdues.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="primary">
            Retour
          </Button>
          <Button onClick={handleConfirmClose} color="error">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isClientSearchOpen}
        onClose={() => setIsClientSearchOpen(false)}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 6px 30px rgba(0, 0, 0, 0.2)",
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
          Rechercher un Client
        </DialogTitle>
        <DialogContent sx={{ marginTop: "0px" }}>
          <ClientSearchBar
            onClientSelect={handleClientSelect}
            onClose={() => setIsClientSearchOpen(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsClientSearchOpen(false)}
            variant="outlined"
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AjouteReservation;
