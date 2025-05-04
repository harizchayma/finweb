import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const PaymentCash = ({ open, handleClose, paymentDetails, onSubmitPayment }) => {
  const [cashAmount, setCashAmount] = useState(paymentDetails?.amount || ''); // Initialize with remaining amount
  const [bankName, setBankName] = useState('');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    setCashAmount(paymentDetails?.amount || ''); // Update on prop change as well
    setBankName('');
    setAmountError(''); // Clear any previous error when the dialog opens or amount changes
  }, [open, paymentDetails?.amount]); // Listen to 'open' and 'paymentDetails.amount'

  const handlePaymentSubmit = () => {
    const amountToPay = parseFloat(cashAmount);
    const remainingAmount = parseFloat(paymentDetails?.amount || 0);

    if (isNaN(amountToPay) || amountToPay <= 0) {
      setAmountError('Veuillez entrer un montant valide.');
      return;
    }

    if (amountToPay > remainingAmount) {
      setAmountError('Le montant entré dépasse le reste à payer.');
      return;
    }

    if (!bankName) {
      setAmountError('Veuillez sélectionner une banque.');
      return;
    }

    const paymentData = {
      montant_virement: amountToPay,
      banque_virement: bankName,
    };
    onSubmitPayment(paymentData);
    handleClose();
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
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', color: '#1976d2' }}>
        Détails du Paiement par Virement
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Montant" // Changed label to "Montant"
          type="number"
          value={cashAmount} // Initialized with paymentDetails?.amount
          onChange={(e) => {
            setCashAmount(e.target.value);
            setAmountError(''); // Clear error on input change
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!amountError}
          helperText={amountError}
        />
        <Typography variant="h6" sx={{ margin: "12px 0", fontWeight: 'bold', color: '#333' }}>
          Sélectionnez la Banque
        </Typography>
        <FormControl fullWidth margin="normal" error={!!amountError && !bankName}>
          <InputLabel id="bank-select-label">Banque</InputLabel>
          <Select
            labelId="bank-select-label"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            defaultValue=""
            variant="outlined"
            sx={{ backgroundColor: '#fff' }}
          >
            <MenuItem value="" disabled>Sélectionnez une banque</MenuItem>
            {availableBanks.map((bank, index) => (
              <MenuItem key={index} value={bank}>{bank}</MenuItem>
            ))}
          </Select>
          {!!amountError && !bankName && <Typography color="error" variant="caption">Veuillez sélectionner une banque.</Typography>}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePaymentSubmit} variant="contained" sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
          Valider Paiement
        </Button>
        <Button onClick={handleClose}  variant="outlined" >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentCash;