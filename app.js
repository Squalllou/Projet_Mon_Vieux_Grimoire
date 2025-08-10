const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const path = require('path');

//tout mettre en variable d'environnement
mongoose.connect(process.env.MONGODB_URI) // lien de connexion a mongodb atlas
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();

app.use((req, res, next) => {  //header pour authoriser les connection entre api et front
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use(express.json()); //intercepte toutes les requetes qui contiennent du json (bodyparser)

app.use('/api/books', booksRoutes); // routes get post ect
app.use('/api/auth', userRoutes);   //routes authentification user
app.use('/images', express.static(path.join(__dirname, 'images'))); // routes pour indiquer ou va les images

module.exports = app;