require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

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
  // Type logic: "families" = restaurant only; else both
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

  // Filter out bars if typeOfPeople is "families"
  if (typeOfPeople === "families") {
    results = results.filter(place =>
      place.types && place.types.includes("restaurant") && !place.types.includes("bar")
    );
  }

  // Limit to numLocations if specified
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

    // 1. Geocode city
    const loc = await geocodeCity(city + ", Canada");
    // 2. Search places
    const places = await searchPlaces(loc, typeOfPeople, numLocations);

    // Return only the data you need for frontend
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

// === STRIPE PAYMENT: Create Checkout Session ===
app.post("/api/create-checkout-session", async (req, res) => {
  console.log('Received order:', req.body);
  const { orderItems, user, crawlInfo, venues } = req.body;
  function colorCodeToName(code) {
    if (code === "#232323") return "Black";
    if (code === "#ff0000") return "Red";
    if (code === "#fff") return "White";
    return "Black";
  }


  try {
    // 1. Build line_items array from orderItems
    const line_items = orderItems.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.type === "tshirt" ? "T-Shirt" : item.type === "tanktop" ? "Tank Top" : "Hat"} - ${venues?.[0]?.name || "Pub Crawl"}`,
          description: `Color: ${colorCodeToName(item.color)}, Size: ${item.size}`,
          images: [
            item.image?.startsWith("http")
              ? item.image
              : `https://yourdomain.com${item.image || "/default.png"}`
          ],
        },
        unit_amount: 2499, // $24.99 in centss
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: user.email,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      
      success_url: "https://google-maps-night-planner-frontend.onrender.com/success",
      cancel_url: "https://google-maps-night-planner-frontend.onrender.com/order",

      metadata: {
        city: crawlInfo?.city || "",
        date: crawlInfo?.date || "",
        startTime: crawlInfo?.startTime || "",
        endTime: crawlInfo?.endTime || "",
        typeOfPeople: crawlInfo?.typeOfPeople || "",
        numLocations: crawlInfo?.numLocations?.toString() || "",
        venue1: venues?.[0]?.name || "", // Just the first venue, or
        partyName: user.partyName,
        userName: user.userName,
        phone: user.phone,
        address: user.address,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== Listen ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
