const Book = require('../models/Books');
const fs = require('fs');

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

exports.modifyBook = (req, res, next) => {
   const bookObject = req.file ? {
       ...JSON.parse(req.body.book),
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
 
   delete bookObject._userId;
   Book.findOne({_id: req.params.id})
       .then((book) => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({ message : 'Not authorized'});
           } else {
               Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Livre modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {res.status(400).json({ error }); 
      });
};

exports.deleteBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
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