import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
} from '@mui/material';

const AjouteEspace = ({ open, handleClose, paymentDetails, onSubmitPayment }) => {
  const [espaceAmount, setEspaceAmount] = useState(paymentDetails?.amount || '');

  const handlePaymentSubmit = () => {
    const paymentData = {
      montant_espace: parseFloat(espaceAmount),
    };
    onSubmitPayment(paymentData); // Send back data to parent
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
      <DialogTitle   sx={{ fontSize: '1.6rem', fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}>
        Détails du Paiement en Espèces
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Montant"
          type="number"
          value={espaceAmount}
          onChange={(e) => setEspaceAmount(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePaymentSubmit} variant="contained" sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
          Valider Paiement
        </Button>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AjouteEspace;