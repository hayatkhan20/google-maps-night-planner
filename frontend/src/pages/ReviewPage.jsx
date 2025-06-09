import React, { useRef, useState } from "react";
import {
  Box, Paper, Typography, Divider, List, ListItem, ListItemText, Avatar, Button, Grid
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import PaymentIcon from "@mui/icons-material/Payment";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";

const GOOGLE_API_KEY = "AIzaSyC-bTDWLQV4S7Ldl11vKfk2TMJzCkYJuiM"; // <<-- replace
const SHIRT_LOGO = "/shirt-logo.png";
const MAP_MARKER = "/not-like-us-marker.png";

function getPhotoUrl(photoRef, apiKey) {
  if (!photoRef) return "";
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}`;
}

export default function ReviewPage() {
  const { state } = useLocation();
  const venues = state?.venues || [];
  const selectedIndex = state?.selectedIndex ?? 0;
  const crawlInfo = state?.crawlInfo || {};
  const orderItems = state?.orderItems || [];
  const user = state?.userDetails || {};
  const navigate = useNavigate();

  const polylinePath = venues.map(v => ({ lat: v.lat, lng: v.lng }));
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["places"]
  });

  const [loading, setLoading] = useState(false);
  const handlePrint = () => window.print();
  const handleDownloadPDF = () => window.print(); // Replace with real PDF logic if needed

  const handleProceedPayment = async () => {
  setLoading(true);

  // Construct a single object for the backend
  const orderPayload = {
    orderItems,            // array of items, with type, color, size, image, etc.
    user,                  // shipping/user info
    crawlInfo,             // bar crawl info
    venues,                // (optional) full crawl venues
  };

  try {
    const res = await fetch("https://google-maps-night-planner.onrender.com/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),   // not {order: orderPayload}, just orderPayload
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.open(data.url, "_blank");
    } else {
      alert("Stripe session creation failed.");
    }
  } catch (e) {
    setLoading(false);
    alert("Error: " + e.message);
  }
};


  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: "#000",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      py: { xs: 2, md: 6 },
      px: { xs: 0, md: 2 }
    }}>
      <Paper sx={{
        width: "100%",
        maxWidth: 1480,
        minHeight: "90vh",
        borderRadius: 4,
        px: { xs: 1, md: 4 },
        py: { xs: 2, md: 4 },
        bgcolor: "#222",
        boxShadow: 8,
        display: "flex",
        flexDirection: "column"
      }}>
        {/* --- TOP: Map & Venue List --- */}
        <Grid container spacing={2}>
          {/* Map (60%) */}
          <Grid item xs={12} md={4.8}>
            <Box sx={{
              bgcolor: "#111", borderRadius: 3, p: 2,
      border: "3px solid #ff7c2a", minHeight: 420, height: "46vh", maxHeight: 560
            }}>
              <Typography variant="h5" sx={{ color: "#ff7c2a", fontWeight: 700, mb: 1 }}>
                Your Crawl Route
              </Typography>
              {isLoaded && venues.length > 0 ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "340px", borderRadius: 8 }}
                  center={polylinePath[0]}
                  zoom={13}
                  options={{
                    styles: [
                      { elementType: 'geometry', stylers: [{ color: '#181818' }] },
                      { elementType: 'labels.text.fill', stylers: [{ color: '#eeeeee' }] },
                      { elementType: 'labels.text.stroke', stylers: [{ color: '#181818' }] },
                      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#232323' }] },
                      { featureType: 'poi', stylers: [{ visibility: "off" }] },
                    ],
                    disableDefaultUI: true,
                    backgroundColor: "#181818"
                  }}
                >
                  {polylinePath.length > 1 && (
                    <Polyline
                      path={polylinePath}
                      options={{
                        strokeColor: "#ffd700",
                        strokeOpacity: 0.9,
                        strokeWeight: 8,
                      }}
                    />
                  )}
                  {venues.map((venue, i) => (
                    <Marker
                      key={venue.place_id}
                      position={{ lat: venue.lat, lng: venue.lng }}
                      title={venue.name}
                      icon={{
                        url: MAP_MARKER,
                        scaledSize: isLoaded ? new window.google.maps.Size(54, 54) : undefined,
                        anchor: isLoaded ? new window.google.maps.Point(27, 54) : undefined,
                      }}
                      zIndex={10 + i}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <Box sx={{
                  color: "#ff7c2a",
                  width: "100%",
                  height: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem"
                }}>
                  No route found.
                </Box>
              )}
            </Box>
          </Grid>
          {/* Venue List (30%) */}
          <Grid item xs={12} md={7.2}>
            <Box sx={{
              bgcolor: "#232323", borderRadius: 3, p: 2, minHeight: 420, height: "46vh", maxHeight: 560,
      overflowY: "auto"
            }}>
              <Typography variant="h5" sx={{ color: "#ff7c2a", fontWeight: 700, mb: 1 }}>
                Venue List & Times
              </Typography>
              <List sx={{ maxHeight: 370, overflowY: "auto", pr: 1 }}>
                {venues.map((venue, idx) => (
                  <ListItem key={venue.place_id} alignItems="flex-start" sx={{
                    mb: 1.2, borderRadius: 2, px: 1.5,
                    bgcolor: "#181818",
                    boxShadow: idx === selectedIndex ? "0 0 0 2px #ff7c2a" : undefined,
                  }}>
                    <Avatar
                      src={venue.photoRef ? getPhotoUrl(venue.photoRef, GOOGLE_API_KEY) : venue.icon}
                      sx={{ width: 48, height: 48, mr: 2, borderRadius: 2, bgcolor: "#232323" }}
                      variant="rounded"
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1.04rem" }}>
                            {venue.name}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.98rem",
                              color: "#ff7c2a",
                              fontWeight: 700,
                              ml: 1,
                              bgcolor: "#222",
                              px: 1.2,
                              borderRadius: 2
                            }}
                          >
                            {crawlInfo.typeOfPeople}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ color: "#ffd700", fontWeight: 700, display: "inline-block" }}>
                            {venue.rating ? `${venue.rating} ` : ""}
                            {venue.rating && "★".repeat(Math.round(venue.rating))}
                          </Typography>
                          <Typography variant="body2" sx={{ ml: 2, color: "#bbb", display: "inline-block" }}>
                            {venue.address}
                          </Typography>
                          <Typography variant="body2" sx={{ ml: 2, color: "#bbb", display: "inline-block" }}>
                            {venue.types?.[1] || venue.types?.[0]}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
        </Grid>

        {/* --- ORDER SUMMARY + SHIPPING --- */}
        <Divider sx={{ my: 4, borderColor: "#444" }} />
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={5.3}>
  <Typography variant="h6" sx={{ color: "#ff7c2a", mb: 1.2, fontWeight: 600 }}>
    Order Summary
  </Typography>
  <Box>
    {orderItems.length === 0 ? (
      <Typography sx={{ color: "#fff" }}>No items selected.</Typography>
    ) : (
      orderItems.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex", alignItems: "center", gap: 2, border: "2px solid #ff7c2a",
            borderRadius: 3, p: 1.5, minHeight: 96, bgcolor: "#181818",
            mb: 2
          }}
        >
          <img
            src={item.image}
            alt={`${item.type} ${item.color} ${item.size}`}
            style={{
              width: 84, height: 84, objectFit: "contain",
              background: "#fff", borderRadius: 8, border: "2px solid #ff7c2a"
            }}
          />

          <Box sx={{ pl: 2 }}>
            <Typography>Type: <b style={{ color: "#ff7c2a" }}>{item.type}</b></Typography>
            <Typography>Color: <b style={{ color: "#ff7c2a" }}>{item.colorName}</b></Typography>
            <Typography>Size: <b style={{ color: "#ff7c2a" }}>{item.size}</b></Typography>
            <Typography>Quantity: <b style={{ color: "#ff7c2a" }}>{item.quantity}</b></Typography>
            <Typography>Subtotal: <b style={{ color: "#ffd700" }}>${(24.99 * (item.quantity || 1)).toFixed(2)}</b></Typography>
          </Box>
        </Box>
      ))
    )}
    {/* Total at the bottom */}
    {orderItems.length > 0 && (
      <Typography
        variant="h6"
        sx={{ color: "#ffd700", textAlign: "right", mt: 1, pr: 2, fontWeight: 700 }}
      >
        Total: $
        {orderItems
          .reduce((acc, item) => acc + 24.99 * (item.quantity || 1), 0)
          .toFixed(2)}
      </Typography>
    )}
  </Box>
</Grid>

          <Grid item xs={12} md={6.7}>
            <Typography variant="h6" sx={{ color: "#ff7c2a", mb: 1.2, fontWeight: 600 }}>
              Shipping Info
            </Typography>
            <Box sx={{
              p: 1.5,
              border: "2px solid #ff7c2a",
              borderRadius: 3,
              minHeight: 120,
              bgcolor: "#181818",
              color: "#fff"
            }}>
              <Typography>Name: <b>{user.partyName || user.fullName}</b></Typography>
              <Typography>Email: <b>{user.email}</b></Typography>
              <Typography>Phone: <b>{user.phone}</b></Typography>
              <Typography>Address: <b>{user.address}</b></Typography>
            </Box>
          </Grid>
        </Grid>

        {/* --- ACTION BUTTONS --- */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 3, mt: 4,
          flexWrap: "wrap", justifyContent: "center"
        }}>
          <Button
            onClick={handleDownloadPDF}
            startIcon={<PictureAsPdfIcon />}
            sx={{
              bgcolor: "#ff7c2a",
              color: "#fff",
              fontWeight: 700,
              px: 4, py: 1.7,
              fontSize: "1.15rem",
              borderRadius: 2,
              "&:hover": { bgcolor: "#e43a6e" }
            }}
          >
            Download Pub Crawl Map
          </Button>
          <Button
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            sx={{
              bgcolor: "#222",
              color: "#ffd700",
              fontWeight: 700,
              px: 4, py: 1.7,
              fontSize: "1.15rem",
              borderRadius: 2,
              border: "2px solid #ffd700",
              "&:hover": { bgcolor: "#444" }
            }}
          >
            Print
          </Button>
          <Button
            onClick={handleProceedPayment}
            startIcon={<PaymentIcon />}
            disabled={loading}
            sx={{
              bgcolor: "#2b85e2",
              color: "#fff",
              fontWeight: 700,
              px: 4, py: 1.7,
              fontSize: "1.15rem",
              borderRadius: 2,
              "&:hover": { bgcolor: "#2163a2" }
            }}
          >
            {loading ? "Redirecting..." : "Proceed to Payment"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
