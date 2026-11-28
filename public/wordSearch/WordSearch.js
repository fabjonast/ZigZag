const directions = [
    //Horizontal
    {
        row: 0,
        col: 1
    },
    {
        row: 0,
        col: -1
    },

    //Vertical
    {
        row: 1,
        col: 0
    },
    {
        row: -1,
        col: 0
    },

    //Diagonal
    {
        row: 1,
        col: 1
    },
    {
        row: 1,
        col: -1
    },
    {
        row: -1,
        col: 1
    },
    {
        row: -1,
        col: -1
    }
];

export function createEmptyGrid(size){
    const grid = [];

    for(let row=0; row < size; row++){
        grid[row] = [];

        for(let col=0; col < size; col++){
            grid[row][col] = "";
        }
    }
    return grid;
}

export function placeAllWords(grid, words) {
    const size = grid.length;

    for(const wordObject of words){
        let placed = false;

        for(let attempt=0; attempt < 1000; attempt++){
            const direction = directions[Math.floor(Math.random() * directions.length)];

            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);

            if(canPlaceWord(grid, wordObject.word, row, col, direction)){
                placeWord(grid, wordObject, row, col, direction);
                placed = true;
                break;
            }
        }
        
        if(!placed){
            return false;
        }
    }

    return true;
}

function canPlaceWord(grid, word, startRow, startCol, direction){
    const size = grid.length;

    for(let i = 0; i < word.length; i++){
        const row = startRow + direction.row * i;

        const col = startCol + direction.col * i;

        if(row < 0 || row >= size || col < 0 || col >= size){
            return false;
        }

        if(grid[row][col] !== "" && grid[row][col] !== word[i]){
            return false;
        }
    }
    return true;
}

function placeWord(grid, wordObject, startRow, startCol, direction){
    const word = wordObject.word;

    wordObject.start = {
        row: startRow,
        col: startCol
    };

    wordObject.end = {
        row: startRow + direction.row * (word.length - 1),
        col: startCol + direction.col * (word.length - 1)
    };

    for(let i = 0; i < word.length; i++){
        const row = startRow + direction.row * i;
        const col = startCol + direction.col * i;

        grid[row][col] = word[i];
    }
}

export function fillEmptyCells(grid){
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for(let row = 0; row < grid.length; row++){
        for(let col = 0; col < grid.length; col++){
            if(grid[row][col] === ""){
                grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
    return grid;
}