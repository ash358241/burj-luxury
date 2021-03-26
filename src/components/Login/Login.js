import React, { useContext, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { UserContext } from '../../App';
import { useHistory, useLocation } from 'react-router';




const Login = () => {
    //context api
    const [loggedInUser, setLoggedInUser] = useContext(UserContext);
    
    //hooks
    const history = useHistory();
    const location = useLocation();

    const { from } = location.state || { from: { pathname: "/" } };

    //user state
    const [user, setUser] = useState({
        isSignedIn:false,
        name: '',
        email: '',
        password: '',
        success: false,
    })

    //newUser state for toggling
    const [newUser, setNewUser] = useState(false);

    //handling firebase error
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }else {
        firebase.app(); // if already initialized, use that one
     }

     //google signIn
    const handleGoogleSignIn = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth()
  .signInWithPopup(provider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;
    var token = credential.accessToken;
    const {displayName, email} = result.user;
    const signedInUser = {name: displayName, email};
    setLoggedInUser(signedInUser);
    storeAuthToken();
    history.replace(from);
  }).catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
  });
    }

    //facebook signIn
    const handleFBSignIn = () => {
        var fbProvider = new firebase.auth.FacebookAuthProvider();
        firebase
  .auth()
  .signInWithPopup(fbProvider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;
    const {displayName, email} = result.user;
    const fbSignedInUser = {name: displayName, email};
    setLoggedInUser(fbSignedInUser);
    history.replace(from);
    var accessToken = credential.accessToken;

  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;

  });
    }

    //handleBlur event
    const handleBlur = (e) => {
        let isFieldValid = true;
        //checking the email valid or not
        if(e.target.name === 'email'){
            isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
        }
        //checking the password valid or not
        if(e.target.name === 'password'){
            const isPasswordValid = e.target.value > 6;
            const passwordHasNumber =  /\d+/g.test(e.target.value);
            isFieldValid = isPasswordValid && passwordHasNumber;
        }
        //if password and email is valid then apply this condition
        if(isFieldValid){
            //getting all the properties of user
            const newUserInfo = {...user};
            //execute the implementation
            newUserInfo[e.target.name] = e.target.value;
            setUser(newUserInfo);
        }
    }

    //handleSubmit event
    const handleSubmit = (e) => {
        if(newUser && user.email && user.password){
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
            .then((res) => {
            const newUserInfo = {...user};
            newUserInfo.error = '';
            newUserInfo.success = true;
            setUser(newUserInfo);
            updateUserName(user.name);
            })
            .catch((error) => {
                const newUserInfo = {...user};
                newUserInfo.error = error.message;
                newUserInfo.success = false;
                setUser(newUserInfo);
            });
        }

        if(!newUser && user.email && user.password){
            firebase.auth().signInWithEmailAndPassword(user.email, user.password)
            .then((res) => {
                const newUserInfo = {...user};
            newUserInfo.error = '';
            newUserInfo.success = true;
            setUser(newUserInfo);
            console.log('sign in user info', res.user);
            })
            .catch((error) => {
                const newUserInfo = {...user};
                newUserInfo.error = error.message;
                newUserInfo.success = false;
                setUser(newUserInfo);
  });
        }

        e.preventDefault();
    }


    //updateUserInfo
    const updateUserName = (name) => {
        const user = firebase.auth().currentUser;

        user.updateProfile({
        displayName: name
        }).then(function() {
        console.log('Update successful')
        }).catch(function(error) {
            console.log(error);
        });
    }

    const storeAuthToken = () => {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
        .then(function(idToken) {
            sessionStorage.setItem('authToken', idToken);
          }).catch(function(error) {
            // Handle error
          });
    }

    return (
        <div style={{textAlign: 'center'}}>
            <h1>This is Login</h1>
            <button onClick={handleGoogleSignIn}>Google sign-in</button>
            <br/>
            <button onClick={handleFBSignIn}>Facebook sign-in</button>
            <br/>
            <br/>
            {/* checkbox */}
            <input type="checkbox" name="newUser" id="" onChange={() => setNewUser(!newUser)}/>
            <label htmlFor="newUser">New User Sign Up</label>
            <form onSubmit={handleSubmit}>
            {newUser && <input type="text" name="name" id="" placeholder="name" onBlur={handleBlur}/>}
            <br/>
            <input type="text" name="email" placeholder='email' onBlur={handleBlur} required />
            <br/>
            <input type="password" name="password" placeholder='password' onBlur={handleBlur} required />
            <br/>
            <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
            </form>
            <p style={{color: 'red'}}>{user.error}</p>
            {
                user.success && <p style={{color: 'green'}}>User {newUser ? 'Created' : 'Logged In'} successfully</p>
            }
        </div>
    );
};

export default Login;