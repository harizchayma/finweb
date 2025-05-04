import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import "moment/locale/fr";
import {
  Grid,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";

moment.locale("fr");
registerLocale("fr", fr);

const VehicleSelectionCalendar = () => {
  // Initialize dates to a period where you expect some bookings based on your data
  const [startDate, setStartDate] = useState(new Date(2025, 4, 3)); // Month is 0-indexed (May is 4)
  const [endDate, setEndDate] = useState(new Date(2025, 4, 8));

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  const fetchAvailableVehicles = async (start, end) => {
    if (!start || !end) {
      setAvailableVehicles([]);
      return;
    }
    setLoading(true);
    try {
      const formattedStart = moment(start).format("YYYY-MM-DD");
      const formattedEnd = moment(end).format("YYYY-MM-DD");

      const [vehiclesRes, contractsRes, reservationsRes] = await Promise.all([
        fetch("http://localhost:7001/vehicules"),
        fetch(
          `http://localhost:7001/contrat?startDate=${formattedStart}&endDate=${formattedEnd}`
        ),
        fetch(
          `http://localhost:7001/reservation?startDate=${formattedStart}&endDate=${formattedEnd}`
        ),
      ]);

      if (!vehiclesRes.ok || !contractsRes.ok || !reservationsRes.ok) {
        throw new Error("Échec de récupération des données depuis l'API.");
      }

      const [vehiclesData, contractsData, reservationsData] = await Promise.all(
        [vehiclesRes.json(), contractsRes.json(), reservationsRes.json()]
      );

      const searchStart = moment(start);
      const searchEnd = moment(end).endOf("day"); // Include the whole end day

      const bookedVehicleNumbersFromContracts =
        contractsData?.data
          ?.filter((contract) => {
            if (!contract?.Date_debut || !contract?.Date_retour) return false;

            // Parse the date part directly and then add the time
            const contractStartDate = moment(contract.Date_debut);
            const [ch, cm] = contract.Heure_debut.split(":").map(Number); // Split hour and minute
            const contractStart = contractStartDate.clone().hour(ch).minute(cm); // Set hour and minute

            const contractEndDate = moment(contract.Date_retour);
            const [rh, rm] = contract.Heure_retour.split(":").map(Number); // Split hour and minute
            const contractEnd = contractEndDate.clone().hour(rh).minute(rm); // Set hour and minute

            // Check for overlap: start1 is before end2 AND end1 is after start2
            return contractStart.isBefore(searchEnd) && contractEnd.isAfter(searchStart);
          })
          ?.map((contract) => contract.num_immatriculation) || [];

      // Filter reservations to only include 'en attent' status for booking check
      const bookedVehicleNumbersFromReservations =
        reservationsData?.data
          ?.filter((reservation) => {
            if (!reservation?.Date_debut || !reservation?.Date_retour) {
              return false;
            }

            // Parse the date part directly and then add the time
            const reservationStartDate = moment(reservation.Date_debut);
            const [rsh, rsm] = reservation.Heure_debut.split(":").map(Number); // Split hour and minute
            const reservationStart = reservationStartDate.clone().hour(rsh).minute(rsm); // Set hour and minute

            const reservationEndDate = moment(reservation.Date_retour);
            const [rrh, rrm] = reservation.Heure_retour.split(":").map(Number); // Split hour and minute
            const reservationEnd = reservationEndDate.clone().hour(rrh).minute(rrm); // Set hour and minute

            // Only consider 'en attent' reservations as booked for this availability check
            // Check for overlap: start1 is before end2 AND end1 is after start2
            return (
              reservation.action === "en attent" &&
              reservationStart.isBefore(searchEnd) &&
              reservationEnd.isAfter(searchStart)
            );
          })
          ?.map((reservation) => reservation.num_immatriculation) || [];

      // Combine booked vehicles from contracts and 'en attent' reservations
      const allBookedVehicles = [
        ...new Set([
          ...bookedVehicleNumbersFromContracts,
          ...bookedVehicleNumbersFromReservations,
        ]),
      ];

      // Filter all vehicles to find those that are NOT in the booked list
      const available =
        vehiclesData?.data?.filter(
          (v) => !allBookedVehicles.includes(v.num_immatriculation)
        ) || [];

      setAvailableVehicles(available);

      // Optional: Add logging here to see what's being filtered
      console.log("Selected Date Range:", formattedStart, "to", formattedEnd);
      console.log("Contracts Data:", contractsData?.data);
      console.log("Reservations Data:", reservationsData?.data);
      console.log("Booked from Contracts:", bookedVehicleNumbersFromContracts);
      console.log("Booked from Reservations (en attent):", bookedVehicleNumbersFromReservations);
      console.log("All Booked Vehicles:", allBookedVehicles);
      console.log("Available Vehicles:", available);


    } catch (error) {
      console.error(error);
      setSnackbarMessage(
        "Erreur lors de la récupération des véhicules disponibles."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setAvailableVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    // Fetch available vehicles immediately when dates change
    fetchAvailableVehicles(start, end);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch available vehicles on initial component mount and when startDate or endDate change
  useEffect(() => {
    fetchAvailableVehicles(startDate, endDate);
  }, [startDate, endDate]); // Dependency array ensures this runs when dates change

  return (
    <Container maxWidth="lg" sx={{ padding: 1, backgroundColor: "#f5f1f1" }}>
      <Typography
        variant="h2"
        sx={{
          marginTop: 4,
          marginBottom: 4,
          fontWeight: "bold",
          color: "#0483cc",
          textAlign: "center",
        }}
      >
        les véhicules disponible
      </Typography>
      <Typography
        variant="h4"
        sx={{
          marginBottom: 1,
          color: "#db0aa3",
          textAlign: "left",
        }}
      >
        Sélectionnez une période sur le calendrier pour voir les véhicules
        disponibles
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "70px", // Adjust as needed for calendar positioning
            }}
          >
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              locale="fr"
              dateFormat="dd/MM/yyyy"
              inline // Display the calendar directly
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "#fff",
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          {loading ? (
            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Display selected date range */}
              {startDate && endDate && (
                <Typography
                  variant="h5"
                  sx={{
                    marginTop: 1,
                    color: "#0371a0",
                    textAlign: "center",
                    marginBottom: 3,
                  }}
                >
                  Véhicules disponibles du{" "}
                  {startDate ? moment(startDate).format("DD-MM-YYYY") : ""} au{" "}
                  {endDate ? moment(endDate).format("DD-MM-YYYY") : ""} :
                </Typography>
              )}
              <Grid container spacing={2}>
                {availableVehicles.length > 0 ? (
                  availableVehicles.map((vehicle) => (
                    <Grid item xs={12} sm={6} md={4} key={vehicle.id_vehicule}>
                      <Paper
                        elevation={3}
                        sx={{
                          padding: 2,
                          borderRadius: 5,
                          backgroundColor: "#fff",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                          height: "100%", // Make cards the same height
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between", // Distribute space
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            marginBottom: 0.6,
                            fontWeight: "bold",
                            color: "#195ad2",
                          }}
                        >
                          {vehicle.num_immatriculation}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ marginBottom: 0.4, color: "#353535" }}
                        >
                          {vehicle.modele} {vehicle.marque}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          Prix par jour: {vehicle.prix_jour} dt
                        </Typography>
                        {/* You can add more vehicle details here */}
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  // Message when no vehicles are available for the selected period
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#180adb",
                      marginTop: 2,
                      textAlign: "center",
                      width: "100%", // Center the text within the grid item
                    }}
                  >
                    {startDate && endDate
                      ? "Aucun véhicule disponible pour la période sélectionnée."
                      : "Sélectionnez une période pour voir les véhicules disponibles."}
                  </Typography>
                )}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
      {/* Snackbar for displaying messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={handleSnackbarClose}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VehicleSelectionCalendar;