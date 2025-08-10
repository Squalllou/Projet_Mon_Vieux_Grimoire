const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtrl = require('../controllers/bookController');

//GET
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);

//POST
router.post('/', auth, multer, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.addRating);

//PUT
router.put('/:id', auth, multer, bookCtrl.modifyBook);

//DELETE
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;