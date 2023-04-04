import "@passageidentity/passage-elements/passage-auth";
const REACT_APP_PASSAGE_APP_ID = "UeLr98YGJNcEWTzgIKxbmR6n"

export default function Login() {
    return (
        <passage-auth app-id={REACT_APP_PASSAGE_APP_ID} style={{ marginTop: "70px"}}></passage-auth>
    );
}