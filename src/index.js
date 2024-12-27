import express from "express";
import dotenv from "dotenv"
import connectDb from "./config/db.js";

dotenv.config();
const app = express()

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDb();








app.listen(port,() => {
    console.log(`Server starting at port ${port}`)
})