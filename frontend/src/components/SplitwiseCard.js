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
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SplitwiseRegistrationModal from './SplitwiseRegistrationModal';

export default class SplitwiseCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null
    };
  }

  positiveSplitwiseTypography = (amount) => {
    return (
      <Typography variant="h4" component="div" style={{ color: "#00acac"}}>
        +${amount}
      </Typography>
    )
  }

  negativeSplitwiseTypography = (amount) => {
    return (
      <Typography variant="h4" component="div" style={{ color: "#ff652f"}}>
        -${amount}
      </Typography>
    )
  }

  positiveAccordianSplitwiseTypography = (amount) => {
    return (
      <Typography sx={{ fontSize: 16 }} style={{ color: "#00acac"}}>
        +${amount}
      </Typography>
    )
  }

  negativeAccordianSplitwiseTypography = (amount) => {
    return (
      <Typography sx={{ fontSize: 16 }} style={{ color: "#ff652f"}}>
        -${amount.substring(1)}
      </Typography>
    )
  }
  
  handleConfigSaveComplete = (message) => {
    console.log("message in Splitwise Card")
    this.setState({
      message
    })
  }

  render() {
    const props = this.props;
    return (
      <Card sx={{ maxWidth: 1100, minHeight: 170 }} style={{ marginBottom: "70px", marginRight: "120px", backgroundColor: "#ebebeb"}}>
        {/* color: "#79797b" */}
        {/* <CardActionArea> */}
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
              <SplitwiseRegistrationModal onComplete={this.handleConfigSaveComplete}/>
            </div>

            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ marginBottom: "15px", marginTop: "-7px", color: "#79797b"}}>
              {props.description}
            </Typography>

            {props.amount>=0 && this.positiveSplitwiseTypography(props.amount)}
            {props.amount<0 && this.negativeSplitwiseTypography(props.amount)}
            
            <Typography sx={{ mb: 1.5, fontSize: 14, ml: 0.5 }} color="text.secondary">
              balance
            </Typography>
            <Accordion style={{ backgroundColor: "#ebebeb", boxShadow: 'none', border: 'none', borderRadius: 0, marginTop: "25px", marginLeft: "-10px"}} disableGutters={true}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography sx={{ mt: 1.5, fontSize: 21 }} variant="h5" style={{ fontWeight: 350 }} >Friends</Typography>
                <Typography sx={{ fontSize: 14, mt: 5.5, ml: -8.5 }} color="text.secondary" style={{ color: "#79797b"}}>
                  Click to view balances between friends
                </Typography>

              </AccordionSummary>
              {props.balances.map(item => {
                // access properties of each item in the array
                const { id, name, amount } = item;

                return (
                  <AccordionDetails key={id}>
                    <Typography style={{ color: "#737a9a", fontSize: 16.5}}>
                      {name}
                    </Typography>
                    {amount>=0 && this.positiveAccordianSplitwiseTypography(amount)}
                    {amount<0 && this.negativeAccordianSplitwiseTypography(amount)}
                  </AccordionDetails>
                )
              })}
              
            </Accordion>
          </CardContent>
        {/* </CardActionArea> */}
      </Card>
    )
  }
}
