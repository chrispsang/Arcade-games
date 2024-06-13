const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Paddle setup
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Ball setup
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;

// Brick setup
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Score setup
let score = 0;
let highScore = 0;
let isGuest = localStorage.getItem("userEmail") === "Guest";

// Firebase configuration
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); 
}

if (isGuest) {
    highScore = parseInt(localStorage.getItem("brickBreakerHighScore")) || 0;
} else {
    getHighScore();
}

// Variables for tracking mouse events
let isMouseDown = false;
let offsetX = 0;

// Event listeners for mouse events
canvas.addEventListener('mousedown', mouseDownHandler, false);
canvas.addEventListener('mousemove', mouseMoveHandler, false);
canvas.addEventListener('mouseup', mouseUpHandler, false);

// Event listeners for touch events
canvas.addEventListener('touchstart', touchStartHandler, false);
canvas.addEventListener('touchmove', touchMoveHandler, false);
canvas.addEventListener('touchend', touchEndHandler, false);

// Mouse down handler
function mouseDownHandler(e) {
    isMouseDown = true;
    offsetX = e.clientX - paddleX;
    e.preventDefault();
}

// Mouse move handler
function mouseMoveHandler(e) {
    if (isMouseDown) {
        const newPaddleX = e.clientX - offsetX;
        if (newPaddleX >= 0 && newPaddleX <= canvas.width - paddleWidth) {
            paddleX = newPaddleX;
        }
        e.preventDefault();
    }
}

// Mouse up handler
function mouseUpHandler() {
    isMouseDown = false;
    e.preventDefault();
}

// Touch start handler
function touchStartHandler(e) {
    const touch = e.touches[0];
    if (touch) {
        isTouchDown = true;
        touchOffsetX = touch.clientX - paddleX;
        e.preventDefault();
    }
}

// Touch move handler
function touchMoveHandler(e) {
    if (isTouchDown) {
        const touch = e.touches[0];
        if (touch) {
            const newPaddleX = touch.clientX - touchOffsetX;
            if (newPaddleX >= 0 && newPaddleX <= canvas.width - paddleWidth) {
                paddleX = newPaddleX;
            }
            e.preventDefault(); 
        }
    }
}

// Touch end handler
function touchEndHandler() {
    isTouchDown = false;
    e.preventDefault();
}

// Function to handle collision detection
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    updateScore();
                    if (score === brickRowCount * brickColumnCount) {
                        restartGame();
                    }
                }
            }
        }
    }
}

// Function to draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// Function to draw the paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// Function to draw the bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Function to draw the score
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Score: ' + score, 8, 20);
    ctx.fillText('High Score: ' + highScore, canvas.width - 130, 20);
}

// Function to update the score and high score display
function updateScore() {
    if (score > highScore) {
        highScore = score;
        if (!isGuest) {
            updateFirebase();
            updateLeaderboard(userEmail, score);
        } else {
            updateLeaderboard(userEmail, score);
            localStorage.setItem("brickBreakerHighScore", score);
            
        }
    }
}

// Function to save high score to Firebase
function updateFirebase() {
    const user = firebase.auth().currentUser;
    if (user) {
        const name = user.email.substring(0, user.email.indexOf("@"));
        firebase.database().ref('users/' + name + '/gamescores/brickbreaker/').set(highScore)
            .then(() => {
                console.log('High score updated successfully.');
            })
            .catch((error) => {
                console.error('Error updating high score:', error);
            });
    } else {
        console.log('No user is signed in.');
    }
}

function getHighScore() {
    if (!isGuest) {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        } else {
            firebase.app(); 
        }
        
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                let name = user.email.substring(0, user.email.indexOf("@"));
                
                // Retrieve high score from Firebase
                firebase.database().ref('users/' + name + '/gamescores/brickbreaker/').once('value').then((snapshot) => {

                    const databaseScore = snapshot.val();
                     if (databaseScore !== null) {
                         const parsedScore = parseInt(databaseScore, 10);
                        if (!isNaN(parsedScore)) {
                            highScore = parsedScore;
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error retrieving high score:', error);
                 });
            } else {
                console.log('No user is signed in.');
            }
        });
    } else {
        highScore = parseInt(localStorage.getItem("highScore"));
    }
}

// Function to restart the game with a custom message
function restartGame() {
    if (score === brickRowCount * brickColumnCount) {
        alert('Congratulations! You broke all the bricks and won the game with a score of ' + score);
    } else {
        alert('Game over! Your final score: ' + score);
    }
    document.location.reload();
}

// Function to draw everything on the canvas
function draw() {
    if (!isPlaying || isPaused) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            isPlaying = false;
            restartGame();
        }
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}

// Event listener for keyboard events to pause the game
document.addEventListener('keydown', (e) => {
    if (e.key === 'p') {
        isPaused = !isPaused;
        if (!isPaused) {
            draw();
        }
    }
});

// Function to update the leaderboard with a new score
function updateLeaderboard(userEmail, score) {
    const leaderboardRef = firebase.database().ref('leaderboard/brickbreaker');
    
    // Push the new high score to the BrickBreaker leaderboard
    leaderboardRef.push({
        email: userEmail,
        score: score
    }).then(() => {
        console.log('Leaderboard updated successfully.');
        fetchLeaderboard(); // Fetch the leaderboard after updating it
    }).catch((error) => {
        console.error('Error updating leaderboard:', error);
    });
}

function fetchLeaderboard() {
    const leaderboardRef = firebase.database().ref('leaderboard/brickbreaker');
    leaderboardRef.orderByChild('score').on('value', (snapshot) => {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = ''; // Clear previous entries

        const highestScores = {}; // Object to store highest scores for each email

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const email = data.email;
            const score = data.score;

            // Check if the email already exists in highestScores
            if (highestScores[email] === undefined || score > highestScores[email]) {
                // If it doesn't exist or the new score is higher, update the highest score
                highestScores[email] = score;
            }
        });

        // Always include the guest score if it exists in local storage
        const guestScore = parseInt(localStorage.getItem("brickBreakerHighScore")) || 0;
        if (guestScore) {
            highestScores["Guest"] = guestScore;
        }

        // Convert highestScores object into an array of objects for sorting
        const sortedLeaderboard = Object.entries(highestScores).map(([email, score]) => ({ email, score }));

        // Sort the leaderboard in descending order based on score
        sortedLeaderboard.sort((a, b) => b.score - a.score);

        // Display the sorted leaderboard
        sortedLeaderboard.forEach((entry) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${entry.email}: ${entry.score}`;
            leaderboardList.appendChild(listItem);
        });
    });
}


    document.getElementById('leaderboardButton').addEventListener('click', function() {
        document.getElementById('leaderboardContainer').style.display = 'block'; // Show the leaderboard container
        fetchLeaderboard(); // Fetch and display the leaderboard data
    });

    document.getElementById('leaderboardButton').addEventListener('click', function() {
        var leaderboardList = document.getElementById('leaderboardList');
        if (leaderboardList.style.display === 'none' || leaderboardList.style.display === '') {
            leaderboardList.style.display = 'block';
        } else {
            leaderboardList.style.display = 'none';
        }
    });