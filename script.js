// إعدادات اللعبة
const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const BLOCK_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone',
    WOOD: 'wood',
    WATER: 'water',
    GOLD: 'gold',
    DIAMOND: 'diamond',
    EMPTY: 'empty'
};

// حالة اللعبة
let gameState = {
    playerPos: { x: 5, y: 5 },
    health: 10,
    maxHealth: 10,
    hunger: 10,
    maxHunger: 10,
    level: 0,
    inventory: {
        'grass': 0,
        'dirt': 0,
        'stone': 0,
        'wood': 0,
        'water': 0,
        'gold': 0,
        'diamond': 0
    }
};

// خريطة اللعبة
let gameMap = [];

// تهيئة اللعبة
function initGame() {
    generateMap();
    renderMap();
    updateUI();
    setupControls();
    startGameLoop();
}

// توليد الخريطة
function generateMap() {
    gameMap = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        gameMap[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            const rand = Math.random();
            
            if (rand < 0.7) {
                gameMap[y][x] = BLOCK_TYPES.GRASS;
            } else if (rand < 0.8) {
                gameMap[y][x] = BLOCK_TYPES.DIRT;
            } else if (rand < 0.85) {
                gameMap[y][x] = BLOCK_TYPES.STONE;
            } else if (rand < 0.9) {
                gameMap[y][x] = BLOCK_TYPES.WOOD;
            } else if (rand < 0.93) {
                gameMap[y][x] = BLOCK_TYPES.GOLD;
            } else if (rand < 0.96) {
                gameMap[y][x] = BLOCK_TYPES.DIAMOND;
            } else {
                gameMap[y][x] = BLOCK_TYPES.WATER;
            }
        }
    }
}

// رسم الخريطة
function renderMap() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const block = document.createElement('div');
            block.className = `block ${gameMap[y][x]}`;
            
            // عرض اللاعب
            if (gameState.playerPos.x === x && gameState.playerPos.y === y) {
                block.className = 'block player';
                block.textContent = '🧔';
            } else {
                // عرض رموز البلوكات
                const blockEmojis = {
                    'grass': '🟩',
                    'dirt': '🟫',
                    'stone': '⬜',
                    'wood': '🪵',
                    'water': '🌊',
                    'gold': '⭐',
                    'diamond': '💎'
                };
                block.textContent = blockEmojis[gameMap[y][x]];
            }
            
            block.addEventListener('click', () => clickBlock(x, y));
            gameBoard.appendChild(block);
        }
    }
}

// معالجة النقر على البلوك
function clickBlock(x, y) {
    const dx = Math.abs(x - gameState.playerPos.x);
    const dy = Math.abs(y - gameState.playerPos.y);
    
    // يمكن الحفر البلوكات المجاورة فقط
    if (dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0)) {
        mineBlock(x, y);
    }
}

// حفر البلوك
function mineBlock(x, y) {
    const blockType = gameMap[y][x];
    
    if (blockType !== BLOCK_TYPES.WATER && blockType !== BLOCK_TYPES.EMPTY) {
        gameState.inventory[blockType]++;
        gameMap[y][x] = BLOCK_TYPES.EMPTY;
        gameState.level += 5;
        updateUI();
        renderMap();
    }
}

// بناء البلوك
function buildBlock(blockType) {
    const x = gameState.playerPos.x;
    const y = gameState.playerPos.y;
    
    // البناء حول اللاعب
    const positions = [
        { x: x + 1, y: y },
        { x: x - 1, y: y },
        { x: x, y: y + 1 },
        { x: x, y: y - 1 }
    ];
    
    for (let pos of positions) {
        if (pos.x >= 0 && pos.x < GRID_WIDTH && pos.y >= 0 && pos.y < GRID_HEIGHT) {
            if (gameMap[pos.y][pos.x] === BLOCK_TYPES.EMPTY && gameState.inventory[blockType] > 0) {
                gameMap[pos.y][pos.x] = blockType;
                gameState.inventory[blockType]--;
                gameState.level += 2;
                updateUI();
                renderMap();
                return;
            }
        }
    }
}

// التحكم بالحركة
function movePlayer(dx, dy) {
    const newX = gameState.playerPos.x + dx;
    const newY = gameState.playerPos.y + dy;
    
    // التحقق من حدود الخريطة
    if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT) {
        gameState.playerPos.x = newX;
        gameState.playerPos.y = newY;
        
        // التعرض للضرر عند الماء
        if (gameMap[newY][newX] === BLOCK_TYPES.WATER) {
            gameState.health -= 2;
        }
        
        renderMap();
    }
}

// إعداد عناصر التحكم
function setupControls() {
    document.addEventListener('keydown', (e) => {
        switch(e.key.toUpperCase()) {
            case 'W':
                movePlayer(0, -1);
                break;
            case 'S':
                movePlayer(0, 1);
                break;
            case 'A':
                movePlayer(-1, 0);
                break;
            case 'D':
                movePlayer(1, 0);
                break;
            case 'E':
                // الحفر - سيتم عبر النقر
                break;
            case 'R':
                // البناء - اختيار أول مادة متاحة
                for (let item in gameState.inventory) {
                    if (gameState.inventory[item] > 0) {
                        buildBlock(item);
                        break;
                    }
                }
                break;
            case ' ':
                // الأكل
                if (gameState.inventory['wood'] > 0) {
                    gameState.hunger = Math.min(gameState.maxHunger, gameState.hunger + 3);
                    gameState.inventory['wood']--;
                    gameState.level += 1;
                }
                e.preventDefault();
                break;
        }
        updateUI();
    });
}

// تحديث واجهة المستخدم
function updateUI() {
    // تحديث الصحة
    const healthPercent = (gameState.health / gameState.maxHealth) * 100;
    document.getElementById('health').style.width = healthPercent + '%';
    document.getElementById('healthText').textContent = gameState.health + '/' + gameState.maxHealth;
    
    // تحديث الجوع
    const hungerPercent = (gameState.hunger / gameState.maxHunger) * 100;
    document.getElementById('hunger').style.width = hungerPercent + '%';
    document.getElementById('hungerText').textContent = gameState.hunger + '/' + gameState.maxHunger;
    
    // تحديث المستوى
    document.getElementById('level').textContent = gameState.level;
    
    // تحديث الحقيبة
    updateInventory();
    
    // التحقق من نهاية اللعبة
    if (gameState.health <= 0) {
        alert('انتهت اللعبة! 💀\nالمستوى النهائي: ' + gameState.level);
        location.reload();
    }
}

// تحديث الحقيبة
function updateInventory() {
    const inventoryContainer = document.getElementById('inventoryContainer');
    inventoryContainer.innerHTML = '';
    
    const itemEmojis = {
        'grass': '🟩',
        'dirt': '🟫',
        'stone': '⬜',
        'wood': '🪵',
        'water': '🌊',
        'gold': '⭐',
        'diamond': '💎'
    };
    
    for (let item in gameState.inventory) {
        if (gameState.inventory[item] > 0) {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                <div class="inventory-item-icon">${itemEmojis[item]}</div>
                <div class="inventory-item-count">${gameState.inventory[item]}</div>
            `;
            div.addEventListener('click', () => buildBlock(item));
            inventoryContainer.appendChild(div);
        }
    }
}

// حلقة اللعبة الرئيسية
function startGameLoop() {
    setInterval(() => {
        // تقليل الجوع
        if (gameState.hunger > 0) {
            gameState.hunger -= 0.5;
        } else {
            // التعرض للضرر عند الجوع
            gameState.health -= 1;
        }
        
        // عشوائي - قد تتعرض للضرر من مخلوقات
        if (Math.random() < 0.01) {
            gameState.health -= 1;
        }
        
        updateUI();
    }, 1000);
}

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    initGame();
});
