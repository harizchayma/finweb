import React from "react";
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
  Grid,
  Card,
  CardContent,
  Typography,
  InputAdornment,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import BuildIcon from "@mui/icons-material/Build";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SpeedIcon from "@mui/icons-material/Speed";
import PeopleIcon from "@mui/icons-material/People";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";

function AjouteVehicule({
  open,
  handleClose,
  newVehicle,
  setNewVehicle,
  categories,
  handleAddVehicle,
}) {
  const handleChange = (field) => (event) => {
    setNewVehicle({ ...newVehicle, [field]: event.target.value });
  };

  const marques = [
    "Alfa Romeo",
    "Audi",
    "BMW",
    "Citroën",
    "Dacia",
    "Fiat",
    "Mercedes-Benz",
    "Peugeot",
    "Renault",
    "Volkswagen",
    "Chery",
    "Hyundai",
    "Kia",
    "Nissan",
    "Suzuki",
    "Toyota",
    "Chevrolet",
    "Ford",
    "Jeep",
  ];

  const lieuxCertification = [
    "Tunis",
    "Sfax",
    "Sousse",
    "Gabès",
    "Bizerte",
    "Ariana",
    "Kairouan",
    "Gafsa",
    "Nabeul",
    "Monastir",
    "Mahdia",
    "Médenine",
    "Tozeur",
    "Kasserine",
    "Zarzis",
    "Hammamet",
    "Djerba",
    "Ben Arous",
    "Manouba",
  ];

  const energies = ["Essence", "Diesel", "Gaz", "Électrique", "Hybride"];
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVehicle({ ...newVehicle, image: reader.result }); // Set the base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction réutilisable pour générer un champ de sélection (Select)
  const renderSelectField = ({ label, field, options, icon }) => (
    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={newVehicle[field] || ""}
        onChange={handleChange(field)}
        label={label}
        startAdornment={
          icon && <InputAdornment position="start">{icon}</InputAdornment>
        }
        sx={{
          width: "250px",
          height: "40px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1976d2",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#115293",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0d47a1",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.id_categorie || option}
            value={option.id_categorie || option}
          >
            {option.catégorie || option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Fonction spécifique pour le champ de sélection des catégories
  const renderCategorySelect = ({ icon }) =>
    renderSelectField({
      label: "Catégorie",
      field: "id_categorie",
      options: categories,
      icon: icon,
    });

  // Fonction spécifique pour les autres champs de sélection (marque, lieu, énergie)
  const renderOtherSelectList = ({ label, field, options, icon }) =>
    renderSelectField({
      label: label,
      field: field,
      options: options,
      icon: icon,
    });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontSize: "1.3rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "#d21919",
          marginBottom: 2,
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        Ajouter un Véhicule
      </DialogTitle>

      <DialogContent sx={{ p: 1 }}>
        <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2, p: 0.6 }}>
          <CardContent>
            {/* Identification du Véhicule Section */}
            <Typography
              variant="h6"
              style={{
                margin: "0 0 15px 0",
                color: "#1976d2",
                fontWeight: "600",
                fontSize: "1rem",
                textAlign: "center",
              }}
            >
              Identification du Véhicule
            </Typography>
            <Grid container spacing={1}>
              {[
                {
                  label: "Numéro Immatriculation",
                  field: "num_immatriculation",
                  icon: <ConfirmationNumberIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Numéro de chassis",
                  field: "n_serie_du_type",
                  icon: <BuildIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Marque",
                  field: "marque",
                  isSelect: true,
                  options: marques,
                  icon: <DirectionsCarIcon sx={{ color: "#1976d2" }} />,
                  render: (props) => renderOtherSelectList(props),
                },
                {
                  label: "Modele",
                  field: "modele",
                  icon: <DeviceHubIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Prix par jour",
                  field: "prix_jour",
                  icon: <BuildIcon sx={{ color: "#1976d2" }} />,
                },
              ].map(({ label, field, icon, isSelect, options, render }) => (
                <Grid item xs={12} sm={4} key={field}>
                  {isSelect ? (
                    render({ label, field, options, icon })
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      label={label}
                      value={newVehicle[field] || ""}
                      onChange={handleChange(field)}
                      InputProps={{
                        style: { width: "250px", height: "40px" },
                        startAdornment: (
                          <InputAdornment position="start">
                            {icon}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 1,
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#1976d2" },
                          "&:hover fieldset": { borderColor: "#115293" },
                          "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                        },
                      }}
                    />
                  )}
                </Grid>
              ))}
            </Grid>

            {/* Spécifications du Véhicule Section */}
            <Typography
              variant="h6"
              style={{
                margin: "0 0 15px 0",
                color: "#1976d2",
                fontWeight: "600",
                fontSize: "1rem",
                textAlign: "center",
              }}
            >
              Spécifications du Véhicule
            </Typography>
            <Grid container spacing={1}>
              {[
                {
                  label: "Carrosserie",
                  field: "carrosserie",
                  icon: <BuildIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Énergie",
                  field: "energie",
                  isSelect: true,
                  options: energies,
                  icon: <LocalGasStationIcon sx={{ color: "#1976d2" }} />,
                  render: (props) => renderOtherSelectList(props),
                },
                {
                  label: "Puissance Fiscale",
                  field: "puissance_fiscale",
                  icon: <SpeedIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Nombre de Places",
                  field: "nbr_places",
                  icon: <PeopleIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Cylindrée",
                  field: "cylindree",
                  icon: (
                    <SettingsInputComponentIcon sx={{ color: "#1976d2" }} />
                  ),
                },
              ].map(({ label, field, icon, isSelect, options, render }) => (
                <Grid item xs={12} sm={4} key={field}>
                  {isSelect ? (
                    render({ label, field, options, icon })
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      label={label}
                      value={newVehicle[field] || ""}
                      onChange={handleChange(field)}
                      InputProps={{
                        style: { width: "250px", height: "40px" },
                        startAdornment: (
                          <InputAdornment position="start">
                            {icon}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 1,
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#1976d2" },
                          "&:hover fieldset": { borderColor: "#115293" },
                          "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                        },
                      }}
                    />
                  )}
                </Grid>
              ))}
            </Grid>

            {/* Certification Section */}
            <Typography
              variant="h6"
              style={{
                margin: "0 0 15px 0",
                color: "#1976d2",
                fontWeight: "600",
                fontSize: "1rem",
                textAlign: "center",
              }}
            >
              Certification
            </Typography>
            <Grid container spacing={1}>
              {[
                {
                  label: "Numéro Certificat",
                  field: "num_certificat",
                  icon: <DescriptionIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Lieu Certificat",
                  field: "lieu_certificat",
                  isSelect: true,
                  options: lieuxCertification,
                  icon: <LocationOnIcon sx={{ color: "#1976d2" }} />,
                  render: (props) => renderOtherSelectList(props),
                },
                {
                  label: "Date Certificat",
                  field: "date_certificat",
                  type: "date",
                  icon: <CalendarTodayIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Type Commercial",
                  field: "type_commercial",
                  icon: <DescriptionIcon sx={{ color: "#1976d2" }} />,
                },
                {
                  label: "Catégorie",
                  field: "id_categorie",
                  isSelect: true,
                  options: categories,
                  icon: <CategoryIcon sx={{ color: "#1976d2" }} />,
                  render: (props) => renderCategorySelect(props),
                },
              ].map(
                ({ label, field, icon, isSelect, options, type, render }) => (
                  <Grid item xs={12} sm={4} key={field}>
                    {isSelect ? (
                      render({ label, field, options, icon })
                    ) : (
                      <TextField
                        fullWidth
                        variant="outlined"
                        label={label}
                        type={type || "text"}
                        value={newVehicle[field] || ""}
                        onChange={handleChange(field)}
                        InputLabelProps={
                          type === "date" ? { shrink: true } : {}
                        }
                        InputProps={{
                          style: { width: "250px", height: "40px" },
                          startAdornment: (
                            <InputAdornment position="start">
                              {icon}
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 1,
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#1976d2" },
                            "&:hover fieldset": { borderColor: "#115293" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#0d47a1",
                            },
                          },
                        }}
                      />
                    )}
                  </Grid>
                )
              )}
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions
        sx={{ p: 0.8, display: "flex", justifyContent: "flex-end" }}
      >
        <Grid item xs={12} sm={4}>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button
              variant="contained"
              component="span"
              sx={{
                bgcolor: "green",
                color: "white",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#15c076" },
              }}
            >
             Choisir une image
            </Button>
          </label>
        </Grid>
        <Button
          onClick={handleAddVehicle}
          variant="contained"
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
          onClick={handleClose}
          variant="contained"
          sx={{
            bgcolor: "#d32f2f",
            color: "white",
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#b71c1c" },
          }}
          startIcon={<CancelIcon />}
        >
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AjouteVehicule;
