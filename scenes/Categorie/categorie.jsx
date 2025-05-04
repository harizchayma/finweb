import {
  Box,
  Typography,
  useTheme,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { frFR } from "@mui/x-data-grid";
import GridToolbarCustom from "../../components/GridToolbarCustom";

const Categorie = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { role } = useAuth();
  const customColors =
    role === "Admin"
      ? { background: "#3c90f0", hover: "#2a3eb1", tableHeader: "#6da5ee" }
      : { background: "#a0d3e8", hover: "#7ab8d9", tableHeader: "#bcccdf" };

  const [categories, setCategories] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editedCategory, setEditedCategory] = useState({ catégorie: "" });
  const [newCategory, setNewCategory] = useState({ catégorie: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);

  const handleView = (category) => {
    setViewCategory(category);
    setOpenViewDialog(true);
  };

  const columns = [
    { field: "catégorie", headerName: "Catégorie", width: 250 ,renderCell: (params) => (
      <div style={{  fontWeight: "bold" }}>
        {params.value}
      </div>
    ),},
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-between">
          <Tooltip title="Voir">
            <IconButton
              sx={{ color: "#3d59d5", marginRight: 1 }}
              onClick={() => handleView(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {role === "Admin" && (
            <>
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
                  onClick={() => {
                    setSelectedCategory(params.row);
                    setOpenDeleteDialog(true);
                  }}
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:7001/categorie");
      if (Array.isArray(response.data.data)) {
        const categoriesFormatted = response.data.data.map((category) => ({
          id: category.id_categorie, // Ensure 'id' is present
          id_categorie: category.id_categorie,
          catégorie: category["catégorie"],
        }));
        setCategories(categoriesFormatted);
      } else {
        console.error("La réponse ne contient pas un tableau de catégories !");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbarMessage("Erreur lors de la récupération des catégories");
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (category) => {
    setEditedCategory(category);
    setOpenEditDialog(true);
  };

  const handleAddCategory = async () => {
    try {
      const response = await axios.post(
        "http://localhost:7001/categorie",
        newCategory
      );
      // The backend should return the new category with its id
      setCategories((prevCategories) => [
        ...prevCategories,
        { id: response.data.data.id_categorie, ...response.data.data },
      ]);
      setOpenAddDialog(false);
      setNewCategory({ catégorie: "" });
      setSnackbarMessage("Catégorie ajoutée avec succès !");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error adding category:", error);
      setSnackbarMessage("Erreur lors de l'ajout de la catégorie");
      setSnackbarOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:7001/categorie/${editedCategory.id_categorie}`,
        editedCategory
      );
      const updatedCategoryWithId = {
        id: response.data.data.id_categorie,
        ...response.data.data,
      };

      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id_categorie === editedCategory.id_categorie
            ? updatedCategoryWithId
            : cat
        )
      );
      setOpenEditDialog(false);
      setEditedCategory({ catégorie: "" });
      setSnackbarMessage("Catégorie modifiée avec succès !");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating category:", error);
      setSnackbarMessage("Erreur lors de la mise à jour de la catégorie");
      setSnackbarOpen(true);
    }
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);
  const checkCategoryAssociations = async (id_categorie) => {
    try {
      const response = await axios.get(
        `http://localhost:7001/categorie/${id_categorie}/associations`
      );
      return response.data.hasAssociations;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification des associations de la catégorie",
        error
      );
      return true; // Prevent deletion on error
    }
  };

  const handleDelete = async (id_categorie) => {
    try {
      const hasAssociations = await checkCategoryAssociations(id_categorie);
      if (hasAssociations) {
        setSnackbarMessage(
          "Cette catégorie ne peut pas être supprimée car elle est associée à des véhicules."
        );
        setSnackbarOpen(true);
        return;
      }
      await axios.delete(`http://localhost:7001/categorie/${id_categorie}`);
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id_categorie !== id_categorie)
      );
      setSnackbarMessage("Catégorie supprimée avec succès !");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting category:", error);
      setSnackbarMessage("Erreur lors de la suppression de la catégorie");
      setSnackbarOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      handleDelete(selectedCategory.id_categorie);
    }
    setOpenDeleteDialog(false);
  };
  return (
    <Box m="20px">
      <Header title="Catégories" />
      {role === "Admin" && (
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#3c90f0",
            color: "white",
            fontSize: "0.875rem",
            padding: "10px 20px",
            borderRadius: "20px",
            marginBottom: "10px",
            "&:hover": {
              backgroundColor: "#2a3eb1",
            },
          }}
          onClick={() => setOpenAddDialog(true)}
        >
          Ajouter Catégorie
        </Button>
      )}
      <Box
        mt="30px"
        height="55vh"
        width="100vh"
        flex={1}
        sx={{
          height: "60vh",
          width: "75%",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <DataGrid
          rows={categories}
          columns={columns}
          getRowId={(row) => row.id_categorie}
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

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClose(); // Only close on close button click
          }
        }}
        sx={{ "& .MuiDialog-paper": { padding: "20px", borderRadius: "8px" } }}
      >
        <DialogTitle
          sx={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#1976d2",
            margin: 3,
          }}
        >
          Catégorie
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="h3"
            sx={{
              fontSize: "1.5rem",
              
              textAlign: "center",
              color: "#1d1f20",
              margin: 3,
            }}
          >
            Catégorie:{" "}
            <span style={{fontSize: "2rem", color: "red",fontWeight: "bold", }}>{viewCategory?.catégorie}</span>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenViewDialog(false)}
            sx={{
              bgcolor: "#d32f2f",
              color: "white",
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#b71c1c" },
            }}
            startIcon={<CancelIcon />}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClose(); // Only close on close button click
          }
        }}
        sx={{ "& .MuiDialog-paper": { padding: "20px", borderRadius: "8px" } }}
      >
        <DialogTitle
          sx={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#1976d2",
            margin: 3,
          }}
        >
          Modifier Catégorie
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Catégorie"
            type="text"
            fullWidth
            variant="outlined"
            value={editedCategory.catégorie || ""}
            InputProps={{
              style: { width: "300px", height: "55px" },
            }}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" },
                "&:hover fieldset": { borderColor: "#115293" },
                "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
              },
            }}
            onChange={(e) =>
              setEditedCategory({
                ...editedCategory,
                catégorie: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSaveEdit}
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#1565c0" },
            }}
            startIcon={<SaveIcon />}
          >
            Modifier
          </Button>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{
              bgcolor: "#d32f2f",
              color: "white",
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#b71c1c" },
            }}
            startIcon={<CancelIcon />}
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClose(); // Only close on close button click
          }
        }}
        sx={{ "& .MuiDialog-paper": { padding: "20px", borderRadius: "8px" } }}
      >
        <DialogTitle
          sx={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#1976d2",
            margin: 3,
          }}
        >
          Ajouter Catégorie
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Catégorie"
            type="text"
            fullWidth
            variant="outlined"
            InputProps={{
              style: { width: "300px", height: "55px" },
            }}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" },
                "&:hover fieldset": { borderColor: "#115293" },
                "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
              },
            }}
            value={newCategory.catégorie || ""}
            onChange={(e) =>
              setNewCategory({ ...newCategory, catégorie: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddCategory}
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
            onClick={() => setOpenAddDialog(false)}
            sx={{
              bgcolor: "#d32f2f",
              color: "white",
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#b71c1c" },
            }}
            startIcon={<CancelIcon />}
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        sx={{ "& .MuiDialog-paper": { padding: "20px", borderRadius: "8px" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: colors.redAccent[500] }}>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}   color="primary"
            variant="outlined"
            sx={{ borderRadius: "20px" }}>
            Annuler
          </Button>
          <Button onClick={confirmDelete}  color="error"
            variant="contained"
            sx={{ borderRadius: "20px" }}>
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
          severity={snackbarMessage.includes("succès") ? "success" : "error"}
          sx={{
            width: "100%",
            backgroundColor: snackbarMessage.includes("succès")
              ? "#4caf50"
              : "#f44336",
            color: "white",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Categorie;
