const gameStart = document.querySelector('.game-start');
const gameArea = document.querySelector('.game-area');
const gameOver = document.querySelector('.game-over');
const gameScore = document.querySelector('.game-score');
const gamePoints = document.querySelector('.points');
let keys = {};
let player = {
    x: 150,
    y: 100,
    widht: 0,
    height: 0,
    lastTimeFiredFireball: 0
};
let game = {
    speed: 2,
    movingMultiplier: 4,
    fireBallMultiplier: 5,
    fireInterval: 1000,
    cloudSpawnInterval: 3000,
    bugSpawnInterval: 1000,
    bugKillBonus: 2000
};
let scene = {
    score: 0,
    lastCloudSpawn: 0,
    lastBugSpawn: 0,
    isActiveGame: true
};

gameStart.addEventListener('click', onGameStart);

function onGameStart() {
    gameStart.classList.add('hide');
    //render wizard
    const wizard = document.createElement('div');
    wizard.classList.add('wizard');
    wizard.style.top = '200px';
    wizard.style.left = '200px';
    gameArea.appendChild(wizard);
    player.widht = wizard.offsetWidth;
    player.height = wizard.offsetHeight;
    //game infinity loop
    window.requestAnimationFrame(gameAction);

    wizard.style.top = player.y + 'px';
    wizard.style.left = player.x + 'px';

}
//global key listeners
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

//key handlers
function onKeyDown(e) {
    keys[e.code] = true;
    console.log(keys);
}

function onKeyUp(e) {
    keys[e.code] = false;
    console.log(keys);
}

//game loop function;
function gameAction(timestamp) {
    const wizard = document.querySelector('.wizard');
    //console.log(timestamp);


    //Add bugs
    if (timestamp - scene.lastBugSpawn > game.bugSpawnInterval + 5000 * Math.random()) {
        let bug = document.createElement('div');
        bug.classList.add('bug');
        bug.x = gameArea.offsetWidth - 60;
        bug.style.left = bug.x + 'px';
        bug.style.top = (gameArea.offsetHeight - 60) * Math.random() + 'px';
        gameArea.appendChild(bug);
        scene.lastBugSpawn = timestamp;
    }

    //Add clouds
    if (timestamp - scene.lastCloudSpawn > game.cloudSpawnInterval + 2000 * Math.random()) {
        let cloud = document.createElement('div');
        cloud.classList.add('cloud');
        cloud.x = gameArea.offsetWidth - 200;
        cloud.style.left = cloud.x + 'px';
        cloud.style.top = (gameArea.offsetHeight - 200) * Math.random() + 'px';
        gameArea.appendChild(cloud);
        scene.lastCloudSpawn = timestamp;
    }

    //Modify bug position 
    let bugs = document.querySelectorAll('.bug');
    bugs.forEach(bug => {
        bug.x -= game.speed * 3;
        bug.style.left = bug.x + 'px';
        if (bug.x + bugs.offsetWidth <= 0) {
            bug.parentElement.removeChild(bug);
        }
    });

    //Modify clouds position 
    let clouds = document.querySelectorAll('.cloud');
    clouds.forEach(cloud => {
        cloud.x -= game.speed;
        cloud.style.left = cloud.x + 'px';

        if (cloud.x + clouds.offsetWidth <= 0) {
            cloud.parentElement.removeChild(cloud)
        }
    });


    //Modify fireBalls position 
    let fireBalls = document.querySelectorAll('.fire-ball');
    fireBalls.forEach(fireBall => {
        fireBall.x += game.speed * game.fireBallMultiplier;
        fireBall.style.left = fireBall.x + 'px';
        if (fireBall.x + fireBall.offsetWidth > gameArea.offsetWidth) {
            fireBall.parentElement.removeChild(fireBall)
        }
    });
    //aplly gravitation
    let isInAir = (player.y + player.height) <= gameArea.offsetHeight;
    if (isInAir) {
        player.y += game.speed;
    }
    //register user input;
    if (keys.ArrowUp && player.y > 0) {
        player.y -= game.speed * game.movingMultiplier;
    }
    if (keys.ArrowDown && isInAir) {
        player.y += game.speed * game.movingMultiplier;
    }
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= game.speed * game.movingMultiplier;
    }
    if (keys.ArrowRight && player.x + player.widht < gameArea.offsetWidth) {
        player.x += game.speed * game.movingMultiplier;
    }
    //Aply movement
    wizard.style.top = player.y + 'px';
    wizard.style.left = player.x + 'px';

    if (keys.Space && timestamp - player.lastTimeFiredFireball > game.fireInterval) {
        wizard.classList.add('wizard-fire');
        addFireBall(player);
        player.lastTimeFiredFireball = timestamp;
        //isCollision(wizard, wizard);
    } else {
        wizard.classList.remove('wizard-fire')
    }

    //Colision Detection 
    bugs.forEach(bug => {
        if (isCollision(wizard, bug)) {
            gameOverAction();
        }

        fireBalls.forEach(fireBall => {
            if (isCollision(fireBall, bug)) {
                scene.score += game.bugKillBonus;
                bug.parentElement.removeChild(bug);
                fireBall.parentElement.removeChild(fireBall);
            }
        })
    });

    //Apply score 
    gamePoints.textContent = scene.score;

    // check if the game has finished    
    if (scene.isActiveGame) {
        window.requestAnimationFrame(gameAction);
    }  

       
}


function addFireBall() {
    let fireBall = document.createElement('div');

    fireBall.classList.add('fire-ball');
    fireBall.style.top = (player.y + player.height / 3 - 5) + 'px';
    fireBall.x = player.x + player.widht;
    fireBall.style.left = fireBall.x + 'px';
    gameArea.appendChild(fireBall);
}

function isCollision(firstElemet, secondElemet) {
    let firstRect = firstElemet.getBoundingClientRect();
    let secondRect = secondElemet.getBoundingClientRect();

    return !(firstRect.top > secondRect.bottom ||
        firstRect.bottom < secondRect.top ||
        firstRect.right < secondRect.left ||
        firstRect.left > secondRect.right);
}

function gameOverAction() {
    scene.isActiveGame = false;
    gameOver.classList.remove('hide');
}

