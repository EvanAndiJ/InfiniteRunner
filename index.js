
let config = {
  type: Phaser.AUTO,
  width: 240,
  height: 160,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
      gravity: { y: 200 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  parent: 'game'
};

let game = new Phaser.Game(config);

let isStart = false;
let isGameOver = false;

let score = 0;
let scoreBoard;
let howTo;

let isJump = false;
let lastJump = 0;

let torches;
let lastTorch = 0

let mort;
let ground;
let cursors;
let pointer;

function preload() {
  this.load.image('bg', './img/background.png')
  this.load.spritesheet('ground', './img/ground.png', { frameWidth: 240, frameHeight: 32 });
  this.load.spritesheet('mort', './img/mort.png', { frameWidth: 24, frameHeight: 24 });
  this.load.spritesheet('torchS', './img/torchS.png', {frameWidth: 8, frameHeight: 24});
  this.load.spritesheet('torchM', './img/torchM.png', {frameWidth: 8, frameHeight: 32});
  this.load.spritesheet('torchL', './img/torchL.png', {frameWidth: 8, frameHeight: 40});
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();
  pointer = this.input.activePointer;
  this.anims.create({ key: 'walk',
    frames: this.anims.generateFrameNumbers('mort', { start: 4, end: 9 }),
    frameRate: 12,
    repeat: -1
  });
  this.anims.create({ key: 'bounce',
    frames: this.anims.generateFrameNumbers('mort', { frames: [ 0, 1, 2 ] }),
    frameRate: 6,
    repeat: -1
  });
  this.anims.create({ key: 'jump',
    frames: this.anims.generateFrameNumbers('mort', { frames: [ 11, 12] }),
    frameRate: 6
  });
  this.anims.create({ key: 'hurt',
    frames: this.anims.generateFrameNumbers('mort', { frames: [ 14, 15, 16] }),
    frameRate: 6,
    yoyo: true,
    repeat: -1
  });
  this.anims.create({ key:'lightS',
    frames: this.anims.generateFrameNumbers('torchS', {frames: [0,1,2,3,4,5,6,7,8,9,10,11]}),
    repeat: -1
  })
  this.anims.create({ key:'lightM',
    frames: this.anims.generateFrameNumbers('torchM', {frames: [0,1,2,3,4,5,6,7,8,9,10,11]}),
    repeat: -1
  })
  this.anims.create({ key:'lightL',
    frames: this.anims.generateFrameNumbers('torchL', {frames: [0,1,2,3,4,5,6,7,8,9,10,11]}),
    repeat: -1
  })
  this.anims.create({key: 'groundMove',
    frames: this.anims.generateFrameNumbers('ground', {frames: [2,3]}),
    frameRate: 6,
    repeat: -1
  })

  const bg = this.add.image(0, 0, 'bg').setOrigin(0)
  howTo = this.add.text(120, 60, `Press Spacebar!`, { fontSize: '20px', fontStyle:'bold', color:'#000'}).setOrigin(.5)
  ground = this.physics.add.staticSprite(120, 144, 'ground', 2)

  //line for scoring
  const line = this.add.line(32, 107, 0, 0, 0, 50)
  const goal = this.physics.add.existing(line)
  this.physics.add.collider(ground, goal)
  //line for destroying 
  const end = this.add.line(0, 107, 0, 0, 0, 50)
  const out = this.physics.add.existing(end)
  this.physics.add.collider(ground, out)

  //the player
  mort = this.physics.add.sprite(40, 107, 'mort', 0)
  .setBodySize(16,20, true)
  .play('bounce') 
  this.physics.add.collider(ground, mort)

  //the hurdles 
  torches = this.physics.add.group().setName('torches')
  this.physics.add.collider(torches, ground)
  this.physics.add.overlap(torches, mort, gameOver, null, this)
  this.physics.add.overlap(torches, goal, willScore, null, this)
  this.physics.add.overlap(torches, end, endTorch, null, this)

  scoreBoard = this.add.text(10, 10, `Score: 0`, { fontSize: '12px'})
}

function update () {
  if (isStart) {
    const now = Date.now()

    if (now - lastTorch > 1000 && Math.random() > .8) {
      lastTorch = now
      newTorch(this)
    }
    torches.setVelocityX(-100)
  
    //mort animation handling
    mort.body.touching.down ? mort.anims.play('walk', true) : mort.anims.play('jump', true);

    //jump controls
    let press = cursors.space.isDown || this.input.activePointer.isDown
    if (press && mort.body.touching.down) {
      if (now - lastJump > 900) {
        isJump = true;
        lastJump = now
      }
    }
    if (isJump && !press) {
      isJump = false;
    }
    if (isJump && press) {
      mort.y -= 5;
    }
    if (isJump && mort.y <= 45) {
      isJump = false;
    }
    
  } else if (cursors.space.isDown || this.input.activePointer.isDown) {

    if (isGameOver) {
      
    } else {
      isStart = true;
      howTo.destroy()
      ground.play('groundMove')
    }
  } 
}
function jump() {
  let press = cursors.space.isDown || pointer.isDown
  
  let now = Date.now()
  if (press && mort.body.touching.down) {
    if (now - lastJump > 900) {
      isJump = true;
      lastJump = now
    }
  }
  if (isJump && !press) {
    isJump = false;
  }
  if (isJump && press) {
    mort.y -= 5;
  }
  if (isJump && mort.y <= 45) {
    isJump = false;
  }
}

function newTorch (scene) {
  const options = ['S', 'M', 'L', 'p', 'p']
  const yVals = {
    S: 116, 
    M: 112,
    L: 108  };
  const xVals = [245, 253, 261]
  const n = Math.floor(Math.random() * 4)
  
  for (let i=0; i<n; i++) {
    const torch = options[Math.floor(Math.random()*options.length)]
    torch != 'p' ? 
      torches.add(scene.physics.add.sprite(xVals[i], yVals[torch], `torch${torch}`, 0)
        .play(`light${torch}`))
      : null;
  }
  
}
function endTorch () {  
  torches.getChildren()[0].destroy()
}

let ticker = 0;
function willScore () {
  ticker === 4 ? scorePoint() : ticker++;
}
function scorePoint () {
  ticker = 0;
  score++;
  scoreBoard.setText('Score: ' + score)
}

function gameOver() {
  
  this.physics.pause()
  mort.play('hurt')
  ground.stop()
  isStart = false
  isGameOver = true
  
  const modal = this.add.group();
  const box = this.add.rectangle(120, 80, 130, 65, 0xdb9730, 1).setStrokeStyle(2, 0x4f3829);
  modal.add(box);
  modal.add(this.add.text(65, 60, `Game Over!`, {fontSize: '18px', fill: '#000'}));
  modal.add(this.add.text(72, 75, `Score: ${score}`, {fontSize: '15px', fill: '#000'}));

  const butt = this.add.rectangle(104, 95, 30, 12, 0xdb9730, 1)
  .setStrokeStyle(2, 0x4f3829)
  .setOrigin(0)
  .setName('butt')
  .setInteractive()
  .on('pointerup', function() { 
    // RESTARTING THE SCENE TAKES THESE THINGS OFF THE SCREEN 
    //      BUT I'M NOT SURE IF IT'S DESTORYING THEM. LEAVING FOR REF.
    // modal.destroy(true)
    // torches.destroy(true) //destroy torches and container group
    // torches = this.physics.add.group().setName('torches')
    isGameOver = false;
    score = 0;
    ticker = 0;
    this.scene.start();
  }, this);
  modal.add(butt)
  modal.add(this.add.text(butt.x+3, butt.y+3, 'Reset', {fontSize: '8px', fill: '#000'}))
}

