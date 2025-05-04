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
  Snackbar, // Import Snackbar
  Alert, // Import Alert
} from "@mui/material";
import { format, parseISO, isValid } from "date-fns";
import { Cancel, Save, CalendarToday } from "@mui/icons-material";

function ModifierPaiement({ open, handleClose, paymentId, onSuccess }) {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({}); // For form input management
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // or 'error'

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setLoading(true);
      setError(null);
      setPaymentData(null); // Reset paymentData on new fetch
      try {
        const response = await axios.get(
          `http://localhost:7001/paiement/${paymentId}`
        );
        setPaymentData(response.data);
        setFormData(response.data?.data || {});
      } catch (err) {
        setError("Erreur lors de la récupération des données de paiement.");
      } finally {
        setLoading(false);
      }
    };

    if (open && paymentId) {
      fetchPaymentDetails();
    } else if (!open) {
      // Reset state when the dialog is closed
      setFormData({});
      setPaymentData(null);
      setError(null);
      setLoading(false); // Ensure loading is false when closed
      setSnackbarOpen(false); // Close any open snackbar
    }
  }, [open, paymentId]);

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
    try {
      const dataToSend = {
        Id_paiement: paymentId,
        Numero_paiement: formData.Numero_paiement || null,
        cin_client: formData.cin_client || null,
        Numero_contrat: formData.Numero_contrat || null,
        date_paiement: formData.date_paiement
          ? format(parseISO(formData.date_paiement), "yyyy-MM-dd")
          : null,

        montant_cheque1:
          formData.montant_cheque1 !== null && !isNaN(formData.montant_cheque1)
            ? parseFloat(formData.montant_cheque1)
            : null,
        banque_cheque1: formData.banque_cheque1 || null,
        echeance_cheque1: formData.echeance_cheque1 || null,
        date_cheque1: formData.date_cheque1
          ? format(parseISO(formData.date_cheque1), "yyyy-MM-dd")
          : null,

        montant_cheque2:
          formData.montant_cheque2 !== null && !isNaN(formData.montant_cheque2)
            ? parseFloat(formData.montant_cheque2)
            : null,
        banque_cheque2: formData.banque_cheque2 || null,
        echeance_cheque2: formData.echeance_cheque2 || null,
        date_cheque2: formData.date_cheque2
          ? format(parseISO(formData.date_cheque2), "yyyy-MM-dd")
          : null,

        montant_espace:
          formData.montant_espace !== null && !isNaN(formData.montant_espace)
            ? parseFloat(formData.montant_espace)
            : null,
        montant_virement:
          formData.montant_virement !== null &&
          !isNaN(formData.montant_virement)
            ? parseFloat(formData.montant_virement)
            : null,
        banque_virement: formData.banque_virement || null,
      };

      await axios.put(
        `http://localhost:7001/paiement/${paymentId}`,
        dataToSend
      );
      setSnackbarMessage("Paiement modifié avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setLoading(false);
      handleClose();
      if (onSuccess) {
        onSuccess(); // Call the onSuccess callback if provided
      }
    } catch (err) {
      if (err.response && err.response.data?.error) {
        setError(JSON.stringify(err.response.data.error, null, 2)); // Affiche dans ton UI si besoin
      } else {
        setError("Erreur inattendue lors de la mise à jour.");
      }
      setSnackbarMessage("Erreur lors de la modification du paiement.");
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

  if (!paymentData || !paymentData.data) {
    return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Information</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Aucune information de paiement disponible.
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
        Modifier Paiement - Numéro: {paymentData.data?.Numero_paiement}
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

          {/* Payment Date */}
          {formData.date_paiement !== null &&
            formData.date_paiement !== undefined && (
              <Grid item xs={12}>
                <TextField
                  label="Date de Paiement "
                  variant="outlined"
                  type="date"
                  name="date_paiement"
                  value={
                    formData.date_paiement &&
                    isValid(parseISO(formData.date_paiement))
                      ? format(parseISO(formData.date_paiement), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

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
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default ModifierPaiement;
