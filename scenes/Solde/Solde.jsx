import React, { useState, useEffect } from "react";
import {
  Box,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Modal,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@mui/material/styles";
import GridToolbarCustom from "../../components/GridToolbarCustom";
import { frFR } from "@mui/x-data-grid";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AffichierSolde from "./AffichierSolde";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Solde = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [allBalances, setAllBalances] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { role } = useAuth();
  const customColors =
    role === "Admin"
      ? { background: "#3c90f0", hover: "##2a3eb1", tableHeader: "#6da5ee" }
      : { background: "#a0d3e8", hover: "#7ab8d9", tableHeader: "#bcccdf" };
  const [value, setValue] = useState(0);
  const [allData, setAllData] = useState([]);
  const [soldeChartData, setSoldeChartData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [contrats, setContrats] = useState([]);

  // Nouvel état pour le graphique en pie du total des crédits
  const [totalCreditsValue, setTotalCreditsValue] = useState(0);
  // Ajout du total Non Solde
  const [totalNonSoldeValue, setTotalNonSoldeValue] = useState(0);
  // Ajout de l'état pour le total des débits
  const [totalDebit, setTotalDebit] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      const sortedData = [...allData].sort((a, b) => {
        const soldeA = parseFloat(a.solde);
        const soldeB = parseFloat(b.solde);
        if (soldeA < 0 && soldeB >= 0) {
          return -1;
        }
        if (soldeA >= 0 && soldeB < 0) {
          return 1;
        }
        return 0;
      });
      setData(sortedData);
    } else if (newValue === 1) {
      setData(allData.filter((item) => parseFloat(item.solde) === 0));
    } else if (newValue === 2) {
      setData(allData.filter((item) => parseFloat(item.solde) > 0));
    }
  };

  const fetchData = async () => {
    try {
      const clientsResponse = await axios.get("http://localhost:7001/client");
      const clients = clientsResponse.data.data;

      const contratsResponse = await axios.get("http://localhost:7001/contrat");
      const contrats = contratsResponse.data.data;

      const avancesResponse = await axios.get("http://localhost:7001/avance");
      const avances = avancesResponse.data.data;

      const paiementsResponse = await axios.get("http://localhost:7001/paiement");
      const paiements = paiementsResponse.data.data;

      const processedData = clients
        .map((client) => {
          if (!client.id_client) {
            console.error(`Client data is missing an ID:`, client);
            return null;
          }

          const clientContracts = contrats.filter(
            (contrat) => contrat.cin_client === String(client.cin_client)
          );

          const totalDebit = clientContracts.reduce(
            (sum, contrat) => sum + parseFloat(contrat.Prix_total || 0),
            0
          );

          const clientAvances = avances.filter(
            (avance) => avance.cin_client === String(client.cin_client)
          );

          const clientPaiements = paiements.filter(
            (paiement) => paiement.cin_client === String(client.cin_client)
          );

          const totalAvance = clientAvances.reduce(
            (sum, avance) => sum + parseFloat(avance.montant_avance || 0),
            0
          );

          const totalPaiement = clientPaiements.reduce(
            (sum, paiement) => sum + parseFloat(paiement.montant_paiement || 0),
            0
          );

          const totalCredit = totalAvance + totalPaiement;
          const solde = totalDebit - totalCredit;

          return {
            id: client.id_client,
            nom: `${client.nom_fr} ${client.prenom_fr}`,
            cin_client: client.cin_client,
            totalDebit: totalDebit.toFixed(3),
            totalCredit: totalCredit.toFixed(3),
            solde: solde.toFixed(3),
          };
        })
        .filter((client) => client !== null);

      // Tri initial
      const initialSortedData = [...processedData].sort((a, b) => {
        const soldeA = parseFloat(a.solde);
        const soldeB = parseFloat(b.solde);
        if (soldeA > 0 && soldeB >= 0) return -1;
        if (soldeA >= 0 && soldeB < 0) return 1;
        return 0;
      });

      setAllData(initialSortedData);
      setData(initialSortedData);

      // Calcul total des crédits
      const totalCreditsSum = processedData.reduce(
        (sum, client) => sum + parseFloat(client.totalCredit),
        0
      );
      setTotalCreditsValue(totalCreditsSum);

      // Calcul total des débits
      const totalDebitSum = processedData.reduce(
        (sum, client) => sum + parseFloat(client.totalDebit),
        0
      );
      setTotalDebit(totalDebitSum);

      // Affichage du total des crédits dans "Total des Débits" (à changer si besoin)
      setAllBalances(totalCreditsSum);

      // Calcul du total Non Solde
      const totalNonSoldeSum = processedData.reduce(
        (sum, client) =>
          sum + (parseFloat(client.totalDebit) - parseFloat(client.totalCredit)),
        0
      );
      setTotalNonSoldeValue(totalNonSoldeSum);

      // Préparer données pour le graphique en solde/nonsolde
      const soldeZeroCount = processedData.filter(
        (item) => parseFloat(item.solde) === 0
      ).length;
      const nonSoldeCount = processedData.length - soldeZeroCount;

      setSoldeChartData([
        { name: "Solde", value: soldeZeroCount },
        { name: "Non Solde", value: nonSoldeCount },
      ]);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleOpenModal = async (client) => {
    try {
      const contratsResponse = await axios.get("http://localhost:7001/contrat");
      const contratsFiltered = contratsResponse.data.data.filter(
        (contrat) => contrat.cin_client === String(client.cin_client)
      );
      setSelectedClient(client);
      setContrats(contratsFiltered);
      setOpenModal(true);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedClient(null);
    setContrats([]);
  };

  const columns = [
    {
      field: "nom",
      headerName: "Client",
      width: 150,
      renderCell: (params) => {
        const hasZeroSolde = allData.some(
          (item) => parseFloat(item.solde) === 0 && item.id === params.row.id
        );
        return (
          <div
            style={{
              fontWeight: "bold",
              color: hasZeroSolde ? "green" : "#f42222",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    { field: "totalDebit", headerName: "Total Débit", width: 150 },
    { field: "totalCredit", headerName: "Total Crédit", width: 150 },
    {
      field: "solde",
      headerName: "Solde",
      width: 150,
      renderCell: (params) => {
        const soldeValue = parseFloat(params.value);
        let color = "";
        if (soldeValue === 0) {
          color = "green";
        } else if (soldeValue > 0) {
          color = "#f42222";
        }
        return <div style={{ color: color, fontWeight: "bold" }}>{params.value}</div>;
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleOpenModal(params.row)}
          sx={{ color: "#3d59d5", marginRight: 1 }}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ padding: "20px" }}>
      <Header title="Solde client" />
      <Box sx={{ borderBottom: 1, borderColor: "divider", marginBottom: "0px" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: customColors.background,
            },
            "& .MuiTab-root.Mui-selected": {
              color: customColors.background,
            },
          }}
        >
          <Tab label="Tous " {...a11yProps(0)} />
          <Tab label="Solde " {...a11yProps(1)} />
          <Tab label="Non Solde" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <Box sx={{ display: "flex", width: "100%", gap: "10px" }}>
        {/* Tableau à gauche */}
        <Box sx={{ flex: 1 }}>
          {/* Panel 1 */}
          <CustomTabPanel value={value} index={0}>
            <Box
              sx={{
                height: "60vh",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
                marginBottom: "15px",
                width: "100%",
              }}
            >
              <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.id}
                components={{ Toolbar: GridToolbarCustom }}
                localeText={{ ...frFR.components.MuiDataGrid.defaultProps.localeText }}
                initialState={{ pagination: { paginationModel: { pageSize: 30 } } }}
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
          </CustomTabPanel>
          {/* Panel 2 */}
          <CustomTabPanel value={value} index={1}>
            <Box
              sx={{
                height: "60vh",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
                marginBottom: "15px",
                width: "100%",
              }}
            >
              <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.id}
                components={{ Toolbar: GridToolbarCustom }}
                localeText={{ ...frFR.components.MuiDataGrid.defaultProps.localeText }}
                initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
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
          </CustomTabPanel>
          {/* Panel 3 */}
          <CustomTabPanel value={value} index={2}>
            <Box
              sx={{
                height: "60vh",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
                marginBottom: "15px",
                width: "100%",
              }}
            >
              <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.id}
                components={{ Toolbar: GridToolbarCustom }}
                localeText={{ ...frFR.components.MuiDataGrid.defaultProps.localeText }}
                initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
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
          </CustomTabPanel>
        </Box>

        {/* Graphique en pie */}
        <Box sx={{ width: "400px", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Solde", value: totalCreditsValue },
                  { name: "Non Solde", value: totalNonSoldeValue },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toFixed(3)}`}
              >
                <Cell fill="#09953f" />
                <Cell fill="#f42222" />
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ fontSize: "1.2rem", mt: 2, fontWeight: "bold" }}>
            <strong>Total des Débits:</strong> {totalDebit.toFixed(3)}
          </Box>
        </Box>
      </Box>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleCloseModal();
          }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "8px",
          }}
        >
          {selectedClient && (
            <AffichierSolde
              client={selectedClient}
              contrats={contrats}
              onClose={handleCloseModal}
            />
          )}
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Solde;