import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import * as firebaseui from 'firebaseui'
import * as firebase from "firebase/app";

class SignIn extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: false // Local signed-in state.
    };
    this.setLoggedIn = props.setLoggedIn;

      // Configure FirebaseUI.
    this.uiConfig = {
      // Popup signin flow rather than redirect flow.
      signInFlow: 'popup',
      // We will display Google and Facebook as auth providers.
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false
      }
    };
  }

  // Listen to the Firebase Auth state and set the local state.
  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
        (user) => {
          this.setState({isSignedIn: !!user});
          this.setLoggedIn(!!user);
        }
    );
  }
  
  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const button = <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} style={{backgroundColor:"blue"}} />;
    return (
      <>{!this.state.isSignedIn && button}</>
  
    );
  }
}

export default SignIn;
