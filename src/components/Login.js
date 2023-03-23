import "@passageidentity/passage-elements/passage-auth";

export default function Login() {
    return (
        <passage-auth app-id={process.env.REACT_APP_PASSAGE_APP_ID} style={{ marginTop: "70px"}}></passage-auth>
    );
}