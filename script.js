(function () {

    var firebaseConfig = {
        apiKey: "AIzaSyBIYR8fqmZ4Hoef6G3J1zM5KY2aTe0Z-d8",
        authDomain: "arcade-website.firebaseapp.com",
        databaseURL: "https://arcade-website-default-rtdb.firebaseio.com",
        projectId: "arcade-website",
        storageBucket: "arcade-website.appspot.com",
        messagingSenderId: "816116541407",
        appId: "1:816116541407:web:962060d94f7d6836e0066a",
        measurementId: "G-90E1GNSK3C"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.database();

    localStorage.removeItem('userEmail');
    if (firebase.auth() != null) {
      firebase.auth().signOut().then(function() {
        console.log("User signed out.");
      }, function(error) {
        console.error('Sign Out Error', error);
      });
    }
  
    // Get Elements
    const txtEmail = document.getElementById("username");
    const txtPassword = document.getElementById("password");
    const btnLogin = document.getElementById("btnLogin");
    const btnSignup = document.getElementById("btnSignup");
  
    // Validate email format
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    }
  
    // Add Login Event
    if (btnLogin != null) {
      btnLogin.addEventListener('click', e => {
        const email = txtEmail.value;
        const password = txtPassword.value;
  
        if (email === "" || password === "") {
          alert("Email and Password cannot be empty.");
          return;
        }
  
        if (!validateEmail(email)) {
          alert("Please enter a valid email address.");
          return;
        }
  
        const auth = firebase.auth();
  
        // Sign in with firebase auth
        auth.signInWithEmailAndPassword(email, password)
          .then(user => {
            alert("Login Successful :)");
            window.location.href = 'homepage.html';
          })
          .catch(err => {
            alert("Credentials Invalid. Please try again.");
            console.error("Login error:", err);
          });
      });
    }
  
    // Add Signup Event
    if (btnSignup != null) {
      btnSignup.addEventListener('click', e => {
        const email = txtEmail.value;
        const password = txtPassword.value;
  
        if (email === "" || password === "") {
          alert("Email and Password cannot be empty.");
          return;
        }
  
        if (!validateEmail(email)) {
          alert("Please enter a valid email address.");
          return;
        }
  
        const auth = firebase.auth();
  
        // Sign up with firebase auth
      auth.createUserWithEmailAndPassword(email, password)
      .then(user => {
        alert("Signup Successful :)");
        window.location.href = 'homepage.html';

        let database_ref = firebase.database().ref();

        let user_data = {
          email : email,
          last_login : Date.now()
        };

        let game_scores = {
          brickbreaker : 0,
          snakegame: 0
        };

        let name = "" + email;
        name = name.substring(0, name.indexOf("@"));

        database_ref.child('users/' + name).set(user_data);
        database_ref.child('users/' + name + '/gamescores/').set(game_scores);
      })
      .catch(err => {
        alert("Signup error: " + err.message);
        console.error("Signup error:", err);
      });
    });
    }
  
    // Monitor auth state
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        const email = user.email.replace('.', '.');
        localStorage.setItem('userEmail', email);
        console.log("User signed in: ", email);
      } else {
        // User is signed out
        localStorage.removeItem('userEmail');
        console.log("User signed out");
      }
    });

  })();
  