require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// =============== GEO SEARCH ===============

// Geocode City → Lat/Lng
async function geocodeCity(city) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json`;
  const response = await axios.get(url, {
    params: {
      address: city,
      key: GOOGLE_API_KEY,
    },
  });
  const data = response.data;
  if (data.status === "OK" && data.results.length > 0) {
    return data.results[0].geometry.location;
  }
  throw new Error("Geocoding failed");
}

// Places Nearby Search (Bars & Restaurants)
async function searchPlaces({ lat, lng }, typeOfPeople, numLocations) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
  let type = "restaurant";
  if (typeOfPeople === "singles" || typeOfPeople === "couples") {
    type = "bar|restaurant";
  }
  const response = await axios.get(url, {
    params: {
      location: `${lat},${lng}`,
      radius: 4000,
      type,
      key: GOOGLE_API_KEY,
    },
  });
  let results = response.data.results;

  if (typeOfPeople === "families") {
    results = results.filter(place =>
      place.types && place.types.includes("restaurant") && !place.types.includes("bar")
    );
  }

  if (numLocations && Number(numLocations) > 0) {
    results = results.slice(0, Number(numLocations));
  }

  return results;
}

// API Route: /api/places?city=Montreal&typeOfPeople=singles&numLocations=3
app.get("/api/places", async (req, res) => {
  try {
    const { city, typeOfPeople, numLocations } = req.query;
    if (!city) return res.status(400).json({ error: "City required" });

    const loc = await geocodeCity(city + ", Canada");
    const places = await searchPlaces(loc, typeOfPeople, numLocations);

    res.json(
      places.map((place) => ({
        name: place.name,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.vicinity || place.formatted_address,
        rating: place.rating,
        types: place.types,
        icon: place.icon,
        photoRef:
          place.photos && place.photos.length > 0
            ? place.photos[0].photo_reference
            : null,
        place_id: place.place_id,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed" });
  }
});

// =============== SQUARE CHECKOUT ===============

app.post("/api/create-checkout-session", async (req, res) => {
  const { orderItems, user, crawlInfo, venues } = req.body;

  function colorCodeToName(code) {
    if (code === "#232323") return "Black";
    if (code === "#ff0000") return "Red";
    if (code === "#fff") return "White";
    return "Black";
  }

  const lineItems = orderItems.map(item => ({
    name: `${item.type === "tshirt" ? "T-Shirt" : item.type === "tanktop" ? "Tank Top" : "Hat"} - ${venues?.[0]?.name || "Pub Crawl"}`,
    quantity: item.quantity.toString(),
    base_price_money: {
      amount: 2499, // $24.99 in cents
      currency: "CAD"
    },
    note: `Color: ${colorCodeToName(item.color)}, Size: ${item.size}`
  }));

  try {
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const body = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: process.env.SQUARE_LOCATION_ID,
        line_items: lineItems
      },
      checkout_options: {
        ask_for_shipping_address: true,
        redirect_url: process.env.SQUARE_REDIRECT_URL || "https://google-maps-night-planner-frontend.onrender.com/success"
      }
    };

    const isProd = (process.env.SQUARE_ENVIRONMENT || '').toLowerCase() === 'production';
    const apiBase = isProd
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    const response = await axios.post(
      `${apiBase}/v2/online-checkout/payment-links`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          'Square-Version': '2024-05-22'
        }
      }
    );

    // THIS is always the real, customer-facing payment link!
    const paymentUrl = response.data.payment_link.url;
    console.log('Payment link for customer:', paymentUrl);

    res.json({ url: paymentUrl });

  } catch (err) {
    let errorDetail = err.response?.data?.errors
      ? err.response.data.errors.map(e => e.detail).join("; ")
      : err.response?.data || err.message || "Square checkout error";
    console.error("Square error:", errorDetail);
    res.status(500).json({ error: errorDetail });
  }
});

// ========== Listen ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
