import { Header } from './Header';
import axios from 'axios';
import React, { Component } from 'react';
import SplitwiseCard from './SplitwiseCard';
import RobinhoodCard from './RobinhoodCard';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      robinhoodAmountInvested: 0,
      robinhoodPositions: [],
      splitwiseAmount: 0,
      splitwiseFriendBalances: []
    }
  }

  componentDidMount = async() => {
    let response = await axios.get("http://localhost:7000/details");

    this.setState({
      ...this.state,
      robinhoodAmountInvested: response.data.robinhood,
      robinhoodPositions: response.data.robinhood_positions,
      splitwiseAmount: response.data.splitwise,
      splitwiseFriendBalances: response.data.splitwise_friend_balances
    })

    console.log("response", response);
  }

  

  render () {
    console.log("Dashboard state", this.state);
    return (
      <div>
        <Header />
        <div style={{ marginTop: "40px", marginLeft: "100px"}}>
          
          <RobinhoodCard   
            title="Robinhood" 
            description="Investement portfolio"
            amount={this.state.robinhoodAmountInvested}
            positions={this.state.robinhoodPositions}
          />
          
          <SplitwiseCard   
            title="Splitwise" 
            description="Pending settlements"
            amount={this.state.splitwiseAmount}
            balances={this.state.splitwiseFriendBalances}
          />
          {/* <Card title="Chase" description="Remaining account balance"/> */}
          {/* <Card title="PG&E" description="Upcoming bill charges"/> */}
        </div>
      </div>
    )
  }
}

export default Home;