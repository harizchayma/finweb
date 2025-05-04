// Paiement.jsx
import React, { useState, useEffect } from "react";
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
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { tokens } from "../../theme";
import { Header } from "../../components";
import AjoutePaiement from "./AjoutePaiement"; // Create this component
import ModifiePaiement from "./ModifiePaiement"; // Create this component
import { useAuth } from "../context/AuthContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { frFR } from "@mui/x-data-grid";
import GridToolbarCustom from "../../components/GridToolbarCustom";
import AfficherPaiement from "./AfficherPaiement";
const Paiement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { role } = useAuth();
  const customColors =
    role === "Admin"
      ? { background: "#3c90f0", hover: "#2a3eb1", tableHeader: "#6da5ee" } // Admin colors
      : { background: "#a0d3e8", hover: "#7ab8d9", tableHeader: "#bcccdf" }; // User colors

  const initialPaiementState = () => ({
    numero_paiement: "", // Changed from Id_paiement
    cin_client: "",
    Numero_contrat: "",
    date_paiement: "",
    // Add other paiement fields here
  });

  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newPaiement, setNewPaiement] = useState(initialPaiementState());
  const [paiementToEdit, setPaiementToEdit] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openEdit, setOpenEdit] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [paiementToDelete, setPaiementToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:7001/paiement");
      const paiementData = response.data.data;

      // Now we need to fetch client information based on cin_client
      const updatedData = await Promise.all(
        paiementData.map(async (paiement) => {
          try {
            const clientResponse = await axios.get(
              `http://localhost:7001/client/cin_client?cin_client=${paiement.cin_client}`
            );
            const clientData = clientResponse.data.data;
            paiement.clientName = clientData
              ? `${clientData.nom_fr} ${clientData.prenom_fr}`
              : "Client Inconnu"; // Fallback if client data not found
          } catch (error) {
            console.error(
              "Erreur lors de la récupération des informations du client:",
              error
            );
            paiement.clientName = "Client Inconnu";
          }
          return paiement; // Return updated paiement including clientName
        })
      );

      setData(updatedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements", error);
    }
  };

  const handleAddPaiement = (newPaiement) => {
    setData((prevData) => [...prevData, newPaiement]);
    setSnackbarMessage("Paiement ajouté avec succès !");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    handleAddClose(); // Close the dialog here, as the add was initiated from AjoutePaiement
  };

  const handleAddOpen = () => setOpenAddDialog(true);
  const handleAddClose = () => {
    setOpenAddDialog(false);
    setNewPaiement(initialPaiementState());
  };

  const handleOpen = (paiement) => {
    setSelectedPaiement(paiement);
    setOpen(true); // This opens the dialog for viewing payment details
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPaiement(null);
  };

  const handleEdit = (paiement) => {
    setPaiementToEdit(paiement);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setPaiementToEdit(null);
  };

  const handleUpdatePaiement = async () => {
    if (!paiementToEdit) {
      setSnackbarMessage("Aucun paiement à mettre à jour");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    try {
      await axios.put(
        `http://localhost:7001/paiement/${paiementToEdit.Id_paiement}`,
        paiementToEdit
      ); // Assuming Id_paiement is the ID
      setData((prevData) =>
        prevData.map((paiement) =>
          paiement.Id_paiement === paiementToEdit.Id_paiement
            ? { ...paiement, ...paiementToEdit }
            : paiement
        )
      );
      setSnackbarMessage("Paiement modifié avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseEdit();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement", error);
      setSnackbarMessage("Erreur lors de la mise à jour du paiement");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteConfirmation = (paiement) => {
    setPaiementToDelete(paiement);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!paiementToDelete) return;

    try {
      await axios.delete(
        `http://localhost:7001/paiement/${paiementToDelete.Id_paiement}`
      ); // Assuming Id_paiement is the ID
      setData((prevData) =>
        prevData.filter(
          (paiement) => paiement.Id_paiement !== paiementToDelete.Id_paiement
        )
      );
      setSnackbarMessage("Paiement supprimé avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement", error);
      setSnackbarMessage("Erreur lors de la suppression du paiement");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const columns = [
    {
      field: "Numero_paiement",
      headerName: "Numéro Paiement",
      width: 150,
      renderCell: (params) => (
        <div style={{ color: "#ec0fcb", fontWeight: "bold" }}>
          {params.value}
        </div>
      ),
    },
    { field: "clientName", headerName: "Client", width: 150,renderCell: (params) => (
      <div style={{  fontWeight: "bold" }}>
        {params.value}
      </div>
    ), },
    {
      field: "Numero_contrat",
      headerName: "Numéro Contrat",
      width: 150,
      renderCell: (params) => (
        <div style={{ color: "red", fontWeight: "bold" }}>{params.value}</div>
      ),
    },
    { field: "date_paiement", headerName: "Date Paiement", width: 150 },
    { field: "montant_paiement", headerName: "Montant Total", width: 150,
      renderCell: (params) => (
        <div style={{ color: "#2566b1", fontWeight: "bold" }}>{params.value}</div>
      ), },
    {
      field: "action",
      headerName: "Action",
      width: 250,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Tooltip title="Voir">
            <IconButton
              sx={{ color: "#3d59d5", marginRight: 1 }}
              onClick={() => handleOpen(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
         
              <Tooltip title="Modifier">
                <IconButton
                  sx={{ color: "#3db351", marginRight: 1 }}
                  onClick={() => handleEdit(params.row)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              {role === "Admin" && (
            <>
              <Tooltip title="Supprimer">
                <IconButton
                  sx={{ color: "error.main", marginRight: 1 }}
                  onClick={() => handleDeleteConfirmation(params.row)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ padding: "20px" }}>
      <Header title="Paiements" /> 
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#3c90f0",
            color: "white",
            fontSize: "0.875rem",
            padding: "10px 20px",
            borderRadius: "20px",
            marginBottom: "20px",
            "&:hover": {
              backgroundColor: "#2a3eb1",
            },
          }}
          onClick={handleAddOpen}
        >
          Ajouter un Paiement
        </Button>
      <Box
        sx={{
          height: "60vh",
          width: "82%",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          marginBottom: "20px",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { border: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#6da5ee",
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: "#6da5ee",
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
          rows={data}
          columns={columns}
          getRowId={(row) => row.Id_paiement} // Adjust this based on your API response
          components={{
            Toolbar: GridToolbarCustom,
          }}
          localeText={{
            ...frFR.components.MuiDataGrid.defaultProps.localeText,
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
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
      <AfficherPaiement
        open={open}
        handleClose={handleClose}
        paymentId={selectedPaiement ? selectedPaiement.Id_paiement : null}
      />
      <AjoutePaiement
        open={openAddDialog}
        handleClose={handleAddClose}
        handleAddPaiement={handleAddPaiement} // Pass the function to update the parent state
      />
      <ModifiePaiement
        open={openEdit}
        handleClose={handleCloseEdit}
        paymentId={paiementToEdit ? paiementToEdit.Id_paiement : null}
        formData={paiementToEdit} // Pass down the paiement to edit
        setFormData={setPaiementToEdit} // Pass down state setter
        handleUpdatePaiement={handleUpdatePaiement} // Pass down the function to handle updates
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        sx={{ "& .MuiDialog-paper": { padding: "20px", borderRadius: "8px" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: colors.redAccent[500] }}>
          Confirmation de suppression
        </DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer ce paiement ?</p>
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            fontSize: "0.875rem",
            backgroundColor:
              snackbarSeverity === "success" ? "#4caf50" : "#f44336",
            color: "#fff",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Paiement;
