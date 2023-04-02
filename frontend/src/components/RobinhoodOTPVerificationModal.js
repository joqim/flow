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

export default class RobinhoodOTPVerificationModal extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
        open: false, //change
        accessCodeObtained: false,
        message: "",
        otpEntered: ""
      };
    }

    componentDidUpdate(prevProps) {
        console.log("props", prevProps)
        if (this.props.childOpen !== prevProps.childOpen) {
            // Do something when data prop updates
            
            this.setState({
                open: this.props.childOpen
            }, () => {
                if(this.props.childOpen==true) {
                    this.setState({
                        ...this.state,
                        message: "Credentials verified"
                    })
                }
            })
        }
    }

    handleOpen = () => {
        this.setState({
            ...this.state,
            open: true
        })
    }

    handleClose = () => {
        this.setState({
            ...this.state,
            open: false
        })
    }

    handleOTPSubmit = async (event) => {
        console.log("inside handleOTPSubmit");
        event.preventDefault();
        let response = await axios.post("http://localhost:7000/verify_robinhood_otp", this.state);
        console.log("response", response);

        this.setState({
            ...this.state,
            accessCodeObtained: response.data.success,
            message: response.data.message,
            open: false
        }, () => {
            this.props.onComplete(response.data.message)
        })
        
        return false;
    }

    handleOTPChange = (event) => {
        this.setState({
            otpEntered: event.target.value,
            message: null
        });
    }    

    render() {
        console.log("state in OTP modal", this.state)
        return (
            <div>
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
                    maxWidth: 300,
                    maxHeight: 280,
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
                </Snackbar>)}

                <div style={{ marginBottom: "20px"}}>
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h6"
                        textColor="inherit"
                        fontWeight={520}
                        fontSize={18}
                        mb={1}
                        style={{ marginLeft: "50px", marginRight: "50px", marginTop: "50px"}}
                    >
                        Enter OTP sent to your phone
                    </Typography>
                    <form 
                        onSubmit={this.handleOTPSubmit}
                        >
                        <Typography
                            textColor="inherit"
                            fontWeight={400}
                            fontSize={16}
                            style={{ marginLeft: "50px"}}
                        >
                        OTP
                        </Typography>
                        <TextField
                            id="otp"
                            type="text"
                            variant="outlined"
                            minWidth="120px"
                            required
                            value={this.state.otpEntered}
                            sx={{
                                fontSize: "12px !important",
                                marginLeft: "50px",
                                marginRight: "50px"
                            }}
                            style={{ marginBottom: "10px"}}
                            onChange={this.handleOTPChange}
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
                                ml: "34%",
                                height: '7vh', 
                                color: "#FFFFFF",
                                backgroundColor: "black",
                                border: "none",
                                borderRadius: "20px",
                            }}
                        >
                        Submit OTP
                        </Button>
                    </form>
                    </div>
                </Sheet>
            </Modal>
            
        </div>
        );
    }

}
