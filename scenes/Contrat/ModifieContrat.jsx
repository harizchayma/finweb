import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from "axios";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AdvanceIcon from "@mui/icons-material/MonetizationOn";
import ChauffeurIcon from "@mui/icons-material/Person";
import AvanceContratIcon from "./IconAvance";
import AjouteChauffeurIcon from "./AjouteChauffeurIcon";

// Fonction utilitaire pour formater les dates
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
};

// Function to calculate the number of days between two dates
const getDaysBetweenDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    return 0;
  }

  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

function ModifieContrat({
  open,
  handleClose,
  contrat,
  setContrat,
  handleUpdateContrat,
}) {
  if (!contrat) {
    return null;
  }

  const { Numero_contrat, cin_client, num_immatriculation } = contrat;

  const [clientDetails, setClientDetails] = useState({});
  const [vehiculeDetails, setVehiculeDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avanceDialogOpen, setAvanceDialogOpen] = useState(false);
  const [chauffeureDialogOpen, setChauffeurDialogOpen] = useState(false);

  const handleOpenAvanceDialog = () => {
    setAvanceDialogOpen(true);
  };

  const handleOpenChauffeurDialog = () => {
    setChauffeurDialogOpen(true);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");

      try {
        if (cin_client) {
          const { data: clientData } = await axios.get(
            `http://localhost:7001/client?cin_client=${cin_client}`
          );
          setClientDetails(clientData?.data[0] || {});
        } else {
          console.warn("CIN est manquant.");
        }

        if (num_immatriculation) {
          const { data: vehicleData } = await axios.get(
            `http://localhost:7001/vehicules?num_immatriculation=${num_immatriculation}`
          );
          setVehiculeDetails(vehicleData?.data[0] || {});
        } else {
          console.warn("Numéro d'immatriculation est manquant.");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des détails:", err);
        setError(
          "Erreur lors de la récupération des détails. Vérifiez la console pour plus de détails."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [cin_client, num_immatriculation]);

  const calculateTotalPrice = useCallback(
    (currentContrat) => {
      const duration = getDaysBetweenDates(
        currentContrat.Date_debut,
        currentContrat.Date_retour
      );
      const prixJour = parseFloat(currentContrat.prix_jour) || 0;
      const fraisChauffeur = parseFloat(currentContrat.frais_chauffeur) || 0;
      const fraisCarburant = parseFloat(currentContrat.frais_carburant) || 0;
      const fraisRetour = parseFloat(currentContrat.frais_retour) || 0;

      const totalHT =
        duration * prixJour + fraisChauffeur + fraisCarburant + fraisRetour;
      const totalPrice = totalHT * 1.19; // Assuming 19% tax

      return totalPrice;
    },
    [getDaysBetweenDates] // Include getDaysBetweenDates in dependencies if it's not defined outside
  );

  const handleChange = useCallback(
    (field) => (event) => {
      const value = event.target.value;
      let updatedContrat = { ...contrat, [field]: value };

      if (field === "Date_retour" || field === "Date_debut") {
        const startDate = new Date(updatedContrat.Date_debut);
        const returnDate = new Date(updatedContrat.Date_retour);
        const duration = Math.ceil(
          (returnDate - startDate) / (1000 * 60 * 60 * 24)
        );
        updatedContrat.Duree_location = duration >= 0 ? duration : 0; // Ensure duration is non-negative
      }

      // Recalculate total price if relevant fields change
      if (
        field === "Date_debut" ||
        field === "Date_retour" ||
        field === "prix_jour" ||
        field === "frais_chauffeur" ||
        field === "frais_carburant" ||
        field === "frais_retour"
      ) {
        updatedContrat.Prix_total = calculateTotalPrice(updatedContrat);
      }

      setContrat(updatedContrat);
    },
    [setContrat, contrat, calculateTotalPrice]
  );

  const handleUpdate = useCallback(async () => {
    if (!contrat || !contrat.Numero_contrat) {
      setError("Numero_contrat is missing or invalid");
      return;
    }

    const updatedContrat = {
      ...contrat,
      Date_debut: new Date(contrat.Date_debut).toISOString(),
      Date_retour: new Date(contrat.Date_retour).toISOString(),
      Duree_location: parseInt(contrat.Duree_location, 10),
      Prolongation: parseInt(contrat.Prolongation, 10),
      Prix_total: parseFloat(contrat.Prix_total),
      Frais: parseFloat(contrat.Frais),
      prix_jour: parseFloat(contrat.prix_jour), // Ensure prix_jour is a number
      frais_chauffeur: parseFloat(contrat.frais_chauffeur), // Ensure frais_chauffeur is a number
      frais_carburant: parseFloat(contrat.frais_carburant), // Ensure frais_carburant is a number
      frais_retour: parseFloat(contrat.frais_retour), // Ensure frais_retour is a number
    };

    try {
      const { data } = await axios.put(
        `http://localhost:7001/contrat/${contrat.ID_contrat}`,
        updatedContrat
      );
      handleUpdateContrat(data.data);
      handleClose();
      setError("");
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.error ||
            "Erreur lors de la mise à jour du contrat"
        );
      } else {
        setError("Erreur lors de la mise à jour du contrat");
      }
    }
  }, [contrat, handleUpdateContrat, handleClose]);

  // Recalculate total price when the contract object changes
  useEffect(() => {
    if (contrat) {
      setContrat((prev) => ({
        ...prev,
        Prix_total: calculateTotalPrice(prev),
      }));
    }
  }, [
    contrat?.Date_debut,
    contrat?.Date_retour,
    contrat?.prix_jour,
    contrat?.frais_chauffeur,
    contrat?.frais_carburant,
    contrat?.frais_retour,
  ]);

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
          handleClose();
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
          marginBottom: 2,
        }}
      >
        Modifier le Numéro Contrat {Numero_contrat}
        <Grid container justifyContent="flex-end" sx={{ mb: 0 }}>
          <Tooltip title="Ajouter un avance">
            <IconButton
              sx={{ color: "#ffb300", marginRight: 1 }}
              onClick={handleOpenAvanceDialog}
            >
              <AdvanceIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ajouter un chauffeur">
            <IconButton
              sx={{ color: "#5c6bc0", marginRight: 2 }}
              onClick={handleOpenChauffeurDialog}
            >
              <ChauffeurIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <Accordion
              sx={{ mb: 2, border: "1px solid #d32f2f", borderRadius: "5px" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#d32f2f" }} />}
                aria-controls="basic-info-content"
                id="basic-info-header"
              >
                <AssignmentIcon sx={{ color: "#d32f2f", mr: 1 }} />
                <Typography variant="h6">Informations de Base</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Card
                  variant="outlined"
                  sx={{ boxShadow: 2, borderRadius: 2, p: 1, width: "100%" }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      {[
                        {
                          label: "Date de Début",
                          key: "Date_debut",
                          type: "date",
                          icon: <DateRangeIcon sx={{ color: "#1565c0" }} />,
                          value: formatDateForInput(contrat.Date_debut), // Formater la date
                        },
                        {
                          label: "Heure de Début",
                          key: "Heure_debut",
                          icon: <AccessTimeIcon sx={{ color: "#1565c0" }} />,
                        },
                        {
                          label: "Date de Retour",
                          key: "Date_retour",
                          type: "date",
                          icon: <DateRangeIcon sx={{ color: "#1565c0" }} />,
                          value: formatDateForInput(contrat.Date_retour), // Formater la date
                        },
                        {
                          label: "Heure de Retour",
                          key: "Heure_retour",
                          icon: <AccessTimeIcon sx={{ color: "#1565c0" }} />,
                        },
                        {
                          label: "Durée de Location (jours)",
                          key: "Duree_location",
                          type: "number",
                          readOnly: true,
                          icon: <AccessTimeIcon sx={{ color: "#1565c0" }} />,
                        },
                       
                        
                      ].map(
                        (
                          { label, key, type, readOnly, icon, value },
                          index
                        ) => (
                          <Grid item xs={12} sm={6} key={key || index}>
                            <TextField
                              label={label}
                              type={type || "text"}
                              fullWidth
                              variant="outlined"
                              value={value || contrat[key] || ""}
                              onChange={
                                readOnly ? undefined : handleChange(key)
                              }
                              InputLabelProps={
                                type === "date" ? { shrink: true } : {}
                              }
                              InputProps={{
                                style: { width: "350px", height: "45px" },
                                readOnly: readOnly,
                                startAdornment: icon ? (
                                  <InputAdornment position="start">
                                    {icon}
                                  </InputAdornment>
                                ) : null,
                              }}
                              sx={{
                                mb: 1,
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": { borderColor: "#1976d2" },
                                  "&:hover fieldset": {
                                    borderColor: "#115293",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#0d47a1",
                                  },
                                },
                              }}
                            />
                          </Grid>
                        )
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>

            <Accordion
              sx={{ mb: 2, border: "1px solid #d32f2f", borderRadius: "5px" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#d32f2f" }} />}
                aria-controls="guarantee-info-content"
                id="guarantee-info-header"
              >
                <AccountBalanceIcon sx={{ color: "#d32f2f", mr: 1 }} />
                <Typography variant="h6">Informations de Garantie</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Card
                  variant="outlined"
                  sx={{ boxShadow: 2, borderRadius: 2, p: 2, width: "100%" }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      {[
                        {
                          label: "Mode de Règlement Garantie",
                          key: "mode_reglement_garantie",
                          icon: (
                            <MonetizationOnIcon sx={{ color: "#1565c0" }} />
                          ),
                        },
                        {
                          label: "Montant",
                          key: "montant",
                          type: "number",
                          icon: (
                            <MonetizationOnIcon sx={{ color: "#1565c0" }} />
                          ),
                        },
                        {
                          label: "Échéance",
                          key: "echeance",
                          type: "date",
                          icon: <DateRangeIcon sx={{ color: "#1565c0" }} />,
                        },
                        {
                          label: "Numéro de Pièce",
                          key: "numero_piece",
                          icon: <AssignmentIcon sx={{ color: "#1565c0" }} />,
                        },
                        {
                          label: "Banque",
                          key: "banque",
                          icon: (
                            <AccountBalanceIcon sx={{ color: "#1565c0" }} />
                          ),
                        },
                      ].map(({ label, key, type, icon }, index) => (
                        <Grid item xs={12} sm={6} key={key || index}>
                          <TextField
                            label={label}
                            type={type || "text"}
                            fullWidth
                            variant="outlined"
                            value={contrat[key] || ""}
                            onChange={handleChange(key)}
                            InputLabelProps={
                              type === "date" ? { shrink: true } : {}
                            }
                            InputProps={{
                              startAdornment: icon ? (
                                <InputAdornment position="start">
                                  {icon}
                                </InputAdornment>
                              ) : null,
                            }}
                            sx={{
                              mb: 1,
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "#1976d2" },
                                "&:hover fieldset": { borderColor: "#115293" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#0d47a1",
                                },
                              },
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>

            <Accordion
              sx={{ mb: 2, border: "1px solid #d32f2f", borderRadius: "5px" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#d32f2f" }} />}
                aria-controls="fees-info-content"
                id="fees-info-header"
              >
                <MonetizationOnIcon sx={{ color: "#d32f2f", mr: 1 }} />
                <Typography variant="h6">Informations de Frais</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Card
                  variant="outlined"
                  sx={{ boxShadow: 2, borderRadius: 2, p: 2, width: "100%" }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      {[
                        
                        {
                          label: "Frais de Retour",
                          key: "frais_retour",
                          type: "number",
                          icon: (
                            <MonetizationOnIcon sx={{ color: "#1565c0" }} />
                          ),
                        },
                        {
                          label: "Frais de Carburant",
                          key: "frais_carburant",
                          type: "number",
                          icon: (
                            <MonetizationOnIcon sx={{ color: "#1565c0" }} />
                          ),
                        },
                        {
                          label: "Frais de Chauffeur",
                          key: "frais_chauffeur",
                          type: "number",
                          icon: (
                            <MonetizationOnIcon sx={{ color: "#1565c0" }} />
                          ),
                        },
                        
                      ].map(({ label, key, type, icon }, index) => (
                        <Grid item xs={12} sm={6} key={key || index}>
                          <TextField
                            label={label}
                            type={type || "text"}
                            fullWidth
                            variant="outlined"
                            value={contrat[key] || ""}
                            onChange={handleChange(key)}
                            InputLabelProps={
                              type === "date" ? { shrink: true } : {}
                            }
                            InputProps={{
                              startAdornment: icon ? (
                                <InputAdornment position="start">
                                  {icon}
                                </InputAdornment>
                              ) : null,
                            }}
                            sx={{
                              mb: 1,
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "#1976d2" },
                                "&:hover fieldset": { borderColor: "#115293" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#0d47a1",
                                },
                              },
                            }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} sm={6} key="Prix_total">
                        <TextField
                          label="Prix Total"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={
                            typeof contrat.Prix_total === "number"
                              ? contrat.Prix_total.toFixed(2)
                              : ""
                          } // Check if it's a number before toFixed
                          readOnly
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MonetizationOnIcon sx={{ color: "#1565c0" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: "#1976d2" },
                              "&:hover fieldset": { borderColor: "#115293" },
                              "&.Mui-focused fieldset": {
                                borderColor: "#0d47a1",
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={handleUpdate}
          variant="contained"
          sx={{
            bgcolor: "#1976d2",
            color: "white",
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#1565c0" },
          }}
          startIcon={<SaveIcon />}
        >
          Modifier
        </Button>
        <Button
          onClick={() => {
            setContrat(null);
            handleClose();
          }}
          variant="contained"
          sx={{
            bgcolor: "#d32f2f",
            color: "white",
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#b71c1c" },
          }}
          startIcon={<CancelIcon />}
        >
          Annuler
        </Button>
      </DialogActions>
      <AvanceContratIcon
        open={avanceDialogOpen}
        handleClose={() => setAvanceDialogOpen(false)}
        defaultContractNumber={Numero_contrat} // Utilisez ici Numero_contrat
        cinClient={cin_client} // Utilisez ici cin_client
      />
      <AjouteChauffeurIcon
        open={chauffeureDialogOpen}
        handleClose={() => setChauffeurDialogOpen(false)}
        defaultContractNumber={Numero_contrat}
        onChauffeurAdded={() => {
          setChauffeurDialogOpen(false); // Fermer le dialogue mais ne pas changer de page
          // fetchData(); // Si vous voulez mettre à jour l'affichage des chauffeurs
        }}
      />
    </Dialog>
  );
}

export default ModifieContrat;
