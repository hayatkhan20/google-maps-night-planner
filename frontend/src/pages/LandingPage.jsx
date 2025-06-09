import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Paper, InputAdornment,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TimePicker } from "@mui/x-date-pickers";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_API_KEY = "AIzaSyC-bTDWLQV4S7Ldl11vKfk2TMJzCkYJuiM"; // Replace with your key

export default function LandingPage() {
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [autoComplete, setAutoComplete] = useState(null);

  // Canada Day July 1st, 2pm�9pm
  const canadaDay = new Date(new Date().getFullYear(), 6, 1);
  const [startTime, setStartTime] = useState(new Date(canadaDay.setHours(14, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(canadaDay.setHours(21, 0, 0, 0)));
  const [typeOfPeople, setTypeOfPeople] = useState("");
  const [numLocations, setNumLocations] = useState(1);

  const navigate = useNavigate();

  // Google Maps/Places script
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["places"]
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (city) return; // Don't overwrite if user typed

    // Ask for geolocation
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      // Reverse geocode to city
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const cityComponent = data.results[0]?.address_components.find(c =>
          c.types.includes("locality")
        );
        if (cityComponent) {
          setCity(cityComponent.long_name);
          setCityInput(cityComponent.long_name);
        }
      } catch (e) { /* ignore */ }
    }, () => {});
    // eslint-disable-next-line
  }, [isLoaded]);

  // Google Autocomplete city select
  const handlePlaceChanged = () => {
    if (autoComplete) {
      const place = autoComplete.getPlace();
      const cityName = place.address_components?.find(c =>
        c.types.includes("locality")
      )?.long_name || place.name;
      setCity(cityName);
      setCityInput(cityName);
    }
  };

  const handleSearch = () => {
    navigate("/plan", {
      state: {
        city,
        date: "Canada Day (July 1st)",
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        typeOfPeople,
        numLocations,
      }
    });
  };

  if (!isLoaded) {
    return <Box sx={{ p: 4, color: "#fff" }}>Loading...</Box>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        bgcolor: "#000",
        position: "relative",
      }}>

        <Box
          sx={{
            position: "absolute",
            top: { xs: 20, md: 32 },
            right: { xs: 10, md: 38 },
            width: { xs: "88vw", sm: 420, md: 420 },
            background: "rgba(30,30,30,0.96)",
            border: "2px solid #ff7c2a",
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            zIndex: 100,
            boxShadow: "0 6px 32px #111c",
            color: "#fff"
          }}
        >
          <Typography variant="h6" fontWeight={600} sx={{ color: "#ff7c2a", mb: 1 }}>
            What & How Are You Celebrating?
          </Typography>
          <Typography variant="body1" fontWeight={400}>
            Use our AI Event Technology to plan your Canada Day to celebrate with similar people, socializing the same way as you are.
            <br /><br />
            Simply select whether you’d like to go out with other <b>Singles</b>, <b>Couples</b> or with other <b>Families</b> and how many venues you’d like to go to.
          </Typography>
        </Box>


        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          height: "100vh",
          pl: { xs: 2, md: 10 },
          pr: 2,
          zIndex: 2,
          position: "relative",
        }}>
          <Typography variant="h3" fontWeight={700} sx={{
            color: "#fff", mb: 2, textShadow: "2px 4px 12px #333"
          }}>
            WHERE & WHEN ARE<br /> YOU CELEBRATING?
          </Typography>
          <Typography variant="h5" fontWeight={500} sx={{
            color: "#ff7c2a", mb: 4, textShadow: "2px 4px 12px #222"
          }}>
            Canada Day - July 1st
          </Typography>

          <Box sx={{ width: { xs: 220, md: 320 }, mb: 3 }}>
            <img
              src="/Ottawa.PNG"
              alt="Ottawa Canada Day"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                margin: "0 auto"
              }}
            />
          </Box>



          <Paper elevation={8} sx={{
            py: 2, px: 2, borderRadius: 3,
            display: "flex", flexDirection: "row", alignItems: "center", gap: 2,
            minWidth: { xs: "90vw", sm: 650, md: 900 },
            background: "#181818", // dark background for form
            color: "#fff"
          }}>
            {/* Google Places Autocomplete for City */}
            <Autocomplete
              onLoad={ac => setAutoComplete(ac)}
              onPlaceChanged={handlePlaceChanged}
              fields={['address_components', 'name']}
              types={['(cities)']}
            >
              <TextField
                label="City"
                value={cityInput}
                onChange={e => {
                  setCityInput(e.target.value);
                  setCity(e.target.value);
                }}
                variant="outlined"
                sx={{
                  width: 210,
                  background: "#181818",
                  borderRadius: 1,
                  color: "#fff"
                }}
                InputLabelProps={{ style: { color: "#bbb" } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: "#ff7c2a" }} />
                    </InputAdornment>
                  ),
                  style: { color: "#fff" }
                }}
                autoComplete="off"
              />
            </Autocomplete>
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={newValue => setStartTime(newValue)}
              slotProps={{
                textField: {
                  variant: "outlined",
                  sx: {
                    width: 140, background: "#181818", borderRadius: 1,
                    color: "#fff"
                  },
                  InputLabelProps: { style: { color: "#bbb" } },
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon sx={{ color: "#ff7c2a" }} />
                      </InputAdornment>
                    ),
                    style: { color: "#fff" }
                  }
                }
              }}
            />
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={newValue => setEndTime(newValue)}
              slotProps={{
                textField: {
                  variant: "outlined",
                  sx: {
                    width: 140, background: "#181818", borderRadius: 1,
                    color: "#fff"
                  },
                  InputLabelProps: { style: { color: "#bbb" } },
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon sx={{ color: "#ff7c2a" }} />
                      </InputAdornment>
                    ),
                    style: { color: "#fff" }
                  }
                }
              }}
            />
            <FormControl sx={{ minWidth: 170 }}>
              <InputLabel sx={{ color: "#bbb" }}>Type of People</InputLabel>
              <Select
                value={typeOfPeople}
                label="Type of People"
                onChange={e => setTypeOfPeople(e.target.value)}
                sx={{ color: "#fff" }}
                MenuProps={{ PaperProps: { sx: { bgcolor: "#111", color: "#fff" } } }}
              >
                <MenuItem value="singles">Singles</MenuItem>
                <MenuItem value="couples">Couples</MenuItem>
                <MenuItem value="families">Families (No Alcohol)</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: "#bbb" }}>Number of Locations</InputLabel>
              <Select
                value={numLocations}
                label="Number of Locations"
                onChange={e => setNumLocations(Number(e.target.value))}
                sx={{ color: "#fff" }}
                MenuProps={{ PaperProps: { sx: { bgcolor: "#111", color: "#fff" } } }}
              >
                <MenuItem value={1}>One location is fine</MenuItem>
                {[2, 3, 4, 5].map(i => (
                  <MenuItem value={i} key={i}>{i}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              onClick={handleSearch}
              variant="contained"
              sx={{
                ml: 2,
                px: 4,
                py: 2,
                fontWeight: 700,
                fontSize: "1.08rem",
                borderRadius: 2,
                boxShadow: "0 3px 18px 0px #ee3f6b44",
                background: "linear-gradient(90deg,#e43a6e,#ff7c2a 90%)",
                color: "#fff"
              }}
              disabled={!city || !typeOfPeople}
            >
              PLAN MY NIGHT
            </Button>
          </Paper>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
