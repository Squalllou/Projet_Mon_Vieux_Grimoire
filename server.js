const http = require('http');
const app = require('./app');

// Cette fonction transforme une valeur (chaîne ou nombre) en numéro de port utilisable
const normalizePort = val => {
  const port = parseInt(val, 10); // On tente de convertir en nombre

  if (isNaN(port)) {
    return val; // Si ce n’est pas un nombre (ex: 'pipe'), on retourne tel quel
  }
  if (port >= 0) {
    return port; // Port valide
  }
  return false; // Port invalide
};

const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

// Cette fonction gère les erreurs spécifiques liées au serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error; // Si ce n’est pas une erreur d’écoute, on relance l'erreur
  }

  const address = server.address(); // Récupère l’adresse du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

  // On traite des erreurs fréquentes
  switch (error.code) {
    case 'EACCES': // Port interdit sans droits admin
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE': // Port déjà utilisé
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app); // On crée le serveur HTTP avec notre app Express

server.on('error', errorHandler); // On attache notre gestionnaire d’erreur

server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind); // Log quand le serveur est bien lancé
});

server.listen(port); // On démarre l’écoute
