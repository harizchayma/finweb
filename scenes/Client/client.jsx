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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { tokens } from "../../theme";
import { Header } from "../../components";
import AjouteClient from "./AjouteClient";
import AfficherClient from "./AfficherClient";
import ModifieClient from "./ModifieClient";
import { useAuth } from "../context/AuthContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { frFR } from "@mui/x-data-grid";
import GridToolbarCustom from "../../components/GridToolbarCustom";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LoginClient from "./LoginClient";

const Client = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { role } = useAuth();
  const customColors =
    role === "Admin"
      ? { background: "#3c90f0", hover: "#2a3eb1", tableHeader: "#6da5ee" }
      : { background: "#a0d3e8", hover: "#7ab8d9", tableHeader: "#bcccdf" };
  const initialClientState = () => ({
    nom_fr: "",
    nom_ar: "",
    prenom_fr: "",
    prenom_ar: "",
    cin_client: "",
    date_cin: "",
    date_naiss: "",
    adresse_fr: "",
    adresse_ar: "",
    num_tel: "",
    Numero_Permis: "",
    date_permis: "",
    profession_fr: "",
    profession_ar: "",
    nationalite_origine: "",
  });

  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newClient, setNewClient] = useState(initialClientState());
  const [clientToEdit, setClientToEdit] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openEdit, setOpenEdit] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [selectedClientForLogin, setSelectedClientForLogin] = useState(null);

  const handleOpenLoginDialog = (client) => {
    setSelectedClientForLogin(client);
    setOpenLoginDialog(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:7001/client");
      console.log(response.data.data); // Vérifiez les données ici
      setData(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients", error);
    }
  };

  const handleAddClient = async () => {
    try {
      const response = await axios.post(
        "http://localhost:7001/client",
        newClient
      );
      setData((prevData) => [...prevData, response.data.data]);
      setSnackbarMessage("Client ajouté avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleAddClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du client:", error);
      setSnackbarMessage("Erreur lors de l'ajout du client");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddOpen = () => setOpenAddDialog(true);
  const handleAddClose = () => {
    setOpenAddDialog(false);
    setNewClient(initialClientState());
  };

  const handleOpen = (client) => {
    setSelectedClient(client);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedClient(null);
  };

  const handleEdit = (client) => {
    setClientToEdit(client);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setClientToEdit(null);
  };

  const handleUpdateClient = async () => {
    if (!clientToEdit) {
      setSnackbarMessage("Aucun client à mettre à jour");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await axios.put(
        `http://localhost:7001/client/${clientToEdit.id_client}`,
        clientToEdit
      );
      setData((prevData) =>
        prevData.map((client) =>
          client.id_client === clientToEdit.id_client
            ? { ...client, ...clientToEdit }
            : client
        )
      );
      setSnackbarMessage("Client modifié avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseEdit();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client", error);
      setSnackbarMessage("Erreur lors de la mise à jour du client");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteConfirmation = (client) => {
    setClientToDelete(client);
    setOpenDeleteDialog(true);
  };

  const checkIfClientHasAssociations = async (clientId) => {
    try {
      const response = await axios.get(
        `http://localhost:7001/client/${clientId}/associations`
      );
      return response.data.hasAssociations;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification des associations du client",
        error
      );
      return true; // Assume associations to prevent deletion in case of error
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      const hasAssociations = await checkIfClientHasAssociations(
        clientToDelete.id_client
      );
      if (hasAssociations) {
        setSnackbarMessage(
          "Ce client ne peut pas être supprimé car il a des contrats ou des réservations en cours."
        );
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setOpenDeleteDialog(false);
        return;
      }

      await axios.delete(
        `http://localhost:7001/client/${clientToDelete.id_client}`
      );
      setData((prevData) =>
        prevData.filter(
          (client) => client.id_client !== clientToDelete.id_client
        )
      );
      setSnackbarMessage("Client supprimé avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du client", error);
      const message =
        error.response?.data?.message ||
        "Erreur lors de la suppression du client";
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    }
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleFidelChange = async (event, client) => {
    try {
      // Convertir la valeur booléenne en nombre
      const newFidelStatus = event.target.checked ? 1 : 0; // Si checked est vrai : 1, sinon : 0
      await axios.put(
        `http://localhost:7001/client/${client.id_client}/fidel`,
        { is_fidel: newFidelStatus } // Envoi 1 ou 0
      );

      setData((prevData) =>
        prevData.map((c) =>
          c.id_client === client.id_client
            ? { ...c, is_fidel: newFidelStatus === 1 } // Remise à `true`/`false` côté client
            : c
        )
      );

      setSnackbarMessage(`Statut de fidélité mis à jour pour ${client.nom_fr}`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut de fidélité",
        error.response.data
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur inconnue lors de la mise à jour.";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const columns = [
    {
      field: "cin_client",
      headerName: "CIN",
      width: 120,
      renderCell: (params) => (
        <div style={{ color: "red", fontWeight: "bold" }}>{params.value}</div>
      ),
    },
    {
      field: "nom_fr",
      headerName: "Nom (FR)",
      width: 120,
      renderCell: (params) => (
        <div style={{ fontWeight: "bold" }}>{params.value}</div>
      ),
    },
    { field: "nom_ar", headerName: "Nom (AR)", width: 120 },
    {
      field: "prenom_fr",
      headerName: "Prénom (FR)",
      width: 120,
      renderCell: (params) => (
        <div style={{ fontWeight: "bold" }}>{params.value}</div>
      ),
    },
    { field: "prenom_ar", headerName: "Prénom (AR)", width: 120 },
    {
      field: "is_fidel",
      headerName: "Fidélité",
      width: 180,
      renderCell: (params) => {
        const isFidel = params.value === true; // Utilisez ici `true` au lieu de `1`
    
        return (
          <Tooltip title={isFidel ? "Client fidèle" : "Client non fidèle"}>
            <FormControlLabel
              control={
                <Switch
                  checked={isFidel}
                  onChange={(event) => handleFidelChange(event, params.row)}
                  color="primary"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "green",
                    },
                    "& .MuiSwitch-switchBase": {
                      color: "red",
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: isFidel ? "green" : "red",
                      transition: "background-color 0.3s ease",
                    },
                  }}
                />
              }
              label={
                <span
                  style={{
                    color: isFidel ? "green" : "red", // Change la couleur du texte
                    fontWeight: "bold", // Optionnel : Mettre le texte en gras
                  }}
                >
                  {isFidel ? "fidèle" : "Non fidèle"}
                </span>
              }
            />
          </Tooltip>
        );
      },
    },
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
          {role === "Admin" && (
            <>
              <Tooltip title="Ajouter Login">
                <IconButton
                  sx={{ color: "#ff9800", marginRight: 1 }}
                  onClick={() => handleOpenLoginDialog(params.row)}
                >
                  <LockOpenIcon />
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
      <Header title="Clients" />
      {role === "Admin" && (
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
          Ajouter un Client
        </Button>
      )}
      <Box
        sx={{
          height: "60vh",
          width: "90%",
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
          getRowId={(row) => row.cin_client}
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
      <LoginClient
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
        client={selectedClientForLogin}
        onAddLogin={async (clientId, loginDetails) => {
          try {
            await axios.put(`http://localhost:7001/client/${clientId}/login`, {
              email: loginDetails.email,
              password: loginDetails.password,
            });
            setSnackbarMessage(
              "Informations de connexion ajoutées avec succès !"
            );
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            setOpenLoginDialog(false);
            fetchData();
          } catch (error) {
            console.error(
              "Erreur lors de l'ajout des informations de connexion:",
              error
            );
            setSnackbarMessage(
              "Erreur lors de l'ajout des informations de connexion."
            );
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          }
        }}
      />
      <AfficherClient
        open={open}
        handleClose={handleClose}
        selectedClient={selectedClient}
      />
      <AjouteClient
        open={openAddDialog}
        handleClose={handleAddClose}
        newClient={newClient}
        setNewClient={setNewClient}
        handleAddClient={handleAddClient}
      />
      <ModifieClient
        open={openEdit}
        handleClose={handleCloseEdit}
        client={clientToEdit}
        setClient={setClientToEdit}
        handleUpdateClient={handleUpdateClient}
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
          <p>Êtes-vous sûr de vouloir supprimer ce client ?</p>
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
          severity={snackbarMessage.includes("succès") ? "success" : "error"}          sx={{
            width: "100%",
            fontSize: "0.875rem",
            backgroundColor:
              snackbarSeverity === "success"
                ? "#4caf50"
                : snackbarSeverity === "error"
                ? "#f44336"
                :  "#f44336",
            color: "#fff",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Client;
