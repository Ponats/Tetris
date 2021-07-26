import BLOCKS from "./blocks.js"

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button")

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

const movingItem = {
    type: "",
    direction: 0, // 화살표 위 방향키를 눌렀을 때 돌리는 역할을 도와주는 지표.
    top: 0, // 위 아래값
    left: 4, // 왼쪽 오른쪽 값
};


init()

// function
function init(){

    tempMovingItem = { ...movingItem };
    for(let i = 0; i < GAME_ROWS; i++){
        prependNewLine()
    }
    generateNewBlock();
    //renderBlocks()
}

function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j = 0; j < GAME_COLS; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul)
    playground.prepend(li)
}

function renderBlocks(moveType =""){
    const { type, direction, top, left} = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
    })
    BLOCKS[type][direction].some(block => { //forEach
        const x = block[0] + left;
        const y = block[1] + top;
        //console.log(playground.childNodes[y])
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailbale = checkEmpty(target);
        if (isAvailbale) {
            target.classList.add(type, "moving")
        } else {
            tempMovingItem = { ... movingItem }
            if(moveType === 'retry'){
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(()=>{
                renderBlocks('retry') // 재귀함수
                if(moveType === "top"){
                    seizeBlock();
                }
            },0) // 괄호안에 이벤트가 실행된 후에 스택에 집어넣기.. 0초 후.
            return true;
        }
    });
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
}

function checkMatch(){

    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized"))
            matched = false
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerText = score;
        }
    })

    generateNewBlock()
}

function generateNewBlock(){ // 블록 생성 위치

    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock('top',1)
    },duration)

    const blockArray = Object.entries(BLOCKS); // 블록의 갯수를 blockArray에 담기
    const randomIndex = Math.floor(Math.random() * blockArray.length) // 랜덤 숫자 생성

    movingItem.type = blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ... movingItem};
    renderBlocks()
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType, amount){
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType)
}

function changeDirection(){
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}
function changeDirectionReverSe(){
    const direction = tempMovingItem.direction;
    direction === 0 ? tempMovingItem.direction = 3 : tempMovingItem.direction -= 1;
    renderBlocks();
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top",1)
    }, 8);
}

function showGameoverText(){
    gameText.style.display = "flex";
}

// event handling
document.addEventListener("keydown", e=> {
    switch(e.keyCode){
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 38:
        case 88:
            changeDirection();
            break;
        case 17:
        case 90:
            changeDirectionReverSe();
            break;
        case 40:
            moveBlock("top", 1)
            break;
        case 32: // 스페이스바
            dropBlock();
            break;
        default:
            break;
    }
    console.log(e)
})

restartButton.addEventListener("click",()=>{
    playground.innerHTML ="";
    gameText.style.display = "none"
    score = 0;
    scoreDisplay.innerText = score;
    init()
})