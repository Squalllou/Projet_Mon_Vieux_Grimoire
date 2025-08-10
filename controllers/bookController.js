const Book = require('../models/Books');
const fs = require('fs');

// CREER LES LIVRES
exports.createBook = (req, res, next) => {
   const bookObject = JSON.parse(req.body.book);                                   //recuperation de le livre
   delete bookObject._id;                                                          //suppression de son id car geré par la bd
   delete bookObject._userId;                                                      //suppression de l'id du client pour eviter que le client tente de se faire passer pour qqun d'autre
   const book = new Book({
       ...bookObject,                                                               //on creer le livre avec les donnees recuperees
       userId: req.auth.userId,                                                     //on lui attribu l'id du token d'authentification
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //on créer l'url de l'image en prenant le protocole(http)+le nom d'hotte+l'endroit ou on le met + le nom creer par multer
   });
 
   book.save()                                                                      //on enregistre notre livre
   .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
   .catch(error => { res.status(400).json( { error })})
};

// TROUVE UN LIVRE
exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

// MODIFIER UN LIVRE
exports.modifyBook = (req, res, next) => {
   const bookObject = req.file ? {
       ...JSON.parse(req.body.book),
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
 
   delete bookObject._userId;
   Book.findOne({_id: req.params.id})
       .then((book) => {
           if (book.userId != req.auth.userId) {
               res.status(403).json({ message: 'Unauthorized request' });
           } else {
               Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Livre modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {res.status(400).json({ error }); 
      });
};

// SUPPRIMER UN LIVRE
exports.deleteBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId != req.auth.userId) {
               res.status(403).json({ message: 'Unauthorized request' });
           } else {
               const filename = book.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Book.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};

//RECUPERER TOUS LES LIVRES
exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// AJOUT D'UNE NOTE + CALCULE DE LA MOYENNE
exports.addRating = (req, res, next) => {
  const bookId = req.params.id;
  const { rating } = req.body;
  const userId = req.auth.userId;


  // On vérifie que la note est entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
  }

  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé.' });
      }

      // On regarde si l'utilisateur a déjà noté
      const existingRating = book.ratings.find(r => r.userId === userId);
      if (existingRating) {
        return res.status(403).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      // Ajout de la nouvelle note
      book.ratings.push({ userId, grade: rating });

      // Recalcule de la moyenne
      const total = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
      book.averageRating = total / book.ratings.length;

      // Sauvegarde
      book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// RECUPERER LES 3 MEILLEURS LIVRES
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Tri décroissant sur la moyenne
    .limit(3)                    // On prend seulement les 3 premiers
    .then(books => res.status(200).json(books))
    .catch(error => res.status(500).json({ error }));
};
