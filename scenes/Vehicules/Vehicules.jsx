import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { tokens } from "../../theme";
import { Header } from "../../components";
import AjouteVehicule from "./AjouteVehicule";
import AfficherVehicule from "./AfficherVehicule";
import ModifieVehicule from "./ModifieVehicule"; // Make sure this import is correct
import { useAuth } from "../context/AuthContext";
import Visibility from "@mui/icons-material/Visibility";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { frFR } from "@mui/x-data-grid";
import GridToolbarCustom from "../../components/GridToolbarCustom";

const Vehicules = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { role } = useAuth();
  const customColors =
    role === "Admin"
      ? { background: "#3c90f0", hover: "#2a3eb1", tableHeader: "#6da5ee" }
      : { background: "#a0d3e8", hover: "#7ab8d9", tableHeader: "#bcccdf" };
  const initialVehicleState = () => ({
    num_immatriculation: "",
    marque: "",
    modele: "",
    id_categorie: "",
    n_serie_du_type: "",
    type_commercial: "",
    carrosserie: "",
    energie: "",
    puissance_fiscale: "",
    nbr_places: "",
    cylindree: "",
    num_certificat: "",
    lieu_certificat: "",
    date_certificat: "",
    prix_jour: "",
    image: "",
  });

  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newVehicle, setNewVehicle] = useState(initialVehicleState());
  const [vehicleToEdit, setVehicleToEdit] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openEdit, setOpenEdit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchData();
    }
  }, [categories]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:7001/vehicules");
      const vehicles = response.data.data;
      const vehiclesWithCategories = vehicles.map((vehicle) => ({
        ...vehicle,
        catégorie:
          categories.find((cat) => cat.id_categorie === vehicle.id_categorie)
            ?.catégorie || "Inconnu",
      }));
      setData(vehiclesWithCategories);
    } catch (error) {
      console.error("Erreur lors de la récupération des véhicules", error);
      setSnackbarMessage("Erreur lors de la récupération des véhicules");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:7001/categorie");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories", error);
      setSnackbarMessage("Erreur lors de la récupération des catégories");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddVehicle = async () => {
    console.log("Vehicle data being sent:", newVehicle);
    try {
      const formData = new FormData();
      for (const key in newVehicle) {
        formData.append(key, newVehicle[key]);
      }

      const response = await axios.post(
        "http://localhost:7001/vehicules",
        formData, // Send as FormData
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Assuming the API returns the newly added vehicle with its category
      const addedVehicle = response.data.data;
      const vehicleWithCategory = {
        ...addedVehicle,
        catégorie:
          categories.find((cat) => cat.id_categorie === addedVehicle.id_categorie)
            ?.catégorie || "Inconnu",
      };
      setData((prevData) => [...prevData, vehicleWithCategory]);
      setSnackbarMessage("Véhicule ajouté avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleAddClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du véhicule:", error.response.data);
      setSnackbarMessage(error.response.data.message || "Erreur lors de l'ajout du véhicule");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddOpen = () => setOpenAddDialog(true);
  const handleAddClose = () => {
    setOpenAddDialog(false);
    setNewVehicle(initialVehicleState());
  };

  const handleOpen = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVehicle(null);
  };

  const handleEdit = (vehicle) => {
    setVehicleToEdit(vehicle);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setVehicleToEdit(null);
  };
  const handleUpdateVehicle = async (updatedVehicle, imageFile) => {
    const formData = new FormData();
    for (const key in updatedVehicle) {
      formData.append(key, updatedVehicle[key]);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }
  
    // Log the FormData contents (entries)
    for (const pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
  
    try {

      const response = await axios.put(
        `http://localhost:7001/vehicules/${updatedVehicle.num_immatriculation}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the data state with the modified vehicle
      setData((prevData) =>
        prevData.map((vehicle) =>
          vehicle.num_immatriculation === updatedVehicle.num_immatriculation
            ? {
                ...response.data.data, // Use data from the response
                catégorie:
                  categories.find(
                    (cat) => cat.id_categorie === response.data.data.id_categorie
                  )?.catégorie || "Inconnu",
              }
            : vehicle
        )
      );

      setSnackbarMessage("Véhicule modifié avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseEdit(); // Close the edit dialog
    } catch (error) {
      console.error("Erreur lors de la modification du véhicule:", error.response?.data);
      setSnackbarMessage(error.response?.data?.message || "Erreur lors de la modification du véhicule");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };


  const checkIfVehiculeHasAssociations = async (vehiculeNumImmat) => {
    try {
      const response = await axios.get(
        `http://localhost:7001/vehicules/${vehiculeNumImmat}/associations`
      );
      return response.data.hasAssociations;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification des associations du véhicule",
        error
      );
      return true; // Keep this as a fallback to prevent deletion on error
    }
  };

  const handleDelete = async (num_immatriculation) => {
    if (!num_immatriculation) return;

    try {
      const hasAssociations = await checkIfVehiculeHasAssociations(
        num_immatriculation
      );
      if (hasAssociations) {
        setSnackbarMessage(
          "Ce véhicule ne peut pas être supprimé car il a des contrats ou des réservations en cours."
        );
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setOpenDeleteDialog(false);
        return;
      }

      await axios.delete(
        `http://localhost:7001/vehicules/${num_immatriculation}`
      );
      setData((prevData) =>
        prevData.filter(
          (vehicle) => vehicle.num_immatriculation !== num_immatriculation
        )
      );
      setSnackbarMessage("Véhicule supprimé avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du véhicule", error);
      const message =
        error.response?.data?.message ||
        "Erreur lors de la suppression du véhicule";
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    }
  };

  const confirmDelete = () => {
    if (selectedVehicle) {
      handleDelete(selectedVehicle.num_immatriculation);
    }
    handleCloseDeleteDialog();
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleOpenDeleteDialog = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedVehicle(null);
  };

  const columns = [
    {
      field: "num_immatriculation",
      headerName: "Numéro Immatriculation",
      width: 180,
      renderCell: (params) => (
        <div style={{ color: "red", fontWeight: "bold" }}>{params.value}</div>
      ),
    },
    { field: "marque", headerName: "Marque", width: 150 ,renderCell: (params) => (
      <div style={{  fontWeight: "bold" }}>
        {params.value}
      </div>
    ),},
    { field: "modele", headerName: "Modele", width: 150 ,renderCell: (params) => (
      <div style={{  fontWeight: "bold" }}>
        {params.value}
      </div>
    ),},
    { field: "catégorie", headerName: "Catégorie", width: 150 },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-between">
          <Tooltip title="Voir">
            <IconButton
              sx={{ color: "#3d59d5", marginRight: 2 }}
              onClick={() => handleOpen(params.row)}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          {role === "Admin" && (
            <>
              <Tooltip title="Modifier">
                <IconButton
                  sx={{ color: "#3db351", marginRight: 2 }}
                  onClick={() => handleEdit(params.row)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Supprimer">
                <IconButton
                  sx={{ color: "error.main", marginRight: 2 }}
                  onClick={() => handleOpenDeleteDialog(params.row)}
                >
                  <Delete />
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
      <Header title="Véhicules" />
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
          Ajouter un Véhicule
        </Button>
      )}
      <Box
        sx={{
          height: "60vh",
          width: "80%",
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
          getRowId={(row) => row.num_immatriculation}
          components={{
            Toolbar: GridToolbarCustom, // Custom toolbar
          }}
          localeText={{
            ...frFR.components.MuiDataGrid.defaultProps.localeText, // French default localization
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

      <AfficherVehicule
        open={open}
        handleClose={handleClose}
        selectedVehicle={selectedVehicle}
      />
      <AjouteVehicule
        open={openAddDialog}
        handleClose={handleAddClose}
        newVehicle={newVehicle}
        setNewVehicle={setNewVehicle}
        categories={categories}
        handleAddVehicle={handleAddVehicle}
      />
      <ModifieVehicule
        open={openEdit}
        handleClose={handleCloseEdit}
        vehicle={vehicleToEdit}
        setVehicle={setVehicleToEdit}
        handleUpdateVehicle={handleUpdateVehicle} // Pass the update function
        categories={categories}
      />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
         sx={{ "& .MuiDialog-paper": { padding: "20px", borderRadius: "8px" } }}
              >
                <DialogTitle sx={{ fontWeight: "bold", color: colors.redAccent[500] }}>
                  Confirmation de suppression
                </DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer ce véhicule ?</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: "20px" }}
          >
            Annuler
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: "20px" }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vehicules;