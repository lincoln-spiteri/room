const express = require('express');
const router = express.Router();

const Router = require('../services/router');

const mediaRouter = new Router();

mediaRouter.init();


/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});


router.post('/api/members', async (req, res, next) => {

  console.log('New member joining the room');

  const parameters = await mediaRouter.createTransports();

  res.json(parameters);
});


router.post('/api/members/connect', async (req, res, next) => {

  console.log('Member connecting media');

  await mediaRouter.connect(req.body);

  res.status(200).end();
});


router.post('/api/members/produce', async (req, res, next) => {

  console.log('Member started feed');

  const transport = await mediaRouter.produce(req.body);

  res.status(200).end();
});

module.exports = router;
