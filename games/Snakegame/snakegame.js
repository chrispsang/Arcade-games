const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const grid = 20;
const snakeSpeed = 100; // Milliseconds per frame
let lastRenderTime = 0;

let snake = {
    x: grid * 5,
    y: grid * 5,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
};

let apple = {
    x: grid * 10,
    y: grid * 10
};

let score = 0;
let highScore = 0;
let isGuest = localStorage.getItem("userEmail") === "Guest";
let gameOver = false;
let gameStarted = false;
let gamePaused = false; // Variable to track whether the game is paused

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
    highScore = parseInt(localStorage.getItem("snakeGameHighScore")) || 0;
} else {
    getHighScore();
}

const scoreBox = document.getElementById("score");

const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
            console.log("attributes changed");
        }
    }
});


const config = {
    attributes: true,
    attributeFilter: ['data-value']
};

observer.observe(scoreBox, config);

observer.observe(scoreBox, {
    attributes: true
    });

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetGame() {
    snake.x = grid * 5;
    snake.y = grid * 5;
    snake.dx = grid;
    snake.dy = 0;
    snake.cells = [];
    snake.maxCells = 4;

    apple.x = getRandomInt(0, canvas.width / grid) * grid;
    apple.y = getRandomInt(0, canvas.height / grid) * grid;

    gameOver = false;
    gameStarted = false;
    
}

function updateScore() {
    if (score > highScore) {
        highScore = score;
        if (!isGuest) {
            updateFirebase();
            updateLeaderboard(userEmail, score);
        }
        else {
            localStorage.setItem("snakeGameHighScore", score);
        }
        
    }

    ctx.clearRect(0, 0, canvas.width, 40);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Score: ' + score, canvas.width / 6, 20);
    ctx.fillText('High Score: ' + highScore, canvas.width - 130, 20);
}

function draw() {
    if (!gameStarted) return;

    if(gamePaused) {
        requestAnimationFrame(draw);
        return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - lastRenderTime;

    if (deltaTime < snakeSpeed) {
        requestAnimationFrame(draw);
        return;
    }

    lastRenderTime = currentTime;

    ctx.clearRect(0, 40, canvas.width, canvas.height - 40);

    if (gameOver) {
        drawGameOver(); 
        return;
    }

    snake.x += snake.dx;
    snake.y += snake.dy;

    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
        gameOver = true;
    }

    snake.cells.unshift({ x: snake.x, y: snake.y });

    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    ctx.fillStyle = 'green';
    snake.cells.forEach((cell, index) => {
        ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            apple.x = getRandomInt(0, canvas.width / grid) * grid;
            apple.y = getRandomInt(0, canvas.height / grid) * grid;
            score += 10;
            console.log("Score" + score);
            scoreBox.dataset.value = score;
            updateScore();
        }

        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                gameOver = true;
            }
        }
    });

    updateScore();
    requestAnimationFrame(draw);
}

function drawGameOver() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Display the game over message
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);

    // Optionally, display the final score
    ctx.font = '20px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 30);

    // Show the start button
    document.getElementById('startSnake').style.display = 'block';
}


document.getElementById('startSnake').addEventListener('click', () => {
    if (!gameStarted || gameOver) {
    resetGame();
    score = 0;
    updateScore();
    gameOver = false;
    gameStarted = true; // Ensure the game starts again
    lastRenderTime = Date.now();
    draw(); // Start the game loop

    // Hide the button after clicking
    document.getElementById('playAgainButton').style.display = 'none';
    }
});

document.getElementById('helpButton').addEventListener('click', () => {
    toggleGamePause();
});

document.getElementById('closeBtn').addEventListener('click', () => {
    toggleGamePause();
});

function toggleGamePause() {
    gamePaused = !gamePaused;
    if (!gamePaused) {
        lastRenderTime = Date.now();
        draw();
    }
}

document.addEventListener('keydown', (e) => {
    if ([37, 38, 39, 40].includes(e.keyCode) && !gamePaused) {
        e.preventDefault();

        if (gameOver) {
            return;
        }

        if (e.which === 37 && snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
            gameStarted = true;
        } else if (e.which === 38 && snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
            gameStarted = true;
        } else if (e.which === 39 && snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
            gameStarted = true;
        } else if (e.which === 40 && snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
            gameStarted = true;
        }
    }
});

// Function to handle touch start event
function handleTouchStart(event) {
    event.preventDefault(); // Prevent default behavior

    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    // Store initial touch position
    startX = touchX;
    startY = touchY;
}

// Function to handle touch end event
function handleTouchEnd(event) {
    event.preventDefault(); // Prevent default behavior

    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;

    // Calculate swipe distance
    const deltaX = touchX - startX;
    const deltaY = touchY - startY;

    // Determine swipe direction based on the larger delta value
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            // Move right
            snake.dx = grid;
            snake.dy = 0;
        } else {
            // Move left
            snake.dx = -grid;
            snake.dy = 0;
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            // Move down
            snake.dy = grid;
            snake.dx = 0;
        } else {
            // Move up
            snake.dy = -grid;
            snake.dx = 0;
        }
    }
}

// Add touch event listeners to the canvas
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);


resetGame();

document.getElementById('startSnake').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        lastRenderTime = Date.now();
        draw();
        document.getElementById('startSnake').style.display = 'none'; // Hide the button
        // fetchLeaderboard();
    }
});

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
            firebase.database().ref('users/' + name + '/gamescores/snakegame/').once('value')
                .then((snapshot) => {
                const databaseScore = snapshot.val();
                const parsedScore = parseInt(databaseScore, 10);
                if (parsedScore !== null) {
                    // highScoreDisplay.innerText = parsedScore;
                    highScore = parsedScore;
                }
                })
                .catch((error) => {
                console.error('Error retrieving high score:', error);
                });
            } else {
            console.log('No user is signed in.');
            }
        });
    }
    else {
        highScore = parseInt(localStorage.getItem("highScore"));
    }
}

function updateFirebase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    } else {
        firebase.app(); 
    }

    const user = firebase.auth().currentUser;
    if (user) {
        let name = user.email;
        name = name.substring(0, name.indexOf("@"));
        firebase.database().ref('users/' + name + '/gamescores/' + "snakegame").set(highScore)
        .then(() => {
            console.log('Score updated successfully.');
        })
        .catch((error) => {
            console.error('Error updating score:', error);
        });
    } else {
        console.log('No user is signed in.');
    }

    return;
}
// Function to update the leaderboard with a new score
function updateLeaderboard(userEmail, score) {
    const leaderboardRef = firebase.database().ref('leaderboard/snakegame');
    
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
    const leaderboardRef = firebase.database().ref('leaderboard/snakegame');
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
        const guestScore = parseInt(localStorage.getItem("snakeGameHighScore")) || 0;
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