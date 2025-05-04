import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

const AjouteCheque = ({ open, handleClose, paymentDetails, onSubmitCheque }) => {
  const [cheque1Amount, setCheque1Amount] = useState('');
  const [cheque1Bank, setCheque1Bank] = useState('');
  const [cheque1PaymentDate, setCheque1PaymentDate] = useState('');
  const [echeance1, setEcheance1] = useState('');

  const handleCheque1Submit = () => {
    if (!cheque1Amount || !cheque1Bank || !cheque1PaymentDate) {
      alert("Please fill in all fields.");
      return;
    }

    const cheque1Data = {
      montant_cheque1: parseFloat(cheque1Amount),
      banque_cheque1: cheque1Bank,
      echeance_cheque1: echeance1,
      date_cheque1: new Date(cheque1PaymentDate).toISOString(),
    };
  
    onSubmitCheque(cheque1Data);
    resetForm(); // Clear the inputs after submitting
    handleClose();
  };

  const resetForm = () => {
    setCheque1Amount('');
    setCheque1Bank('');
    setCheque1PaymentDate('');
    setEcheance1('');
  };

  const availableBanks = [
    "STB",
    "BNA",
    "BH",
    "BFPME",
    "BTS",
    "BTE",
    "BTL",
    "TSB",
    "Banque Zitouna",
    "Al Baraka Bank",
    "Al Wifak International Bank",
    "Amen Bank",
    "Attijari Bank",
    "ATB",
    "ABC",
    "BIAT",
    "BT",
    "BTK",
    "BFT",
    "Citi Bank",
    "QNB",
    "UBCI",
    "UIB",
  ];

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }
      }}>
      <DialogTitle sx={{ fontSize: '1.6rem', fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}>
        Détails du Paiement par Chèque
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Montant Chèque"
          type="number"
          value={cheque1Amount}
          onChange={(e) => setCheque1Amount(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ backgroundColor: '#fff' }}
        />
        <TextField
          label="Numéro de Chèque"
          value={echeance1}
          onChange={(e) => setEcheance1(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="Informations sur l'échéance"
          variant="outlined"
          sx={{ backgroundColor: '#fff' }}
        />
        <TextField
          label="Date de Chèque"
          type="date"
          value={cheque1PaymentDate}
          onChange={(e) => setCheque1PaymentDate(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          sx={{ backgroundColor: '#fff' }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="bank-select-label">Banque</InputLabel>
          <Select
            labelId="bank-select-label"
            value={cheque1Bank}
            onChange={(e) => setCheque1Bank(e.target.value)}
            variant="outlined"
            sx={{ backgroundColor: '#fff' }}
          >
            <MenuItem value="" disabled>Sélectionnez une banque</MenuItem>
            {availableBanks.map((bank, index) => (
              <MenuItem key={index} value={bank}>{bank}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCheque1Submit} variant="contained" sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
          Ajouter Chèque
        </Button>
        <Button onClick={handleClose} variant="outlined">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AjouteCheque;