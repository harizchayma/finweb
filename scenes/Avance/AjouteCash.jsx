import React, { useState } from 'react';
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
const AjouteCash = ({ open, handleClose, paymentDetails, onSubmitPayment }) => {
    const [cashAmount, setCashAmount] = useState(paymentDetails?.amount || ''); // Use optional chaining
    const [bankName, setBankName] = useState(paymentDetails?.banque_virement || ''); // Use optional chaining
  
    const handlePaymentSubmit = () => {
      const paymentData = {
        montant_virement: parseFloat(cashAmount),
        banque_virement: bankName,
      };
      onSubmitPayment(paymentData); // Send back data to parent
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
      <DialogTitle sx={{ fontSize: '1.6rem', fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}>
        Détails du Paiement
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Montant"
          type="number"
          value={cashAmount}
          onChange={(e) => setCashAmount(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Typography variant="h6" sx={{ margin: "12px 0", fontWeight: 'bold', color: '#333' }}>
          Sélectionnez la Banque
        </Typography>
        <FormControl fullWidth margin="normal">
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
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePaymentSubmit}  variant="contained" sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
          Valider Paiement
        </Button>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AjouteCash;