import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Paper, MenuItem, IconButton, Grid
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";

// ---- Color/size/type definitions ----
const COLORS = [
  { code: "#232323", name: "Black" },
  { code: "#ff0000", name: "Red" },
  { code: "#fff", name: "White" }
];
const HAT_COLORS = [
  { code: "#232323", name: "Black" },
  { code: "#ff0000", name: "Red" },
  { code: "##FFC0CB", name: "Pink" }
];
const SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];
const SHIRT_PRICE = 24.99;

const ITEM_TYPES = [
  { value: "tshirt", label: "T-Shirt" },
  { value: "tanktop", label: "Tank Top" },
  { value: "hat", label: "Hat" }
];

const colorCodeToName = (code) => {
  if (code === "#232323") return "black";
  if (code === "#ff0000") return "red";
  if (code === "#fff") return "white";
  return "black";
};

// Styled color circle
const ColorButton = styled(IconButton)(({ colorselected }) => ({
  border: colorselected === "true" ? "2.5px solid #ff7c2a" : "2px solid #444",
  marginRight: 10,
  width: 34,
  height: 34,
  transition: "border 0.2s"
}));

function ItemPreview({ type, color }) {
  const colorName = colorCodeToName(color);
  const src = `/${type}-${colorName}.png`;
  return (
    <Box sx={{
      width: 74, height: 74, borderRadius: 2,
      background: "#fff",
      border: "2px solid #444", display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      <img
        src={src}
        alt={`${type} ${colorName}`}
        style={{
          width: "90%", height: "90%",
          objectFit: "contain"
        }}
      />
    </Box>
  );
}

export default function OrderPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const venue = state?.venue || state?.venues?.[state?.selectedIndex || 0];

  // NEW: The item currently being customized
  const [newItem, setNewItem] = useState({
    type: "tshirt",
    color: "#232323",
    size: "M",
    quantity: 1,
  });
  // The current order (cart)
  const [orderItems, setOrderItems] = useState([]);

  // User Info
  const [user, setUser] = useState({
    partyName: "",
    userName: "",
    email: "",
    phone: "",
    address: ""
  });

  const [loading, setLoading] = useState(false);

  if (!venue) return <Box p={5} sx={{ color: "#fff" }}>No venue selected.</Box>;

  // Handlers for add item form
  const availableColors = newItem.type === "hat" ? HAT_COLORS : COLORS;

  const handleNewItemChange = (field, value) => {
    if (field === "type") {
      // Reset color to first valid color when changing type
      const validColors = value === "hat" ? HAT_COLORS : COLORS;
      setNewItem(item => ({
        ...item,
        [field]: value,
        color: validColors[0].code
      }));
    } else {
      setNewItem(item => ({
        ...item,
        [field]: value
      }));
    }
  };

  // Add current item to cart
  const handleAddItem = () => {
    const colorName = colorCodeToName(newItem.color);
    setOrderItems(items => [
      ...items,
      { ...newItem, id: Date.now() + Math.random(),
      image: `/${newItem.type}-${colorName}.png`}
    ]);
    // Reset for next
    setNewItem({
      type: "tshirt",
      color: "#232323",
      size: "M",
      quantity: 1,
    });
  };

  // Remove item from cart
  const handleRemoveItem = (id) => {
    setOrderItems(items => items.filter(item => item.id !== id));
  };

  // User Form Handler
  const handleUserChange = (e) =>
    setUser(u => ({ ...u, [e.target.name]: e.target.value }));

  // Order Submission
  const handleOrder = () => {
    if (!user.email || !user.address || !user.userName) {
      alert("Please fill all required fields.");
      return;
    }
    if (orderItems.length === 0) {
      alert("Add at least one item to your order.");
      return;
    }
    // Send all orderItems to review page
    navigate("/review", {
      state: {
        venues: state.venues,
        crawlInfo: state.crawlInfo,
        orderItems,
        userDetails: user,
        selectedIndex: state.selectedIndex
      }
    });
  };

  // ---- Calculate Total ----
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (SHIRT_PRICE * item.quantity), 0
  );

  // ---- Render ----
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        bgcolor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 2, md: 0 },
        px: { xs: 0, md: 0 }
      }}
    >
      <Grid
        container
        sx={{
          height: { xs: "auto", md: "88vh" },
          width: "96vw",
          maxWidth: "1680px",
          alignItems: "stretch",
          justifyContent: "center",
          boxSizing: "border-box"
        }}
        spacing={4}
      >
        {/* Venue & Item Customizer */}
        <Grid item xs={12} md={7.2}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              boxSizing: "border-box",
              bgcolor: "#222",
              color: "#fff"
            }}
            elevation={3}
          >
            {/* Venue Section */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box>
                <img
                  src={
                    venue.photoRef
                      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${venue.photoRef}&key=AIzaSyC-bTDWLQV4S7Ldl11vKfk2TMJzCkYJuiM`
                      : venue.icon || "https://via.placeholder.com/240"
                  }
                  alt={venue.name}
                  style={{
                    width: 148,
                    height: 116,
                    borderRadius: 12,
                    marginRight: 24,
                    objectFit: "cover",
                    background: "#333"
                  }}
                />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={700} sx={{ color: "#fff" }}>
                  {venue.name}
                </Typography>
                <Typography variant="h6" sx={{ color: "#bbb", mb: 1 }}>
                  {venue.address}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ width: "100%", mb: 2, borderBottom: "1.5px solid #444" }} />

            <Typography variant="h5" sx={{ mb: 2, color: "#ff7c2a" }}>
              Add Item to Order
            </Typography>

            {/* New item form */}
            <Paper
              sx={{
                mb: 2, p: 2, background: "#191919", borderRadius: 2,
                border: "2px solid #333", display: "flex", alignItems: "center", gap: 3, boxShadow: "none"
              }}
            >
              <ItemPreview type={newItem.type} color={newItem.color} />

              <Box sx={{ minWidth: 140 }}>
                {/* Item type select */}
                <TextField
                  select
                  label="Type"
                  value={newItem.type}
                  onChange={e => handleNewItemChange("type", e.target.value)}
                  size="small"
                  sx={{
                    minWidth: 100, mb: 1,
                    bgcolor: "#191919", color: "#fff",
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#bbb" }
                  }}
                  InputLabelProps={{ style: { color: "#bbb" } }}
                >
                  {ITEM_TYPES.map(type => (
                    <MenuItem value={type.value} key={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Color circles */}
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Typography sx={{ fontWeight: 500, mr: 1, color: "#aaa" }}>Color:</Typography>
                  {availableColors.map(c => (
                    <ColorButton
                      key={c.code}
                      colorselected={(newItem.color === c.code).toString()}
                      style={{ background: c.code }}
                      onClick={() => handleNewItemChange("color", c.code)}
                    />
                  ))}
                </Box>
              </Box>

              {/* Size, Qty */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <TextField
                  select label="Size" value={newItem.size}
                  onChange={e => handleNewItemChange("size", e.target.value)}
                  size="small"
                  sx={{
                    minWidth: 80, bgcolor: "#191919", color: "#fff",
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#bbb" }
                  }}
                  InputLabelProps={{ style: { color: "#bbb" } }}
                >
                  {SIZES.map(sz => (
                    <MenuItem value={sz} key={sz}>{sz}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Qty"
                  type="number"
                  size="small"
                  sx={{
                    width: 68, bgcolor: "#191919", color: "#fff",
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#bbb" }
                  }}
                  inputProps={{ min: 1, style: { textAlign: "center", color: "#fff" } }}
                  value={newItem.quantity}
                  onChange={e =>
                    handleNewItemChange("quantity", Math.max(1, Number(e.target.value)))
                  }
                />
              </Box>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#ff7c2a" }}>
                  ${(SHIRT_PRICE * newItem.quantity).toFixed(2)}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                sx={{
                  ml: 2, border: "2px solid #ff7c2a", color: "#ff7c2a", fontWeight: 700, borderRadius: 2
                }}
                onClick={handleAddItem}
              >
                + Add Item
              </Button>
            </Paper>

            {/* List of items */}
            <Box sx={{
              width: "100%", maxHeight: 330, overflowY: "auto",
              mb: 1, background: "#181818", borderRadius: 2, p: 2,
              border: "2px solid #333"
            }}>
              <Typography variant="h6" sx={{ color: "#ff7c2a", mb: 1 }}>Order Items</Typography>
              {orderItems.length === 0 && (
                <Typography sx={{ color: "#999", fontSize: "1.07rem" }}>
                  No items added yet.
                </Typography>
              )}
              {orderItems.map((item, idx) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex", alignItems: "center", mb: 2,
                    borderBottom: idx < orderItems.length - 1 ? "1px solid #222" : "none", pb: 1
                  }}
                >
                  <ItemPreview type={item.type} color={item.color} />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography fontWeight={600}>{ITEM_TYPES.find(t => t.value === item.type)?.label || ""}</Typography>
                    <Typography fontSize="0.93rem" color="#bbb">
                      Color: <b style={{ color: item.color }}>{colorCodeToName(item.color)}</b>, Size: <b>{item.size}</b>, Qty: <b>{item.quantity}</b>
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: "#ff7c2a", ml: 2 }}>
                    ${(SHIRT_PRICE * item.quantity).toFixed(2)}
                  </Typography>
                  <IconButton onClick={() => handleRemoveItem(item.id)} color="error" sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              {/* Total row */}
              {orderItems.length > 0 && (
                <Box
                  sx={{
                    borderTop: "2px solid #333",
                    pt: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#ff7c2a", fontSize: "1.22rem" }}
                  >
                    Total: ${totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* User Form */}
        <Grid item xs={12} md={4.8}>
          <Paper
            sx={{
              borderRadius: 3,
              height: "100%",
              p: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxSizing: "border-box",
              bgcolor: "#222",
              color: "#fff"
            }}
            elevation={3}
          >
            <Typography variant="h5" fontWeight={700} sx={{ color: "#ff7c2a", mb: 2 }}>
              USER FORM
            </Typography>
            <TextField
              label="First Name" name="partyName" value={user.partyName}
              onChange={handleUserChange} fullWidth sx={{
                mb: 2, bgcolor: "#191919",
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiInputLabel-root": { color: "#bbb" }
              }}
              InputLabelProps={{ style: { color: "#bbb" } }}
            />
            <TextField
              label="Last Name" name="userName" value={user.userName}
              onChange={handleUserChange} fullWidth sx={{
                mb: 2, bgcolor: "#191919",
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiInputLabel-root": { color: "#bbb" }
              }}
              InputLabelProps={{ style: { color: "#bbb" } }}
            />
            <TextField
              label="Email" name="email" value={user.email}
              onChange={handleUserChange} fullWidth sx={{
                mb: 2, bgcolor: "#191919",
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiInputLabel-root": { color: "#bbb" }
              }}
              type="email"
              InputLabelProps={{ style: { color: "#bbb" } }}
            />
            <TextField
              label="Phone Number" name="phone" value={user.phone}
              onChange={handleUserChange} fullWidth sx={{
                mb: 2, bgcolor: "#191919",
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiInputLabel-root": { color: "#bbb" }
              }}
              type="tel"
              InputLabelProps={{ style: { color: "#bbb" } }}
            />
            <TextField
              label="Shipping Address" name="address" value={user.address}
              onChange={handleUserChange} fullWidth sx={{
                mb: 2, bgcolor: "#191919",
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiInputLabel-root": { color: "#bbb" }
              }}
              multiline minRows={2}
              InputLabelProps={{ style: { color: "#bbb" } }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{
                mt: 3, fontWeight: 700,
                background: "linear-gradient(90deg, #e43a6e, #ff7c2a 90%)",
                color: "#fff"
              }}
              onClick={handleOrder}
              disabled={loading}
              fullWidth
            >
              {loading ? "Redirecting..." : "REVIEW SUMMARY"}
            </Button>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 1, alignSelf: "flex-start", color: "#ff7c2a" }}
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Back
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
