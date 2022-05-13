
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


const AWS = require('aws-sdk');
AWS.config.update({
    region: 'me-south-1'
  });
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'Sensor';


function addUser(username, password) {
	const params = {
	  TableName: "UserInfo",
	  Item: {
		ID: { S: "1" },
		Username: { N: username },
		Password: {S: password}
	  },
	};

	dynamodb.putItem(params, function(err) {
	  if (err) {
		console.error("Unable to add User", err);
	  } else {
		console.log(`Added ${Username} with password of ${Password}%`);
	  }
	});
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
  
  app.post('/all', async (req, res) => {
    const params = {
      TableName: dynamodbTableName
    }
    try {
      const allProducts = await scanDynamoRecords(params, []);
      // const body = {
      //   products: allProducts
      // }
      res.json(allProducts);
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