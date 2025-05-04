import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  useTheme,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { tokens } from "../../theme";
import { Header } from "../../components";
import { useAuth } from "../context/AuthContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import GridToolbarCustom from "../../components/GridToolbarCustom";
import { frFR } from "@mui/x-data-grid";
import AfficherReservation from "./AfficherReservation";
import AjouteContratReseve from "./AjouteContratReseve";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ColorModeContext } from "../../theme";
import AjouteReservation from "./AjouteReservation";

const Reservations = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { role, userId } = useAuth();
  const colorMode = useContext(ColorModeContext);
  const customColors =
    role === "Admin"
      ? { background: "#3c90f0", hover: "#2a3eb1", tableHeader: "#6da5ee" }
      : { background: "#a0d3e8", hover: "#7ab8d9", tableHeader: "#bcccdf" };
  const [reservations, setReservations] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [ajouteContratOpen, setAjouteContratOpen] = useState(false);
  const [ajouteReservationOpen, setAjouteReservationOpen] = useState(false);
  const [chartData, setChartData] = useState({
    totalChartData: [],
    enAttenteChartData: [],
    accepteChartData: [],
    rejeteChartData: [],
  });
  const [loadingChart, setLoadingChart] = useState(true);
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [reservationToAccept, setReservationToAccept] = useState(null);

  // State to hold the initial active step for AjouteContratReseve
  const [initialContractStep, setInitialContractStep] = useState(3); // Default to step 3 (Vehicle Info)

  useEffect(() => {
    fetchReservationsWithUserDetailsAndPrepareChartData();
  }, []);

  const fetchReservationsWithUserDetailsAndPrepareChartData = async () => {
    setLoadingChart(true);
    try {
      const response = await axios.get("http://localhost:7001/reservation");
      const reservationsData = response.data.data || [];
      const currentDate = new Date();

      for (const reservation of reservationsData) {
        // Récupérer le nom du client
        try {
          const clientResponse = await axios.get(
            `http://localhost:7001/client/cin_client?cin_client=${reservation.cin_client}`
          );
          const clientData = clientResponse.data.data;
          reservation.clientName = clientData
            ? `${clientData.nom_fr} ${clientData.prenom_fr}`
            : "Unknown Client";
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des informations du client:",
            error
          );
          reservation.clientName = "Client Inconnu";
        }

        // Récupérer le nom de l'utilisateur responsable
        if (reservation.login_id) {
          try {
            const userResponse = await axios.get(
              `http://localhost:7001/users/${reservation.login_id}`
            );
            const userData = userResponse.data.data;
            reservation.userName = userData
              ? `${userData.nom} ${userData.prenom}`
              : "Utilisateur inconnu";
          } catch (error) {
            console.error(
              "Erreur lors de la récupération des informations de l'utilisateur:",
              error
            );
            reservation.userName = "Utilisateur inconnu";
          }
        } else {
          if (reservation.action === "rejecte") {
            reservation.userName = "Système";
          } else {
            reservation.userName = ""; // Ou une autre valeur par défaut si nécessaire
          }
        }

        // Vérifier et rejeter les réservations expirées
        const startDate = new Date(reservation.Date_debut);
        if (reservation.action === "en attent" && startDate < currentDate) {
          await handleReject(reservation);
        }
      }

      const sortedReservations = [...reservationsData].sort((a, b) => {
        if (a.action === "en attent" && b.action !== "en attent") {
          return -1;
        }
        if (a.action !== "en attent" && b.action === "en attent") {
          return 1;
        }
        return 0;
      });

      setReservations(sortedReservations);
      prepareChartData(sortedReservations, colors); // Passer les données triées
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setSnackbarMessage("Error fetching reservations.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingChart(false);
    }
  };

  const prepareChartData = (data) => {
    const totalReservations = data.length;
    const enAttente = data.filter((r) => r.action === "en attent").length;
    const accepte = data.filter((r) => r.action === "accepte").length;
    const rejete = data.filter((r) => r.action === "rejecte").length;

    // Prepare chart data where each chart has one segment only
    setChartData({
      totalChartData: [
        { name: "Tous", value: totalReservations, color: "#3c90f0" },
        { name: "Autres", value: 0, color: "#ccc" },
      ],
      enAttenteChartData: [
        { name: "En Attente", value: enAttente, color: "#ff9800" },
        { name: "Autres", value: totalReservations - enAttente, color: "#ccc" },
      ],
      accepteChartData: [
        { name: "Acceptée", value: accepte, color: "#4caf50" },
        { name: "Autres", value: totalReservations - accepte, color: "#ccc" },
      ],
      rejeteChartData: [
        { name: "Rejetée", value: rejete, color: "#f44336" },
        { name: "Autres", value: totalReservations - rejete, color: "#ccc" },
      ],
    });
  };

  const handleDialogOpen = (reservation = null) => {
    setEditingReservation(reservation);
    setDialogOpen(true);
  };

  const handleView = (reservation) => {
    setSelectedReservation(reservation);
    setShowReservationDialog(true);
  };

  const handleDeleteConfirmation = (reservation) => {
    if (reservation.action === "accepte") {
      setSnackbarMessage("Impossible de supprimer une réservation acceptée.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    setReservationToDelete(reservation);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!reservationToDelete) return;

    try {
      await axios.delete(
        `http://localhost:7001/reservation/${reservationToDelete.id}`
      );
      fetchReservationsWithUserDetailsAndPrepareChartData();
      setSnackbarMessage("Reservation deleted!");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      setSnackbarMessage("Error deleting reservation.");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
    setOpenDeleteDialog(false);
  };

  const handleAccept = async (selectedReservation) => {
    const currentDate = new Date();
    const returnDate = new Date(selectedReservation.Date_retour);

    if (selectedReservation.action === "en attent") {
      if (currentDate >= returnDate) {
        // If return date has passed, ask for confirmation to change dates
        setReservationToAccept(selectedReservation);
        setConfirmAcceptOpen(true);
        return;
      } else {
        // If return date is in the future, proceed to contract creation (starting at vehicle step)
        if (!selectedReservation.num_immatriculation) {
          setSnackbarMessage("Aucun véhicule sélectionné pour cette réservation.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        const reservationData = {
          ...selectedReservation,
          Date_debut: selectedReservation.Date_debut,
          Heure_debut: selectedReservation.Heure_debut,
          Date_retour: selectedReservation.Date_retour,
          Heure_retour: selectedReservation.Heure_retour,
          Duree_location: selectedReservation.Duree_location,
          cin_client: selectedReservation.cin_client || "",
        };
        setSelectedReservation(reservationData);
        setInitialContractStep(2); // Start at step 2 (Vehicle Info)
        setAjouteContratOpen(true);
      }
    }
  };

  const handleCreateContract = (reservation, startStep = 3) => {
    // Logic to handle the creation of a contract, possibly navigating to another page
    // or opening a modal for contract details.
    console.log("Creating contract for reservation:", reservation);
    setSelectedReservation(reservation);
    setInitialContractStep(startStep); // Set the initial step dynamically
    setAjouteContratOpen(true);
  };


  const handleReject = async (selectedReservation) => {
    try {
      const currentDate = new Date();
      const returnDate = new Date(selectedReservation.Date_retour);
      let shouldReject = false;

      // Fetch client data to get is_fidel
      const clientResponse = await axios.get(
        `http://localhost:7001/client/cin_client?cin_client=${selectedReservation.cin_client}`
      );
      const clientData = clientResponse.data.data;
      const isFidel = clientData ? clientData.is_fidel : 0; // Default to 0 if client data or is_fidel is missing

      if (isFidel === true) {
        // Check if 7 days have passed since the return date
        const sevenDaysAfterReturn = new Date(returnDate);
        sevenDaysAfterReturn.setDate(returnDate.getDate() + 7);
        if (currentDate >= sevenDaysAfterReturn) {
          shouldReject = true;
        }
      } else {
        // Reject immediately if return date has passed
        if (currentDate >= returnDate) {
          shouldReject = true;
        }
      }

      if (shouldReject) {
        const payload = {
          action: "rejecte",
          login_id: Number(userId),
        };

        await axios.patch(
          `http://localhost:7001/reservation/${selectedReservation.id_reservation}/action`,
          payload
        );

        await fetchReservationsWithUserDetailsAndPrepareChartData(); // Refresh data
        setSnackbarMessage("Réservation refusée !");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        // Optionally, inform the user that the reservation cannot be rejected yet
        setSnackbarMessage(
          isFidel === true
            ? "La réservation ne peut pas encore être refusée. Elle sera automatiquement rejetée après 7 jours de la date de retour."
            : "La réservation ne peut pas encore être refusée. Elle sera automatiquement rejetée après la date de retour."
        );
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Erreur lors du refus de la réservation :", error);
      if (error.response) {
        console.error("Réponse du serveur :", error.response.data);
      }
      setSnackbarMessage("Erreur lors du refus de la réservation.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const columns = [
    {
      field: "stateAndId",
      headerName: "Numéro",
      width: 70,
      renderCell: (params) => {
        let icon, color;

        switch (params.row.action) {
          case "accepte":
            icon = <CheckCircleIcon sx={{ color: "green", marginRight: 1 }} />;
            color = "green";
            break;
          case "en attent":
            icon = (
              <HourglassEmptyIcon sx={{ color: "orange", marginRight: 1 }} />
            );
            color = "orange";
            break;
          case "rejecte":
            icon = <CancelIcon sx={{ color: "red", marginRight: 1 }} />;
            color = "red";
            break;
          default:
            icon = null;
            color = "gray";
        }

        return (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {icon}
            <Typography variant="body2" sx={{ color: color }}>
              {params.row.id_reservation}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "num_immatriculation",
      headerName: "Immatriculation",
      width: 125,
      renderCell: (params) => (
        <div style={{ color: "#051f91", fontWeight: "bold" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "clientName",
      headerName: "Client",
      width: 120,
      renderCell: (params) => (
        <div style={{ fontWeight: "bold" }}>{params.value}</div>
      ),
    },

    { field: "Date_debut", headerName: "Date debut ", width: 100 },
    { field: "Date_retour", headerName: "Date Retour ", width: 100 },
    { field: "Duree_location", headerName: "Durée ", width: 80 },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Tooltip title="Voir les détails">
            <Button onClick={() => handleView(params.row)}>
              <VisibilityIcon sx={{ color: "#3d59d5", marginRight: 1 }} />
            </Button>
          </Tooltip>
          {role === "Admin" && (
            <>
              <Tooltip title="Supprimer">
                <span>
                  {" "}
                  {/* Encapsulez le bouton dans un span */}
                  <Button
                    color="error"
                    onClick={() => handleDeleteConfirmation(params.row)}
                    disabled={params.row.action === "accepte"}
                  >
                    <DeleteIcon />
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
          {params.row.action === "en attent" && (
            <>
              <Tooltip title="Accepter la réservation">
                <Button
                  color="success"
                  onClick={() => handleAccept(params.row)}
                >
                  <CheckCircleIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Rejeter la réservation">
                <Button color="error" onClick={() => handleReject(params.row)}>
                  <CancelIcon />
                </Button>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },

    {
      field: "userName", // This will now show either the username or "Utilisateur inconnu"
      headerName: "Responsable",
      width: 150,
      renderCell: (params) => (
        <div style={{ fontWeight: "bold" }}>{params.value}</div>
      ),
    },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Header title="Réservations" />
      <Box display="flex" gap="10px" mb="15px">
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#3c90f0",
            color: "white",
            fontSize: "0.85rem",
            padding: "6px 16px", // Reduced padding
            borderRadius: "30px",
            marginBottom: "20px",
            "&:hover": {
              backgroundColor: "#2a3eb1",
            },
            height: "47px", // Added explicit height
          }}
          onClick={() => setAjouteReservationOpen(true)}
        >
          Ajouter Réservation
        </Button>
        {loadingChart ? (
          <Typography>Chargement des données du graphique...</Typography>
        ) : (
          <>
            {/* Total Reservations */}
            <Box
              marginLeft="20px"
              width="200px"
              height="147px"
              bgcolor="#fff"
              borderRadius="20px"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography variant="h6" align="center">
                Total {chartData.totalChartData[0].value}
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={chartData.totalChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.totalChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* En Attente Reservations */}
            <Box
              marginLeft="20px"
              width="200px"
              height="147px"
              bgcolor="#fff"
              borderRadius="20px"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography variant="h6" align="center">
                En Attente {chartData.enAttenteChartData[0].value}
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={chartData.enAttenteChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {chartData.enAttenteChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Acceptée Reservations */}
            <Box
              marginLeft="20px"
              width="200px"
              height="147px"
              bgcolor="#fff"
              borderRadius="20px"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography variant="h6" align="center">
                Acceptée {chartData.accepteChartData[0].value}
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={chartData.accepteChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {chartData.accepteChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Rejetée Reservations */}
            <Box
              marginLeft="20px"
              width="200px"
              height="147px"
              bgcolor="#fff"
              borderRadius="20px"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography variant="h6" align="center">
                Rejetée {chartData.rejeteChartData[0].value}
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={chartData.rejeteChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {chartData.rejeteChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </Box>
      <Box
        sx={{
          height: "55vh",
          width: "91%",
          backgroundColor: colors.primary[400],
          borderRadius: "8px",
          boxShadow: "0 1px 0px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          marginBottom: "0px",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { border: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: customColors.tableHeader,
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: customColors.tableHeader,
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-iconSeparator": {
            color: colors.primary[100],
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={reservations}
          columns={columns}
          getRowId={(row) => row.id_reservation}
          components={{
            Toolbar: GridToolbarCustom,
          }}
          localeText={{
            ...frFR.components.MuiDataGrid.defaultProps.localeText, // French default localization
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 50 },
            },
          }}
          checkboxSelection
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: customColors.tableHeader,
              borderBottom: "none",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: customColors.tableHeader,
              borderTop: "none",
            },
          }}
        />
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        sx={{ "& .MuiDialog-paper": { padding: "20px", borderRadius: "8px" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: colors.redAccent[500] }}>
          Confirmation de suppression
        </DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer cette réservation ?</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: "20px" }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: "20px" }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmAcceptOpen}
        onClose={() => setConfirmAcceptOpen(false)}
        // Add styling here
        sx={{
          "& .MuiDialog-paper": {
            padding: "20px", // Add some internal padding
            borderRadius: "8px", // Rounded corners
            backgroundColor: theme.palette.background.paper, // Use theme background color
            boxShadow: theme.shadows[5], // Add a subtle shadow
            minWidth: '300px', // Minimum width
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.2rem", // Slightly larger title font
            fontWeight: "bold",
            textAlign: "center", // Center the title
            color: theme.palette.primary.main, // Use primary color for title
            marginBottom: "15px", // Add space below the title
            borderBottom: `1px solid ${theme.palette.divider}`, // Add a subtle separator
            paddingBottom: "10px", // Padding below the separator
          }}
        >
          Confirmation d'acceptation
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}> {/* Center content */}
          <Typography variant="body1" sx={{fontWeight: "bold", color: theme.palette.text.secondary }}> {/* Use secondary text color */}
            La date de retour de cette réservation est déjà passée. Voulez-vous
            modifier les dates pour créer un contrat ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", paddingTop: "20px" }}> {/* Center buttons and add padding */}
          <Button
            onClick={() => setConfirmAcceptOpen(false)}
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: "20px", // Rounded buttons
              minWidth: '100px', // Minimum button width
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              setConfirmAcceptOpen(false);
              // Open AjouteContratReseve starting at the date/time step (step 1)
              handleCreateContract(reservationToAccept, 1);
            }}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "20px", // Rounded buttons
              minWidth: '100px', // Minimum button width
              backgroundColor: colors.blueAccent[600], // Use a color from your theme
              "&:hover": {
                 backgroundColor: colors.blueAccent[700], // Darker hover color
              }
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <AfficherReservation
        open={showReservationDialog}
        handleClose={() => setShowReservationDialog(false)}
        selectedReservation={selectedReservation}
        handleAccept={handleAccept}
        handleReject={handleReject}
      />
      <AjouteContratReseve
        open={ajouteContratOpen}
        handleClose={() => setAjouteContratOpen(false)}
        selectedReservation={selectedReservation}
        activeStep={initialContractStep} // Pass the initial step
        handleAccept={handleAccept} // Pass handleAccept if needed within AjouteContratReseve
      />
      <AjouteReservation
        open={ajouteReservationOpen}
        handleClose={() => setAjouteReservationOpen(false)}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarMessage.includes("succès") ? "success" : "error"}
          sx={{
            width: "100%",
            fontSize: "0.875rem",
            backgroundColor:
              snackbarSeverity === "success"
                ? "#4caf50"
                : snackbarSeverity === "error"
                ? "#f44336"
                : "#f44336",
            color: "#fff",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reservations;