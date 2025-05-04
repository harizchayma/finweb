import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
  Paper,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";
import ClientSearchBar from "../Client/ClientSearchBar";
import SearchIcon from "@mui/icons-material/Search";
import { FcPlus } from "react-icons/fc";
import PaymentCheque from "./PaymentCheque";
import PaymentCheque2 from "./PaymentCheque2";
import PaymentCash from "./PaymentCash";
import PaymentEspace from "./PayementEspace";

const AjoutePaiement = ({ open, handleClose, handleAddPaiement }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [contratsClient, setContratsClient] = useState([]);
  const [datePaiement, setDatePaiement] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [numeroPaiement, setNumeroPaiement] = useState("");
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [selectedContratNumero, setSelectedContratNumero] = useState(null);
  const [numeroContratPaiement, setNumeroContratPaiement] = useState("");
  const [step, setStep] = useState(1);
  const [avancesForContrat, setAvancesForContrat] = useState([]);
  const [selectedContratDetails, setSelectedContratDetails] = useState(null);
  const [paymentChequeOpen, setPaymentChequeOpen] = useState(false);
  const [paymentCheque2Open, setPaymentCheque2Open] = useState(false);
  const [cheque1Details, setCheque1Details] = useState({});
  const [cheque2Details, setCheque2Details] = useState({});
  const [paymentCashOpen, setPaymentCashOpen] = useState(false);
  const [cashPaymentDetails, setCashPaymentDetails] = useState({});
  const [paymentEspaceOpen, setPaymentEspaceOpen] = useState(false);
  const [espacePaymentDetails, setEspacePaymentDetails] = useState({});
  const [totalContractPrice, setTotalContractPrice] = useState(0);
  const [totalAdvances, setTotalAdvances] = useState(0);
  const [montantRestantInitial, setMontantRestantInitial] = useState(0); // Garder une trace du montant restant initial
  const [montantRestant, setMontantRestant] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [paymentError, setPaymentError] = useState("");
  const [isSoldeUpdated, setIsSoldeUpdated] = useState(false); // Nouveau state pour suivre la mise à jour du solde

  useEffect(() => {
    if (open) {
      resetForm();
      fetchLastNumeroPaiement();
      setIsSoldeUpdated(false); // Réinitialiser le statut de la mise à jour du solde
    }
  }, [open]);

  useEffect(() => {
    const fetchContrats = async () => {
      if (selectedClient?.cin_client) {
        try {
          const response = await axios.get(
            `http://localhost:7001/contrat/cin/${selectedClient.cin_client}`
          );
          console.log("Fetched contracts:", response.data.data); // Log the response
          const contrats = response.data.data || [];
          // Filter out contracts that have been fully paid (solde = true)
          const unpaidContrats = contrats.filter(
            (contrat) => contrat.solde !== true
          );
          console.log("Unpaid contracts:", unpaidContrats); // Log unpaid contracts
          setContratsClient(unpaidContrats);
          setSelectedContratNumero(null);
          setNumeroContratPaiement("");
          setSelectedContratDetails(null);
        } catch (error) {
          console.error("Error fetching client contracts", error);
          setContratsClient([]);
        }
      } else {
        setContratsClient([]);
      }
    };
    fetchContrats();
  }, [selectedClient]);

  useEffect(() => {
    if (selectedContratDetails) {
      const totalAvances = calculateTotalAdvances();
      const totalDue = Number(selectedContratDetails?.Prix_total) || 0;
      setTotalContractPrice(totalDue);
      setTotalAdvances(totalAvances);
      const initialRestant = totalDue - totalAvances;
      setMontantRestantInitial(initialRestant);
      setMontantRestant(initialRestant);
      setTotalPaid(0); // Réinitialiser le total payé lors de la sélection d'un nouveau contrat
      setPaymentError(""); // Effacer toute erreur précédente
      setIsSoldeUpdated(false); // Réinitialiser lors du changement de contrat

      const timer = setTimeout(() => {
        setMontantRestant(initialRestant);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [selectedContratDetails, avancesForContrat]);

  const fetchLastNumeroPaiement = async () => {
    try {
      const response = await axios.get("http://localhost:7001/paiement/last");
      const lastNumero = response.data;

      if (typeof lastNumero === "string" && lastNumero.startsWith("P")) {
        const numericPart = parseInt(lastNumero.slice(1), 10);
        if (!isNaN(numericPart)) {
          const nextNumber = numericPart + 1;
          setNumeroPaiement(`P${nextNumber.toString().padStart(4, "0")}`);
        } else {
          setNumeroPaiement("P0001");
        }
      } else {
        setNumeroPaiement("P0001");
      }
    } catch (error) {
      console.error("Error fetching last payment number", error);
      setNumeroPaiement("P0001");
    }
  };

  const calculateTotalAdvances = () => {
    return avancesForContrat.reduce((total, avance) => {
      const montant =
        typeof avance.montant_avance === "string"
          ? parseFloat(avance.montant_avance)
          : avance.montant_avance || 0;
      return total + montant;
    }, 0);
  };

  const resetForm = () => {
    setSelectedClient(null);
    setContratsClient([]);
    setSelectedContratNumero(null);
    setDatePaiement(new Date().toISOString().slice(0, 10));
    setNumeroPaiement("");
    setNumeroContratPaiement("");
    setStep(1);
    setAvancesForContrat([]);
    setCheque1Details({});
    setCheque2Details({});
    setCashPaymentDetails({});
    setEspacePaymentDetails({});
    setMontantRestantInitial(0);
    setMontantRestant(0);
    setTotalContractPrice(0);
    setTotalAdvances(0);
    setTotalPaid(0);
    setPaymentError("");
    setIsSoldeUpdated(false);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setIsClientSearchOpen(false);
    setStep(1);
    setIsSoldeUpdated(false);
  };

  const handleContratSelect = (event, numeroContrat) => {
    if (event.target.checked) {
      setSelectedContratNumero(numeroContrat);
      const contrat = contratsClient.find(
        (c) => c.Numero_contrat === numeroContrat
      );
      if (contrat) {
        setSelectedContratDetails(contrat);
      } else {
        setSelectedContratDetails(null);
      }
      setNumeroContratPaiement(numeroContrat);
      setIsSoldeUpdated(false);
    } else {
      setSelectedContratNumero(null);
      setNumeroContratPaiement("");
      setSelectedContratDetails(null);
      setIsSoldeUpdated(false);
    }
  };

  const handleNextStep = async () => {
    if (selectedContratNumero) {
      try {
        const response = await axios.get(
          `http://localhost:7001/avance/contrat/${selectedContratNumero}`
        );
        setAvancesForContrat(response.data.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des avances:", error);
        setAvancesForContrat([]);
      }
    }
    setStep(2);
    setIsSoldeUpdated(false);
  };

  const handleOpenPaymentEspace = () => {
    if (selectedContratDetails) {
      setPaymentEspaceOpen(true);
    }
  };

  const handleOpenPaymentCheque = () => {
    if (selectedContratDetails) {
      setPaymentChequeOpen(true);
    }
  };

  const handleOpenPaymentCheque2 = () => {
    if (selectedContratDetails) {
      setPaymentCheque2Open(true);
    }
  };

  const handleOpenPaymentCash = () => {
    if (selectedContratDetails) {
      setPaymentCashOpen(true);
    }
  };

  const updateMontantRestant = (montant) => {
    setMontantRestant((prev) => parseFloat((prev - montant).toFixed(3)));
    setTotalPaid((prev) => parseFloat((prev + montant).toFixed(3)));
    setPaymentError(""); // Effacer l'erreur lorsqu'un paiement est ajouté
  };

  const handleSubmitCheque = (chequeData) => {
    const montantCheque = parseFloat(
      chequeData.montant_cheque1 || chequeData.montant_cheque2 || 0
    );

    if (totalPaid + montantCheque > montantRestantInitial) {
      setPaymentError(
        "Le montant total des paiements dépasse le reste à payer !"
      );
      return;
    }

    updateMontantRestant(montantCheque);

    if (!cheque1Details.montant_cheque1 && chequeData.montant_cheque1) {
      setCheque1Details(chequeData);
      setPaymentChequeOpen(false);
    } else if (!cheque2Details.montant_cheque2 && chequeData.montant_cheque2) {
      setCheque2Details(chequeData);
      setPaymentCheque2Open(false);
    }
  };

  const handleSubmitCash = (cashData) => {
    const montantCash = parseFloat(cashData.montant_virement || 0);

    if (totalPaid + montantCash > montantRestantInitial) {
      setPaymentError(
        "Le montant total des paiements dépasse le reste à payer !"
      );
      return;
    }

    updateMontantRestant(montantCash);
    setCashPaymentDetails(cashData);
    setPaymentCashOpen(false); // Fermer le modal de paiement par virement
  };

  const handleSubmitEspace = (espaceData) => {
    const montantEspace = parseFloat(espaceData.montant_espace || 0);

    if (totalPaid + montantEspace > montantRestantInitial) {
      setPaymentError(
        "Le montant total des paiements dépasse le reste à payer !"
      );
      return;
    }

    updateMontantRestant(montantEspace);
    setEspacePaymentDetails(espaceData);
    setPaymentEspaceOpen(false); // Fermer le modal de paiement en espèces
  };

  const handleSubmit = async () => {
    if (!selectedClient || !selectedContratNumero || !datePaiement) {
      console.error("Client, contrat, and payment date must be selected.");
      return;
    }

    // Vérifier si le montant total payé correspond au reste à payer
    const totalPaiementActuel =
      parseFloat(espacePaymentDetails.montant_espace || 0) +
      parseFloat(cashPaymentDetails.montant_virement || 0) +
      parseFloat(cheque1Details.montant_cheque1 || 0) +
      parseFloat(cheque2Details.montant_cheque2 || 0);

    const resteAPayerFinal = parseFloat(montantRestantInitial.toFixed(3));

    if (parseFloat(totalPaiementActuel.toFixed(3)) !== resteAPayerFinal) {
      setPaymentError(
        "Le montant total des paiements doit être égal au reste à payer !"
      );
      return;
    }

    const paiementData = {
      Numero_paiement: numeroPaiement,
      cin_client: selectedClient.cin_client,
      Numero_contrat: selectedContratNumero,
      date_paiement: datePaiement,
      montant_espace: espacePaymentDetails.montant_espace || null, // Utilisez null ou 0 si non défini
      montant_virement: cashPaymentDetails.montant_virement || null,
      banque_virement: cashPaymentDetails.banque_virement || null,
      montant_cheque1: cheque1Details.montant_cheque1 || null,
      banque_cheque1: cheque1Details.banque_cheque1 || null,
      date_cheque1: cheque1Details.date_cheque1 || null,
      echeance_cheque1: cheque1Details.echeance_cheque1 || null,
      montant_cheque2: cheque2Details.montant_cheque2 || null,
      banque_cheque2: cheque2Details.banque_cheque2 || null,
      date_cheque2: cheque2Details.date_cheque2 || null,
      echeance_cheque2: cheque2Details.echeance_cheque2 || null,
    };

    console.log("Data de paiement:", paiementData);

    try {
      const response = await axios.post(
        "http://localhost:7001/paiement",
        paiementData
      );
      console.log("Paiement ajouté avec succès :", response.data);

      // Mettre à jour le solde du contrat
      try {
        await axios.patch(
          `http://localhost:7001/contrat/solde/${selectedContratDetails.ID_contrat}`,
          { solde: true } // Envoyer true pour indiquer que le solde doit être mis à jour à 1
        );
        console.log("Solde du contrat mis à jour avec succès.");
        setIsSoldeUpdated(true); // Marquer le solde comme mis à jour
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour du solde du contrat :",
          error
        );
        // Gérer l'erreur de mise à jour du solde si nécessaire
      }

      handleAddPaiement(response.data.data);
      handleClose();
      resetForm();
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout du paiement :",
        error.response ? error.response.data : error
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose();
        }
      }}
      fullWidth
      maxWidth="md"
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
        {step === 1 ? "Sélectionner le Contrat et la Date" : "Payer le contrat"}
        <Typography
          variant="h5"
          align="center"
          sx={{ marginBottom: 1, color: "#f0112b" }}
        >
          [Numéro de Paiement: {numeroPaiement || "N/A"}]
        </Typography>
        {selectedContratNumero && step === 1 && (
          <Typography
            variant="subtitle2"
            align="center"
            sx={{ marginBottom: 1, color: "#2e7d32" }}
          >
            Contrat Sélectionné: {numeroContratPaiement}
          </Typography>
        )}
        {isSoldeUpdated && step === 2 && (
          <Typography
            variant="subtitle2"
            align="center"
            sx={{ marginBottom: 1, color: "#2e7d32", fontWeight: "bold" }}
          >
            Solde du contrat mis à jour!
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {step === 1 && (
          <>
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

            {contratsClient.map((contrat) =>
              contrat && contrat.Numero_contrat ? (
                <Grid item xs={12} sm={6} md={4} key={contrat.ID_contrat}>
                  <Paper
                    elevation={3}
                    sx={{
                      padding: 2,
                      borderRadius: "40px",
                      transition: "0.3s",
                      "&:hover": { boxShadow: 7 },
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      textAlign: "left",
                      borderColor:
                        selectedContratNumero === contrat.Numero_contrat
                          ? "#4caf50"
                          : "#1976d2",
                      borderWidth: 2,
                      marginBottom: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            selectedContratNumero === contrat.Numero_contrat
                          }
                          onChange={(event) =>
                            handleContratSelect(event, contrat.Numero_contrat)
                          }
                          name={`contrat-${contrat.ID_contrat}`}
                          sx={{
                            color: "#1976d2",
                            "&.Mui-checked": {
                              color: "#1976d2",
                            },
                          }}
                          value={contrat.Numero_contrat}
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#f0112b",
                              fontWeight: "bold",
                              marginBottom: 1,
                            }}
                          >
                            Numéro de contrat: {contrat.Numero_contrat}
                          </Typography>
                          <Typography variant="body1" sx={{ marginBottom: 1 }}>
                            Prix: {parseFloat(contrat.Prix_total).toFixed(3)} dt
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </Grid>
              ) : null
            )}

            <TextField
              margin="dense"
              label="Date de Paiement"
              type="date"
              fullWidth
              value={datePaiement}
              onChange={(e) => setDatePaiement(e.target.value)}
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: "#1976d2",
                },
              }}
              InputProps={{
                sx: {
                  borderRadius: "20px",
                  borderColor: "#ddd",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ddd",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
              }}
              sx={{ mt: 2 }}
            />
          </>
        )}

        {step === 2 && (
          <Box
            mt={2}
            sx={{
              padding: 2,
              borderRadius: "10px",
              backgroundColor: "#f5f5f5",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {selectedContratDetails &&
              selectedContratDetails.Prix_total != null && (
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    color: "#1976d2",
                    marginBottom: 1,
                    textAlign: "center",
                  }}
                >
                  Prix Total du Contrat: {totalContractPrice.toFixed(3)} dt
                </Typography>
              )}

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", marginBottom: 1 }}
            >
              Avances pour le Contrat {selectedContratNumero} :
            </Typography>

            {avancesForContrat.length > 0 ? (
              <Grid container spacing={2}>
                {avancesForContrat.map((avance) => (
                  <Grid item xs={12} sm={6} md={4} key={avance.id_avance}>
                    <Paper
                      sx={{
                        padding: 2,
                        marginBottom: 1,
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        },
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          color: "#e61f33",
                          textAlign: "center",
                        }}
                      >
                        Numéro d'Avance: {avance.Numero_avance}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#555" }}>
                        Date: {avance.date}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: "#020202",
                        }}
                        key={`montant-${avance.id_avance}`}
                      >
                        Montant: {parseFloat(avance.montant_avance).toFixed(3)}{" "}
                        dt
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Aucune avance trouvée pour ce contrat.
              </Typography>
            )}

            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#2196f3",
                marginTop: 2,
              }}
            >
              Montant Total des Avances: {totalAdvances.toFixed(3)} dt
            </Typography>
            {paymentError && (
              <Typography color="error" mt={2}>
                {paymentError}
              </Typography>
            )}
            {selectedContratDetails && (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#e61f3a",
                  textAlign: "center",
                  marginTop: 3,
                }}
              >
                Reste à Payer:{" "}
                {montantRestant > 0 ? montantRestant.toFixed(3) : "0.000"} dt
              </Typography>
            )}
            <Box mt={2} display="flex" justifyContent="space-around">
              <Button
                endIcon={<FcPlus />}
                variant="outlined"
                color="primary"
                onClick={handleOpenPaymentEspace}
                sx={{
                  color: "#4caf50",
                  textAlign: "center",
                  marginTop: 0,
                  marginLeft: 2,
                }}
              >
                Payer en Espèces
              </Button>
              <Button
                endIcon={<FcPlus />}
                variant="outlined"
                color="primary"
                onClick={handleOpenPaymentCheque}
                sx={{
                  color: "#4caf50",
                  textAlign: "center",
                  marginTop: 0,
                  marginLeft: 2,
                }}
              >
                Payer par 1er Chèque
              </Button>
              <Box display="flex">
                <Button
                  endIcon={<FcPlus />}
                  variant="outlined"
                  color="primary"
                  onClick={handleOpenPaymentCheque2}
                  sx={{
                    color: "#4caf50",
                    textAlign: "center",
                    marginTop: 0,
                    marginLeft: 2,
                  }}
                >
                  Payer par 2ème Chèque
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<FcPlus />}
                  sx={{
                    color: "#4caf50",
                    textAlign: "center",
                    marginTop: 0,
                    marginLeft: 2,
                  }}
                  onClick={handleOpenPaymentCash}
                >
                  Payer Virement
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: "20px", borderColor: "#ddd", color: "#1976d2" }}
        >
          Annuler
        </Button>
        {step === 1 && (
          <Button
            onClick={handleNextStep}
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#155a8a" },
              borderRadius: "20px",
              fontWeight: "bold",
            }}
            disabled={
              !selectedClient || !selectedContratNumero || !datePaiement
            }
          >
            Suivant
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#155a8a" },
              borderRadius: "20px",
              fontWeight: "bold",
            }}
            disabled={
              !selectedClient || !selectedContratNumero || !datePaiement
            }
          >
            Valider
          </Button>
        )}
      </DialogActions>

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

      <PaymentCheque
        open={paymentChequeOpen}
        handleClose={() => setPaymentChequeOpen(false)}
        paymentDetails={{ amount: montantRestant }}
        onSubmitCheque={handleSubmitCheque}
      />

      <PaymentCheque2
        open={paymentCheque2Open}
        handleClose={() => setPaymentCheque2Open(false)}
        paymentDetails={{ amount: montantRestant }}
        onSubmitCheque={handleSubmitCheque}
      />

      <PaymentCash
        open={paymentCashOpen}
        handleClose={() => setPaymentCashOpen(false)}
        paymentDetails={{ amount: montantRestant }}
        onSubmitPayment={handleSubmitCash}
      />

      <PaymentEspace
        open={paymentEspaceOpen}
        handleClose={() => setPaymentEspaceOpen(false)}
        paymentDetails={{ amount: montantRestant }}
        onSubmitPayment={handleSubmitEspace}
      />
    </Dialog>
  );
};

export default AjoutePaiement;
