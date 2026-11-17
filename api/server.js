import express   from 'express';  
 
import  authRoute  from './routes/authRoute.js';
import  productRoute  from './routes/proudcts.js';
import  storeRoute  from './routes/storeRpute.js';
import  orderRoute  from './routes/order.js';
import paymentRoute from './routes/paymentRoutes.js';
import  connectedDB  from './config/db.js';
 import  dotenv from 'dotenv';
 
dotenv.config();

 
 
const  app =  express();

const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (!origin) return next();
  if (!allowedOrigins.has(origin)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/store', storeRoute);
app.use('/order', orderRoute);
app.use('/api/payments', paymentRoute);
 
const PORT =  process.env.PORT   || 3000  ; 
async function startServer() {
  try {
    await connectedDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection error:", err);
    process.exitCode = 1;
  }
}

startServer();
 