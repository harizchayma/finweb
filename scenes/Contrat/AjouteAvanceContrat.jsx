import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import DateIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import AjouteCheque from "../Avance/AjouteCheque"; 
import AjouteCheque2 from "../Avance/AjouteCheque2"; 
import AjouteCash from "../Avance/AjouteCash"; 
import AjouteEspace from "../Avance/AjouteEspace"; 

function AjouteAvanceContrat({
  open,
  handleClose,
  defaultContractNumber,
  defaultCinClient,
  newAdvance, 
  setNewAdvance,
  setData,
}) {
  const [avance, setAvance] = useState({
    cin_client: defaultCinClient || "",
    date: "",
    Numero_contrat: defaultContractNumber || "",
    Numero_avance: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  const fetchLastNumeroAvance = async () => {
    try {
      const response = await axios.get("http://localhost:7001/avance/last");
      return response.data;
    } catch (error) {
      console.error("Error fetching last advance number:", error);
      return null;
    }
  };

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true);
    try {
      const advanceToAdd = {
        cin_client: avance.cin_client, // Ensure this is exactly 8 characters
        date: avance.date, // Must be in ISO format
        Numero_contrat: avance.Numero_contrat,
        Numero_avance: avance.Numero_avance,
        montant_cheque1: newAdvance.montant_cheque1 || null, // Send null if not defined
        banque_cheque1: newAdvance.banque_cheque1 || null,
        echeance_cheque1: newAdvance.echeance_cheque1 || null,
        date_cheque1: newAdvance.date_cheque1 || null,
        montant_cheque2: newAdvance.montant_cheque2 || null, // Send null if not defined
        banque_cheque2: newAdvance.banque_cheque2 || null,
        echeance_cheque2: newAdvance.echeance_cheque2 || null,
        date_cheque2: newAdvance.date_cheque2 || null,
        montant_espace: newAdvance.montant_espace || null,
        montant_virement: newAdvance.montant_virement || null,
        banque_virement: newAdvance.banque_virement || null,
      };
  
      console.log("Payload to be sent:", advanceToAdd); // Log the payload for debugging
  
      const response = await axios.post("http://localhost:7001/avance", advanceToAdd);
      if (response.data && response.data.data) {
        // Handle success
        setData((prevData) => [...prevData, { ...response.data.data, id: response.data.data.id_avance }]);
        setSuccessMessage("Avance ajoutée avec succès !");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleClose();
        setNewAdvance({});
      } else {
        throw new Error(response.data?.message || "Erreur lors de l'ajout de l'avance.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avance:", error);
      setErrorMessage(error.response?.data?.message || "Erreur lors de l'ajout de l'avance.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [avance, newAdvance, handleClose, setData, setNewAdvance]);
  useEffect(() => {
    const initializeAvance = async () => {
      const lastNumeroAvance = await fetchLastNumeroAvance();
      if (lastNumeroAvance) {
        const lastNumber = parseInt(lastNumeroAvance.slice(1), 10);
        const nextNumber = lastNumber + 1;
        const newNumeroAvance = `V${nextNumber.toString().padStart(4, "0")}`;
        setAvance((prev) => ({
          ...prev,
          Numero_avance: newNumeroAvance,
        }));
      } else {
        setAvance((prev) => ({
          ...prev,
          Numero_avance: "V0001",
        }));
      }
    };

    if (open) {
      initializeAvance();
    }
  }, [open]);

  const handleChangeDate = (event) => {
    setAvance((prev) => ({ ...prev, date: event.target.value }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const [openChequeDialog, setOpenChequeDialog] = useState(false);
  const [chequeDetails, setChequeDetails] = useState({});
  const [openCheque2Dialog, setOpenCheque2Dialog] = useState(false); // State for the second cheque dialog
  const [cheque2Details, setCheque2Details] = useState({});
  const [openVirementDialog, setOpenVirementDialog] = useState(false); // State for the virement dialog
  const [virementDetails, setVirementDetails] = useState({});
  const [openEspaceDialog, setOpenEspaceDialog] = useState(false); // State for the espace dialog
  const [espaceDetails, setEspaceDetails] = useState({});

  const handleOpenVirementDialog = () => {
    setVirementDetails({});
    setOpenVirementDialog(true);
  };
  const handleOpenChequeDialog = () => {
    setOpenChequeDialog(true);
  };

  const handleCloseChequeDialog = () => {
    setOpenChequeDialog(false);
  };

  const handleAddChequePayment = (chequeData) => {
    console.log("Cheque Data:", chequeData);
    setNewAdvance((prev) => ({ ...prev, ...chequeData }));
    handleCloseChequeDialog();
  };

  const handleOpenCheque2Dialog = () => {
    setOpenCheque2Dialog(true);
  };

  const handleCloseCheque2Dialog = () => {
    setOpenCheque2Dialog(false);
  };

  const handleAddCheque2Payment = (cheque2Data) => {
    console.log("Cheque 2 Data:", cheque2Data);
    setNewAdvance((prev) => ({ ...prev, ...cheque2Data }));
    handleCloseCheque2Dialog();
  };

  const handleCloseVirementDialog = () => {
    setOpenVirementDialog(false);
  };

  const handleAddVirementPayment = (virementData) => {
    console.log("Virement Data:", virementData);
    setNewAdvance((prev) => ({ ...prev, ...virementData }));
    handleCloseVirementDialog();
  };

  const handleOpenEspaceDialog = () => {
    setEspaceDetails({});
    setOpenEspaceDialog(true);
  };

  const handleCloseEspaceDialog = () => {
    setOpenEspaceDialog(false);
  };

  const handleAddEspecePayment = (espaceData) => {
    console.log("Espèce Data:", espaceData);
    setNewAdvance((prev) => ({ ...prev, ...espaceData }));
    handleCloseEspaceDialog();
  };

  const handleAddEspece = () => {
    handleOpenEspaceDialog();
  };

  const handleAddCheque2 = () => {
    handleOpenCheque2Dialog();
  };

  const handleAddVirement = () => {
    handleOpenVirementDialog();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            padding: "10px",
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
            marginBottom: 1,
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Ajouter une Avance - {avance.Numero_avance}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" sx={{ mb: 2, color: "#1976d2" }}>
              Numéro de Contrat
            </Typography>
            <Typography sx={{ mb: 2 }}>{avance.Numero_contrat}</Typography>

            <Typography variant="h5" sx={{ mb: 2, color: "#1976d2" }}>
              CIN Client
            </Typography>
            <TextField
              value={avance.cin_client}
              onChange={(e) =>
                setAvance((prev) => ({ ...prev, cin_client: e.target.value }))
              }
              required
              placeholder="Entrez le CIN"
              sx={{
                mb: 2,
                width: "250px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#1976d2" },
                  "&:hover fieldset": { borderColor: "#115293" },
                  "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                },
              }}
            />

            <Typography variant="h5" sx={{ color: "#1976d2" }}>
              Date
            </Typography>
            <TextField
              type="date"
              value={avance.date}
              onChange={handleChangeDate}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                width: "250px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#1976d2" },
                  "&:hover fieldset": { borderColor: "#115293" },
                  "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                },
              }}
            />

            <Button
              onClick={handleOpenChequeDialog}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                color: "#4caf50",
                textAlign: "center",
                marginTop: 2,
                marginLeft: 0,
                marginRight: 2,
              }}
              startIcon={<AddIcon />}
            >
              Ajouter Chèque
            </Button>
            <Button
              onClick={handleOpenEspaceDialog}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                color: "#4caf50",
                textAlign: "center",
                marginTop: 2,
                marginLeft: 0,
                marginRight: 2,
              }}
              startIcon={<AddIcon />}
            >
              Ajouter Espèce
            </Button>
            <Button
              onClick={handleAddCheque2}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                color: "#4caf50",
                textAlign: "center",
                marginTop: 2,
                marginLeft: 0,
                marginRight: 2,
              }}
              startIcon={<AddIcon />}
            >
              Ajouter Chèque 2
            </Button>
            <Button
              onClick={handleAddVirement}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                color: "#4caf50",
                textAlign: "center",
                marginTop: 2,
                marginLeft: 0,
                marginRight: 2,
              }}
              startIcon={<AddIcon />}
            >
              Ajouter Virement
            </Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            type="submit" // Use type="submit" here
            onClick={handleSubmit} // Calls handleSubmit on click
            color="primary"
            disabled={loading}
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#1565c0" },
            }}
            startIcon={<AddIcon />}
          >
            {loading ? "Ajout en cours..." : "Ajouter"}
          </Button>
          <Button
            onClick={handleClose}
            color="primary"
            disabled={loading}
            startIcon={<CancelIcon />}
            sx={{
              bgcolor: "#d32f2f",
              color: "white",
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#b71c1c" },
            }}
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {errorMessage || successMessage}
        </Alert>
      </Snackbar>

      {/* Include implementations for other dialog components */}
      <AjouteCheque
        open={openChequeDialog}
        handleClose={handleCloseChequeDialog}
        onSubmitCheque={handleAddChequePayment}
      />
      <AjouteCheque2
        open={openCheque2Dialog}
        handleClose={handleCloseCheque2Dialog}
        onSubmitCheque={handleAddCheque2Payment}
      />
      <AjouteCash
        open={openVirementDialog}
        handleClose={handleCloseVirementDialog}
        paymentDetails={virementDetails}
        onSubmitPayment={handleAddVirementPayment}
      />
      <AjouteEspace
        open={openEspaceDialog}
        handleClose={handleCloseEspaceDialog}
        onSubmitPayment={handleAddEspecePayment}
      />
    </>
  );
}

export default AjouteAvanceContrat;