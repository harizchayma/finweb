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
  Card,
  CardContent,
  Divider,
  useTheme, // Import useTheme hook
  CircularProgress, // Import CircularProgress
} from "@mui/material";
import { parseISO, format } from "date-fns";
import { fr } from "date-fns/locale";
import { tokens } from "../../theme";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

// Main functional component
function AfficherAvance({ open, handleClose, avanceId }) {
  const [avanceData, setAvanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme(); // Use the theme
  const colors = tokens(theme.palette.mode); // Get color tokens based on theme mode

  useEffect(() => {
    const fetchAvanceDetails = async () => {
      if (avanceId) {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(
            `http://localhost:7001/avance/${avanceId}`
          );
          const avanceData = response.data.data; // Get advance data

          // Fetch client details using CIN
          const clientResponse = await axios.get(
            `http://localhost:7001/client/cin_client?cin_client=${avanceData.cin_client}`
          );
          const clientData = clientResponse.data.data;

          // Set advance data along with client name
          setAvanceData({
            ...avanceData,
            clientName: clientData
              ? `${clientData.nom_fr} ${clientData.prenom_fr}`
              : "Client Inconnu",
          });
          setLoading(false);
        } catch (error) {
          console.error(
            "Erreur lors du chargement des détails de l'avance:",
            error
          );
          setError("Erreur lors du chargement des détails de l'avance.");
          setLoading(false);
        }
      }
    };
    fetchAvanceDetails();
  }, [avanceId]);

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Chargement des détails de l'avance...</DialogTitle>
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
          <Typography color="error">{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!avanceData) {
    return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Information</DialogTitle>
        <DialogContent>
          <Typography>Aucun détail d'avance à afficher.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const {
    Numero_avance,
    cin_client,
    Numero_contrat,
    date,
    montant_cheque1,
    echeance_cheque1,
    date_cheque1,
    banque_cheque1,
    montant_cheque2,
    echeance_cheque2,
    date_cheque2,
    banque_cheque2,
    montant_espace,
    montant_virement,
    banque_virement,
  } = avanceData;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose(); // Only close on close button click
        }
      }}
      fullWidth
      maxWidth="sm"
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
          color: "#d21919",
          marginBottom: 2,
        }}
      >
        Détails de l'Avance - Numéro: {Numero_avance}
      </DialogTitle>
      <DialogContent sx={{ padding: 2 }}>
        <Card
          variant="outlined"
          sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}
        >
          <CardContent>
            <Grid container spacing={2}>
              {/* Contract Number */}
              <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ConfirmationNumberIcon
                    sx={{ color: "#1976d2", marginRight: 1 }}
                  />{" "}
                  Numéro de Contrat:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body1"
                  sx={{ color: "red", fontWeight: "600" }}
                >
                  {Numero_contrat}
                </Typography>
              </Grid>
              {/* Client Information */}
              <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AccountCircleIcon
                    sx={{ color: "#1976d2", marginRight: 1 }}
                  />{" "}
                   Client:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", color: "#030303" }}
                >
                  {avanceData.clientName}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AccountCircleIcon
                    sx={{ color: "#1976d2", marginRight: 1 }}
                  />{" "}
                  CIN Client:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", color: "#030303" }}
                >
                  {cin_client}
                </Typography>
              </Grid>
              {/* Payment Date - Assuming 'date' from your backend is the payment date */}
              <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CalendarTodayIcon
                    sx={{ color: "#1976d2", marginRight: 1 }}
                  />{" "}
                  Date de Avance:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ color: "#5c5a5a" }}>
                  {date
                    ? format(parseISO(date), "dd MMMM yyyy", { locale: fr })
                    : "N/A"}
                </Typography>
              </Grid>
              {/* Payment Details */}
              {montant_cheque1 != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <MonetizationOnIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Montant Chèque :
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#030303" }}
                    >
                      {montant_cheque1} dt
                    </Typography>
                  </Grid>
                </>
              )}
              {echeance_cheque1 != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CalendarTodayIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Numéro de Chèque :
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: "#5c5a5a" }}>
                      {echeance_cheque1}
                    </Typography>
                  </Grid>
                </>
              )}
              {date_cheque1 != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CalendarTodayIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Date Chèque :
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: "#5c5a5a" }}>
                      {date_cheque1
                        ? format(parseISO(date_cheque1), "dd MMMM yyyy", {
                            locale: fr,
                          })
                        : "N/A"}
                    </Typography>
                  </Grid>
                </>
              )}
              {banque_cheque1 != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <AccountBalanceIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Banque Chèque :
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: "#5c5a5a" }}>
                      {banque_cheque1}
                    </Typography>
                  </Grid>
                </>
              )}
              {/* Second Cheque Details */}
              {montant_cheque2 != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <MonetizationOnIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Montant Chèque 2:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#030303" }}
                    >
                      {montant_cheque2} dt
                    </Typography>
                  </Grid>
                </>
              )}
              {echeance_cheque2 != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CalendarTodayIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Numéro de Chèque 2:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: "#5c5a5a" }}>
                      {echeance_cheque2}
                    </Typography>
                  </Grid>
                </>
              )}
              {date_cheque2 != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CalendarTodayIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Date Chèque 2:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: "#5c5a5a" }}>
                      {date_cheque2
                        ? format(parseISO(date_cheque2), "dd MMMM yyyy", {
                            locale: fr,
                          })
                        : "N/A"}
                    </Typography>
                  </Grid>
                </>
              )}
              {banque_cheque2 != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <AccountBalanceIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Banque Chèque 2:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: "#5c5a5a" }}>
                      {banque_cheque2}
                    </Typography>
                  </Grid>
                </>
              )}
              {/* Cash and Bank Transfer Details */}
              {montant_espace != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <MonetizationOnIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Montant Espèces:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#030303" }}
                    >
                      {montant_espace} dt
                    </Typography>
                  </Grid>
                </>
              )}
              {montant_virement != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <MonetizationOnIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Montant Virement:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#030303" }}
                    >
                      {montant_virement} dt
                    </Typography>
                  </Grid>
                </>
              )}
              {banque_virement != null && (
                <>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <AccountBalanceIcon
                        sx={{ color: "#1976d2", marginRight: 1 }}
                      />{" "}
                      Banque Virement:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: "#5c5a5a" }}>
                      {banque_virement}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="primary"
          sx={{
            bgcolor: "#d32f2f",
            color: "white",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#c62828" },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AfficherAvance;
