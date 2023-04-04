import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid';
import RobinhoodLoginModal from "./RobinhoodLoginModal";
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
// import './loginStyles.css';

export default class RobinhoodCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      loggedInEmail : ""
    };
  }

  componentDidMount = () => {
    console.log("props in Robinhood card", this.props);
    this.setState({
      loggedInEmail: this.props.email
    })
  }

  positiveRobinhoodTypography = (amount) => {
    return (
      <Typography variant="h4" component="div" style={{ color: "#08cc04"}}>
        +${amount}
      </Typography>
    )
  }

  negativeRobinhoodTypography = (amount) => {
    return (
      <Typography variant="h4" component="div" style={{ color: "#ff5404"}}>
        -${amount}
      </Typography>
    )
  }

  handleLoginFlowComplete = (message) => {
    this.setState({
      message
    }, () => {
      this.props.flowComplete()
    })
  }

  render() {
    const props = this.props;
    console.log("state in Robinhood card", this.state)
    return (
      <Card sx={{ maxWidth: 1100, minHeight: 170 }} style={{ marginTop: "-20px", marginBottom: "70px", marginRight: "120px", backgroundColor: "#ebebeb"}}>
          <CardContent>
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography gutterBottom variant="h5" component="div" style={{ flexGrow: 1 }}>
                {props.title}
              </Typography>
              <RobinhoodLoginModal 
                email={this.state.loggedInEmail} 
                onComplete={this.handleLoginFlowComplete}
              />
            </div>

            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ marginBottom: "15px", marginTop: "-7px", color: "#79797b"}}>
              {props.description}
            </Typography>
            
            {props.amount>=0 && this.positiveRobinhoodTypography(props.amount)}
            {props.amount<0 && this.negativeRobinhoodTypography(props.amount)}

            {props.positions && (<Typography sx={{ mb: 1.5, fontSize: 14, ml: 0.5 }} color="text.secondary">
              invested
            </Typography>)}

            <Accordion style={{ backgroundColor: "#ebebeb", boxShadow: 'none', border: 'none', borderRadius: 0, marginTop: "25px", marginLeft: "-10px"}} disableGutters={true}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography sx={{ mt: 1.5, fontSize: 21 }} variant="h5" style={{ fontWeight: 350 }} >Positions</Typography>
                <Typography sx={{ fontSize: 14, mt: 5.5, ml: -10.7 }} color="text.secondary" style={{ color: "#79797b"}}>
                  Click to view non-zero positions
                </Typography>

              </AccordionSummary>
              {props.positions && props.positions.map(item => {
                // access properties of each item in the array
                const { symbol, quantity, average_price } = item;

                return (
                  <AccordionDetails key={symbol}>
                    <Grid container spacing={2} style={{ mt: 5}}>
                      <Grid item xs={4} style={{ textAlign: "center" }}>
                        <Typography sx={{ mt: 1.5, fontSize: 16, fontWeight: 400 }} variant="h5" style={{ }} >
                          SYMBOL
                        </Typography>
                        <Typography sx={{ fontSize: 14, mt: 0}} color="text.secondary" style={{ color: "#79797b"}}>
                          {symbol}
                        </Typography>
                      </Grid>

                      <Grid item xs={4} style={{ textAlign: "center" }}>
                        <Typography sx={{ mt: 1.5, fontSize: 16, fontWeight: 400 }} variant="h5" style={{ }} >
                          Quantity
                        </Typography>
                        <Typography sx={{ fontSize: 14, mt: 0}} color="text.secondary" style={{ color: "#79797b"}}>
                          {parseFloat(quantity).toFixed(2)} shares
                        </Typography>
                      </Grid>

                      <Grid item xs={4} style={{ textAlign: "center" }}>
                        <Typography sx={{ mt: 1.5, fontSize: 16, fontWeight: 400 }} variant="h5" style={{ }} >
                          Average price
                        </Typography>
                        <Typography sx={{ fontSize: 14, mt: 0}} color="text.secondary" style={{ color: "#79797b"}}>
                          ${parseFloat(average_price).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                )
              })}
            </Accordion>
          </CardContent>
      </Card>
    )
  }
}
