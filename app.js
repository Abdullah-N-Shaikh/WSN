
const express = require('express')
const bcrypt = require('bcrypt') // For hashing user passwords and comparing hashed passwords
const session = require('express-session')
// const flash =require('connect-flash');


// const router = express.Router();

const app = express()
const port = process.env.PORT || 3000;
// app.use(flash());

// Passport 
const passport = require('passport')
const Local_Strategy = require('passport-local').Strategy 

const path = require('path');

const AWS = require('aws-sdk');
// //for mqtt
var awsIot = require('aws-iot-device-sdk');
// // test mqtt

// const device = awsIot.device({
//   keyPath: path.resolve(__dirname + '/certs/private.pem.key'),
//   certPath: path.resolve(__dirname + '/certs/certificate.pem.crt'),
//   caPath: path.resolve(__dirname + '/certs/AmazonRootCA1.pem'),
//   clientId: "Web",
//   host: "a3txg7vsallna2-ats.iot.us-east-1.amazonaws.com"
// });
// console.log("Connected ... ");

// device
// .on('connect', function() {
//   console.log('connect');
//   device.subscribe('wsn/AddNode');
//   device.publish('home/helloworld', JSON.stringify({ test_data: "from Website to MQTT Broker or Raspberry Pi"}));
// });

// device
// .on('message', function(topic, payload) {
//   console.log('We got a message from wsn/AddNode');
//   console.log('message', topic, payload.toString());
// });




AWS.config.update({
    region: 'me-south-1'
  });
const dynamodb = new AWS.DynamoDB.DocumentClient();
const DynamoDB = new AWS.DynamoDB();

const dynamodbTableName = 'SensorData';

app.use(express.static(__dirname + '/img/'));

function addUser(username, password) {
  console.log("inside adduser funcion")
	const params = {
	  TableName: "UserDB",
	  Item: {
		Username: { S: username },
		Password: {S: password}
	  },
	};
  console.log("parm has been created")

	DynamoDB.putItem(params, function(err) {
	  if (err) {
		console.error("Unable to add User", err);
	  } else {
		console.log(`Added ${username} with password of ${password}%`);
	  }
	});
  }

  function getUser(username) {
    
  }



// database 

// app.use(express.static(__dirname + '/css/auth.css'));

// app.post('/specifc', async (req, res) => {
//     const params = {
//       TableName: dynamodbTableName,
//       Key: {
//         'Sensor_Id': req.query.Sensor_Id
//       }
//     }
//     await dynamodb.get(params).promise().then(response => {
//       res.json(response.Item);
//     }, error => {
//       console.error('Do your custom error handling here. I am just ganna log it out: ', error);
//       res.status(500).send(error);
//     })
//   })

app.post('/addnodebymac', (req, res) => {
  let x = req.body.macaddress
  let result = x
  console.log(req.body.macaddress);
  res.send({result : result})
})

app.post('/addnode', async (req, res) => {
  
let Nodemac= reg.body.mac

const device = awsIot.device({
  keyPath: path.resolve(__dirname + '/certs/private.pem.key'),
  certPath: path.resolve(__dirname + '/certs/certificate.pem.crt'),
  caPath: path.resolve(__dirname + '/certs/AmazonRootCA1.pem'),
  clientId: "Web",
  host: "a3txg7vsallna2-ats.iot.us-east-1.amazonaws.com"
});
console.log("Connected ... ");

device
.on('connect', function() {
  console.log('connect');
  device.subscribe('wsn/AddNodeStatus');
  device.publish('wsn/addnodemac', JSON.stringify({ mac: Nodemac}));
});

device
.on('message', function(topic, payload) {
  console.log('We got a message from wsn/AddNodeStatus');
  console.log('message', topic, payload.toString());
});

  res.send({"result": "node is added"})
})

app.post('/mqtt', async (req, res) => {
   

            // testing the lambda function
            console.log("Start testing Lambda Function");
            var lambda = new AWS.Lambda();
            var paramss = {
              FunctionName: 'PublishMQTT', /* required */
              Payload: "Here is the payload from the webserver"
            };
            lambda.invoke(paramss, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else     console.log(data);           // successful response
            });
            console.log("End testing Lambda Function");
          })


  
  app.post('/all', async (req, res) => {
    const params = {
      TableName: dynamodbTableName
    }
    try {
      const SensorDataAll = await scanDynamoRecords(params, []);
      // const body = {
      //   products: SensorDataAll
      // }
      res.json(SensorDataAll);
    } catch(error) {
      console.error('Do your custom error handling here. I am just ganna log it out: ', error);
      res.status(500).send(error);
    }
  })

  app.post('/allUsers', async (req, res) => {
    const params = {
      TableName: "UserDB"
    }
    try {

      const SensorDataAll = await scanDynamoRecords(params, []);
      // const body = {
      //   products: SensorDataAll
      // }



// testing for mqtt
console.log("Start testing MQTT Function");
// console.log("The path should i use is "+path.resolve(__dirname));
// const device = awsIot.device({
//   keyPath: path.resolve(__dirname + '/certs/private.pem.key'),
//   certPath: path.resolve(__dirname + '/certs/certificate.pem.crt'),
//   caPath: path.resolve(__dirname + '/certs/AmazonRootCA1.pem'),
//   clientId: "Web",
//   host: "a3txg7vsallna2-ats.iot.us-east-1.amazonaws.com"
// });
// console.log("Connected ... ");

// device
// .on('connect', function() {
//   console.log('connect');
//   // device.subscribe('topic_1');
//   device.publish('home/helloworld', JSON.stringify({ test_data: 1}));
// });

// device
// .on('message', function(topic, payload) {
//   console.log('message', topic, payload.toString());
// });








      res.json(SensorDataAll);
    } catch(error) {
      console.error('Do your custom error handling here. I am just ganna log it out: ', error);
      res.status(500).send(error);
    }
  })

  async function scanDynamoRecords(scanParams, itemArray) {
    try {
      const dynamoData = await dynamodb.scan(scanParams).promise();
      itemArray = itemArray.concat(dynamoData.Items);
      if (dynamoData.LastEvaluatedKey) {
        scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
        return await scanDynamoRecords(scanParams, itemArray);
      }
      return itemArray;
    } catch(error) {
      throw new Error(error);
    }
  }
  



let authenticateUser = async function(username, password, done) {

  const params = {
    TableName: "UserDB",
    Key: {
      Username: { S: username },
    },
  };

  DynamoDB.getItem(params, function(err, data) {
    if (err) {
      console.error("Unable to a user with same username", err);
    } else {
      console.log("Found user inforamtion", data.Item);
      console.log("His password is : ", data.Item.Password.S);
      return data.Item.Password.S;
    }
  });





    // getUser(username);


    let user = users.find(user => user.username == username)
    if(user == null){
        return done(null, false, {message: 'No such user!'})
    }
    // User exists. Check password
    try {
        if(await bcrypt.compare(password, user.password)){
            return done(null, user)
        } else {
            return done(null, false, {message: 'Password incorrect!'})
        }
    } catch(err) {
        return done(err)
    }
}

passport.use(new Local_Strategy({ usernameField: 'username'}, authenticateUser))
passport.serializeUser((user, done) => done(null, user.id) )
passport.deserializeUser((id, done) => { 
    return done(null, users.find(user => user.id == id))
 })

// Emulate database
const users = []  // Do not use in production!

//Middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Session
app.use(session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
}))
const flash = require('connect-flash');
app.use(flash());

// Passport
app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, (req, res) => {
    res.sendFile('Pages/index.html', {root: __dirname})
})
app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.sendFile('Pages/dashboard.html', {root: __dirname})
})

app.get('/data', checkAuthenticated, (req, res) => {
    res.sendFile('Pages/data.html', {root: __dirname})
})

app.get('/manageNetwork', checkAuthenticated, (req, res) => {
  res.sendFile('Pages/manageNetwork.html', {root: __dirname})
})

app.get('/map', checkAuthenticated, (req, res) => {
  res.sendFile('Pages/NetworkMap.html', {root: __dirname})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile('Pages/login.html', {root: __dirname})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.sendFile('Pages/register.html', {root: __dirname})
})

app.get('/logout', function(req, res){
  console.log("Inside app.js logout");
  req.session.destroy(function() {
    console.log("Inside app.js logout clearCookie" );
    res.clearCookie('connect.sid');
    res.redirect('/');
});
});
// from the register button click
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        let hashed_passowrd = await bcrypt.hash(req.body.password, 10)
        // push data to DB
        console.log("Before adding the user to DB",req.body.username, hashed_passowrd);

        addUser(req.body.username,hashed_passowrd)
        console.log("The user should have been added to DB",req.body.username, hashed_passowrd);
        users.push({
            id: Date.now().toString(),
            username: req.body.username,
            password: hashed_passowrd
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login') //edit this to login
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

app.listen(port, () => console.log(`Application server listening on port ${port}`))