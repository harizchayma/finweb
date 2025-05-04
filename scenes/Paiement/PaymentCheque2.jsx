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

const PaymentCheque2 = ({ open, handleClose, paymentDetails, onSubmitCheque }) => {
  const [cheque2Amount, setCheque2Amount] = useState(paymentDetails?.amount || ''); // Initialize with remaining amount
  const [cheque2Bank, setCheque2Bank] = useState('');
  const [cheque2PaymentDate, setCheque2PaymentDate] = useState('');
  const [echeance2, setEcheance2] = useState('');
  const [amountError, setAmountError] = useState(''); // State for amount error

  useEffect(() => {
    setCheque2Amount(paymentDetails?.amount || ''); // Update on prop change
    setCheque2Bank('');
    setCheque2PaymentDate('');
    setEcheance2('');
    setAmountError(''); // Clear error on open
  }, [open, paymentDetails?.amount]);

  const handleCheque2Submit = () => {
    const amountToPay = parseFloat(cheque2Amount);
    const remainingAmount = parseFloat(paymentDetails?.amount || 0);

    if (isNaN(amountToPay) || amountToPay <= 0) {
      setAmountError('Veuillez entrer un montant valide.');
      return;
    }

    if (amountToPay > remainingAmount) {
      setAmountError('Le montant entré dépasse le reste à payer.');
      return;
    }

    if (!cheque2Bank) {
      setAmountError('Veuillez sélectionner une banque.');
      return;
    }

    if (!cheque2PaymentDate) {
      setAmountError('Veuillez sélectionner la date du chèque.');
      return;
    }

    const cheque2Data = {
      montant_cheque2: amountToPay,
      banque_cheque2: cheque2Bank,
      echeance_cheque2: echeance2,
      date_cheque2: new Date(cheque2PaymentDate).toISOString(),
    };

    onSubmitCheque(cheque2Data);
    resetForm(); // Clear the inputs after submitting
    handleClose();
  };

  const resetForm = () => {
    setCheque2Amount('');
    setCheque2Bank('');
    setCheque2PaymentDate('');
    setEcheance2('');
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
        Détails du Deuxième Paiement par Chèque
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Montant Chèque"
          type="number"
          value={cheque2Amount}
          onChange={(e) => {
            setCheque2Amount(e.target.value);
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
          value={echeance2}
          onChange={(e) => setEcheance2(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="Informations sur l'échéance"
          variant="outlined"
          sx={{ backgroundColor: '#fff' }}
        />
        <TextField
          label="Date de Chèque"
          type="date"
          value={cheque2PaymentDate}
          onChange={(e) => setCheque2PaymentDate(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          sx={{ backgroundColor: '#fff' }}
        />
        <FormControl fullWidth margin="normal" error={!!amountError && !cheque2Bank}>
          <InputLabel id="bank-select-label">Banque</InputLabel>
          <Select
            labelId="bank-select-label"
            value={cheque2Bank}
            onChange={(e) => setCheque2Bank(e.target.value)}
            variant="outlined"
            sx={{ backgroundColor: '#fff' }}
          >
            <MenuItem value="" disabled>Sélectionnez une banque</MenuItem>
            {availableBanks.map((bank, index) => (
              <MenuItem key={index} value={bank}>{bank}</MenuItem>
            ))}
          </Select>
          {!!amountError && !cheque2Bank && <Typography color="error" variant="caption">Veuillez sélectionner une banque.</Typography>}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCheque2Submit} variant="contained" color="primary" sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
        Valider Chèque
        </Button>
        <Button onClick={handleClose} variant="outlined">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentCheque2;