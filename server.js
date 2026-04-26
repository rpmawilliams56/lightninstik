import express from "express";
import cors from "cors";
import leadsRoute from "./api/routes/leads.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", leadsRoute);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});