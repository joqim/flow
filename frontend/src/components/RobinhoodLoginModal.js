import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import TextField from '@mui/material/TextField';
import Sheet from '@mui/joy/Sheet';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import RobinhoodOTPVerificationModal from './RobinhoodOTPVerificationModal';

export default class RobinhoodLoginModal extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
        open: false,
        email: "",
        password: "",
        openOTP: false,
        message: null,
        otpEntered: "",
        loggedInEmail: ""
      };
    }

    componentDidMount = () => {
        console.log("props in Robinhood Login Modal", this.props);
        this.setState({
            loggedInEmail: this.props.email
        })
    }

    handleOpen = () => {
        this.setState({
            ...this.state,
            open: true,
            openOTP: false
        })
    }

    handleClose = () => {
        this.setState({
            ...this.state,
            open: false,
            openOTP: false
        })
    }

    handleSubmit = async (event) => {
        console.log("inside handleSubmit");
        event.preventDefault();
        let response = await axios.post("http://localhost:7002/robinhood_otp", this.state);
        console.log("response", response);

        this.setState({
            ...this.state,
            openOTP: response.data.success,
            message: response.data.message
        })
        
        return false;
    }

    handleEmailChange = (event) => {
        this.setState({
            email: event.target.value,
            message: null
        });
    }
    
    handlePasswordChange = (event) => {
        this.setState({
            password: event.target.value,
            message: null
        });
    }
    

    handleOTPComplete = (message) => {
        this.setState({
            ...this.state,
            open: false,
            message
        }, () => {
            this.props.onComplete(message)
        })
    }

    render() {
        console.log("Robinhood Login modal state", this.state)
        return (
            <div>
            <Button
                variant="contained"
                onClick={(event) => {
                    this.handleOpen();
                }}
                sx={{
                    paddingRight: "16px",
                    color: "#FFFFFF",
                    backgroundColor: "black",
                    fontSize: "16px",
                    border: "none",
                    borderRadius: "20px",
                    padding: "0px 24px",
                    width: "150px",
                    height: "40px",
                    textTransform: "none",
                    marginRight: "20px",
                    marginTop: "10px",
                    cursor: "pointer",
                }}
            >
                Log In
            </Button>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={this.state.open}
                onClose={this.handleClose}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                
                <Sheet
                variant="outlined"
                sx={{
                    minWidth: 600,
                    borderRadius: 'md',
                    p: 2,
                    boxShadow: 'sm',
                }}
                >
                <ModalClose
                    variant="outlined"
                    sx={{
                        top: 'calc(-1/4 * var(--IconButton-size))',
                        right: 'calc(-1/4 * var(--IconButton-size))',
                        boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
                        borderRadius: '50%',
                        bgcolor: 'background.body',
                    }}
                    onClick={this.handleClose}
                />
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
                    {/* <Alert onClose={() => this.setState({ message: null })} severity="error">
                        {this.state.message}
                    </Alert> */}
                </Snackbar>)}

                <Typography
                    component="h2"
                    id="modal-title"
                    level="h4"
                    textColor="inherit"
                    fontWeight={520}
                    fontSize={22}
                    mb={1}
                    style={{ marginLeft: "50px", marginRight: "50px", marginTop: "50px"}}
                >
                    Log in to Robinhood
                </Typography>
                <Typography id="modal-desc" textColor="text.tertiary" fontSize={14} mb={2} mt={-1} style={{ marginLeft: "50px", marginRight: "50px"}}>
                    Enter your email and password to access your Robinhood account.
                </Typography>

                <form 
                    style={{ marginLeft: "50px", marginRight: "50px", marginBottom: "10px"}}
                    onSubmit={this.handleSubmit}
                >
                    <Typography
                        textColor="inherit"
                        fontWeight={400}
                        fontSize={16}
                    >
                        Email
                    </Typography>
                    <TextField
                        id="email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        required
                        value={this.state.email}
                        sx={{
                            fontSize: "12px !important",
                        }}
                        style={{ marginBottom: "10px"}}
                        onChange={this.handleEmailChange}
                    />

                    <Typography
                        textColor="inherit"
                        fontWeight={400}
                        fontSize={16}
                    >
                        Password
                    </Typography>
                    <TextField
                        id="password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        required
                        value={this.state.password}
                        onChange={this.handlePasswordChange}
                        sx={{
                            fontSize: "12px !important",
                        }}
                        style={{ marginBottom: "30px"}}
                    />
                    <Button
                        type="submit"
                        variant="soft"
                        color="primary"
                        sx={{ 
                            width: "100px", 
                            height: "50px", 
                            alignContent: "center", 
                            mt: 1, 
                            ml: "40%",
                            height: '5vh', 
                            color: "#FFFFFF",
                            backgroundColor: "black",
                            border: "none",
                            borderRadius: "20px",
                        }}
                    >
                        Get OTP
                    </Button>
                </form>
                <RobinhoodOTPVerificationModal 
                    childOpen={this.state.openOTP} 
                    onComplete={this.handleOTPComplete}
                    email={this.props.email}
                />
                </Sheet>
            </Modal>
            {/* {this.state.openOTP && (<RobinhoodOTPVerificationModal childOpen={this.state.openOTP}/>)} */}
        </div>
        );
    }

}
