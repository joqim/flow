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

export default class SplitwiseRegistrationModal extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
        open: false,
        homepageURL: "http://localhost:3000",
        consumerKey: "",
        consumerSecret: "",
        message: null
      };
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

    handleSubmit = async (event) => {
        console.log("inside handleSubmit");
        event.preventDefault();
        let response = await axios.post("http://localhost:7000/splitwise_configuration", this.state);
        console.log("response", response);

        this.setState({
            ...this.state,
            message: "Configuration saved",
            open: false
        }, () => {
            this.props.onComplete(this.state.message)
        })
        
        return false;
    }

    handleKeyChange = (event) => {
        this.setState({
            consumerKey: event.target.value,
            message: null
        });
    }
    
    handleSecretChange = (event) => {
        this.setState({
            consumerSecret: event.target.value,
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
        console.log("Splitwise modal state", this.state)
        return (
            <div>
            <Button 
                variant="contained" 
                onClick={() => {
                    this.handleOpen();
                }}
                style={{ 
                  backgroundColor: "#00acac",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 550,
                  marginRight: "14px",
                  marginTop: "10px",
                  padding: "0px 24px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  height: "40px",
                  width: "160px",
                  transition: "background-color 0.2s ease",
                  textTransform: "none"
                }}
              >
                Register App
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
                    style={{ marginLeft: "50px", marginRight: "50px", marginTop: "10px"}}
                >
                    Register your application to Splitwise
                </Typography>

                <Typography id="modal-desc" textColor="text.tertiary" fontSize={16} mb={2} mt={2} style={{ marginLeft: "50px", marginRight: "50px"}}>
                    Visit <a href="https://secure.splitwise.com/apps/new" target="_blank">Splitwise</a> to register your application. <br/>
                </Typography>

                

                <form 
                    style={{ marginLeft: "50px", marginRight: "50px", marginBottom: "10px"}}
                    onSubmit={this.handleSubmit}
                >
                    <Typography
                        textColor="inherit"
                        fontWeight={400}
                        fontSize={16}
                        mt={-1}
                    >
                        HOMEPAGE URL
                    </Typography>
                    <TextField
                        variant="outlined"
                        fullWidth
                        required
                        value={this.state.homepageURL}
                        sx={{
                            fontSize: "8px !important"
                        }}
                        style={{ marginBottom: "10px"}}
                        aria-readonly
                    />

                    <Typography id="modal-desc" textColor="text.tertiary" fontSize={16} mb={2} mt={3} style={{ marginRight: "50px"}}>
                        Enter Consumer Key and Consumer Secret from the created application to sync it with Flow.
                    </Typography>

                    <Typography
                        mt={-2}
                        textColor="inherit"
                        fontWeight={400}
                        fontSize={16}
                    >
                        CONSUMER KEY
                    </Typography>
                    <TextField
                        id="consumer_key"
                        type="text"
                        variant="outlined"
                        fullWidth
                        required
                        value={this.state.consumerKey}
                        sx={{
                            fontSize: "12px !important",
                        }}
                        style={{ marginBottom: "10px"}}
                        onChange={this.handleKeyChange}
                    />

                    <Typography
                        textColor="inherit"
                        fontWeight={400}
                        fontSize={16}
                        mb={0}
                    >
                        CONSUMER SECRET
                    </Typography>
                    <TextField
                        id="consumer_secret"
                        type="text"
                        variant="outlined"
                        fullWidth
                        required
                        value={this.state.consumerSecret}
                        sx={{
                            fontSize: "12px !important",
                        }}
                        style={{ marginBottom: "30px"}}
                        onChange={this.handleSecretChange}
                    />
                    <Button
                        type="submit"
                        variant="soft"
                        color="primary"
                        sx={{ 
                            width: "150px", 
                            height: "50px", 
                            alignContent: "center", 
                            mt: 1, 
                            ml: "40%",
                            height: '7vh', 
                            color: "#FFFFFF",
                            backgroundColor: "black",
                            border: "none",
                            borderRadius: "20px",
                            mb: -2
                        }}
                    >
                        Sync with Flow
                    </Button>
                </form>
                </Sheet>
            </Modal>
        </div>
        );
    }

}
