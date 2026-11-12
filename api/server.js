import express   from 'express';  
 
import  authRoute  from './routes/authRoute.js';
import  productRoute  from './routes/proudcts.js';
import  storeRoute  from './routes/storeRpute.js';
import  orderRoute  from './routes/order.js';
import  connectedDB  from './db/db.js';
 import  dotenv from 'dotenv';
 
dotenv.config();

 
 
const  app =  express();

app.use(express.json());
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/store', storeRoute);
app.use('/order', orderRoute);
 
const PORT =  process.env.PORT   || 8000  ; 
app.listen(PORT, () => {
   connectedDB().catch((err) => {
  console.error("Database connection error:", err);
   });
});
 