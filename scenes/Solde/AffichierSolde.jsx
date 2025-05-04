import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
} from "@mui/material";
import axios from "axios";
import { FcPrint } from "react-icons/fc";
import { styled } from '@mui/material/styles';

const AffichierSolde = ({ client, contrats, onClose }) => {
    const [contratDetails, setContratDetails] = useState([]);
    const tableRef = useRef(null);

    useEffect(() => {
        const fetchContratDetails = async () => {
            try {
                const avancesResponse = await axios.get("http://localhost:7001/avance");
                const avances = avancesResponse.data.data;

                const paiementsResponse = await axios.get(
                    "http://localhost:7001/paiement"
                );
                const paiements = paiementsResponse.data.data;

                const details = contrats.map((contrat) => {
                    const contratAvances = avances.filter(
                        (avance) => avance.Numero_contrat === contrat.Numero_contrat
                    );
                    const contratPaiements = paiements.filter(
                        (paiement) => paiement.Numero_contrat === contrat.Numero_contrat
                    );

                    const totalAvance = contratAvances.reduce(
                        (sum, avance) => sum + parseFloat(avance.montant_avance || 0),
                        0
                    );

                    const totalPaiement = contratPaiements.reduce(
                        (sum, paiement) => sum + parseFloat(paiement.montant_paiement || 0),
                        0
                    );

                    const totalCredit = totalAvance + totalPaiement;
                    const solde = parseFloat(contrat.Prix_total) - totalCredit;

                    return {
                        ...contrat,
                        totalCredit: totalCredit.toFixed(3),
                        solde: solde.toFixed(3),
                    };
                });

                setContratDetails(details);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des détails du contrat:",
                    error
                );
            }
        };

        fetchContratDetails();
    }, [contrats]);

    const handlePrintTableWithTitle = () => {
        const printWindow = window.open("_blank");
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <style type="text/css">
              @media print {
                body * {
                  visibility: hidden;
                }
                .print-section, .print-section * {
                  visibility: visible;
                }
                .print-section {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%; /* Ensure full width for the printed section */
                  box-sizing: border-box; /* Include padding and border in element's total width and height */
                }
                .print-title {
                  text-align: center;
                  margin-bottom: 20px;
                  color: #1E2A78;
                  font-weight: bold;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #e0e0e0;
                  font-weight: bold;
                }
                .solde-positif {
                  color: red;
                  font-weight: bold;
                }
                .solde-negatif {
                  color: green;
                  font-weight: bold;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-section">
              <h3 class="print-title">Détails du Solde : ${client.nom}</h3>
              ${tableRef.current?.outerHTML}
            </div>
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const PrintButton = styled(FcPrint)(({ theme }) => ({
        cursor: 'pointer',
        fontSize: '2.5em', // Increase size
        transition: 'transform 0.3s',
        '&:hover': {
            transform: 'scale(1.1)', // Slight scale on hover for better UX
        },
        // Use theme to access colors if available
        color: '#000', // Default color.  You can use theme.palette.primary.main if you have it defined.
    }));

    return (
        <Box
            sx={{
                padding: "20px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0 }}>
                <PrintButton onClick={handlePrintTableWithTitle} />
            </Box>

            <Typography
                variant="h3"
                sx={{
                    textAlign: "center",
                    marginBottom: "30px",
                    color: "#1E2A78",
                    fontWeight: "bold",
                }}
            >
                Détails du Solde : {client.nom}
            </Typography>
            <TableContainer component={Paper} ref={tableRef}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                            <TableCell sx={{ fontWeight: "bold" }}>
                                Numéro de contrat
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Total Débit</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Total Crédit</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Solde</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contratDetails.map((contrat) => (
                            <TableRow key={contrat.id_contrat}>
                                <TableCell sx={{ color: "#1E2A78", fontWeight: "bold" }}>{contrat.Numero_contrat}</TableCell>
                                <TableCell>{contrat.Prix_total}</TableCell>
                                <TableCell>{contrat.totalCredit}</TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        color: parseFloat(contrat.solde) > 0 ? "red" : "green",
                                    }}
                                >
                                    {contrat.solde}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>

                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        color: "#fff",
                        backgroundColor: "#d21919",
                        "&:hover": { bgcolor: "#a61a1a" },
                        transition: "background-color 0.3s ease",
                    }}
                >
                    Fermer
                </Button>
            </Box>
        </Box>
    );
};

export default AffichierSolde;
