// public/game.js
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let customers;
let currentCustomer;
let cursors;
let timeLeft = 120;
let score = 0;
let currentRecipe;
let mixingStation;
let inMixingMinigame = false;

const recipes = [
    { name: "Mojito", ingredients: ["rum", "mint", "lime", "sugar", "soda"] },
    { name: "Margarita", ingredients: ["tequila", "lime", "triple sec"] },
    { name: "Old Fashioned", ingredients: ["whiskey", "bitters", "sugar"] },
    { name: "Martini", ingredients: ["gin", "vermouth"] },
    { name: "Daiquiri", ingredients: ["rum", "lime", "sugar"] },
];

function preload() {
    this.load.image('tiles', 'assets/tilemap_packed.png');
    this.load.tilemapTiledJSON('map', 'assets/bar_map.json');
    this.load.spritesheet('characters', 'assets/characters_packed.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('objects', 'assets/objects_packed.png', { frameWidth: 16, frameHeight: 16 });
}

function create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tilemap_packed', 'tiles');
    const floorLayer = map.createLayer('Floor', tileset, 0, 0);
    const wallsLayer = map.createLayer('Walls', tileset, 0, 0);

    floorLayer.setScale(2);
    wallsLayer.setScale(2);

    wallsLayer.setCollisionByProperty({ collides: true });

    player = this.physics.add.sprite(200, 200, 'characters', 26);
    player.setScale(2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('characters', { start: 24, end: 26 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('characters', { start: 27, end: 29 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('characters', { start: 30, end: 32 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('characters', { start: 33, end: 35 }),
        frameRate: 10,
        repeat: -1
    });

    customers = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        const customer = customers.create(x, y, 'characters', Phaser.Math.Between(0, 23));
        customer.setScale(2);
        customer.setCollideWorldBounds(true);
    }

    mixingStation = this.physics.add.sprite(600, 100, 'objects', 14);
    mixingStation.setScale(2);
    mixingStation.setImmovable(true);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, wallsLayer);
    this.physics.add.collider(customers, wallsLayer);
    this.physics.add.collider(player, customers, interactWithCustomer, null, this);
    this.physics.add.collider(player, mixingStation, startMixingMinigame, null, this);

    startNewOrder();
    startTimer(this);
}

function update() {
    if (inMixingMinigame) return;

    player.setVelocity(0);

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else if (cursors.up.isDown) {
        player.setVelocityY(-160);
        player.anims.play('up', true);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
        player.anims.play('down', true);
    } else {
        player.anims.stop();
    }
}

function interactWithCustomer(player, customer) {
    if (currentCustomer) return;
    currentCustomer = customer;
    startNewOrder();
}

function startNewOrder() {
    currentRecipe = Phaser.Utils.Array.GetRandom(recipes);
    document.getElementById('current-recipe').textContent = currentRecipe.name;
    const recipeIngredients = document.getElementById('recipe-ingredients');
    recipeIngredients.innerHTML = '';
    currentRecipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        recipeIngredients.appendChild(li);
    });
}

function startMixingMinigame() {
    if (!currentRecipe) return;
    inMixingMinigame = true;
    player.setVelocity(0);
    
    const minigameScene = game.scene.add('MixingMinigame', MixingMinigame, true, { recipe: currentRecipe });
    minigameScene.events.on('complete', (result) => {
        inMixingMinigame = false;
        game.scene.remove('MixingMinigame');
        if (result.success) {
            score += 100;
            document.getElementById('score').textContent = score;
            showModal("Great job!", `You've made a perfect ${currentRecipe.name}!`);
        } else {
            showModal("Oops!", "That's not quite right. The customer seems disappointed.");
        }
        currentCustomer.destroy();
        currentCustomer = null;
        currentRecipe = null;
        startNewOrder();
    });
}

function startTimer(scene) {
    const timerEvent = scene.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: scene,
        loop: true
    });
}

function updateTimer() {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
        showModal("Time's up!", "Your shift is over!");
        this.scene.pause();
    }
}

function showModal(title, message) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'block';
}

document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

class MixingMinigame extends Phaser.Scene {
    constructor() {
        super('MixingMinigame');
    }

    init(data) {
        this.recipe = data.recipe;
        this.selectedIngredients = [];
    }

    create() {
        this.add.rectangle(400, 300, 700, 500, 0x000000, 0.8);
        this.add.text(400, 100, 'Mix the Drink!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        const ingredientSpacing = 600 / (this.recipe.ingredients.length + 1);
        this.recipe.ingredients.forEach((ingredient, index) => {
            const x = 100 + ingredientSpacing * (index + 1);
            const ingredientObj = this.add.image(x, 300, 'objects', this.getIngredientFrame(ingredient)).setInteractive();
            ingredientObj.setScale(4);
            ingredientObj.setData('ingredient', ingredient);
            this.add.text(x, 350, ingredient, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);

            ingredientObj.on('pointerdown', () => {
                this.selectedIngredients.push(ingredient);
                ingredientObj.setTint(0x00ff00);
                if (this.selectedIngredients.length === this.recipe.ingredients.length) {
                    this.checkRecipe();
                }
            });
        });
    }

    getIngredientFrame(ingredient) {
        switch(ingredient) {
            case 'rum': return 54;
            case 'mint': return 52;
            case 'lime': return 51;
            case 'sugar': return 55;
            case 'soda': return 53;
            case 'tequila': return 54;
            case 'triple sec': return 54;
            case 'whiskey': return 54;
            case 'bitters': return 54;
            case 'gin': return 54;
            case 'vermouth': return 54;
            default: return 50;
        }
    }

    checkRecipe() {
        const success = this.recipe.ingredients.every((ingredient, index) => 
            ingredient === this.selectedIngredients[index]
        );
        this.events.emit('complete', { success });
    }
}
