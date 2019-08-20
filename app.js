const mongoose = require('mongoose');

var config = require('./config');

const url = config.mongoUrl;
const connect = mongoose.connect(url, { useNewUrlParser: true });

connect.then((db) => {
  console.log("Connected correctly to MongoDB");
}, (err) => { console.log(err); });

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var passport = require('passport');

var indexRouter = require('./routes/index');
var companyRouter = require('./routes/companyRouter');
var callbackRouter = require('./routes/callbackRouter');
var losFromPublishersRouter = require('./routes/losFromPublishersRouter');
var serverInformationRouter = require('./routes/serverInformationRouter');

var swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    info: {
      title: 'ONE Record Server',
      version: '3.0.0',
      description: 'ONE Record Server autogenerated Swagger API documentation. <br> <br>' +
        'Note! <br> __By creating a company account you agree the data and actions that you ' +
        ' submit and perform in this sandbox are entirely at your own responsibility. We recommend that you do not introduce private, commercial or other sensitive information in this sandbox since its exposure cannot be guaranteed. IATA is not liable for your actions or data.__' +
        '<br> <br> ' +
        'Steps to follow in order to test the APIs: <br>' +
        ' 1. Create a company via ```POST /companies```. You will need __companyId__ and __companyPin__ at a later stage, so keep them safely/memorize them. Only users that know the **companyPin** number can create an account under your company registration.<br>' +
        ' 2. Create a user for your __companyId__ via ```POST /companies/yourCompanyId/users```. <br>' +
        ' 3. Login a user via ```POST /companies/yourCompanyId/users/login```. Will get a token (JWT) in the login response which is valid for 72 hours. <br>' +
        ' 4. Add the token in the **Authorize** box. The following syntax must be used: ```Bearer yourtoken```. The endpoints with **lock** icon can be accessed only after the token is added to the **Authorize** box, which automatically ' +
        'adds it to the **Authorization** header. <br>' +
        ' 5. Add logistics objects to the server via ```POST /companies/yourCompanyId/los```. You can find some examples of logistics objects in [Github](https://github.com/IATA-Cargo/Sandbox). ' + 
        ' Logistics object must contain ```@type``` field: Airwaybill, Housemanifest, Housewaybill or Booking.<br>' +
        ' 6. Some of the endpoints (example: ```GET /companies```) can only be accessed with the ```serverSecret``` configured in the server ```config.js``` file. <br>' + 
        '<br> **Publish - subscribe model** <br>' +
        ' 1. Follow the instructions above in order to create a company, users and login. <br>' + 
        ' 2. Subscription information of this server can be retrieved via ```GET /serverInformation?topic=logisticsObjectType```. <br>' +
        ' 3. The endpoint ```POST /callbackUrl``` is used to receive logistics objects from the publishers to which the current server is subscribed to. ' +
        'You can configure the **subscriptionSecret** as instructed in [Github Sandbox repository](https://github.com/IATA-Cargo/Sandbox). The publishers that have the subscription secret can send ' +
        ' logistics objects to this endpoint.<br>' +
        '<br> More information about ONE Record specification on [IATA Github repository](https://github.com/IATA-Cargo/ONE-Record). <br>'
    },
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        scheme: 'bearer',
        description: 'For accessing the API a valid JWT token must be passed in all the queries in the **Authorization** header. <br>' +
          'A valid JWT token is generated by the API and retourned as answer of a call to the route ```POST /companies/yourCompanyId/users/login``` ' +
          ' giving a valid username & password. The returned token is valid for 72 hours. <br>' +
          'The following syntax must be used in the **Authorization** header: ```Bearer yourtoken```.'
      }
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

// Set Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/', indexRouter);
app.use('/companies', companyRouter);
app.use('/callbackUrl', callbackRouter);
app.use('/losFromPublishers', losFromPublishersRouter);
app.use('/serverInformation', serverInformationRouter);

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
