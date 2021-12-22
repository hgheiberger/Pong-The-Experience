//Global-Configuration Variables
let playerScore = 0;
let CPUScore = 0;

const playingFieldWidth = 400;
const playingFieldHeight = 200;

var camera, renderer, scene;
var paddle1, paddle2, ball
var spotLight

var paddle1DirY = 0
var ballDirX = 1, ballDirY = 1;


//User-Configuration Variables
const pointsToWin = 7;
const difficulty = 0.3; //0: easiest  - 1: hardest

const paddleWidth = 10;
const paddleHeight = 30;
const paddleDepth = 10;

const playerPaddleSpeed = 1.7;
const maxCPUSpeed = 2.1;
var ballSpeed = 2.5;
const maxBallSpeed = 5;

//Materials for game
const paddle1Material = new THREE.MeshLambertMaterial({color: 0x1B32C0});
const paddle2Material = new THREE.MeshLambertMaterial({color: 0xFF4045});
const ballMaterial = new THREE.MeshLambertMaterial({color: 0xD43001});
const playingFieldMaterial = new THREE.MeshLambertMaterial({color: 0x4BD121});
const backgroundTableMaterial = new THREE.MeshLambertMaterial({color: 0x111111});
const backgroundPillarMaterial = new THREE.MeshLambertMaterial({color: 0x534d0d});
const groundMaterial = new THREE.MeshLambertMaterial({color: 0x888888});

//Geometries for game
const paddle1Geometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth, 1, 1, 1);
const paddle2Geometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth, 1, 1, 1);
const ballGeometry = new THREE.SphereGeometry(5, 6, 6);
const playingFieldGeometry = new THREE.PlaneGeometry(playingFieldWidth*0.95, playingFieldHeight, 10, 10);
const backgroundTableGeometry = new THREE.BoxGeometry(playingFieldWidth*1.05, playingFieldHeight*1.03, 100, 10, 10, 1);
const backgroundPillarGeometry = new THREE.BoxGeometry(30, 30, 300, 1, 1, 1); 
const groundGeometry = new THREE.BoxGeometry(1000, 1000, 3, 1, 1, 1);

//Initialize Three.js Scene
function createScene(){
    //Set scene size (in pixels)
    const sceneWidth = 1280;
    const sceneHeight = 720;

    //Initialize scene
    scene = new THREE.Scene();
    
    //Initialize camera
    const fov = 50;
    const aspectRatio = sceneWidth / sceneHeight;
    const nearClipping = 0.1;
    const farClipping = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearClipping, farClipping);
    camera.position.z = 320;

    //Initialize renderer
    const gameCanvas = document.getElementById("gameCanvas");
    renderer = new THREE.WebGLRenderer({canvas: gameCanvas, alpha: false});
    renderer.setSize(sceneWidth, sceneHeight);
    renderer.setPixelRatio(devicePixelRatio);

    //Create playing field
    const playingField = new THREE.Mesh(playingFieldGeometry, playingFieldMaterial);
    playingField.receiveShadow = true;
    scene.add(playingField);

    //Create background table
    const backgroundTable = new THREE.Mesh(backgroundTableGeometry, backgroundTableMaterial);
    backgroundTable.position.z = -51;
    backgroundTable.receiveShadow = true;
    scene.add(backgroundTable);

    //Create Pong ball
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0, 5);
    ball.receiveShadow = true;
    ball.castShadow = true;
    scene.add(ball);

    //Create paddle 1
    paddle1 = new THREE.Mesh(paddle1Geometry, paddle1Material);
    paddle1.receieveShadow = true;
    paddle1.castShadow = true;
    paddle1.position.x = -playingFieldWidth/2 + paddleWidth;
    paddle1.position.z = paddleDepth;
    scene.add(paddle1);
    
    //Create paddle 2
    paddle2 = new THREE.Mesh(paddle2Geometry, paddle2Material);
    paddle2.receieveShadow = true;
    paddle2.castShadow = true;
    paddle2.position.x = playingFieldWidth/2 - paddleWidth;
    paddle2.position.z = paddleDepth;
    scene.add(paddle2);

    //Create ground
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.z = -132;
    ground.receiveShadow = true;
    scene.add(ground);

    //Create point light
    const pointLight = new THREE.PointLight(0xF8D898, 2.9, 10000);
    pointLight.position.set(-1000, 0, 1000);
    scene.add(pointLight);

    //Create spotlight for shadow effects
    spotLight = new THREE.SpotLight(0xF8D898, 1.5);
    spotLight.position.set(0, 0, 460);
    spotLight.castShadow = true;
    scene.add(spotLight);

    //Enable Shadows
    renderer.shadowMap.enabled = true;	
}


//Initialize Pong Game
function setup(){
    //Update win conditon
    document.getElementById("winnerBoard").innerHTML = "First to " + pointsToWin + " wins!";

    //Reset scores
    playerScore = 0;
    CPUScore = 0;

    //initialize scene
    createScene();

    //Start Game Loop
    animate();
}

//Handles rendering and game logic
function animate(){
    //Draw new scene frame
    renderer.render(scene, camera);

    //Maintain game loop
    requestAnimationFrame(animate);

    //Manage game logic
    handleBallPhysics();
    handlePaddlePhysics();
    handleCameraPhysics();
    handlePlayerMovement();
    handleCPUMovement();
}

//Handles ball physics
function handleBallPhysics(){
    //Handles CPU scoring
    if (ball.position.x <= -playingFieldWidth / 2){
        //Updates score
        CPUScore++;
        document.getElementById("scores").innerHTML = playerScore + "-" + CPUScore;

        //Reset ball
        resetBall(1);
        checkWinCondition();
    }

    //Handles Player scoring
    if (ball.position.x >= playingFieldWidth / 2){
        //Updates score
        playerScore++;
        document.getElementById("scores").innerHTML = playerScore + "-" + CPUScore;

        //Reset ball
        resetBall(0);
        checkWinCondition();
    }

    //Handles bouncing off table
    if (ball.position.y <= -playingFieldHeight / 2 || ball.position.y >= playingFieldHeight / 2){
        ballDirY = -ballDirY;
    }

    //Updates ball position
    ball.position.x += ballDirX * ballSpeed;
    ball.position.y += ballDirY * ballSpeed;

    //Limits ball speed to maxBallSpeed
    if (ballDirY > maxBallSpeed){
        ballDirY = maxBallSpeed;
    }
    else if (ballDirY < -maxBallSpeed){
        ballDirY = -maxBallSpeed;
    }
}

//Handles paddle physics
function handlePaddlePhysics(){
    //Handles player paddle collisions
    if ((ball.position.x <= (paddle1.position.x + paddleWidth)) && ball.position.x >= paddle1.position.x){
        if((ball.position.y <= (paddle1.position.y + paddleHeight/2)) && (ball.position.y >= (paddle1.position.y - paddleHeight/2))){
            //If ball is travelling towards player
            if (ballDirX < 0){
                //Perform hit animation
                paddle1.scale.y = 15;

                //Switch ball direction
                ballDirX = -ballDirX;

                //Update ball angle
                ballDirY -= paddle1DirY * 0.7;
            }
        }
    } 

    //Handles CPU paddle collisions
    if ((ball.position.x <= (paddle2.position.x + paddleWidth)) && ball.position.x >= paddle2.position.x){
        if((ball.position.y <= (paddle2.position.y + paddleHeight/2)) && (ball.position.y >= (paddle2.position.y - paddleHeight/2))){
            //If ball is travelling towards CPU
            if (ballDirX > 0){
                //Perform hit animation
                paddle2.scale.y = 15;

                //Switch ball direction
                ballDirX = -ballDirX;

                //Update ball angle
                ballDirY -= paddle2DirY * 0.7;
            }
        }
    } 

}

//Handles camera physics
function handleCameraPhysics(){
    //Dynamically move lights (for shadow effect)
	spotLight.position.x = ball.position.x * 2;
	spotLight.position.y = ball.position.y * 2;

    //Position camera behind paddle's current position
	camera.position.x = paddle1.position.x - 100;
	camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;

    //Add small camera movement effect
    camera.position.z = paddle1.position.z + 100 + 0.04 * (-ball.position.x + paddle1.position.x);

    //Rotates camera toward CPU
    camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
    camera.rotation.y = -60 * Math.PI/180;
    camera.rotation.z = -90 * Math.PI/180;

}

//Handles player movement
function handlePlayerMovement(){
    //Handles move left
    if (Key.isDown(Key.A)){
        
        //If paddle is not touching the side, move
        if (paddle1.position.y < playingFieldHeight * 0.44){      
            paddle1DirY = 1;
        }

        //Otherwise, indicate to the user that the side has been reached by gradually scaling paddle
        else{
            paddle1DirY = 0;
            paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
        }

    }
    //Handles move right
    else if (Key.isDown(Key.D)){
        //If paddle is not touching the side, move
        if (paddle1.position.y > -playingFieldHeight * 0.44){
            paddle1DirY = -1;
        }

        //Otherwise, indicate to the user that the side has been reached by gradually scaling paddle
        else{
            paddle1DirY = 0;
            paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
        }
        
    }
    //Handles arbitrary key press
    else{
        paddle1DirY = 0;
    }

    //Gradually descales paddle if necessary
    paddle1.scale.y += (1 - paddle1.scale.y) * 0.2;	
    paddle1.scale.z += (1 - paddle1.scale.z) * 0.2;	
    
    //Performs paddle movement
    paddle1.position.y += paddle1DirY * playerPaddleSpeed;
}

//Handles CPU movement
function handleCPUMovement(){
    //Move CPU in the direction of ball
    const paddle2Speed = (ball.position.y - paddle2.position.y) * difficulty;

    //If speed is greater than max, move paddle by maxspeed
    if (Math.abs(paddle2Speed) < maxCPUSpeed){
        paddle2.position.y += paddle2Speed;
    }

    //Otherwise, move paddle by the calculated spee
    else {
        //Move in positive direction
        if (paddle2Speed > 0){
            paddle2.position.y += maxCPUSpeed;
        }

        //Move in negative direction
        else if (paddle2Speed < 0){
            paddle2.position.y -= maxCPUSpeed;
        }
    }

    //Gradually descales paddle if necessary
    paddle2.scale.y += (1 - paddle2.scale.y) * 0.2;	
}

//Resets ball after point
//losingPaddle: 1: Player  0: CPU
function resetBall(losingPaddle){
    //Reset ball position to center
    ball.position.x = 0;
    ball.position.y = 0;

    //If CPU lost point, serve ball to Player
    if (losingPaddle === 0){
        ballDirX = -1;
    }
    //If Player lost point, serve ball to CPU
    else{
        ballDirX = 1;
    }

    //Give arbitrary positive server direction
    ballDirY = 1;
}

//Checks wheher Player or CPU has won
var bounceTimee = 0;
function checkWinCondition(){
    
    if (playerScore >= pointsToWin){
        //Stop Ball 
        ballSpeed = 0;

        //Create win message
        document.getElementById("scores").innerHTML = "Player wins!";		
		document.getElementById("winnerBoard").innerHTML = "Refresh to play again";

        //Start paddle oscillation animation
        bounceTime++;
		paddle1.position.z = Math.sin(bounceTime * 0.1) * 10;
		paddle1.scale.z = 2 + Math.abs(Math.sin(bounceTime * 0.1)) * 10;
		paddle1.scale.y = 2 + Math.abs(Math.sin(bounceTime * 0.05)) * 10;
    }
    else if (CPUScore >= pointsToWin){
        //Stop Ball 
        ballSpeed = 0;

        //Create win message
		document.getElementById("scores").innerHTML = "CPU wins!";
		document.getElementById("winnerBoard").innerHTML = "Refresh to play again";

        //Start paddle oscillation animation
		bounceTime++;
		paddle2.position.z = Math.sin(bounceTime * 0.1) * 10;
		// enlarge and squish paddle to emulate joy
		paddle2.scale.z = 2 + Math.abs(Math.sin(bounceTime * 0.1)) * 10;
		paddle2.scale.y = 2 + Math.abs(Math.sin(bounceTime * 0.05)) * 10;
    }
}


/**
//Resize canvas on window resize
window.addEventListener('resize', () =>
{
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

*/