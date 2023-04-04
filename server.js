import express, { json } from "express";
import cors from "cors";
import Splitwise from "splitwise";
import Robinhood from 'robinhood';
import readline from 'readline';
import axios from "axios";
import * as dotenv from 'dotenv';
import findConfig from 'find-config';
dotenv.config({ path: findConfig('.env') });

import PassageNode from "@passageidentity/passage-node";
import { db, connect, close } from './db.js';

const app = express();
const PORT = 7002;
const CLIENT_URL = "http://localhost:3000";

let robinhood;

let ROBINHOOD_AUTH_CODE;

app.use(json());
app.use(
  cors({
    origin: CLIENT_URL,
  })
);

const nodePassage = new PassageNode({
  appID: process.env.PASSAGE_APP_ID,
  apiKey: process.env.PASSAGE_API_KEY,
  authStrategy: "HEADER",
});

app.post("/auth", async (req, res) => {
  try {
    console.log("inside /auth")
    const userID = await nodePassage.authenticateRequest(req).catch(err => {
      console.log("inside .catch")
      res.json({
        authStatus: "failure",
      });
    });

    // connect().then(async () => {
    //   console.log("after connection in server")
    //   const users = await db.collection('credentials').find().toArray();
    //   console.log("users", users)
    // });
  
    if (userID) {
      console.log("userID available in auth", userID)
      // user is authenticated
      const { email, phone } = await nodePassage.user.get(userID);
      const identifier = email ? email : phone;

      res.json({
        authStatus: "success",
        identifier,
      });
    }
  } catch (e) {
    // authentication failed
    console.log("error in /auth \n", e);
    // res.json({
    //   authStatus: "failure",
    // });
  }
});

function retrieveSplitwiseConfiguration(loggedinEmail) {
  console.log("inside retrieveSplitwiseConfiguration", loggedinEmail);
  return new Promise((resolve, reject) => {
    connect()
      .then(async () => {
        console.log("after connection in server")
        const users = await db.collection('credentials').findOne({email: loggedinEmail});
        console.log("users", users)
        if (users == null) {
          resolve({ CONSUMER_KEY: null, CONSUMER_SECRET: null });
        } else {
          resolve({ CONSUMER_KEY: users.consumer_key, CONSUMER_SECRET: users.consumer_secret });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function prepareSplitwiseBalanceDetails(email) {
  try {
    const { CONSUMER_KEY, CONSUMER_SECRET } = await retrieveSplitwiseConfiguration(email);
    console.log("CONSUMER_KEY from mongodb", CONSUMER_KEY);

    let totalBalanceArray = [];
    let totalOwed = 0;
    if (CONSUMER_KEY == null || CONSUMER_SECRET == null) {
      return { totalOwed, totalBalanceArray };
    }

    const sw = Splitwise({
      consumerKey: CONSUMER_KEY,
      consumerSecret: CONSUMER_SECRET,
    });

    let friends = await sw.getFriends();
    let friendBalancesArray = [];

    for (let friend of friends) {
      let friendObject = {};

      //console.log("\nfriend ", friend)
      if (friend.balance.length != 0) {
        friendObject.id = friend.id;
        friendObject.name = friend.first_name;
        friendObject.amount = friend.balance[0].amount;
        friendBalancesArray.push(friendObject);

        totalBalanceArray.push(friend.balance[0].amount);
      }
    }

    totalOwed = totalBalanceArray.reduce(
      (accumulator, currentValue) =>
        parseFloat(accumulator) + parseFloat(currentValue),
      0
    );
    totalOwed = totalOwed.toFixed(2);

    return { totalOwed, friendBalancesArray };
  } catch (error) {
    console.error(error);
    let totalBalanceArray = [];
    let totalOwed = 0;
    return { totalOwed, totalBalanceArray };
  }
}

async function prepareRobinhoodBalanceDetails(token) {
  console.log("inside prepareRobinhoodBalanceDetails");

  let positionsArray = [];
  let positions = await retrievePositions(token);
  console.log("after retrieve positions", positions)
  
  const instrumentUrls = positions.results.map(position => position.instrument);
  const instrumentDataArray = await Promise.all(instrumentUrls.map(url => axios.get(url)));

  instrumentDataArray.forEach(instrumentData => {
    const instrument = instrumentData.data;
    console.log("\n instrument", instrument)
    const matchingPosition = positions.results.find(position => position.instrument === instrument.url);
    
    let preparedPosition = {};
    preparedPosition.symbol = instrument.symbol;
    preparedPosition.name = instrument.simple_name;
    preparedPosition.quantity = matchingPosition.quantity;
    preparedPosition.average_price = matchingPosition.average_buy_price;
    preparedPosition.amount_invested = (matchingPosition.quantity*matchingPosition.average_buy_price).toFixed(2);

    positionsArray.push(preparedPosition);
  });

  const totalInvested = positionsArray.reduce((acc, curr) => acc + parseFloat(curr.amount_invested), 0);
  console.log("positionsArray", positionsArray)
  return {totalInvested, positionsArray};
}

async function retrievePositions(token) {
  console.log("inside retrievePositions", token)
  // Initialize Robinhood API with your login credentials
  const robinhood = Robinhood({
    token: token
  });

  // Wait for nonzero positions data to be returned
  const positions = await new Promise((resolve, reject) => {
    robinhood.nonzero_positions((err, response, body) => {
      if (err) {
        reject(err);
      } else {
        console.log("body in retrievePositions", body)
        if(body!=undefined)
        resolve(body);
      }
    });
  });
  
  return positions;
}

function retrieveRobinhoodConfiguration(loggedinEmail) {
  console.log("inside retrieveRobinhoodConfiguration", loggedinEmail);
  return new Promise((resolve, reject) => {
    connect()
      .then(async () => {
        console.log("after connection in server")
        const users = await db.collection('credentials').findOne({email: loggedinEmail});
        console.log("users", users)
        if (users == null) {
          resolve(null);
        } else {
          resolve(users.robinhood_access_token);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function retrieveRobinhoodBuyingPower(email) {
  console.log("inside retrieveRobinhoodBuyingPower")

  const ROBINHOOD_ACCESS_TOKEN = await retrieveRobinhoodConfiguration(email);
  // Initialize Robinhood API with your login credentials
  const robinhood = Robinhood({
    token: ROBINHOOD_ACCESS_TOKEN
  });

  // Wait for nonzero positions data to be returned
  const buyingPower = await new Promise((resolve, reject) => {
    robinhood.accounts((err, response, body) => {
      //console.log("res", response)
      if (err) {
        reject(err);
      } else {
        console.log("inside else part", body.results);

        if(body!=undefined && body.results) {
          console.log("token ", ROBINHOOD_ACCESS_TOKEN)
          let response = {};
          response.buyingPower = parseFloat(body.results[0].cash).toFixed(2);
          response.token = ROBINHOOD_ACCESS_TOKEN;
          resolve(parseFloat(body.results[0].cash).toFixed(2));
        } else {
          resolve(0, null)
        }
          
      }
    });
  });
  
  return { buyingPower, ROBINHOOD_ACCESS_TOKEN };
}

async function saveRobinhoodAccessToken(mfa_code, loggedinEmail) {
  return new Promise((resolve, reject) => {
    robinhood.set_mfa_code(mfa_code, () => {
      ROBINHOOD_AUTH_CODE = robinhood.auth_token();
      console.log("ROBINHOOD_AUTH_CODE", ROBINHOOD_AUTH_CODE);

      connect()
        .then(async () => {
          console.log("after connection in server");
          const result = await db.collection('credentials').findOneAndUpdate(
            { email: loggedinEmail },
            { $set: { robinhood_access_token: ROBINHOOD_AUTH_CODE } },
            { upsert: true, returnOriginal: false }
          );
          console.log("result", result)
          resolve(result.value.robinhood_token);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}


async function verifyRobinhoodCredentials(username, password) {
  return new Promise((resolve, reject) => {
    robinhood = Robinhood({ username, password }, (err, data) => {
      console.log("data", data);
      if (err) {
        console.log("err", err);
        reject({
          success: true,
          message: "Unable to log in with provided credentials.",
        });
      } else {
        resolve({
          success: true,
          message: "Logged in",
        });
      }
    });
  });
}

app.post("/robinhood_otp", async (req, res) => {
  try {
    console.log("inside /otp", req.body);
    
    //fix so that when password is sent from frontend, its hashed so its not intercepted
    let username = req.body.email;
    let password = req.body.password;

    let otpResponse = await verifyRobinhoodCredentials(username, password);
    console.log("otpResponse", otpResponse)

    res.json({
      success: otpResponse.success,
      message: otpResponse.message,
    });

  } catch (e) {
    // authentication failed
    console.log(e);
    res.json({
      success: false,
      message: "Unable to log in with provided credentials.",
    });
  }
});

app.post("/verify_robinhood_otp", async (req, res) => {
  try {
    console.log("inside /verify_robinhood_otp", req.body);
    //console.log("robinhood object", robinhood)
    
    //fix so that when password is sent from frontend, its hashed so its not intercepted
    let otpEntered = req.body.otpEntered;
    let email = req.body.loggedinEmail;
    console.log("email", email)

    let authToken = await saveRobinhoodAccessToken(otpEntered, email);
    console.log("authToken", authToken)

    res.json({
      success: true,
      message: "Access token stored in Passage. Login complete.",
      auth_token: authToken
    });

  } catch (e) {
    // authentication failed
    console.log(e);
    res.json({
      success: false,
      message: "OTP invalid. Retry",
    });
  }
});

app.post("/details", async (req, res) => {
  try {
    console.log("inside /details", req.body.username);
    let loggedinEmail = req.body.username;
    
    let splitwiseDetails = {totalOwed: 0, friendBalancesArray: []}

    if(req.body.username) {
      splitwiseDetails = await prepareSplitwiseBalanceDetails(loggedinEmail);
    }
    
    let response = await retrieveRobinhoodBuyingPower(loggedinEmail);
    console.log("response", response);

    let buyingPower = response.buyingPower;
    let robinhoodToken = response.ROBINHOOD_ACCESS_TOKEN;

    let robinhoodDetails = { positionsArray: [], totalInvested: 0}
    if(robinhoodToken) {
      robinhoodDetails = await prepareRobinhoodBalanceDetails(robinhoodToken);
      console.log("robinhoodDetails", robinhoodDetails);
    }

    res.json({
      robinhood: parseFloat(buyingPower)+parseFloat(robinhoodDetails.totalInvested),
      robinhood_positions: robinhoodDetails.positionsArray,
      splitwise: parseFloat(splitwiseDetails.totalOwed),
      splitwise_friend_balances: splitwiseDetails.friendBalancesArray
    });

  } catch (e) {
    // authentication failed
    console.log(e);
    res.json({
      message: "error",
    });
  }
});

function updateSplitwiseConfiguration(consumerKey, consumerSecret, loggedInEmail) {
  return new Promise((resolve, reject) => {
    connect()
      .then(async () => {
        console.log("after connection in server");
        const result = await db.collection('credentials').findOneAndUpdate(
          { email: loggedInEmail },
          { $set: { 
            consumer_key: consumerKey,
            consumer_secret: consumerSecret 
          } },
          { upsert: true, returnOriginal: false }
        );
        console.log("result", result)
        resolve(result.value);
      })
      .catch((err) => {
        reject(err);
      });
  });
}


app.post("/splitwise_configuration", async (req, res) => {
  try {
    console.log("inside splitwise_configuration", req.body);
    let consumerKey = req.body.consumerKey;
    let consumerSecret = req.body.consumerSecret;
    let loggedInEmail = req.body.loggedInEmail;
    let config = await updateSplitwiseConfiguration(consumerKey, consumerSecret, loggedInEmail);
    console.log("config", config);

    res.json({
      message: "Config saved"
    });

  } catch (e) {
    // authentication failed
    console.log(e);
    res.json({
      message: "error",
    });
  }
});

app.get("/test", async (req, res) => {
  try {
    console.log("inside /test");

    const robinhoodPromise = new Promise((resolve, reject) => {
      const robinhood = Robinhood({
        username: process.env.ROBINHOOD_USERNAME,
        password: process.env.ROBINHOOD_PASSWORD
      }, () => {
        // Log in successful
        console.log('Logged in to Robinhood API');
        resolve(robinhood);
      });
      
      // Prompt user for MFA code
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question('Enter MFA code: ', (mfa_code) => {
        // Log in with MFA code
        robinhood.set_mfa_code(mfa_code, () => {
          console.log(robinhood.auth_token());
        });
        rl.close();
      });
    });

    const robinhood = await robinhoodPromise;

    // use robinhood object here...

  } catch (e) {
    // authentication failed
    console.log(e);
    res.json({
      message: "error",
    });
  }
});


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});