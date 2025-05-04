import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
} from '@mui/material';

const PaymentEspace = ({ open, handleClose, paymentDetails, onSubmitPayment }) => {
  const [espaceAmount, setEspaceAmount] = useState(paymentDetails?.amount || '');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    setEspaceAmount(paymentDetails?.amount || '');
    setAmountError(''); // Clear any previous error when the dialog opens or amount changes
  }, [paymentDetails?.amount]);

  const handlePaymentSubmit = () => {
    const amountToPay = parseFloat(espaceAmount);
    const remainingAmount = parseFloat(paymentDetails?.amount || 0);

    if (isNaN(amountToPay) || amountToPay <= 0) {
      setAmountError('Veuillez entrer un montant valide.');
      return;
    }

    if (amountToPay > remainingAmount) {
      setAmountError('Le montant entré dépasse le reste à payer.');
      return;
    }

    const paymentData = {
      montant_espace: amountToPay,
    };
    onSubmitPayment(paymentData);
    handleClose();
  };

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
        Paiement en Espèces
      </DialogTitle>
      <DialogContent>
        <TextField
          label={`Montant (Reste à Payer: ${paymentDetails?.amount ? parseFloat(paymentDetails.amount).toFixed(3) : '0.000'} dt)`}
          type="number"
          value={espaceAmount}
          onChange={(e) => {
            setEspaceAmount(e.target.value);
            setAmountError(''); // Clear error on input change
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!amountError}
          helperText={amountError}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePaymentSubmit} variant="contained" sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
          Valider Paiement
        </Button>
        <Button onClick={handleClose} variant="outlined" >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentEspace;