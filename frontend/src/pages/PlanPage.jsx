import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button,
  CircularProgress
} from "@mui/material";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";

// Place libraries array as a top-level const for performance!
const GOOGLE_LIBRARIES = ["places"];
const GOOGLE_API_KEY = "AIzaSyC-bTDWLQV4S7Ldl11vKfk2TMJzCkYJuiM";

// Helper for venue image
function getPhotoUrl(photoRef, apiKey) {
  if (!photoRef) return "";
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}`;
}

export default function PlanPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const mapRef = useRef(null);

  const [center, setCenter] = useState({ lat: 45.4215, lng: -75.6998 }); // Default: Ottawa
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Load Google Maps JS API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  // Fetch venues from backend based on all search criteria
  useEffect(() => {
    async function fetchVenues() {
      if (!state?.city) return;
      setLoading(true);
      setSelectedIndex(null);
      try {
        const params = new URLSearchParams({
          city: state.city,
          typeOfPeople: state.typeOfPeople || "singles",
          numLocations: state.numLocations || 1,
          date: state.date || "",
          time: state.time || "",
        }).toString();

        const res = await fetch(
          "https://google-maps-night-planner.onrender.com/api/places?${params}"
        );
        const data = await res.json();
        setVenues(data);

        // Center map on first result (or fallback to Ottawa)
        if (data.length > 0) {
          setCenter({ lat: data[0].lat, lng: data[0].lng });
        }
      } catch (err) {
        setVenues([]);
      }
      setLoading(false);
    }
    fetchVenues();
    // eslint-disable-next-line
  }, [state?.city, state?.typeOfPeople, state?.numLocations, state?.date, state?.time]);

  // Handle venue selection
  const handleSelectVenue = (idx) => setSelectedIndex(idx);

 

const handleNext = () => {
  // If nothing is selected, you can default to 0 or block navigation
  const idx = selectedIndex ?? 0;
  navigate("/order", {
    state: {
      venues,
      selectedIndex: idx,
      crawlInfo: {
        city: state.city,
        date: state.date,
        startTime: state.startTime,
        endTime: state.endTime,
        typeOfPeople: state.typeOfPeople,
        numLocations: state.numLocations
      }
    }
  });
};



  // Back to search
  const handleBack = () => navigate(-1);

  // For Polyline path (yellow line between all venues)
  const polylinePath = venues.map(v => ({ lat: v.lat, lng: v.lng }));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        bgcolor: "#000",
      }}
    >
      {/* Map Section */}
      <Box sx={{ flex: 2, minWidth: 0 }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={13}
            mapTypeId="roadmap"
            onLoad={map => { mapRef.current = map; }}
            options={{
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#181818' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#eeeeee' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#181818' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#232323' }] },
                { featureType: 'poi', stylers: [{ visibility: "off" }] },
              ],
              backgroundColor: "#181818"
            }}
          >
            {/* Polyline for route */}
            {polylinePath.length > 1 && (
              <Polyline
                path={polylinePath}
                options={{
                  strokeColor: "#ffd700", // yellow
                  strokeOpacity: 0.9,
                  strokeWeight: 6,
                  icons: [],
                }}
              />
            )}
            {venues.map((venue, i) => (
              <Marker
                key={venue.place_id}
                position={{ lat: venue.lat, lng: venue.lng }}
                title={venue.name}
                icon={{
                  url: "/not-like-us-marker.png", // In /public
                  scaledSize: isLoaded ? new window.google.maps.Size(48, 48) : undefined,
                  anchor: isLoaded ? new window.google.maps.Point(24, 48) : undefined,
                }}
                zIndex={selectedIndex === i ? 2 : 1}
                onClick={() => handleSelectVenue(i)}
              />
            ))}
          </GoogleMap>
        ) : (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>

      {/* Sidebar Section */}
      <Paper
        sx={{
          flex: 1.15,
          minWidth: { xs: 260, sm: 340, md: 410 },
          height: "100vh",
          p: 2,
          borderRadius: 0,
          boxShadow: "none",
          overflowY: "auto",
          bgcolor: "#181818",
          color: "#fff",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Top Nav */}
        <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
          <Button onClick={handleBack} variant="outlined" size="small" sx={{
            mr: 2,
            color: "#fff",
            borderColor: "#444",
            ":hover": { borderColor: "#e43a6e", color: "#e43a6e" }
          }}>
            ← Back
          </Button>
          <Typography variant="h5" fontWeight={700} sx={{ flex: 1, color: "#ff7c2a" }}>
            Results
          </Typography>
          <Button
            onClick={handleNext}
            variant="contained"
            size="small"
            sx={{
              ml: 1,
              fontWeight: 700,
              px: 3,
              color: "#fff",
              background: "linear-gradient(90deg,#e43a6e,#ff7c2a 90%)"
            }}
          >
            Next →
          </Button>
        </Box>
        <Divider sx={{ mb: 2, borderColor: "#333" }} />

        {/* Results */}
        {loading ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "#e43a6e" }} />
          </Box>
        ) : venues.length === 0 ? (
          <Typography sx={{ color: "#ff7c2a" }}>
            No bars or restaurants found for your criteria.
          </Typography>
        ) : (
          <List>
            {venues.map((venue, i) => (
              <ListItem
                key={venue.place_id}
                alignItems="flex-start"
                sx={{
                  mb: 2,
                  cursor: "pointer",
                  border: selectedIndex === i ? "2px solid #e43a6e" : "2px solid #232323",
                  borderRadius: 2,
                  bgcolor: selectedIndex === i ? "#222" : "inherit",
                  boxShadow: selectedIndex === i ? "0 4px 18px #e43a6e22" : undefined
                }}
                onClick={() => handleSelectVenue(i)}
              >
                <Avatar
                  variant="rounded"
                  src={venue.photoRef ? getPhotoUrl(venue.photoRef, GOOGLE_API_KEY) : venue.icon}
                  sx={{ width: 68, height: 68, mr: 2, borderRadius: 2, bgcolor: "#232323" }}
                />
                <ListItemText
                  primary={
                    <span style={{ fontWeight: 700, fontSize: "1.13rem", color: "#fff" }}>{venue.name}</span>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: "#ff7c2a", fontWeight: 500 }}>
                        {venue.address}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 0.2 }}>
                        {/* Star ratings */}
                        {venue.rating && (
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "#ffd700",
                              mr: 1,
                              fontSize: "1.15rem"
                            }}>
                            {venue.rating} {"★".repeat(Math.round(venue.rating))}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ ml: 2, color: "#bbb" }}>
                          {venue.types?.[1] || venue.types?.[0]}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
