import express from "express";
import cors from "cors";
import routes from "./routes";
import { config } from "dotenv";
const app = express();
config();

// Configura CORS para permitir solicitudes desde cualquier origen
app.use(
  cors({
    origin: "*",
  })
);
//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes - definir rutas
app.use(routes);

app.listen(process.env.PORT, () => {
  console.log(`Server on port ${process.env.PORT}`);
});
