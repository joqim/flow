import { Header } from '../components/Header';
import SplitwiseCard from './SplitwiseCard';
import RobinhoodCard from './RobinhoodCard';
import React, { Component } from 'react';
import axios from 'axios';
import { Passage } from '@passageidentity/passage-js';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';

const API_URL = "http://localhost:7002";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isAuthorized: false,
      username: "",
      robinhoodAmountInvested: 0,
      robinhoodPositions: [],
      splitwiseAmount: 0,
      splitwiseFriendBalances: [],
      message: null,
      loading: true
    };
  }

  fetchDetails = async () => {
    let response = await axios.post("http://localhost:7002/details", this.state);

    this.setState({
      ...this.state,
      robinhoodAmountInvested: response.data.robinhood,
      robinhoodPositions: response.data.robinhood_positions,
      splitwiseAmount: response.data.splitwise,
      splitwiseFriendBalances: response.data.splitwise_friend_balances,
      loading: false
    })

    console.log("response", response)
  }

  async componentDidMount() {
    let authResponse = await this.getAuthStatus();
  }

  async getAuthStatus() {
    try {
      const authToken = localStorage.getItem("psg_auth_token");
      const response = await axios.post(`${API_URL}/auth`, null, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log("auth response", response)
      const { authStatus, identifier } = response.data;
      if (authStatus === "success") {
        this.setState({
          isLoading: false,
          isAuthorized: authStatus,
          username: identifier,
          message: "Successfully signed into Flow via Passage."
        }, async () => {
          let detailsResponse = await this.fetchDetails();
        });
      } else {
        this.setState({
          isLoading: false,
          isAuthorized: false,
          username: "",
          message: "Not logged in. Login to access Flow"
        }, async () => {
          let detailsResponse = await this.fetchDetails();
        });
      }
    } catch (err) {
      console.log(err);
      this.setState({
        isLoading: false,
        isAuthorized: false,
        username: "",
        message: "Not logged in. Login to access Flow"
      }, async () => {
        let detailsResponse = await this.fetchDetails();
      });
    }
  }

  handleLogout = async () => {
    try {
      const REACT_APP_PASSAGE_APP_ID = "UeLr98YGJNcEWTzgIKxbmR6n"
      const passage = new Passage(REACT_APP_PASSAGE_APP_ID);
      const session = passage.getCurrentSession();
      const sessionSignOut = await session.signOut();
      console.log("sessionSignOut", sessionSignOut);
      
      this.setState({
        isLoading: false,
        isAuthorized: false,
        username: "",
        message: "Logged out of Flow."
      });
      
    } catch (err) {
      console.log(err);
    }
  };

  render () {
    console.log("Dashboard state", this.state);
    const { isLoading, isAuthorized, username } = this.state;

    if (isLoading) {
      return null;
    }

    const authorizedBody = 
    <>
      {this.state.message!=null && (<Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={this.state.message !== null}
        autoHideDuration={6000}
        onClose={() => this.setState({ message: null })}
        message={this.state.message}
        action={
          <React.Fragment>
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{ p: 0.5 }}
              onClick={() => this.setState({ message: null })}
            >
              <CloseIcon />
            </IconButton>
          </React.Fragment>
        }
      >
      </Snackbar>)}
      <br/><br/>
      {/* <Typography gutterBottom style={{ flexGrow: 1, fontSize: 17 }}>
        Hi, {username.split('@')[0]}
      </Typography> */}
      <br/><br/>

      <RobinhoodCard   
        style={{ marginTop: "-40px"}}
        title="Robinhood" 
        description="Investement portfolio"
        amount={this.state.robinhoodAmountInvested}
        positions={this.state.robinhoodPositions}
        email={this.state.username}
        flowComplete={this.fetchDetails}
      />
      
      <SplitwiseCard
        email={this.state.username}
        title="Splitwise" 
        description="Pending settlements"
        amount={this.state.splitwiseAmount}
        balances={this.state.splitwiseFriendBalances}
        flowComplete={this.fetchDetails}
      />
      {/* <Card title="Chase" description="Remaining account balance"/> */}
      {/* <Card title="PG&E" description="Upcoming bill charges"/> */}
    </>;

    const unauthorizedBody = 
    <>
      {this.state.message!=null && (<Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={this.state.message !== null}
        autoHideDuration={10000}
        onClose={() => this.setState({ message: null })}
        message={this.state.message}
        action={
          <React.Fragment>
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{ p: 0.5 }}
              onClick={() => this.setState({ message: null })}
            >
              <CloseIcon />
            </IconButton>
          </React.Fragment>
        }
      >
      </Snackbar>)}
      <br/><br/>
      <Button 
          variant="contained" 
          href="/" 
          style={{ 
            backgroundColor: "#c3a4fb",
            color: "black",
            fontSize: "16px",
            fontWeight: 410,
            marginRight: "14px",
            marginTop: "-40px",
            marginLeft: "-1 0px",
            padding: "0px 24px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            height: "40px",
            width: "200px",
            transition: "background-color 0.2s ease",
            textTransform: "none"
          }}
        >
          Login to Continue
      </Button>
      {/* <a href="/" >Login to continue.</a> */}
    </>;

    return (
      <div>
        {this.state.loading && 
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#fff' // Change the background color as desired
           }}>
            <CircularProgress />
          </Box>
        }
        {!this.state.loading && (
          <>
            {/* <div>{isAuthorized ? 'Welcome!' : 'Unauthorized'}</div> */}
            <br />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "60px" }}>
              <Header />
              {isAuthorized && (<Button 
                variant="contained"
                onClick={this.handleLogout}
                style={{ 
                  backgroundColor: "black",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 410,
                  marginRight: "16%",
                  padding: "0px 24px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  height: "40px",
                  width: "150px",
                  transition: "background-color 0.2s ease",
                  textTransform: "none"
                }}
                >
                  Logout
              </Button>)}
              
            </div>
            <div style={{ marginTop: "0px", marginLeft: "100px"}}>
                {isAuthorized ? authorizedBody : unauthorizedBody}
              </div>
          </>
        )}
        
      </div>
    )
  }
}

export default Dashboard;
