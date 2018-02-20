const ApiController = require('../controllers/api_controller');

module.exports = (app) => {
	app.get('/api/index/:userId', ApiController.index);

	app.post('/api/login', ApiController.login);

	app.post('/api/register', ApiController.register);

	app.post('/api/category/create', ApiController.createCategory);

	app.put('/api/category/edit/:id', ApiController.editCategory);

	app.put('/api/category/move', ApiController.moveCategory);

	app.delete('/api/category/delete/:id', ApiController.deleteCategory);

	app.post('/api/item/create', ApiController.createItem);

	app.put('/api/item/edit/:id', ApiController.editItem);

	app.delete('/api/item/delete/:id', ApiController.deleteItem);

	app.get('/api/items', ApiController.listItems);

	app.get('/api/categories', ApiController.listCategories);

};