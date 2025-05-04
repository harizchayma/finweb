import React, { useState, useEffect } from 'react';
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

const PaymentCheque = ({ open, handleClose, paymentDetails, onSubmitCheque }) => {
  const [cheque1Amount, setCheque1Amount] = useState(paymentDetails?.amount || ''); // Initialize with remaining amount
  const [cheque1Bank, setCheque1Bank] = useState('');
  const [cheque1PaymentDate, setCheque1PaymentDate] = useState('');
  const [echeance1, setEcheance1] = useState('');
  const [amountError, setAmountError] = useState(''); // State for amount error

  useEffect(() => {
    setCheque1Amount(paymentDetails?.amount || ''); // Update on prop change
    setCheque1Bank('');
    setCheque1PaymentDate('');
    setEcheance1('');
    setAmountError(''); // Clear error on open
  }, [open, paymentDetails?.amount]);

  const handleCheque1Submit = () => {
    const amountToPay = parseFloat(cheque1Amount);
    const remainingAmount = parseFloat(paymentDetails?.amount || 0);

    if (isNaN(amountToPay) || amountToPay <= 0) {
      setAmountError('Veuillez entrer un montant valide.');
      return;
    }

    if (amountToPay > remainingAmount) {
      setAmountError('Le montant entré dépasse le reste à payer.');
      return;
    }

    if (!cheque1Bank) {
      setAmountError('Veuillez sélectionner une banque.');
      return;
    }

    if (!cheque1PaymentDate) {
      setAmountError('Veuillez sélectionner la date du chèque.');
      return;
    }

    const cheque1Data = {
      montant_cheque1: amountToPay,
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
    setAmountError('');
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
          onChange={(e) => {
            setCheque1Amount(e.target.value);
            setAmountError(''); // Clear error on input change
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ backgroundColor: '#fff' }}
          error={!!amountError}
          helperText={amountError}
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
        <FormControl fullWidth margin="normal" error={!!amountError && !cheque1Bank}>
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
          {!!amountError && !cheque1Bank && <Typography color="error" variant="caption">Veuillez sélectionner une banque.</Typography>}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCheque1Submit} variant="contained" sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
        Valider Chèque
        </Button>
        <Button onClick={handleClose} variant="outlined">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentCheque;