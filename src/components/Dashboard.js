import { Header } from '../components/Header';
import axios from 'axios';
import React, { Component } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Card from '../components/Card';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
        //empty
    }
  }

  componentDidMount = async() => {
    //test
  }

  render () {
    console.log("Dashboard state", this.state);

    return (
      <div>
        <Header />
        <div style={{ marginTop: "40px", marginLeft: "100px"}}>
          <Card title="Chase" description="Remaining account balance"/>
          <Card title="Robinhood" description="Amount invested"/>
          <Card title="PG&E" description="Upcoming bill charges"/>
          <Card title="Splitwise" description="Pending settlements"/>
        </div>
      </div>
    )
  }
}

export default Home;