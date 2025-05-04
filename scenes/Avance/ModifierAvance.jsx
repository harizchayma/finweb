import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  TextField,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { format, parseISO, isValid } from "date-fns";
import { Cancel, Save, CalendarToday } from "@mui/icons-material";

function ModifierAvance({ open, handleClose, advanceId, onSuccess }) {
  const [advanceData, setAdvanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({}); // For form input management
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // or 'error'

  useEffect(() => {
    const fetchAdvanceDetails = async () => {
      setLoading(true);
      setError(null);
      setAdvanceData(null); // Reset advance data on new fetch
      try {
        const response = await axios.get(`http://localhost:7001/avance/${advanceId}`);
        setAdvanceData(response.data);
        const fetchedData = response.data?.data || {};
        const { id, ...formDataWithoutId } = fetchedData; // Exclude 'id' if present
        setFormData(formDataWithoutId);
    } catch (err) {
        setError("Erreur lors de la récupération des données d'avance.");
      } finally {
        setLoading(false);
      }
    };

    if (open && advanceId) {
      fetchAdvanceDetails();
    } else if (!open) {
      // Reset state when the dialog is closed
      setFormData({});
      setAdvanceData(null);
      setError(null);
      setLoading(false); // Ensure loading is false when closed
      setSnackbarOpen(false); // Close any open snackbar
    }
  }, [open, advanceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      let updatedValue = value;
      if (name.startsWith("montant")) {
        updatedValue = parseFloat(value);
        if (isNaN(updatedValue)) {
          updatedValue = null; // Or handle the error as needed
        }
      }
      return { ...prevState, [name]: updatedValue };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!formData.date || !formData.cin_client) {
      setSnackbarMessage("Les champs obligatoires sont manquants : 'date' et 'cin_client'");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        Numero_avance: formData.Numero_avance || null,
        cin_client: formData.cin_client || null,
        Numero_contrat: formData.Numero_contrat || null,
        date: formData.date ? format(new Date(formData.date), "yyyy-MM-dd") : null,
        montant_cheque1: formData.montant_cheque1 || null,
        banque_cheque1: formData.banque_cheque1 || null,
        echeance_cheque1: formData.echeance_cheque1 || null,
        date_cheque1: formData.date_cheque1 ? format(new Date(formData.date_cheque1), "yyyy-MM-dd") : null,
        montant_cheque2: formData.montant_cheque2 || null,
        banque_cheque2: formData.banque_cheque2 || null,
        echeance_cheque2: formData.echeance_cheque2 || null,
        date_cheque2: formData.date_cheque2 ? format(new Date(formData.date_cheque2), "yyyy-MM-dd") : null,
        montant_espace: formData.montant_espace || null,
        montant_virement: formData.montant_virement || null,
        banque_virement: formData.banque_virement || null,
      };
      console.log("Data to send:", dataToSend);
      const response = await axios.put(`http://localhost:7001/avance/${advanceId}`, dataToSend);

      setSnackbarMessage("Avance modifiée avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setLoading(false);
      handleClose();
      if (onSuccess && response.data && response.data.data) {
        onSuccess(response.data.data);
      }

    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Server Errors:", err.response.data.error);
        const message = err.response?.data?.error || err.response?.data?.message || "Erreur inconnue";
        setSnackbarMessage(`Erreur: ${JSON.stringify(message)}`);
      } else {
        setSnackbarMessage("Erreur inconnue lors de la modification.");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };


  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Chargement des informations...</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 3,
          }}
        >
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Erreur</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!advanceData || !advanceData.data) {
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Information</DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Aucune information d'avance disponible.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    );
}

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose(); // Only close on close button click
        }
      }}
      sx={{
        "& .MuiDialog-paper": {
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "#f5f5f5",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
        },
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "#d21919",
          marginBottom: 0,
        }}
      >
        Modifier Avance - Numéro: {advanceData.data?.Numero_avance}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Contract Number */}
          <Grid item xs={12}>
            {formData.Numero_contrat !== null &&
            formData.Numero_contrat !== undefined ? (
              <Typography
                variant="h5"
                sx={{
                  marginBottom: 0,
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#3949ab",
                }}
              >
                Numéro de Contrat: {formData.Numero_contrat}
              </Typography>
            ) : (
              <Typography variant="body1" color="textSecondary">
                Numéro de Contrat non disponible
              </Typography>
            )}
          </Grid>

          {/* Client Information */}
          <Grid item xs={12}>
            {formData.cin_client !== null &&
            formData.cin_client !== undefined ? (
              <Typography
                variant="h5"
                sx={{
                  marginBottom: 0,
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#3949ab",
                }}
              >
                CIN Client: {formData.cin_client}
              </Typography>
            ) : (
              <Typography variant="body1" color="textSecondary">
                CIN Client non disponible
              </Typography>
            )}
          </Grid>

              <Grid item xs={12}>
              <TextField
    label="Date d'Avance"
    variant="outlined"
    type="date"
    name="date"
    value={
        formData.date &&
        isValid(parseISO(formData.date))
            ? format(parseISO(formData.date), "yyyy-MM-dd")
            : ""
    }
    onChange={handleChange}
    fullWidth
/>
              </Grid>
           

          {/* Montant Chèque 1 */}
          {formData.montant_cheque1 !== null &&
            formData.montant_cheque1 !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Montant Chèque "
                  variant="outlined"
                  name="montant_cheque1"
                  type="number"
                  value={formData.montant_cheque1 || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

          {/* Echéance Chèque 1 */}
          {formData.echeance_cheque1 !== null &&
            formData.echeance_cheque1 !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Numéro de Chèque"
                  variant="outlined"
                  name="echeance_cheque1"
                  value={formData.echeance_cheque1 || ""}
                  onChange={handleChange}
                  fullWidth
                  required={
                    formData.montant_cheque1 !== null &&
                    formData.montant_cheque1 !== undefined &&
                    formData.montant_cheque1 !== ""
                  }
                />
              </Grid>
            )}

          {/* Date Chèque 1 */}
          {formData.date_cheque1 !== null &&
            formData.date_cheque1 !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Date Chèque "
                  variant="outlined"
                  type="date"
                  name="date_cheque1"
                  value={
                    formData.date_cheque1 &&
                    isValid(parseISO(formData.date_cheque1))
                      ? format(parseISO(formData.date_cheque1), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}
          {/* Banque Chèque 1 */}
          {formData.banque_cheque1 !== null &&
            formData.banque_cheque1 !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Banque Chèque "
                  variant="outlined"
                  name="banque_cheque1"
                  value={formData.banque_cheque1 || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}
          {/* Montant Chèque 2 */}
          {formData.montant_cheque2 !== null &&
            formData.montant_cheque2 !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Montant Chèque 2"
                  variant="outlined"
                  name="montant_cheque2"
                  type="number"
                  value={formData.montant_cheque2 || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

          {/* Echéance Chèque 2 */}
          {formData.echeance_cheque2 !== null &&
            formData.echeance_cheque2 !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Numéro de Chèque 2"
                  variant="outlined"
                  type="text"
                  name="echeance_cheque2"
                  value={formData.echeance_cheque2 || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

          {/* Date Chèque 2 */}
          {formData.date_cheque2 !== null &&
            formData.date_cheque2 !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Date Chèque 2"
                  variant="outlined"
                  type="date"
                  name="date_cheque2"
                  value={
                    formData.date_cheque2 &&
                    isValid(parseISO(formData.date_cheque2))
                      ? format(parseISO(formData.date_cheque2), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

          {/* Banque Chèque 2 */}
          {formData.banque_cheque2 !== null &&
            formData.banque_cheque2 !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Banque Chèque 2"
                  variant="outlined"
                  name="banque_cheque2"
                  value={formData.banque_cheque2 || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}
          {/* Montant Espèces */}
          {formData.montant_espace !== null &&
            formData.montant_espace !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Montant Espèces"
                  variant="outlined"
                  name="montant_espace"
                  type="number"
                  value={formData.montant_espace || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

          {/* Montant Virement */}
          {formData.montant_virement !== null &&
            formData.montant_virement !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Montant Virement"
                  variant="outlined"
                  name="montant_virement"
                  type="number"
                  value={formData.montant_virement || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

          {/* Banque Virement */}
          {formData.banque_virement !== null &&
            formData.banque_virement !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Banque Virement"
                  variant="outlined"
                  name="banque_virement"
                  value={formData.banque_virement || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit}
          sx={{
            bgcolor: "#1976d2",
            color: "white",
            px: 2,
            py: 1,
            fontWeight: "bold",
            "&:hover": { bgcolor: "#1565c0" },
          }}
          disabled={loading}
        >
          <Save sx={{ marginRight: 1 }} />
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Modifier"
          )}
        </Button>
        <Button
          onClick={handleClose}
          sx={{
            bgcolor: "#d32f2f",
            color: "white",
            px: 2,
            py: 1,
            fontWeight: "bold",
            "&:hover": { bgcolor: "#b71c1c" },
          }}
        >
          <Cancel sx={{ marginRight: 1 }} />
          Annuler
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default ModifierAvance;