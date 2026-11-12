import express   from 'express';  
 
import  authRoute  from './routes/authRoute.js';
import  connectedDB  from './db/db.js';
 import  dotenv from 'dotenv';
 
dotenv.config();

 
 
const  app =  express();

app.use(express.json());
app.use('/auth', authRoute);
 
const PORT =  process.env.PORT   || 8000  ; 
app.listen(PORT, () => {
   connectedDB().catch((err) => {
  console.error("Database connection error:", err);
   });
});
 