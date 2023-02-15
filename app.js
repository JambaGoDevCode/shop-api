const express = require('express');
const app = express();
const bodyParcr = require('body-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const path = require('path');

require('dotenv').config();

app.use(cors());
app.options('*', cors());

// middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

const ordersRouter = require('./routers/orders');
const usersRouter = require('./routers/users');
const categoriesRouter = require('./routers/categories');
const productRouter = require('./routers/products');
//const usersRouter = require('./routers/users');

const api = process.env.API_URL;

// Routers
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/products`, productRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);

// DataBase connect
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'compraq',
  })
  .then(() => {
    console.log('Database connecet is sucess full');
  })
  .catch((err) => {
    console.log(err);
  });

// Server listen development

app.listen(3000, () => {
  console.log(' App is running at http://localhost:3000');
});


// production 

/*
var  server = app.listen(process.env.PORT || 3000, function(){
  var port = server.address().port;
  console.log("Express is working on port" + port)
})
*/



