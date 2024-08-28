document.addEventListener('DOMContentLoaded', () => {
    let invaderBullets = [];
    const player = document.getElementById('player');
    const game = document.getElementById('game');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const leaderboardList = document.getElementById('leaderboard-list');
    const gameWidth = game.clientWidth;
    const gameHeight = game.clientHeight;

    let keys = {};
    let playerSpeed = 5;
    let bulletSpeed = 7;
    let invadersDirection = 1;
    let invaderSpeed = 1;
    let bullets = [];
    let invadersArray = [];
    let score = 0;
    let gameOver = false;
    let level = 1;
    let canShoot = true;
    let lives = 3;

    let leaderboard = [
        { username: 'Hacker42', score: 8500 },
        { username: 'NoobMaster', score: 7030 },
        { username: 'EliteGamer', score: 2000 },
        { username: 'ProPlayer', score: 1050 },
        { username: 'AverageJoe', score: 600 }
    ];

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    function movePlayer() {
        if (gameOver) return;

        const playerPos = player.offsetLeft;

        if (keys['ArrowLeft'] && playerPos > 0) {
            player.style.left = `${playerPos - playerSpeed}px`;
        }
        if (keys['ArrowRight'] && playerPos < gameWidth - player.offsetWidth) {
            player.style.left = `${playerPos + playerSpeed}px`;
        }
        if ((keys[' '] || keys['Spacebar']) && canShoot) {
            shootBullet();
        }
    }

    function shootBullet() {
        if (gameOver || !canShoot) return;

        canShoot = false;

        const bullet = document.createElement('div');
        bullet.classList.add('bullet');

        const playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue('bottom'));
        bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2 - 2.5}px`;
        bullet.style.bottom = `${playerBottom + player.offsetHeight}px`;

        game.appendChild(bullet);
        bullets.push(bullet);
    }

    function moveBullets() {
        if (gameOver) return;

        bullets.forEach((bullet, bulletIndex) => {
            bullet.style.bottom = `${parseInt(bullet.style.bottom) + bulletSpeed}px`;

            if (parseInt(bullet.style.bottom) > gameHeight) {
                game.removeChild(bullet);
                bullets.splice(bulletIndex, 1);
                canShoot = true;
            } else {
                invadersArray.forEach((invader, invaderIndex) => {
                    const bulletRect = bullet.getBoundingClientRect();
                    const invaderRect = invader.getBoundingClientRect();

                    if (
                        bulletRect.left < invaderRect.right &&
                        bulletRect.right > invaderRect.left &&
                        bulletRect.top < invaderRect.bottom &&
                        bulletRect.bottom > invaderRect.top
                    ) {
                        game.removeChild(invader);
                        game.removeChild(bullet);
                        invadersArray.splice(invaderIndex, 1);
                        bullets.splice(bulletIndex, 1);
                        score += 10;
                        updateScore();
                        canShoot = true;
                    }
                });
            }
        });

        if (bullets.length === 0) {
            canShoot = true;
        }
    }

    function createBunkers() {
        const bunkerContainer = document.getElementById('game');
        const bunkerPositions = [150, 350, 550, 750];

        bunkerPositions.forEach(position => {
            const bunker = document.createElement('div');
            bunker.classList.add('bunker');
            bunker.style.position = 'absolute';
            bunker.style.left = `${position}px`;
            bunker.style.bottom = '100px';

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 8; j++) {
                    const block = document.createElement('div');
                    block.classList.add('bunker-block');
                    block.style.width = '10px';
                    block.style.height = '10px';
                    block.style.backgroundColor = 'green';
                    block.style.display = 'inline-block';
                    block.style.margin = '1px';
                    bunker.appendChild(block);
                }
            }

            bunkerContainer.appendChild(bunker);
        });
    }

    function createInvaders() {
        const rows = 5;
        const cols = 10;
        const invaderWidth = 40;
        const invaderHeight = 40;
        const spacing = 20;
        const offsetX = (gameWidth - (cols * invaderWidth + (cols - 1) * spacing)) / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const invader = document.createElement('div');
                invader.classList.add('invader');

                if (row === 0) {
                    invader.classList.add('ufo');
                } else if (row === 1 || row === 2) {
                    invader.classList.add('squid');
                } else {
                    invader.classList.add('ghost1');
                }

                invader.style.left = `${offsetX + col * (invaderWidth + spacing)}px`;
                invader.style.top = `${50 + row * (invaderHeight + spacing)}px`;
                game.appendChild(invader);
                invadersArray.push(invader);
            }
        }
    }

    function invaderShoot() {
        if (invadersArray.length > 0 && !gameOver) {
            const randomInvader = invadersArray[Math.floor(Math.random() * invadersArray.length)];

            const bullet = document.createElement('div');
            bullet.classList.add('invader-bullet');
            bullet.style.left = `${randomInvader.offsetLeft + randomInvader.offsetWidth / 2 - 2.5}px`;
            bullet.style.top = `${randomInvader.offsetTop + randomInvader.offsetHeight}px`;

            game.appendChild(bullet);
            invaderBullets.push(bullet);
        }
    }

    setInterval(invaderShoot, 1000 + Math.random() * 1000);

    function moveInvaderBullets() {
        invaderBullets.forEach((bullet, index) => {
            bullet.style.top = `${parseInt(bullet.style.top) + 5}px`;

            if (checkBulletBunkerCollision(bullet, true)) {
                bullet.remove();
                invaderBullets.splice(index, 1);
                return;
            }

            const bulletRect = bullet.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            if (
                bulletRect.left < playerRect.right &&
                bulletRect.right > playerRect.left &&
                bulletRect.bottom > playerRect.top &&
                bulletRect.top < playerRect.bottom
            ) {
                lives--;
                updateLivesDisplay();

                if (lives <= 0) {
                    endGame();
                }

                bullet.remove();
                invaderBullets.splice(index, 1);
            } else if (parseInt(bullet.style.top) > gameHeight) {
                bullet.remove();
                invaderBullets.splice(index, 1);
            }
        });
    }

    function moveInvaders() {
        if (gameOver) return;

        let moveDown = false;
        let leftMostPosition = Infinity;
        let rightMostPosition = -Infinity;

        invadersArray.forEach((invader) => {
            const invaderLeft = invader.offsetLeft;
            const invaderRight = invader.offsetLeft + invader.offsetWidth;

            leftMostPosition = Math.min(leftMostPosition, invaderLeft);
            rightMostPosition = Math.max(rightMostPosition, invaderRight);

            invader.style.left = `${invaderLeft + invaderSpeed * invadersDirection}px`;

            const invaderRect = invader.getBoundingClientRect();
            const collidedWithBunker = Array.from(document.querySelectorAll('.bunker-block')).some(block => {
                const blockRect = block.getBoundingClientRect();
                return (
                    invaderRect.left < blockRect.right &&
                    invaderRect.right > blockRect.left &&
                    invaderRect.bottom > blockRect.top &&
                    invaderRect.top < blockRect.bottom
                );
            });

            if (collidedWithBunker) {
                invader.style.top = '50px';
                invader.style.left = `${invaderLeft}px`;
            } else {
                if (moveDown) {
                    invader.style.top = `${invader.offsetTop + 20}px`;
                }
            }
        });

        if (rightMostPosition >= gameWidth - 40 && invadersDirection > 0) {
            invadersDirection *= -1;
            moveDown = true;
        } else if (leftMostPosition <= 0 && invadersDirection < 0) {
            invadersDirection *= -1;
            moveDown = true;
        }

        if (moveDown) {
            invadersArray.forEach((invader) => {
                invader.style.top = `${invader.offsetTop + 20}px`;
            });
        }

        if (invadersArray.length === 0) {
            levelUp();
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function updateLevel() {
        levelDisplay.textContent = `Level: ${level}`;
    }

    function updateLeaderboard() {
        leaderboardList.innerHTML = '';
        leaderboard.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.username}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    }

    function updateLivesDisplay() {
        const livesContainer = document.getElementById('lives-container');
        livesContainer.innerHTML = '';

        for (let i = 0; i < lives; i++) {
            const life = document.createElement('div');
            life.classList.add('life');
            life.style.backgroundImage = 'url("images/space_invader.png")';
            livesContainer.appendChild(life);
        }
    }

    function checkLeaderboard() {
        for (let i = 0; i < leaderboard.length; i++) {
            if (score > leaderboard[i].score) {
                const username = prompt("Congratulations! You've made it onto the leaderboard. Enter your name:");
                leaderboard.splice(i, 0, { username: username || 'Player', score: score });
                leaderboard.pop();
                updateLeaderboard();
                break;
            }
        }
    }

    function resetGame() {
        document.querySelectorAll('.bullet').forEach(bullet => bullet.remove());
        document.querySelectorAll('.invader').forEach(invader => invader.remove());
        document.querySelectorAll('.invader-bullet').forEach(bullet => bullet.remove());
        document.querySelectorAll('.bunker').forEach(bunker => bunker.remove());

        clearInterval(invaderShootingInterval);

        score = 0;
        level = 1;
        lives = 3;
        invaderSpeed = 1;
        invadersDirection = 1;
        bullets = [];
        invaderBullets = [];
        invadersArray = [];
        gameOver = false;

        updateScore();
        updateLevel();
        updateLivesDisplay();

        createBunkers();
        createInvaders();

        invaderShootingInterval = setInterval(invaderShoot, 3000 + Math.random() * 4000);
        gameLoop();
    }

    function checkBulletBunkerCollision(bullet, isInvaderBullet = false) {
        let collisionDetected = false;
        const bulletRect = bullet.getBoundingClientRect();

        document.querySelectorAll('.bunker-block:not(.destroyed)').forEach(block => {
            const blockRect = block.getBoundingClientRect();

            if (
                bulletRect.left < blockRect.right &&
                bulletRect.right > blockRect.left &&
                bulletRect.top < blockRect.bottom &&
                bulletRect.bottom > blockRect.top
            ) {
                if (isInvaderBullet) {
                    console.log('Collision detected. Destroying block:', blockRect);
                    block.classList.add('destroyed');
                    block.style.visibility = 'hidden';
                    bullet.remove();
                }
                collisionDetected = true;
                return collisionDetected;
            }
        });

        return collisionDetected;
    }

    function levelUp() {
        level++;
        invaderSpeed += 1;
        updateLevel();

        invadersArray = [];
        bullets = [];
        invaderBullets = [];
        document.querySelectorAll('.bullet').forEach(bullet => bullet.remove());
        document.querySelectorAll('.invader').forEach(invader => invader.remove());
        document.querySelectorAll('.invader-bullet').forEach(bullet => bullet.remove());

        createBunkers();
        createInvaders();
    }

    function endGame() {
        gameOver = true;
        clearInterval(invaderShootingInterval);
        alert(`Game Over! Your Score: ${score}`);

         checkLeaderboard();

            setTimeout(resetGame, 2000);
    }

    function gameLoop() {
        if (gameOver) return;

        movePlayer();
        moveInvaders();
        moveBullets();
        moveInvaderBullets();

        requestAnimationFrame(gameLoop);
    }

    updateLeaderboard();
    updateLevel();
    updateLivesDisplay();
    createBunkers();
    createInvaders();
    gameLoop();

    let invaderShootingInterval = setInterval(invaderShoot, 3000 + Math.random() * 4000);
});
