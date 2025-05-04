import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import AjouteAvance from "./AjouteAvance";
import AfficherAvance from "./AfficheAvance";
import ModifierAvance from "./ModifierAvance";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { frFR } from "@mui/x-data-grid";
import GridToolbarCustom from "../../components/GridToolbarCustom";

function Avance() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { role } = useAuth();

  const customColors =
    role === "Admin"
      ? { background: "#3c90f0", hover: "#2a3eb1", tableHeader: "#6da5ee" }
      : { background: "#a0d3e8", hover: "#7ab8d9", tableHeader: "#bcccdf" };

  const [data, setData] = useState([]);
  const [contracts, setContracts] = useState([]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openVoirAvanceDialog, setOpenVoirAvanceDialog] = useState(false);
  const [openModifierDialog, setOpenModifierDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAvanceIds, setSelectedAvanceIds] = useState([]);
  const [avanceToDeleteId, setAvanceToDeleteId] = useState(null);
  const [newAdvance, setNewAdvance] = useState({
    cin_client: "",
    date: "",
    Numero_contrat: "",
    Numero_avance: "",
  });

  const [avanceAVoirId, setAvanceAVoirId] = useState(null);
  const [selectedAvanceNumber, setSelectedAvanceNumber] = useState(null);
  const [avanceAModifierId, setAvanceAModifierId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleVoirClick = (avance) => {
    if (avance && typeof avance.id_avance !== "undefined") {
      setAvanceAVoirId(avance.id_avance);
      setOpenVoirAvanceDialog(true);
    } else {
      console.error("Selected avance does not have a valid id_avance.", avance);
    }
  };

  const handleVoirClose = () => {
    setOpenVoirAvanceDialog(false);
    setAvanceAVoirId(null);
  };

  const handleDeleteConfirm = (avanceId) => {
    setAvanceToDeleteId(avanceId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteAvance = async () => {
    if (!selectedAvanceIds.length && !avanceToDeleteId) return; // Check if there's anything to delete

    const idsToDelete = avanceToDeleteId
      ? [avanceToDeleteId]
      : selectedAvanceIds;

    try {
      await Promise.all(
        idsToDelete.map(async (avanceId) => {
          await axios.delete(`http://localhost:7001/avance/${avanceId}`);
        })
      );

      setSnackbarMessage("Avances supprimées avec succès !");
      setSnackbarSeverity("success");
      setOpenDeleteDialog(false);
      setSelectedAvanceIds([]);
      setAvanceToDeleteId(null); // Reset the single delete ID
      fetchAvances(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting avances:", error);
      setSnackbarMessage("Erreur lors de la suppression.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleModifierClick = useCallback((avanceId, numeroAvance) => {
    if (typeof avanceId !== "undefined") {
      setAvanceAModifierId(avanceId);
      setSelectedAvanceNumber(numeroAvance);
      setOpenModifierDialog(true);
    } else {
      console.error("Clicked avance does not have an id");
    }
  }, []);

  const fetchAvances = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:7001/avance");
      console.log(response.data); // Check the API response

      if (response.data && response.data.data) {
        const fetchedData = response.data.data
          .map((avance) => ({
            ...avance,
            id: avance.id_avance || null, // Ensure id is always set (can be null if missing)
          }))
          .filter((obj) => obj.id !== null); // Filter out if id is explicitly null

        // Now we need to fetch client information for each avance
        const updatedData = await Promise.all(
          fetchedData.map(async (avance) => {
            try {
              const clientResponse = await axios.get(
                `http://localhost:7001/client/cin_client?cin_client=${avance.cin_client}`
              );
              const clientData = clientResponse.data.data;
              return {
                ...avance,
                clientName: clientData
                  ? `${clientData.nom_fr} ${clientData.prenom_fr}`
                  : "Client Inconnu", // Fallback if client data not found
              };
            } catch (error) {
              console.error(
                "Erreur lors de la récupération des informations du client:",
                error
              );
              return { ...avance, clientName: "Client Inconnu" };
            }
          })
        );
        setData(updatedData); // Set the state with the updated data containing client names
      } else {
        console.error("No data found in response");
        setData([]); // Handle no data available
      }
    } catch (error) {
      console.error("Error fetching avances:", error);
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  useEffect(() => {
    fetchAvances();
  }, [fetchAvances]);

  const fetchContracts = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:7001/contrat");
      if (response.data && response.data.data) {
        setContracts(response.data.data);
      } else {
        console.error("No contracts found");
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const generateNextAvanceNumber = useCallback(() => {
    if (data.length > 0) {
      const lastAvanceNumber = data.reduce((max, avance) => {
        const num = parseInt(avance.Numero_avance.replace(/\D/g, ""), 10);
        return num > max ? num : max;
      }, 0);
      return `V${(lastAvanceNumber + 1).toString().padStart(4, "0")}`;
    } else {
      return "V0001";
    }
  }, [data]);
  const handleAvanceModifiee = (avanceModifiee) => {
    setData((prevData) =>
      prevData.map((avance) =>
        avance.id_avance === avanceModifiee.id_avance
          ? { ...avanceModifiee, id: avanceModifiee.id_avance } // Ensure 'id' is also updated
          : avance
      )
    );
  };
  const handleAddOpen = useCallback(() => {
    const nextAvanceNumber = generateNextAvanceNumber();
    setNewAdvance((prev) => ({ ...prev, Numero_avance: nextAvanceNumber }));
    setOpenAddDialog(true);
  }, [generateNextAvanceNumber]);

  const handleAddClose = useCallback(() => {
    setOpenAddDialog(false);
    setNewAdvance({
      cin_client: "",
      date: "",
      Numero_contrat: "",
      Numero_avance: "",
    });
  }, []);

  const handleAddAdvance = useCallback(async () => {
    try {
      const advanceToAdd = { ...newAdvance };
      const response = await axios.post(
        "http://localhost:7001/avance",
        advanceToAdd
      );
      if (response.data && response.data.data) {
        setData((prevData) => [
          ...prevData,
          { ...response.data.data, id: response.data.data.id_avance },
        ]);
        setSnackbarMessage("Avance ajoutée avec succès !");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleAddClose();
        setSelectedAvanceNumber(newAdvance.Numero_avance);
      } else {
        throw new Error(
          response.data?.message || "Erreur lors de l'ajout de l'avance."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avance:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Erreur lors de l'ajout de l'avance."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [newAdvance, handleAddClose]);

  const handleContractChange = useCallback(
    (event) => {
      const selectedContractNumber = event.target.value;
      const selectedContract = contracts.find(
        (contract) => contract.Numero_contrat === selectedContractNumber
      );
      setNewAdvance((prev) => ({
        ...prev,
        Numero_contrat: selectedContractNumber,
        cin_client: selectedContract ? selectedContract.cin_client : "",
      }));
    },
    [contracts]
  );

  const columns = [
    {
      field: "select",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        <Checkbox
          checked={selectedAvanceIds.includes(params.row.id)}
          onChange={(event) => {
            const checked = event.target.checked;
            const newSelection = checked
              ? [...selectedAvanceIds, params.row.id]
              : selectedAvanceIds.filter((id) => id !== params.row.id);
            setSelectedAvanceIds(newSelection);
          }}
        />
      ),
    },
    {
      field: "Numero_avance",
      headerName: "Numéro",
      width: 130,
      renderCell: (params) => (
        <div style={{ color: "#08b70e", fontWeight: "bold" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "clientName",
      headerName: "Client",
      width: 150,
      renderCell: (params) => (
        <div style={{ fontWeight: "bold" }}>{params.value}</div>
      ),
    },
    { field: "date", headerName: "Date", width: 150 },
    {
      field: "Numero_contrat",
      headerName: "Numéro de Contrat",
      width: 150,
      renderCell: (params) => (
        <div style={{ color: "red", fontWeight: "bold" }}>{params.value}</div>
      ),
    },
    { field: "montant_avance", headerName: "Montant Total", width: 150,
      renderCell: (params) => (
        <div style={{ color: "#2566b1", fontWeight: "bold" }}>{params.value}</div>
      ), },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box display="flex">
          <Tooltip title="Voir l'avance">
            <IconButton
              sx={{ color: "#3d59d5", marginRight: 1 }}
              onClick={() => {
                if (params.row && params.row.id_avance !== undefined) {
                  handleVoirClick(params.row);
                } else {
                  console.error(
                    "Row data or id_avance is undefined for view action.",
                    params.row
                  );
                }
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
         
              <Tooltip title="Modifier l'avance">
                <IconButton
                  sx={{ color: "#4caf50", marginRight: 1 }}
                  onClick={() => {
                    if (
                      params.row &&
                      typeof params.row.id !== "undefined" &&
                      params.row.Numero_avance
                    ) {
                      handleModifierClick(
                        params.row.id,
                        params.row.Numero_avance
                      );
                    } else {
                      console.error(
                        "Invalid row data for editing:",
                        params.row
                      );
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              {role === "Admin" && (
            <>
              <Tooltip title="Supprimer l'avance">
                     {" "}
                <IconButton
                  sx={{ color: "#d32f2f", marginRight: 1 }}
                  onClick={() => {
                    if (params.row && typeof params.row.id !== "undefined") {
                      handleDeleteConfirm(params.row.id);
                    } else {
                      console.error("Row data is undefined for delete action.");
                    }
                  }}
                >
                          <DeleteIcon />     {" "}
                </IconButton>
                   {" "}
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box m="20px">
      <Header title="Avances" />
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
          Ajouter une Avance
        </Button>
      <Box
        sx={{
          height: "60vh",
          width: "80%",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Ensure correct ID mapping
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
      <AjouteAvance
        openAddDialog={openAddDialog}
        handleAddClose={handleAddClose}
        newAdvance={newAdvance}
        setNewAdvance={setNewAdvance}
        contracts={contracts}
        handleContractChange={handleContractChange} // Use the function defined in Avance
        handleAddAdvance={handleAddAdvance}
      />
      <AfficherAvance
        open={openVoirAvanceDialog}
        handleClose={handleVoirClose}
        avanceId={avanceAVoirId}
      />
      <ModifierAvance
        open={openModifierDialog}
        handleClose={() => setOpenModifierDialog(false)}
        advanceId={avanceAModifierId}
        onSuccess={handleAvanceModifiee}
      />
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
              <DialogTitle>Confirmation de Suppression</DialogTitle>     {" "}
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cette avance ?
        </DialogContent>
             {" "}
        <DialogActions>
                 {" "}
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                      Annuler        {" "}
          </Button>
                 {" "}
          <Button onClick={handleDeleteAvance} color="secondary">
                      Supprimer        {" "}
          </Button>
               {" "}
        </DialogActions>
           {" "}
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Avance;
