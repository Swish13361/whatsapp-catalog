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

app.use(express.json());
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/store', storeRoute);
app.use('/order', orderRoute);
app.use('/api/payments', paymentRoute);
 
const PORT =  process.env.PORT   || 8000  ; 
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
 