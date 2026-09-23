const gridSize = 10;
const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, -1],
    [-1, 1],
    [-1, -1],
];

function generate() {
    for(let word of this.words){
        let placed = false;
        let attempts = 0;

        while(!placed && attempts < 100) {
            const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);

            if(this.canPlaceWord(word, row, col, direction)) {
                this.placeWord(word, row, col, direction);
                placed = true;
            }
            attempts++;
        }
    }
    this.fillEmptyCells();
}

function canPlaceWord(word, row, col, direction) {
    const [dRow, dCol] = direction;

    
}