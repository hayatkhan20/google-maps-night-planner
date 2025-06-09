import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#000",
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 6 },
          bgcolor: "#181818",
          borderRadius: 4,
          boxShadow: 4,
          textAlign: "center",
          width: "100%",
          maxWidth: 440,
        }}
      >
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{
            color: "#ffd700",
            mb: 1,
            letterSpacing: 0.5,
            textShadow: "0 2px 14px #e43a6e44"
          }}
        >
          🎉 Payment Successful!
        </Typography>

        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            color: "#fff",
            mb: 2,
            mt: 2
          }}
        >
          Thank you for your order.<br />
          <span style={{ color: "#ff7c2a" }}>Your Canada Day shirt is on the way!</span>
        </Typography>

        {/* <Typography sx={{ color: "#bbb", mb: 3 }}>
          <b>Your route and shirt order summary will be emailed to you.</b> <br />
          <span style={{ color: "#ffd700" }}>Enjoy the Pub Crawl and Happy Canada Day!</span>
        </Typography> */}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center" mb={2}>
          {/* These buttons can be enabled when PDF/print is implemented */}
          {/* <Button
            variant="outlined"
            size="large"
            disabled
            sx={{
              fontWeight: 700,
              color: "#fff",
              borderColor: "#ffd700",
              ":hover": {
                borderColor: "#e43a6e",
                color: "#e43a6e",
              }
            }}
          >
            Download Map PDF
          </Button> */}
          {/* <Button
            variant="outlined"
            size="large"
            disabled
            sx={{
              fontWeight: 700,
              color: "#fff",
              borderColor: "#ff7c2a",
              ":hover": {
                borderColor: "#ffd700",
                color: "#ffd700",
              }
            }}
          >
            Print
          </Button> */}
        </Stack>
        <Button
          variant="contained"
          size="large"
          onClick={() => window.location.href = "https://notlikeusa.ca/"}
          sx={{
            fontWeight: 700,
            background: "linear-gradient(90deg,#e43a6e,#ff7c2a 90%)",
            color: "#fff",
            mt: 1,
            px: 6
          }}
        >
          BACK TO HOME
        </Button>
      </Box>
    </Box>
  );
}
