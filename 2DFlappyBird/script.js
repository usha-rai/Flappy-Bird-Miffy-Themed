const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Game Variables
let frames = 0;
let score = 0;
let highScore = 0;
const gameState = {
  current: 0,
  getReady: 0,
  game: 1,
  gameOver: 2
};

const bgImage = new Image();
bgImage.src = 'bg.png';

const miffyImg = new Image();
miffyImg.src = 'MiffyIdle.png';

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    handleInput();
  }
});

canvas.addEventListener('click', () => {
  handleInput();
});

function handleInput() {
  switch (gameState.current) {
    case gameState.getReady:
      gameState.current = gameState.game;
      miffy.flap();
      break;
    case gameState.game:
      miffy.flap();
      break;
    case gameState.gameOver:
      resetGame();
      gameState.current = gameState.getReady;
      break;
  }
}

const miffy = {
  x: 50,
  y: 150,
  w: 48, 
  h: 48,
  speed: 0,
  gravity: 0.25,
  jump: 4.6,
  rotation: 0,
  radius: 14, 

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.drawImage(miffyImg, -this.w / 2, -this.h / 2, this.w, this.h);

    ctx.restore();
  },

  flap() {
    this.speed = -this.jump;
  },

  update() {
    if (gameState.current === gameState.getReady) {
      this.y = 150;
      this.speed = 0;
      this.rotation = 0;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;

      if (this.speed >= this.jump) {
        this.rotation = (25 * Math.PI) / 180;
      } else {
        this.rotation = (-15 * Math.PI) / 180;
      }

      if (this.y + this.radius >= canvas.height - 80) {
        this.y = canvas.height - 80 - this.radius;
        gameState.current = gameState.gameOver;
      }

      if (this.y - this.radius <= 0) {
        this.y = this.radius;
        this.speed = 0;
      }
    }
  }
};

const pipes = {
  position: [],
  width: 52,
  gap: 120,
  dx: 2,

  draw() {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topYPos = p.y;
      let bottomYPos = p.y + this.gap;

      ctx.fillStyle = '#fffee3';    
      ctx.strokeStyle = '#f0e9af';  

      ctx.fillRect(p.x, 0, this.width, topYPos);
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x, 0, this.width, topYPos);

      ctx.fillStyle = '#ffffe2';
      ctx.fillRect(p.x - 3, topYPos - 20, this.width + 6, 20);
      ctx.strokeRect(p.x - 3, topYPos - 20, this.width + 6, 20);

      ctx.fillStyle = '#fffee3';
      ctx.fillRect(p.x, bottomYPos, this.width, canvas.height - bottomYPos - 80);
      ctx.strokeRect(p.x, bottomYPos, this.width, canvas.height - bottomYPos - 80);

      ctx.fillStyle = '#ffffe2';
      ctx.fillRect(p.x - 3, bottomYPos, this.width + 6, 20);
      ctx.strokeRect(p.x - 3, bottomYPos, this.width + 6, 20);
    }
  },

  update() {
    if (gameState.current !== gameState.game) return;

    if (frames % 100 === 0) {
      this.position.push({
        x: canvas.width,
        y: Math.floor(Math.random() * (200 - 50 + 1)) + 50,
        passed: false
      });
    }

    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let bottomPipeY = p.y + this.gap;

      p.x -= this.dx;

      if (
        miffy.x + miffy.radius > p.x &&
        miffy.x - miffy.radius < p.x + this.width &&
        miffy.y - miffy.radius < p.y
      ) {
        gameState.current = gameState.gameOver;
      }

      if (
        miffy.x + miffy.radius > p.x &&
        miffy.x - miffy.radius < p.x + this.width &&
        miffy.y + miffy.radius > bottomPipeY
      ) {
        gameState.current = gameState.gameOver;
      }

      if (p.x + this.width < miffy.x - miffy.radius && !p.passed) {
        score++;
        p.passed = true;
        highScore = Math.max(score, highScore);
      }

      if (p.x + this.width <= 0) {
        this.position.shift();
        i--;
      }
    }
  }
};

const fg = {
  y: canvas.height - 80,
  draw() {
    ctx.fillStyle = '#c4ae9f';
    ctx.fillRect(0, this.y, canvas.width, 80);

    ctx.fillStyle = '#def5da';
    ctx.fillRect(0, this.y, canvas.width, 14);

    ctx.strokeStyle = '#95b98b';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(0, this.y);
    ctx.lineTo(canvas.width, this.y);
    ctx.stroke();
  }
};

const UI = {
  draw() {
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#d8707f';
    ctx.lineWidth = 2;

    if (gameState.current === gameState.getReady) {
      ctx.font = '28px Poppins';
      ctx.fillText('Get Ready!', 110, 220);
      ctx.font = '16px Poppins';
      ctx.fillText('Press Space or Click to Jump', 60, 260);
    } else if (gameState.current === gameState.game) {
      ctx.font = '36px Poppins';
      ctx.fillText(score, canvas.width / 2 - 10, 60);
      ctx.strokeText(score, canvas.width / 2 - 10, 60);
    } else if (gameState.current === gameState.gameOver) {
      ctx.font = '30px Poppins';
      ctx.fillText('Game Over', 100, 220);
      ctx.font = '18px Poppins';
      ctx.fillText(`Score: ${score}`, 135, 270);
      ctx.fillText(`High Score: ${highScore}`, 115, 300);
      ctx.font = '14px Poppins';
      ctx.fillText('Click to Restart', 125, 350);
    }
  }
};

function resetGame() {
  miffy.y = 150;
  miffy.speed = 0;
  miffy.rotation = 0;
  pipes.position = [];
  score = 0;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  miffy.update();
  pipes.update();

  miffy.draw();
  pipes.draw();
  fg.draw();
  UI.draw();

  frames++;
  requestAnimationFrame(loop);
}

loop();