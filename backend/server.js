import express, { json } from "express";
import cors from "cors";
import Splitwise from "splitwise";
import Robinhood from 'robinhood';
import readline from 'readline';
import axios from "axios";
import * as dotenv from 'dotenv';

import findConfig from 'find-config';
dotenv.config({ path: findConfig('.env') });


const app = express();
const PORT = 7000;
const CLIENT_URL = "http://localhost:3000";

let robinhood;
let ROBINHOOD_AUTH_CODE;

app.use(json());
app.use(
  cors({
    origin: CLIENT_URL,
  })
);

async function prepareSplitwiseBalanceDetails() {
  const CONSUMER_KEY = process.env.CONSUMER_KEY;
  console.log("CONSUMER_KEY from env", CONSUMER_KEY)
  const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
  const sw = Splitwise({
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET
  })
  let totalBalanceArray = [];
  let friends = await sw.getFriends();
    
  let friendBalancesArray = [];

  for(let friend of friends) {
    let friendObject = {};

    //console.log("\nfriend ", friend)
    if(friend.balance.length!=0) {

      friendObject.id = friend.id;
      friendObject.name = friend.first_name;
      friendObject.amount = friend.balance[0].amount;
      friendBalancesArray.push(friendObject);

      totalBalanceArray.push(friend.balance[0].amount)
    }
    
  }

  let totalOwed = totalBalanceArray.reduce((accumulator, currentValue) => parseFloat(accumulator) + parseFloat(currentValue), 0);
  totalOwed = totalOwed.toFixed(2);
  
  return { totalOwed, friendBalancesArray};
}

async function prepareRobinhoodBalanceDetails() {
  console.log("inside prepareRobinhoodBalanceDetails");

  let positionsArray = [];
  let positions = await retrievePositions();
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


async function retrievePositions() {
  console.log("inside retrievePositions", process.env.ROBINHOOD_ACCESS_TOKEN)
  // Initialize Robinhood API with your login credentials
  const robinhood = Robinhood({
    token: process.env.ROBINHOOD_ACCESS_TOKEN
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

async function retrieveRobinhoodBuyingPower() {
  console.log("inside retrieveRobinhoodBuyingPower")
  // Initialize Robinhood API with your login credentials
  const robinhood = Robinhood({
    token: process.env.ROBINHOOD_ACCESS_TOKEN
  });

  // Wait for nonzero positions data to be returned
  const buyingPower = await new Promise((resolve, reject) => {
    robinhood.accounts((err, response, body) => {
      console.log("res", response)
      if (err) {
        reject(err);
      } else {
        console.log("inside else part", body)

        if(body!=undefined)
        resolve(parseFloat(body.results[0].cash).toFixed(2));
      }
    });
  });
  
  return buyingPower;
}

async function saveRobinhoodAccessToken(mfa_code) {
  return new Promise((resolve, reject) => {
    robinhood.set_mfa_code(mfa_code, () => {
      ROBINHOOD_AUTH_CODE = robinhood.auth_token();
      console.log("ROBINHOOD_AUTH_CODE", ROBINHOOD_AUTH_CODE);

      //save in Passage profile
      resolve(ROBINHOOD_AUTH_CODE);
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
    console.log("robinhood object", robinhood)
    
    //fix so that when password is sent from frontend, its hashed so its not intercepted
    let otpEntered = req.body.otpEntered;

    let authToken = await saveRobinhoodAccessToken(otpEntered);
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

app.get("/details", async (req, res) => {
  try {
    console.log("inside /details");
    let splitwiseDetails = await prepareSplitwiseBalanceDetails();

    let buyingPower = await retrieveRobinhoodBuyingPower();
    let robinhoodDetails = await prepareRobinhoodBalanceDetails();
    
    console.log("robinhoodDetails", robinhoodDetails);

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

async function updateSplitwiseConfiguration(consumerKey, consumerSecret) {
  //save in Passage profile
}

app.post("/splitwise_configuration", async (req, res) => {
  try {
    console.log("inside splitwise_configuration", req.body);
    let consumerKey = req.body;
    let consumerSecret = req.body;
    let config = await updateSplitwiseConfiguration(consumerKey, consumerSecret);
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