const { checkToken } = require('../../middleware/validateToken.js');
const { me, addItem, updateItem, deleteItem, sellItem, getUsers, addUser, getUser, getItems, getItem } = require('./user.service.js');


const router = require('express').Router();

router.get('/me', checkToken, me);
router.get('/getuser/:id', checkToken, getUser);
router.get('/getusers', checkToken, getUsers);
router.get('/getitem/:id', checkToken, getItem);
router.get('/getitems', checkToken, getItems);
router.post('/additem', checkToken, addItem);
router.post('/adduser', checkToken, addUser);
router.post('/sellitem', checkToken, sellItem);
router.patch('/updateitem', checkToken, updateItem);
router.delete('/deleteitem', checkToken, deleteItem);

module.exports = router;