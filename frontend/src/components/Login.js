import "@passageidentity/passage-elements/passage-auth";
import React from "react";
import * as dotenv from 'dotenv';
dotenv.config()

export default function Login() {
    console.log("env", process.env.REACT_APP_PASSAGE_APP_ID)
    return (
        <passage-auth app-id={process.env.REACT_APP_PASSAGE_APP_ID} style={{ marginTop: "70px"}}></passage-auth>
    );
}