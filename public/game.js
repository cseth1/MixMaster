// public/game.js
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const codeInput = document.getElementById('code-input');
const runCodeBtn = document.getElementById('run-code');
const recipeList = document.getElementById('recipes');
const currentLevelSpan = document.getElementById('current-level');

let currentLevel = 1;
let unlockedRecipes = [];

const recipes = [
    { name: "Mojito", ingredients: ["rum", "mint", "lime", "sugar", "soda"] },
    { name: "Margarita", ingredients: ["tequila", "lime", "triple sec"] },
    { name: "Old Fashioned", ingredients: ["whiskey", "bitters", "sugar"] },
    { name: "Martini", ingredients: ["gin", "vermouth"] },
    { name: "Daiquiri", ingredients: ["rum", "lime", "sugar"] }
];

function initGame() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawBar();
}

function drawBar() {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

function drawIngredient(ingredient, x, y) {
    ctx.fillStyle = getIngredientColor(ingredient);
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText(ingredient, x - 15, y + 30);
}

function getIngredientColor(ingredient) {
    const colors = {
        rum: "#FFD700",
        mint: "#00FF00",
        lime: "#32CD32",
        sugar: "#FFFFFF",
        soda: "#87CEFA",
        tequila: "#FFFF00",
        "triple sec": "#FFA500",
        whiskey: "#8B4513",
        bitters: "#8B0000",
        gin: "#F0F8FF",
        vermouth: "#FFFACD"
    };
    return colors[ingredient] || "#808080";
}

function runCode() {
    const code = codeInput.value.toLowerCase();
    const currentRecipe = recipes[currentLevel - 1];
    const ingredients = currentRecipe.ingredients;
    
    let correct = true;
    for (let ingredient of ingredients) {
        if (!code.includes(ingredient)) {
            correct = false;
            break;
        }
    }
    
    if (correct) {
        alert(`Congratulations! You've made a perfect ${currentRecipe.name}!`);
        unlockedRecipes.push(currentRecipe.name);
        updateRecipeList();
        currentLevel++;
        currentLevelSpan.textContent = currentLevel;
        if (currentLevel > recipes.length) {
            alert("Congratulations! You've completed all levels!");
            currentLevel = 1;
        }
        codeInput.value = "";
        drawNextLevel();
    } else {
        alert("Oops! That's not quite right. Try again!");
    }
}

function updateRecipeList() {
    recipeList.innerHTML = "";
    for (let recipe of unlockedRecipes) {
        const li = document.createElement("li");
        li.textContent = recipe;
        recipeList.appendChild(li);
    }
}

function drawNextLevel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBar();
    const currentRecipe = recipes[currentLevel - 1];
    const ingredients = currentRecipe.ingredients;
    for (let i = 0; i < ingredients.length; i++) {
        drawIngredient(ingredients[i], 50 + i * 100, 50);
    }
}

runCodeBtn.addEventListener('click', runCode);

window.addEventListener('load', () => {
    initGame();
    drawNextLevel();
});

window.addEventListener('resize', initGame);
