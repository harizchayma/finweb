import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  CircularProgress,
  Select,
  MenuItem,
  InputAdornment,
  ListItemIcon,
  Box,
} from "@mui/material";
import { fr } from "date-fns/locale";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  DateRange,
  DirectionsCar,
  CheckCircle,
  AccountCircle,
  MonetizationOn,
  LocalShipping,
  AttachMoney,
  Person,
  CalendarToday,
  Description,
  AccountBalance,
} from "@mui/icons-material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import AjouteClient from "../Client/AjouteClient";
import YourComponent from "./YourComponent"; // Assuming this component exists
import ClientSearchBar from "../Client/ClientSearchBar"; // Assuming this component exists
import AllOutIcon from "@mui/icons-material/AllOut";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useAuth } from "../context/AuthContext";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { format } from 'date-fns';

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
  {
    label: "Informations de Garantie",
    icon: <CheckCircle sx={{ color: "#1976d2" }} />,
  },
];

const AjouteContrat = ({
  open,
  handleClose,
  newContract,
  setNewContract, // Receive setNewContract from parent
  handleAddContract,
  availableVehicles,
  fetchAvailableVehicles,
}) => {
  const initialClientInfoState = () => ({
    cin_client: "",
    is_fidel: "", // Default to non-fidel
  });

  const { role, userId } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [openYourComponent, setOpenYourComponent] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [clientInfo, setClientInfo] = useState(initialClientInfoState());
  const [clientExists, setClientExists] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    firstName: "",
    lastName: "",
  });
  const [openAddClientDialog, setOpenAddClientDialog] = useState(false);
  const [customPricePerDay, setCustomPricePerDay] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [vehicleSelectionError, setVehicleSelectionError] = useState("");
  const [newClient, setNewClient] = useState({
    nom_fr: "",
    nom_ar: "",
    prenom_fr: "",
    prenom_ar: "",
    cin_client: "",
    date_cin: "",
    date_naiss: "",
    adresse_fr: "",
    adresse_ar: "",
    num_tel: "",
    Numero_Permis: "",
    date_permis: "",
    profession_fr: "",
    profession_ar: "",
    nationalite_origine: "",
  });

  const availableBanks = [
    "STB",
    "BNA",
    "BH",
    "BFPME",
    "BTS",
    "BTE",
    "BTL",
    "TSB",
    "Banque Zitouna",
    "Al Baraka Bank",
    "Al Wifak International Bank",
    "Amen Bank",
    "Attijari Bank",
    "ATB",
    "ABC",
    "BIAT",
    "BT",
    "BTK",
    "BFT",
    "Citi Bank",
    "QNB",
    "UBCI",
    "UIB",
  ];

  const [montantError, setMontantError] = useState("");
  const [modeReglementError, setModeReglementError] = useState("");
  const [fraisCarburant, setFraisCarburant] = useState(0);
  const [fraisRetour, setFraisRetour] = useState(0);
  const [fraisChauffeur, setFraisChauffeur] = useState(0);
  const [modeReglement, setModeReglement] = useState("");
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [showClientList, setShowClientList] = useState(false);

  const getDaysBetweenDates = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return 0;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const duration = getDaysBetweenDates(
    newContract.Date_debut,
    newContract.Date_retour
  );

  const stepLabelStyle = (index) => {
    if (activeStep === index) {
      return {
        color: "red",
        fontWeight: "bold",
      };
    } else {
      return {
        color: "#1976d2",
        fontWeight: "bold",
      };
    }
  };

  const handleCloseDialog = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmClose = () => {
    setIsConfirmationOpen(false);
    // Reset all relevant states when closing
    setNewContract({
      Date_debut: "",
      Heure_debut: "",
      Date_retour: "",
      Heure_retour: "",
      Duree_location: "",
      Numero_contrat: "", // Reset the contract number
      num_immatriculation: "",
      cin_client: "",
      Prix_total: "",
      mode_reglement_garantie: "",
      montant: "",
      echeance: "",
      numero_piece: "",
      banque: "",
      frais_retour: 0,
      frais_carburant: 0,
      frais_chauffeur: 0,
      prix_jour: 0,
      prix_ht: 0,
    });
    setClientInfo(initialClientInfoState());
    setClientExists(false);
    setSelectedVehicle(null);
    setCustomPricePerDay(0);
    setFraisCarburant(0);
    setFraisRetour(0);
    setFraisChauffeur(0);
    setModeReglement("");
    setMontantError("");
    setModeReglementError("");
    setVehicleSelectionError("");
    setActiveStep(0);
    handleClose(); // Close the parent dialog
  };

  const handleCancelClose = () => {
    setIsConfirmationOpen(false);
  };

  const handleVehicleSelection = (event) => {
    const selectedId = parseInt(event.target.value);
    const selected = availableVehicles.find(
      (vehicle) => vehicle.id_vehicule === selectedId
    );

    if (selected) {
      setSelectedVehicle(selected);
      setCustomPricePerDay(selected.prix_jour);
      setNewContract((prev) => ({
        ...prev,
        num_immatriculation: selected.num_immatriculation,
        prix_jour: selected.prix_jour,
      }));
    } else {
       setSelectedVehicle(null);
       setCustomPricePerDay(0);
       setNewContract((prev) => ({
         ...prev,
         num_immatriculation: "",
         prix_jour: 0,
       }));
    }
  };

  const yourCloseHandler = () => {
    setOpenYourComponent(false);
    handleClose(); // Close the parent dialog
  };

  const filteredVehicles = availableVehicles.filter((vehicle) => {
    const matchesSearchQuery =
      (vehicle.num_immatriculation?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
       vehicle.modele?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
       vehicle.marque?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()));

    const matchesCategory = selectedCategory
      ? selectedCategory === "all" || vehicle.id_categorie === selectedCategory
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

  const handleAddClient = async () => {
    try {
      await axios.post("http://localhost:7001/client", newClient);
      setOpenAddClientDialog(false);
      // Reset newClient state after adding
      setNewClient({
        nom_fr: "",
        nom_ar: "",
        prenom_fr: "",
        prenom_ar: "",
        cin_client: "",
        date_cin: "",
        date_naiss: "",
        adresse_fr: "",
        adresse_ar: "",
        num_tel: "",
        Numero_Permis: "",
        date_permis: "",
        profession_fr: "",
        profession_ar: "",
        nationalite_origine: "",
      });
      // Automatically search for the newly added client
      await handleCINChange({ target: { value: newClient.cin_client } });
    } catch (error) {
      console.error("Error adding client", error);
      setSnackbarMessage("Erreur lors de l'ajout du client.");
      setSnackbarOpen(true);
    }
  };

  const handleCINChange = async (e) => {
    const cin_client = e.target.value;
    setClientInfo({ ...clientInfo, cin_client });
    setClientExists(false);
    setClientDetails({ firstName: "", lastName: "" });
    setErrorMessage("");

    if (cin_client.length === 8) {
      try {
        const response = await axios.get(
          `http://localhost:7001/client?cin_client=${cin_client}`
        );
        const clients = response.data.data;
        const client = clients.find(
          (client) => client.cin_client === cin_client
        );

        if (client) {
          setClientExists(true);
          setClientDetails({
            firstName: client.prenom_fr,
            lastName: client.nom_fr,
          });
          setClientInfo({ ...clientInfo, is_fidel: client.is_fidel });
        } else {
          setClientExists(false);
          setErrorMessage("Aucun client trouvé avec ce CIN.");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du CIN:", error);
        setErrorMessage("Erreur lors de la vérification du CIN.");
      }
    } else if (cin_client.length > 0 && cin_client.length !== 8) {
      setErrorMessage("Le CIN doit contenir exactement 8 caractères.");
    } else {
       setErrorMessage("");
    }
  };

  const handleAddClientClick = () => {
    setOpenAddClientDialog(true);
  };

  const handleChange = (name, value) => {
    setNewContract((prev) => ({ ...prev, [name]: value }));

    if (name === "customPricePerDay") {
      setCustomPricePerDay(parseFloat(value) || 0);
    }

    if (name === "mode_reglement_garantie") {
      setModeReglement(value);
    }

    if (name === "frais_carburant") {
      setFraisCarburant(parseFloat(value) || 0);
    } else if (name === "frais_retour") {
      setFraisRetour(parseFloat(value) || 0);
    } else if (name === "frais_chauffeur") {
      setFraisChauffeur(parseFloat(value) || 0);
    }
  };

  const calculateTotalPrice = useCallback((pricePerDay) => {
    if (
      !selectedVehicle ||
      !newContract.Date_debut ||
      !newContract.Date_retour
    ) {
      return { totalHT: 0, totalPrice: 0 };
    }

    const duration = getDaysBetweenDates(
      newContract.Date_debut,
      newContract.Date_retour
    );
    const totalHT = duration * (parseFloat(pricePerDay) || 0);

    const totalFrais = fraisCarburant + fraisRetour + fraisChauffeur;

    const totalPrice = (totalHT + totalFrais) * 1.19;
    return { totalHT, totalPrice };
  }, [selectedVehicle, newContract.Date_debut, newContract.Date_retour, fraisCarburant, fraisRetour, fraisChauffeur]);


  useEffect(() => {
    // Update total price and HT whenever relevant values change
    if (activeStep === 3 && selectedVehicle) {
      const { totalHT, totalPrice } = calculateTotalPrice(customPricePerDay);
      setNewContract((prev) => ({
        ...prev,
        cin_client: clientInfo.cin_client,
        prix_ht: totalHT,
        Prix_total: totalPrice,
        frais_carburant: fraisCarburant,
        frais_retour: fraisRetour,
        frais_chauffeur: fraisChauffeur,
      }));
    }
  }, [
    activeStep,
    selectedVehicle,
    newContract.Date_debut,
    newContract.Date_retour,
    fraisCarburant,
    fraisRetour,
    fraisChauffeur,
    clientInfo.cin_client,
    customPricePerDay,
    calculateTotalPrice,
    setNewContract // Include setNewContract as a dependency if it's not stable
  ]);

  // This useEffect hook calls the prop function fetchAvailableVehicles
  useEffect(() => {
    if (activeStep === 1 && newContract.Date_debut && newContract.Date_retour) {
      fetchAvailableVehicles(newContract.Date_debut, newContract.Date_retour);
    } else if (activeStep === 1 && (!newContract.Date_debut || !newContract.Date_retour)) {
        // When dates are cleared, reset vehicle selection and price
        setSelectedVehicle(null);
        setCustomPricePerDay(0);
        setNewContract(prev => ({ ...prev, num_immatriculation: "", prix_jour: 0 }));
        // Also clear available vehicles when dates are invalid or missing
        fetchAvailableVehicles(null, null);
    }
  }, [activeStep, newContract.Date_debut, newContract.Date_retour, fetchAvailableVehicles, setNewContract]);


  const handleNext = () => {
    setErrorMessage("");
    setVehicleSelectionError("");
    setMontantError("");
    setModeReglementError("");

    // Step 0: Validate client information
    if (activeStep === 0) {
      if (!clientExists || !clientInfo.cin_client) {
        setErrorMessage("Veuillez sélectionner un client.");
        return;
      }
    }

    // Step 1: Validate dates and times
    if (activeStep === 1) {
      if (!newContract.Date_debut || !newContract.Date_retour) {
        setErrorMessage("Veuillez remplir toutes les dates.");
        return;
      }

      const selectedStartDate = new Date(newContract.Date_debut);
      const selectedEndDate = new Date(newContract.Date_retour);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedStartDate < today) {
        setErrorMessage(
          "La date de début ne peut pas être dans le passé. Veuillez accepter la date aujourd'hui ou une date ultérieure."
        );
        return;
      }

      if (selectedEndDate < selectedStartDate) {
        setErrorMessage("La date de retour doit être après la date de début.");
        return;
      }

      if (!newContract.Heure_debut || !newContract.Heure_retour) {
        setErrorMessage("Veuillez remplir toutes les heures.");
        return;
      }

      const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(newContract.Heure_debut)) {
        setErrorMessage("Heure Début invalide. Format attendu HH:MM.");
        return;
      }
      if (!timeRegex.test(newContract.Heure_retour)) {
        setErrorMessage("Heure Retour invalide. Format attendu HH:MM.");
        return;
      }
    }

    // Step 2: Validate vehicle selection
    if (activeStep === 2) {
      if (!selectedVehicle) {
        setVehicleSelectionError("Veuillez sélectionner un véhicule.");
        return;
      }
    }

     // Step 3: Validate price and fees
    if (activeStep === 3) {
        if (customPricePerDay <= 0) {
             setErrorMessage("Le prix par jour doit être supérieur à zéro.");
             return;
        }
    }

    if (activeStep === 4) {
      if (clientInfo.is_fidel === "0") {
          let guaranteeError = "";
          let hasError = false;

          if (!newContract.mode_reglement_garantie) {
              guaranteeError = "Veuillez sélectionner un mode de règlement.";
              setModeReglementError(guaranteeError);
              hasError = true;
          } else {
              setModeReglementError("");
          }

          const montantNum = parseFloat(newContract.montant);
          if (isNaN(montantNum) || montantNum <= 0) {
              guaranteeError = "Veuillez entrer un montant valide.";
              setMontantError(guaranteeError);
              hasError = true;
          } else {
              setMontantError("");
          }

          if (!newContract.echeance) {
              guaranteeError = "Veuillez entrer une échéance.";
              setErrorMessage(guaranteeError);
              hasError = true;
          } else {
               if (errorMessage && errorMessage.includes("échéance") && !guaranteeError && !montantError && !modeReglementError && newContract.numero_piece && newContract.banque) {
                   setErrorMessage("");
               }
          }

          if (!newContract.numero_piece) {
              guaranteeError = "Veuillez entrer un numéro de pièce.";
              setErrorMessage(guaranteeError);
              hasError = true;
          } else {
              if (errorMessage && errorMessage.includes("numéro de pièce") && !guaranteeError && !montantError && !modeReglementError && newContract.echeance && newContract.banque) {
                  setErrorMessage("");
              }
          }

          if (!newContract.banque) {
              guaranteeError = "Veuillez sélectionner une banque.";
              setErrorMessage(guaranteeError);
              hasError = true;
          } else {
               if (errorMessage && errorMessage.includes("banque") && !guaranteeError && !montantError && !modeReglementError && newContract.echeance && newContract.numero_piece) {
                   setErrorMessage("");
               }
          }

          // If there's ANY error for a non-fidel client, stop here
          if (hasError) {
              return; // Stop here if validation fails for non-fidel client
          }
      }
      if (activeStep === steps.length - 1) {
          handleAddContractAndRedirect();
          return; // Stop here as the contract addition process has started
      }
  }

  // If validation passes for the current step and it's NOT the last step, proceed to the next
  setActiveStep((prev) => prev + 1);
};

  const handleAddContractAndRedirect = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      // handleAddContract is now responsible for the API call and returning the added contract
      const addedContract = await handleAddContract(newContract, clientInfo, customPricePerDay, userId);

      if (addedContract && addedContract.Numero_contrat) {
         // Update the newContract state with the actual contract number from the backend
         setNewContract(prev => ({ ...prev, Numero_contrat: addedContract.Numero_contrat }));
         setOpenYourComponent(true); // Open the next component with the confirmed contract number
      } else {
         // This else block should ideally not be reached if handleAddContract returns correctly on success
         setErrorMessage("Erreur lors de l'ajout du contrat: Numéro de contrat non retourné par le serveur.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du contrat:", error);
      // The error from handleAddContract is already logged and snackbar is shown
      setErrorMessage("Erreur lors de l'ajout du contrat. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };


  const handleBack = () => {
    setErrorMessage("");
    setVehicleSelectionError("");
    setMontantError("");
    setModeReglementError("");
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = (step) => {
    const duration = getDaysBetweenDates(
      newContract.Date_debut,
      newContract.Date_retour
    );
    const totalHT = duration * (parseFloat(customPricePerDay) || 0);
    const totalFrais = fraisCarburant + fraisRetour + fraisChauffeur;
    const totalPrice = (totalHT + totalFrais) * 1.19;


    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center", mb: 0 }}
            >
              <ClientSearchBar
                onClientSelect={(client) => {
                  setClientDetails({
                    firstName: client.prenom_fr,
                    lastName: client.nom_fr,
                  });
                  setClientExists(true);
                  setClientInfo({
                    cin_client: client.cin_client,
                    is_fidel: client.is_fidel,
                  });
                  setNewContract(prev => ({ ...prev, cin_client: client.cin_client }));
                  setShowClientList(false);
                  setErrorMessage("");
                }}
                onClose={() => setShowClientList(false)}
              />
            </Grid>

            <Grid container item xs={12} spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                sm={4}
                container
                justifyContent="flex-end"
                alignItems="center"
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  label="CIN Client"
                  name="cin_client"
                  value={clientInfo.cin_client || ""}
                  onChange={handleCINChange}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#007bff" },
                      "&:hover fieldset": { borderColor: "#0056b3" },
                      "&.Mui-focused fieldset": { borderColor: "#004080" },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#007bff",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#004080",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle sx={{ color: "#007bff" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {clientExists && (
  <Grid item xs={12} sm={6}>
    <Paper
      elevation={8}
      sx={{
        padding: 4,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        marginBottom: 2,
        boxShadow: "0px 12px 24px rgba(96, 166, 219, 0.62)",
      }}
    >
      <Grid container alignItems="center">
        <Grid item>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              marginRight: 3,
              backgroundColor: "#007bff",
              color: "#ffffff",
            }}
          >
            {`${clientDetails.lastName.charAt(
              0
            )}${clientDetails.firstName.charAt(0)}`.toUpperCase()}
          </Avatar>
        </Grid>

        <Grid item>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#3985e9",
              marginBottom: 1,
            }}
          >
            Client Trouvé
          </Typography>
          {/* Modified condition here */}
          {clientInfo.is_fidel ? (
            <Typography variant="h6" sx={{ color: "#28a745", fontWeight: "bold" }}>
              Client Fidèle
            </Typography>
          ) : (
            <Typography variant="h6" sx={{ color: "#dc3545", fontWeight: "bold" }}>
              Client Non Fidèle
            </Typography>
          )}
          <Typography
            variant="body1"
            sx={{ fontWeight: "600", color: "#34495e", mb: 1 }}
          >
            <strong>Nom: </strong>
            <span style={{ color: "#ec2e4e", fontWeight: "800" }}>
              {clientDetails.lastName}
            </span>
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: "600", color: "#34495e" }}
          >
            <strong>Prénom: </strong>
            <span style={{ color: "#ec2e4e", fontWeight: "800" }}>
              {clientDetails.firstName}
            </span>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  </Grid>
)}

            </Grid>

            {!clientExists && clientInfo.cin_client.length > 0 && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="error"
                  sx={{ fontWeight: "bold", textAlign: "center", mt: 0 }}
                >
                  Aucun client trouvé. Veuillez ajouter un nouveau client.
                </Typography>
                {role === "Admin" && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddClientClick}
                      sx={{
                        borderRadius: "25px",
                        padding: "12px 28px",
                        backgroundColor: "#007bff",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                        "&:hover": {
                          backgroundColor: "#0069d9",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                          transform: "scale(1.05)",
                          transition: "0.2s",
                        },
                      }}
                    >
                      Ajouter Client
                    </Button>
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
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
                  value={newContract.Date_debut || ""}
                  onChange={(e) => handleChange("Date_debut", e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
                  InputLabelProps={{
                    shrink: true,
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
                  label="Heure Début"
                  name="Heure_debut"
                  type="time"
                  value={newContract.Heure_debut || ""}
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
                  onChange={(e) => handleChange("Heure_debut", e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date Retour"
                  name="Date_retour"
                  type="date"
                  value={newContract.Date_retour || ""}
                  onChange={(e) => handleChange("Date_retour", e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
                  InputLabelProps={{
                    shrink: true,
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
                  label="Heure Retour"
                  name="Heure_retour"
                  type="time"
                  value={newContract.Heure_retour || ""}
                  onChange={(e) => handleChange("Heure_retour", e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ color: "#f0112b" }}>
                  Durée de location : {duration} jours
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
                  setVehicleSearchQuery("");
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
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
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
                        Aucun véhicule disponible pour cette période.
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Prix par jour"
                value={customPricePerDay}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  setCustomPricePerDay(newValue);
                  setNewContract((prev) => ({ ...prev, prix_jour: newValue }));
                }}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonetizationOn sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 0,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1976d2" },
                    "&:hover fieldset": { borderColor: "#115293" },
                    "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                  },
                }}
                 error={customPricePerDay <= 0}
                 helperText={customPricePerDay <= 0 ? "Le prix par jour doit être supérieur à zéro." : ""}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Prix HT"
                value={totalHT ? totalHT.toFixed(2) : "0.00"}
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
                      value={fraisCarburant}
                      onChange={(e) =>
                        handleChange("frais_carburant", e.target.value)
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
                      value={fraisRetour}
                      onChange={(e) =>
                        handleChange("frais_retour", e.target.value)
                      }
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalShipping sx={{ color: "#1976d2" }} />
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
                      value={fraisChauffeur}
                      onChange={(e) =>
                        handleChange("frais_chauffeur", e.target.value)
                      }
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: "#1976d2" }} />
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
                Prix Total TTC:{" "}
                {totalPrice ? totalPrice.toFixed(2) : "0.00"}{" "}
                dt
              </Typography>
            </Grid>
          </Grid>
        );
        case 4:
          return (
            <Grid container spacing={2}>
              {/* Mode de règlement */}
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  variant="outlined"
                  label="Mode de règlement garantie"
                  value={newContract.mode_reglement_garantie || ""}
                  onChange={(e) => {
                    handleChange("mode_reglement_garantie", e.target.value);
                    // Clear error immediately on change attempt
                    setModeReglementError("");
                  }}
                  displayEmpty
                  sx={{ mb: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance sx={{ color: "#1976d2" }} />
                      </InputAdornment>
                    ),
                  }}
                  required={clientInfo.is_fidel === "0"} // <-- Add this
                  error={Boolean(modeReglementError)}
                >
                  <MenuItem value="" disabled>
                    Sélectionner un mode de règlement
                  </MenuItem>
                  <MenuItem value="virement bancaire">Virement bancaire</MenuItem>
                  <MenuItem value="cheque">Chèque</MenuItem>
                  <MenuItem value="carte bancaire">Carte bancaire</MenuItem>
                  <MenuItem value="especes">Espèces</MenuItem>
                </Select>
                {modeReglementError && (
                  <Typography color="error">{modeReglementError}</Typography>
                )}
              </Grid>

              {/* Montant */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Montant"
                  name="montant"
                  value={newContract.montant || ""}
                  onChange={(e) => {
                    handleChange("montant", e.target.value);
                     // Clear error immediately on change attempt
                    setMontantError("");
                  }}
                  error={Boolean(montantError)}
                  helperText={montantError}
                  required={clientInfo.is_fidel === "0"} // <-- Add this
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: "#1976d2" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Échéance */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Échéance"
                  name="echeance"
                  value={newContract.echeance || ""}
                  type="date"
                  onChange={(e) => {
                     handleChange("echeance", e.target.value);
                     // Clear main error message if it was related to this field
                     if (errorMessage && errorMessage.includes("échéance")) setErrorMessage("");
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 1 }}
                  required={clientInfo.is_fidel === "0"} // <-- Add this
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: "#1976d2" }} />
                      </InputAdornment>
                    ),
                  }}
                  // You might want to add error state and helperText here too for better UX
                  // error={clientInfo.is_fidel === "0" && !newContract.echeance}
                  // helperText={clientInfo.is_fidel === "0" && !newContract.echeance ? "Échéance obligatoire" : ""}
                />
              </Grid>

              {/* Numéro de pièce */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Numéro de pièce"
                  name="numero_piece"
                  value={newContract.numero_piece || ""}
                  onChange={(e) => {
                     handleChange("numero_piece", e.target.value);
                     // Clear main error message if it was related to this field
                     if (errorMessage && errorMessage.includes("numéro de pièce")) setErrorMessage("");
                  }}
                  sx={{ mb: 1 }}
                  required={clientInfo.is_fidel === "0"} // <-- Add this
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description sx={{ color: "#1976d2" }} />
                      </InputAdornment>
                    ),
                  }}
                   // You might want to add error state and helperText here too
                  // error={clientInfo.is_fidel === "0" && !newContract.numero_piece}
                  // helperText={clientInfo.is_fidel === "0" && !newContract.numero_piece ? "Numéro de pièce obligatoire" : ""}
                />
              </Grid>

              {/* Banque */}
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  variant="outlined"
                  label="Banque"
                  value={newContract.banque || ""}
                  onChange={(e) => {
                     handleChange("banque", e.target.value);
                     // Clear main error message if it was related to this field
                     if (errorMessage && errorMessage.includes("banque")) setErrorMessage("");
                  }}
                  displayEmpty
                  sx={{ mb: 1 }}
                  required={clientInfo.is_fidel === "0"} // <-- Add this
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance sx={{ color: "#1976d2" }} />
                      </InputAdornment>
                    ),
                  }}
                   // You might want to add error state and helperText here too
                  // error={clientInfo.is_fidel === "0" && !newContract.banque}
                  // helperText={clientInfo.is_fidel === "0" && !newContract.banque ? "Banque obligatoire" : ""}
                >
                  <MenuItem value="" disabled>
                    Sélectionner une banque
                  </MenuItem>
                  {availableBanks.map((bank, index) => (
                    <MenuItem key={index} value={bank}>
                      {bank}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleCloseDialog();
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
            onClick={handleCloseDialog}
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
            [Numéro de Contrat: {newContract.Numero_contrat || "En attente..."}] {/* Display "En attente..." before number is assigned */}
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
            {` ${duration} jours`}{" "}
          </Typography>
          {"  "}
          <span>Numéro d'immatriculation:</span>
          {selectedVehicle ? (
            <Typography component="span" sx={{ fontWeight: "bold" }}>
              {` (${selectedVehicle.num_immatriculation})`}
            </Typography>
          ) : null}
        </Typography>
        <DialogContent sx={{ padding: 3 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ marginBottom: 3 }}
          >
            {steps.map(({ label, icon }, index) => (
              <Step key={label}>
                <StepLabel
                  icon={icon}
                  sx={{ "& .MuiStepLabel-label": stepLabelStyle(index) }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
          {errorMessage && (
            <Typography color="error" sx={{ fontWeight: "bold", marginTop: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: 1, justifyContent: "space-between" }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
            color="primary"
            sx={{ borderRadius: "20px", marginRight: 1 }}
            startIcon={<ArrowBack />}
          >
            Retour
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            onClick={
              activeStep === steps.length - 1
                ? handleAddContractAndRedirect
                : handleNext
            }
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#155a8a" },
              borderRadius: "20px",
            }}
            disabled={
              loading ||
              (activeStep === 0 && (!clientExists || !clientInfo.cin_client)) ||
              (activeStep === 1 && (!newContract.Date_debut || !newContract.Date_retour || !newContract.Heure_debut || !newContract.Heure_retour)) || // Added validation for dates and times
              (activeStep === 2 && !selectedVehicle) ||
              (activeStep === 3 && customPricePerDay <= 0) ||
              // Corrected validation for Step 4 in the disabled prop
              (activeStep === 4 && clientInfo.is_fidel === "0" && (
                  !newContract.mode_reglement_garantie ||
                  isNaN(parseFloat(newContract.montant)) || parseFloat(newContract.montant) <= 0 ||
                  !newContract.echeance ||
                  !newContract.numero_piece ||
                  !newContract.banque
              ))
            }
            endIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ArrowForward />
              )
            }
          >
            {loading
              ? "Chargement..."
              : activeStep === steps.length - 1
              ? "Valide"
              : "Suivant"}
          </Button>
        </DialogActions>
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
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
      <AjouteClient
        open={openAddClientDialog}
        handleClose={() => setOpenAddClientDialog(false)}
        newClient={newClient}
        setNewClient={setNewClient}
        handleAddClient={handleAddClient}
      />
      <YourComponent
        open={openYourComponent}
        handleClose={yourCloseHandler}
        contractNumber={newContract.Numero_contrat} // Use the confirmed contract number
        cinClient={clientInfo.cin_client}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity="error"
      />
    </LocalizationProvider>
  );
};

AjouteContrat.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  newContract: PropTypes.object.isRequired,
  setNewContract: PropTypes.func.isRequired, // Add propType
  handleAddContract: PropTypes.func.isRequired,
  availableVehicles: PropTypes.array.isRequired,
  fetchAvailableVehicles: PropTypes.func.isRequired,
};

export default AjouteContrat;