import { extractWords } from "./WordExtractor.js";
import { createEmptyGrid, placeAllWords, fillEmptyCells } from "./WordSearch.js";

let words = [];
let grid = [];
let gridSize = 15;
let selectedStart = null;
let selectedEnd = null;
let currentWord = null;

const notesInput = document.getElementById("notesInput");
const wordCount = document.getElementById("wordCount");
const generateBtn = document.getElementById("generateBtn");
const gameArea = document.getElementById("gameArea");
const wordGrid = document.getElementById("wordGrid");
const wordList = document.getElementById("wordList");
const reviewArea = document.getElementById("reviewArea");
const definitionModal = document.getElementById("definitionModal");
const foundWord = document.getElementById("foundWord");
const definitionInput = document.getElementById("definitionInput");
const definitionError = document.getElementById("definitionError");
const submitDefinitionBtn = document.getElementById("submitDefinitionBtn");
const generationError = document.getElementById("generationError");

generateBtn.addEventListener("click", generateWordSearch);
submitDefinitionBtn.addEventListener("click", submitDefinition);

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

    gridSize = Math.max(15, longestWord+2);

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

    displayGrid();
    displayWordList();
    displayReview();

    gameArea.style.display = "block";
}

function displayGrid(){
    wordGrid.innerHTML = "";

    wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;

    for(let row = 0; row < gridSize; row++){
        for(let col = 0; col < gridSize; col++){
            const cell = document.createElement("div");

            cell.classList.add("cell");

            cell.textContent = grid[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.addEventListener("click", () => handleCellClick(row, col));

            wordGrid.appendChild(cell);
        }
    }
}

function displayWordList(){
    wordList.innerHTML = "";

    words.forEach(wordObject => {
        item.textContent = wordObject.word;

        item.classList.add("word-item");

        item.id = "word-" + wordObject.word;

        if(wordObject.completed){
            item.classList.add("completed");
        }

        wordList.appendChild(item);
    });
}

function handleCellClick(row, col){
    if(selectedStart === null){
        selectedStart = {
            row: row,
            col: col
        };

        highlightCell(row, col);
        return;
    }

    selectedEnd = {
        row: row,
        col: col
    };

    const selectedWord = getSelectedWord();

    clearTemporarySelection();

    selectedStart = null;
    selectedEnd = null;

    if(selectedWord){
        handleFoundWord(selectedWord);
    }
}

function getSelectedWord(){
    const rowDifference = selectedEnd.row - selectedStart.row;
    const colDifference = selectedEnd.col - selectedStart.col;

    const isStraight = rowDifference === 0 || colDifference === 0 || Math.abs(rowDifference) === Math.abs(colDifference);

    if(!isStraight){
        return null;
    }

    const rowStep = Math.sign(rowDifference);
    const colStep = Math.sign(colDifference);

    const distance = Math.max(Math.abs(rowDifference), Math.abs(colDifference));

    let selected = "";

    for(let i = 0; i <= distance; i++){
        const row = selectedStart.row + rowStep * i;
        const col = selectedStart.col + colStep * i;

        selected += grid[row][col];
    }

    for(const wordObject of words){
        if(wordObject.word === selected && !wordObject.completed){
            return wordObject;
        }

        const reversed = selected.split("").reverse().join("");

        if(wordObject.word === reversed && !wordObject.completed){
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
    definitionModal.style.display = "flex";

    highlightWord(wordObject);
}

function submitDefinition(){
    const definition = definitionInput.value.trim();

    if(definition.length === 0){
        definitionError.textContent = "Please enter a definition.";
        return;
    }

    currentWord.definition = definition;

    currentWord.completed = true;

    definitionModal.style.display = "none";

    displayWordList();

    highlightWord(currentWord);

    displayReview();

    currentWord = null;
}

function highlightWord(wordObject){
    const start = wordObject.start;
    const end = wordObject.end;

    const rowStep = Math.sign(end.row - start.row);
    const colStep = Math.sign(end.col - start.col);

    const distance = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col));

    for(let i = 0; i <= distance; i++){
        const row = start.row + rowStep * i;
        const col = start.col + colStep * i;

        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

        if(cell){
            cell.classList.remove("selected");
            cell.classList.add("completed");
        }
    }
}

function highlightCell(row, col){
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    if(cell){
        cell.classList.add("selected");
    }
}

function clearTemporarySelection(){
    document.querySelectorAll(".cell.selected").forEach(cell => {
        cell.classList.remove("selected");
    });
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