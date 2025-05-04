import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    useTheme,
    CircularProgress,
} from '@mui/material';
import { parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { tokens } from '../../theme';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

function AfficherPaiement({ open, handleClose, paymentId }) {
    const [paymentData, setPaymentData] = useState(null);
    const [clientInfo, setClientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            setLoading(true);
            setError(null);
            setPaymentData(null);
            try {
                // Fetch payment details
                const response = await axios.get(`http://localhost:7001/paiement/${paymentId}`);
                setPaymentData(response.data);

                // Fetch client details using CIN
                const clientResponse = await axios.get(
                    `http://localhost:7001/client/cin_client?cin_client=${response.data.data.cin_client}`
                );
                const clientData = clientResponse.data.data;

                // Set client information
                setClientInfo({
                    nom: clientData.nom_fr,
                    prenom: clientData.prenom_fr,
                });
            } catch (err) {
                setError('Erreur lors de la récupération des données de paiement.');
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (open && paymentId) {
            fetchPaymentDetails();
        }
    }, [open, paymentId]);

    if (loading) {
        return (
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Chargement des détails du paiement...</DialogTitle>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
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
                    <Button onClick={handleClose} variant="outlined">Fermer</Button>
                </DialogActions>
            </Dialog>
        );
    }

    if (!paymentData || !paymentData.data) {
        return (
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Information</DialogTitle>
                <DialogContent>
                    <Typography>Aucun détail de paiement à afficher.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined">Fermer</Button>
                </DialogActions>
            </Dialog>
        );
    }

    const {
        Numero_paiement,
        cin_client,
        Numero_contrat,
        date_paiement,
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
    } = paymentData.data;

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    handleClose();
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
                Détails du Paiement - Numéro: {Numero_paiement}
            </DialogTitle>
            <DialogContent sx={{ padding: 2 }}>
                <Card variant="outlined" sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            {/* Contract Number */}
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                    <ConfirmationNumberIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Numéro de Contrat:
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" sx={{ color: "red", fontWeight: '600' }}>
                                    {Numero_contrat}
                                </Typography>
                            </Grid>
                            {/* Client Information */}
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                    <AccountCircleIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Client:
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#030303' }}>
                                    {clientInfo ? `${clientInfo.nom} ${clientInfo.prenom}` : "Client Inconnu"}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                    <AccountCircleIcon sx={{ color: "#1976d2", marginRight: 1 }} /> CIN Client:
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#030303' }}>
                                    {cin_client}
                                </Typography>
                            </Grid>
                            {/* Payment Date */}
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                    <CalendarTodayIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Date de Paiement:
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
                                    {date_paiement ? format(parseISO(date_paiement), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}
                                </Typography>
                            </Grid>
                            {/* Payment Details - Cheque 1 */}
                            {montant_cheque1 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <MonetizationOnIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Montant Chèque :
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#030303' }}>
                                            {montant_cheque1} dt
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {echeance_cheque1 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <CalendarTodayIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Numéro de Chèque :
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
                                            {echeance_cheque1}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {date_cheque1 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <CalendarTodayIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Date Chèque :
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#030303' }}>
                                            {montant_cheque1} dt
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {echeance_cheque1 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <CalendarTodayIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Numéro de Chèque :
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
                                            {echeance_cheque1}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {date_cheque1 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <CalendarTodayIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Date Chèque :
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
                                            {date_cheque1}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {banque_cheque1 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <AccountBalanceIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Banque Chèque :
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
                                            {banque_cheque1}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {/* Payment Details - Cheque 2 */}
                            {montant_cheque2 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <MonetizationOnIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Montant Chèque 2:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#030303' }}>
                                            {montant_cheque2} dt
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {echeance_cheque2 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <CalendarTodayIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Numéro de Chèque 2:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
                                            {echeance_cheque2}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {date_cheque2 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <CalendarTodayIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Date Chèque 2:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
                                            {date_cheque2}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {banque_cheque2 != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <AccountBalanceIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Banque Chèque 2:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
                                            {banque_cheque2}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {/* Cash Payment Details */}
                            {montant_espace != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <MonetizationOnIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Montant Espèces:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#030303' }}>
                                            {montant_espace} dt
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {/* Bank Transfer Details */}
                            {montant_virement != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <MonetizationOnIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Montant Virement:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#030303' }}>
                                            {montant_virement} dt
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                            {banque_virement != null && (
                                <>
                                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                            <AccountBalanceIcon sx={{ color: "#1976d2", marginRight: 1 }} /> Banque Virement:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ color: '#5c5a5a' }}>
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
                    variant="contained"
                    sx={{ bgcolor: "#d32f2f", color: "white", fontWeight: "bold", '&:hover': { bgcolor: "#c62828" } }}
                >
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AfficherPaiement;