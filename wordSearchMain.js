import { extractWords } from "./wordExtractor.js";
import { createEmptyGrid, placeAllWords, fillEmptyCells } from "./wordSearch.js";

let words = [];
let grid = [];
let gridSize = 15;
let currentWord = null;

const CELL_GAP = 2;
let cellSize = 40;
let isSelecting = false;
let selectionStart = null;
let currentSelection = [];
let activeLine = null;

const notesInput = document.getElementById("notesInput");
const wordCount = document.getElementById("wordCount");
const generateBtn = document.getElementById("generateBtn");
const gameArea = document.getElementById("gameArea");
const gridWrap = document.getElementById("gridWrap");
const wordGrid = document.getElementById("wordGrid");
const linesLayer = document.getElementById("linesLayer");
const wordList = document.getElementById("wordList");
const reviewArea = document.getElementById("reviewArea");
const definitionModal = document.getElementById("definitionModal");
const foundWord = document.getElementById("foundWord");
const definitionInput = document.getElementById("definitionInput");
const definitionError = document.getElementById("definitionError");
const submitDefinitionBtn = document.getElementById("submitDefinitionBtn");
const generationError = document.getElementById("generationError");
const completionModal = document.getElementById("completionModal");
const continueReviewBtn = document.getElementById("continueReviewBtn");
const reviewSection = document.querySelector(".sectionReview");

generateBtn.addEventListener("click", generateWordSearch);
submitDefinitionBtn.addEventListener("click", submitDefinition);

gridWrap.addEventListener("pointerdown", onPointerDown);
gridWrap.addEventListener("pointermove", onPointerMove);
gridWrap.addEventListener("pointerup", onPointerUp);
gridWrap.addEventListener("pointercancel", cancelSelection);

function generateWordSearch(){
    const notes = notesInput.value.trim();
    const numberOfWords = parseInt(wordCount.value);

    generationError.textContent = "";

    if(notes.length === 0){
        generationError.textContent = "Please enter the study material";
        return;
    }

    let extractedWords = extractWords(notes);
    if(extractedWords.length === 0){
        generationError.textContent = "Not enough words were found";
        return;
    }

    extractedWords = extractedWords.slice(0, numberOfWords);

    const longestWord = Math.max(...extractedWords.map(word => word.length));

    gridSize = Math.max(10, longestWord+2);

    words = extractedWords.map(word => {
        return{
            word: word,
            start: null,
            end: null,
            definition: "",
            completed: false
        };
    });

    grid = createEmptyGrid(gridSize);

    const success = placeAllWords(grid, words);

    if(!success){
        generationError.textContent = "The puzzle could not fit all the words. Try fewer words.";
        return;
    }

    fillEmptyCells(grid);

    reviewSection.hidden = true;
    completionModal.style.display = "none";

    displayGrid();
    displayWordList();

    gameArea.style.display = "block";
}

function displayGrid(){
    wordGrid.innerHTML = "";
    linesLayer.innerHTML = "";
    activeLine = null;

    const pitchSpace = window.innerWidth - 80 - (gridSize - 1) * CELL_GAP;
    cellSize = Math.max(18, Math.min(40, Math.floor(pitchSpace / gridSize)));
    gridWrap.style.setProperty("--cell", cellSize + "px");

    wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;

    for(let row = 0; row < gridSize; row++){
        for(let col = 0; col < gridSize; col++){
            const cell = document.createElement("div");

            cell.classList.add("cell");

            cell.textContent = grid[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;

            wordGrid.appendChild(cell);
        }
    }
}

function displayWordList(){
    wordList.innerHTML = "";

    words.forEach(wordObject => {
        const item = document.createElement("div");

        item.textContent = wordObject.word;

        item.classList.add("word-item");

        item.id = "word-" + wordObject.word;

        if(wordObject.completed){
            item.classList.add("completed");
        }

        wordList.appendChild(item);
    });
}

function pitch(){
    return cellSize + CELL_GAP;
}

function cellCenter(row, col){
    return [col * pitch() + cellSize / 2, row * pitch() + cellSize / 2];
}

function pointerPos(e){
    const rect = wordGrid.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
}

function onPointerDown(e){
    if(e.pointerType === "mouse" && e.button !== 0) return;

    const [x, y] = pointerPos(e);
    const col = Math.floor(x / pitch());
    const row = Math.floor(y / pitch());

    if(row < 0 || col < 0 || row >= gridSize || col >= gridSize) return;

    e.preventDefault();
    gridWrap.setPointerCapture(e.pointerId);

    isSelecting = true;
    selectionStart = { row, col };
    updateSelection(x, y);
}

function onPointerMove(e){
    if(!isSelecting) return;

    const [x, y] = pointerPos(e);
    updateSelection(x, y);
}

function onPointerUp(){
    if(!isSelecting) return;

    isSelecting = false;

    const selectedWord = currentSelection.length > 1 ? getSelectedWord() : null;

    clearActiveLine();
    currentSelection = [];

    if(selectedWord){
        handleFoundWord(selectedWord);
    }
}

function cancelSelection(){
    isSelecting = false;
    currentSelection = [];
    clearActiveLine();
}

function updateSelection(x, y){
    const [startX, startY] = cellCenter(selectionStart.row, selectionStart.col);
    const dx = x - startX;
    const dy = y - startY;

    let rowStep = 0;
    let colStep = 0;
    let steps = 0;

    if(Math.hypot(dx, dy) > cellSize * 0.6){
        const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4) * (Math.PI / 4));

        if(Math.abs(dx) > Math.abs(dy) * 2){
            colStep = Math.sign(dx);
            rowStep = 0;
        } else if (Math.abs(dy) > Math.abs(dx) * 2){
            colStep = 0;
            rowStep = Math.sign(dy);
        } else{
            colStep = Math.sign(dx);
            rowStep = Math.sign(dy);
        }

        const distance = Math.abs(dx) * Math.abs(colStep) + Math.abs(dy) * Math.abs(rowStep);

        const stepLength = pitch() * (rowStep !== 0 && colStep !== 0 ? Math.SQRT2 : 1);

        steps = Math.max(0, Math.round(distance / stepLength));
        while(steps > 0){
            const endRow = selectionStart.row + rowStep * steps;
            const endCol = selectionStart.col + colStep * steps;

            if(endRow >= 0 && endRow < gridSize && endCol >= 0 && endCol < gridSize) break;
            steps--;
        }
    }

    currentSelection = [];
    for(let i = 0; i <= steps; i++){
        currentSelection.push([
            selectionStart.row + rowStep * i,
            selectionStart.col + colStep * i
        ]);
    }

    if(!activeLine){
        activeLine = makeLine("selecting");
    }

    positionLine(activeLine, currentSelection);
}

function makeLine(type){
    const line = document.createElement("div");

    line.classList.add("line", type);
    linesLayer.appendChild(line);

    return line;
}

function positionLine(line, cells){
    const [startRow, startCol] = cells[0];
    const [endRow, endCol] = cells[cells.length -1];

    const [x1, y1] = cellCenter(startRow, startCol);
    const [x2, y2] = cellCenter(endRow, endCol);

    const thickness = cellSize - 4;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    line.style.width = `${length + thickness}px`;
    line.style.height = `${thickness}px`;

    line.style.left = `${x1 - thickness / 2}px`;
    line.style.top = `${y1 - thickness / 2}px`;

    line.style.transformOrigin = `${thickness / 2}px ${thickness / 2}px`;
    line.style.transform = `rotate(${angle}rad)`;
}

function clearActiveLine(){
    if(activeLine){
        activeLine.remove();
        activeLine = null;
    }
}

function getSelectedWord(){
    const selected = currentSelection.map(([row, col]) => grid[row][col]).join("");
    const reversed = selected.split("").reverse().join("");

    for(const wordObject of words){
        if(wordObject.completed) continue;

        const reversed = selected.split("").reverse().join("");

        if(wordObject.word === selected || wordObject.word === reversed){
            return wordObject;
        }
    }
    return null;
}

function handleFoundWord(wordObject){
    currentWord = wordObject;

    foundWord.textContent = wordObject.word;

    definitionInput.value = "";
    definitionError.textContent = "";

    highlightWord(wordObject);

    showDefinitionModal(wordObject.word);
}

function submitDefinition(){
    const definition = definitionInput.value.trim();

    if(definition.length === 0){
        definitionError.textContent = "Please enter a definition.";
        return;
    }

    currentWord.definition = definition;
    currentWord.completed = true;

    const allWordsFound = words.every(word => word.completed);

    hideDefinitionModal();

    displayWordList();

    currentWord = null;

    if(allWordsFound){
        showCompletionModal();
    }
}

function highlightWord(wordObject){
    const start = wordObject.start;
    const end = wordObject.end;

    const rowStep = Math.sign(end.row - start.row);
    const colStep = Math.sign(end.col - start.col);

    const distance = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col));

    const cells = [];
    for(let i = 0; i <= distance; i++){
        cells.push([start.row + rowStep * i, start.col + colStep * i]);
    }

    for(const [row, col] of cells){
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

        if(cell){
            cell.classList.add("completed");
        }
    }
    positionLine(makeLine("found"), cells);
}

function showDefinitionModal(word){
    foundWord.textContent = word;
    definitionInput.value = "";
    definitionError.textContent = "";

    definitionModal.style.display = "flex";
}

function hideDefinitionModal(){
    definitionModal.style.display = "none";
}

function displayReview(){
    reviewArea.innerHTML = "";

    const completedWords = words.filter(word => word.completed);

    if(completedWords.length === 0){
        reviewArea.textContent = "Find a word to begin!";
        return;
    }

    completedWords.forEach(wordObject => {
        const item = document.createElement("div");
        item.classList.add("review-item");

        const title = document.createElement("strong");
        title.textContent = wordObject.word;

        const definition = document.createElement("p");
        definition.textContent = wordObject.definition;

        item.appendChild(title);
        item.appendChild(definition);

        reviewArea.appendChild(item);
    });

    if(completedWords.length === words.length){
        const message = document.createElement("h3");

        message.textContent = "🎉You found all the words!🎉";

        reviewArea.prepend(message);
    }
}

function showFinalReview(){
    const reviewSection = document.querySelector(".sectionReview");

    displayReview();

    reviewSection.hidden = false;
    reviewSection.scrollIntoView({ behavior: "smooth" });
}

function showCompletionModal(){
    completionModal.style.display = "flex";
}

continueReviewBtn.addEventListener("click", () => {
    completionModal.style.display = "none";

    showFinalReview();
});