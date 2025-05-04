import React, { useState } from "react";
 import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
 } from "@mui/material";
 import AddIcon from "@mui/icons-material/Add"; // Import the Add icon
 import ContractIcon from "@mui/icons-material/Assignment"; // Example icon for contract
 import ClientIcon from "@mui/icons-material/Person"; // Example icon for client
 import AdvanceIcon from "@mui/icons-material/MonetizationOn"; // Example icon for advance number
 import DateIcon from "@mui/icons-material/CalendarToday"; // Example icon for date
 import EditIcon from "@mui/icons-material/Edit"; // Import EditIcon
 import CancelIcon from '@mui/icons-material/Cancel';
 import AjouteCheque from './AjouteCheque'; // Import the AjouteCheque component
 import AjouteCheque2 from './AjouteCheque2'; // Import the AjouteCheque2 component
 import AjouteCash from "./AjouteCash";
 import AjouteEspace from "./AjouteEspace"; // Import the AjouteEspace component

 function AjouteAvance({
  openAddDialog,
  handleAddClose,
  newAdvance,
  setNewAdvance,
  contracts,
  handleContractChange,
  handleAddAdvance,
  defaultContractNumber
 }) {
  const [openChequeDialog, setOpenChequeDialog] = useState(false);
  const [chequeDetails, setChequeDetails] = useState({});
  const [openCheque2Dialog, setOpenCheque2Dialog] = useState(false); // State for the second cheque dialog
  const [cheque2Details, setCheque2Details] = useState({});
  const [openVirementDialog, setOpenVirementDialog] = useState(false); // State for the virement dialog
  const [virementDetails, setVirementDetails] = useState({});
  const [openEspaceDialog, setOpenEspaceDialog] = useState(false); // State for the espace dialog
  const [espaceDetails, setEspaceDetails] = useState({});

  const handleOpenVirementDialog = () => {
   setVirementDetails({});
   setOpenVirementDialog(true);
  };
  const handleOpenChequeDialog = () => {
   setOpenChequeDialog(true);
  };

  const handleCloseChequeDialog = () => {
   setOpenChequeDialog(false);
  };

  const handleAddChequePayment = (chequeData) => {
   // Handle the cheque payment data here, e.g., update newAdvance state
   console.log("Cheque Data:", chequeData);
   setNewAdvance({ ...newAdvance, ...chequeData });
   handleCloseChequeDialog();
  };

  const handleOpenCheque2Dialog = () => {
   setOpenCheque2Dialog(true);
  };

  const handleCloseCheque2Dialog = () => {
   setOpenCheque2Dialog(false);
  };

  const handleAddCheque2Payment = (cheque2Data) => {
   // Handle the second cheque payment data
   console.log("Cheque 2 Data:", cheque2Data);
   setNewAdvance(prev => ({ ...prev, ...cheque2Data }));
   handleCloseCheque2Dialog();
  };

  const handleCloseVirementDialog = () => {
   setOpenVirementDialog(false);
  };

  const handleAddVirementPayment = (virementData) => {
   // Handle the virement payment data
   console.log("Virement Data:", virementData);
   setNewAdvance(prev => ({ ...prev, ...virementData }));
   handleCloseVirementDialog();
  };

  const handleOpenEspaceDialog = () => {
   setEspaceDetails({});
   setOpenEspaceDialog(true);
  };

  const handleCloseEspaceDialog = () => {
   setOpenEspaceDialog(false);
  };

  const handleAddEspecePayment = (espaceData) => {
   // Logic to handle adding an espèce payment
   console.log("Espèce Data:", espaceData);
   setNewAdvance(prev => ({ ...prev, ...espaceData }));
   handleCloseEspaceDialog();
  };

  const handleAddEspece = () => {
   // Open the espace dialog
   handleOpenEspaceDialog();
  };

  const handleAddCheque2 = () => {
   // Open the second cheque dialog
   handleOpenCheque2Dialog();
  };

  const handleAddVirement = () => {
   // Open the virement dialog
   handleOpenVirementDialog();
  };

  return (
   <>
    <Dialog
     open={openAddDialog}
     onClose={(event, reason) => {
      if (reason !== "backdropClick") {
       handleAddClose();
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
      Ajouter une Avance{" "}
      {newAdvance.Numero_avance ? `- ${newAdvance.Numero_avance}` : ""}
     </DialogTitle>
     <DialogContent sx={{ padding: 2 }}>
      <FormControl fullWidth margin="normal">
       <InputLabel id="contract-select-label">
        Numéro de Contrat
       </InputLabel>
       <Select
        labelId="contract-select-label"
        value={newAdvance.Numero_contrat || ""}
        onChange={handleContractChange}
        startAdornment={
         <InputAdornment position="start">
          <ContractIcon sx={{ color: "#1976d2" }} />
         </InputAdornment>
        }
       >
        {contracts && contracts.map((contract) => (
         contract && contract.Numero_contrat ? (
          <MenuItem key={contract.Numero_contrat} value={contract.Numero_contrat}>
           {contract.Numero_contrat}
          </MenuItem>
         ) : null
        ))}
       </Select>
      </FormControl>
      <TextField
       label="CIN Client"
       value={newAdvance.cin_client}
       fullWidth
       margin="normal"
       disabled
       InputProps={{
        startAdornment: (
         <InputAdornment position="start">
          <ClientIcon sx={{ color: "#1976d2" }} />
         </InputAdornment>
        ),
       }}
      />
      <TextField
       label="Date"
       type="date"
       value={newAdvance.date}
       onChange={(e) =>
        setNewAdvance({ ...newAdvance, date: e.target.value })
       }
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
        marginLeft: 2,
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
        marginLeft: 2,
       }}
       startIcon={<AddIcon />}
      >
       Ajouter Espèce
      </Button>
      <Button
       onClick={handleAddCheque2}
       color="primary"
       variant="outlined"
       sx={{
        fontWeight: "bold",
        color: "#4caf50",
        textAlign: "center",
        marginTop: 2,
        marginLeft: 2,
       }}
       startIcon={<AddIcon />}
      >
       Ajouter Chèque 2
      </Button>
      <Button
       onClick={handleAddVirement}
       color="primary"
       variant="outlined"
       sx={{
        fontWeight: "bold",
        color: "#4caf50",
        textAlign: "center",
        marginTop: 2,
        marginLeft: 2,
       }}
       startIcon={<AddIcon />}
      >
       Ajouter Virement
      </Button>
     </DialogContent>
     <DialogActions>
      <Button
       onClick={handleAddAdvance}
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
       onClick={handleAddClose}
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

    {/* AjouteCheque Dialog */}
    <AjouteCheque
     open={openChequeDialog}
     handleClose={handleCloseChequeDialog}
     onSubmitCheque={handleAddChequePayment}
    />

    {/* AjouteCheque2 Dialog */}
    <AjouteCheque2
     open={openCheque2Dialog}
     handleClose={handleCloseCheque2Dialog}
     onSubmitCheque={handleAddCheque2Payment}
    />

    {/* AjouteVirement Dialog */}
    <AjouteCash
     open={openVirementDialog}
     handleClose={handleCloseVirementDialog}
     paymentDetails={virementDetails}
     onSubmitPayment={handleAddVirementPayment}
    />

    {/* AjouteEspace Dialog */}
    <AjouteEspace
     open={openEspaceDialog}
     handleClose={handleCloseEspaceDialog}
     onSubmitPayment={handleAddEspecePayment}
    />
   </>
  );
 }

 export default AjouteAvance;