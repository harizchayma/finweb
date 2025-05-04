import React, { useState, useEffect } from "react";
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
import AjouteCheque from '../Avance/AjouteCheque';
import AjouteCheque2 from '../Avance/AjouteCheque2';
import AjouteCash from "../Avance/AjouteCash";
import AjouteEspace from "../Avance/AjouteEspace";

function AvanceContratIcon({
    open,
    handleClose,
    defaultContractNumber,
    cinClient,
}) {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [avance, setAvance] = useState({
        Numero_contrat: "",
        Numero_avance: "",
        cin_client: cinClient || "",
        date: new Date().toISOString().split("T")[0],
    });

    // Add this useState hook to manage payment details
    const [detailAvance, setDetailAvance] = useState({});

    const [openChequeDialog, setOpenChequeDialog] = useState(false);
    const [chequeDetails, setChequeDetails] = useState({});
    const [openCheque2Dialog, setOpenCheque2Dialog] = useState(false);
    const [cheque2Details, setCheque2Details] = useState({});
    const [openVirementDialog, setOpenVirementDialog] = useState(false);
    const [virementDetails, setVirementDetails] = useState({});
    const [openEspaceDialog, setOpenEspaceDialog] = useState(false);
    const [espaceDetails, setEspaceDetails] = useState({});

    useEffect(() => {
        setAvance((prev) => ({ ...prev, cin_client: cinClient || "" }));
    }, [cinClient]);

    useEffect(() => {
        const initializeAvance = async () => {
            const lastNumeroAvance = await fetchLastNumeroAvance();
            const nextNumero = lastNumeroAvance ? `V${(parseInt(lastNumeroAvance.slice(1)) + 1).toString().padStart(4, "0")}` : "V0001";
            setAvance(prev => ({ ...prev, Numero_avance: nextNumero }));
            setDetailAvance(prev => ({ ...prev, Numero_avance: nextNumero })); // Initialize Numero_avance in detailAvance as well
        };

        if (open) {
            initializeAvance();
        }
    }, [open]);

    const fetchLastNumeroAvance = async () => {
        try {
            const response = await axios.get("http://localhost:7001/avance/last");
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération du dernier numéro d'avance:", error);
            return null;
        }
    };

    const handleOpenChequeDialog = () => setOpenChequeDialog(true);
    const handleCloseChequeDialog = () => setOpenChequeDialog(false);
    const handleAddChequePayment = (chequeData) => {
        setDetailAvance(prev => ({ ...prev, ...chequeData }));
        handleCloseChequeDialog();
    };

    const handleOpenCheque2Dialog = () => setOpenCheque2Dialog(true);
    const handleCloseCheque2Dialog = () => setOpenCheque2Dialog(false);
    const handleAddCheque2Payment = (cheque2Data) => {
        setDetailAvance(prev => ({ ...prev, ...cheque2Data }));
        handleCloseCheque2Dialog();
    };

    const handleOpenVirementDialog = () => {
        setVirementDetails({});
        setOpenVirementDialog(true);
    };
    const handleCloseVirementDialog = () => setOpenVirementDialog(false);
    const handleAddVirementPayment = (virementData) => {
        setDetailAvance(prev => ({ ...prev, ...virementData }));
        handleCloseVirementDialog();
    };

    const handleOpenEspaceDialog = () => {
        setEspaceDetails({});
        setOpenEspaceDialog(true);
    };
    const handleCloseEspaceDialog = () => setOpenEspaceDialog(false);
    const handleAddEspecePayment = (espaceData) => {
        setDetailAvance(prev => ({ ...prev, ...espaceData }));
        handleCloseEspaceDialog();
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleChangeDate = (e) => setAvance((prev) => ({ ...prev, date: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!cinClient) {
            setSnackbarMessage("Le CIN du client ne peut pas être vide.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            setLoading(false);
            return;
        }

        const cinRegex = /^[A-Z0-9]+$/;
        if (!cinRegex.test(avance.cin_client)) {
            setSnackbarMessage("Le CIN du client est invalide.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            setLoading(false);
            return;
        }

        try {
            const avanceData = {
                ...avance,
                Numero_contrat: defaultContractNumber,
                ...detailAvance, // Include payment details here
            };
            const response = await axios.post("http://localhost:7001/avance", avanceData);

            if (response.status >= 200 && response.status < 300) {
                setSuccessMessage("Avance ajoutée avec succès!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
                // You might want to handle detail avance in a different flow
                handleClose();
            } else {
                throw new Error(response.data?.message || "Erreur lors de l'ajout de l'avance.");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Erreur lors de l'ajout de l'avance.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
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
                        <Typography sx={{ mb: 2 }}>{defaultContractNumber}</Typography>

                        <Typography variant="h5" sx={{ mb: 2, color: "#1976d2" }}>
                            CIN Client
                        </Typography>
                        <TextField
                            label="CIN Client"
                            value={avance.cin_client}
                            onChange={(e) => setAvance((prev) => ({ ...prev, cin_client: e.target.value }))}
                            required
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
                            label="Date"
                            type="date"
                            value={avance.date}
                            onChange={handleChangeDate}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DateIcon sx={{ color: "#1976d2" }} />
                                    </InputAdornment>
                                ),
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
                                marginRight: 1,
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
                                marginRight: 1,
                            }}
                            startIcon={<AddIcon />}
                        >
                            Ajouter Espèce
                        </Button>
                        <Button
                            onClick={handleOpenCheque2Dialog}
                            color="primary"
                            variant="outlined"
                            sx={{
                                fontWeight: "bold",
                                color: "#4caf50",
                                textAlign: "center",
                                marginTop: 2,
                                marginRight: 1,
                            }}
                            startIcon={<AddIcon />}
                        >
                            Ajouter Chèque 2
                        </Button>
                        <Button
                            onClick={handleOpenVirementDialog}
                            color="primary"
                            variant="outlined"
                            sx={{
                                fontWeight: "bold",
                                color: "#4caf50",
                                textAlign: "center",
                                marginTop: 2,
                            }}
                            startIcon={<AddIcon />}
                        >
                            Ajouter Virement
                        </Button>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        color="primary"
                        sx={{
                            bgcolor: "#1976d2",
                            color: "white",
                            px: 3,
                            py: 1,
                            "&:hover": { bgcolor: "#1565c0" },
                        }}
                        startIcon={<AddIcon />}
                    >
                        Ajouter
                    </Button>
                    <Button
                        onClick={handleClose}
                        color="primary"
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

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {errorMessage || successMessage || snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}

export default AvanceContratIcon;