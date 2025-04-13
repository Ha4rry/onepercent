let body = document.querySelector("body");
let nextButton = document.querySelector("#nextButton");
let answerField = null;
const percentages = [90,
    80,
    70,
    60,
    50,
    45,
    40,
    35,
    30,
    25,
    20,
    15,
    10,
    5,
    1
];
let stage = 0;
let userAnswer = ""
let hasPass = false
let passUsed = false
let passInUse = false
let passGiven = false
let passHTML = ""
let passUsedHTML = ""
let skipHTML = `<div><button id="skipToOnePercentButton">Skip to 1% question</button></div>`

function winPage(){
    if (passUsed == true) {
        passUsedHTML = `<h1>You used a pass.</h1>`
    } else {
        passUsedHTML = `<h1>A pass was not used.</h1>`
    }
    body.style.backgroundColor = "lightgreen"
    body.innerHTML = `
    <h1 class="big rainbow">YOU WON!!</h1>
    <h1 class="medium">You are a member of the 1% club!</h1>
    ${passUsedHTML}

    `
    
}
function nextQuestion(){
    stage = stage + 1
    questionPage()
}
function timeStartsNowButtonPage() {
    if (stage == 13) {
        skipHTML=``
    }
    body.innerHTML = `
    <h1 class="medium">Next Question: ${percentages[stage+1]}%</h1>
    <div><button id="nextButton" class="big">'Your time starts... NOW'</button></div>
    <br>
    <br>
    <br>
    <br>
    ${skipHTML}
    `
    nextButton = document.querySelector("#nextButton");
    skipToOnePercentButton = document.querySelector("#skipToOnePercentButton");

    nextButton.addEventListener('click', nextQuestion);
    skipToOnePercentButton.addEventListener('click', () => {
        if (confirm("Are you sure you want to skip to the 1% question?") == true){
            stage = 13
            timeStartsNowButtonPage()
        }
    })
}
function correctPage() {
    if (percentages[stage] != 1) {
        timeStartsNowButtonPage()
    } else {
        winPage()
    }
    
}
function usePass() {
    passInUse = true
    passUsed = true
    body.innerHTML = `<h1 class="big">Used pass, waiting...</h1>`
}
function out() {
    if (passUsed == true) {
        passUsedHTML = `<h1>You used your pass.</h1>`
    } else {
        passUsedHTML = `<h1>A pass was not used.</h1>`
    }

    body.style.backgroundColor = "red"
    body.innerHTML = `
    <h1 class="big">You are OUT.</h1>
    <h1 class="medium">You lost on the ${percentages[stage]}% question.</h1>
    ${passUsedHTML}
    `
}
function timesUp() {
    if (passInUse == true) {
        passInUse = false
        hasPass = false
        timeStartsNowButtonPage()
        
    }
    else if (userAnswer == "") {
        out()
    }
    else {
        body.innerHTML = `
        <h1>You put:</h2>
        <div id="answerTextDiv" class="medium">${userAnswer}</div>
        <br>
        <button id="correctButton">Correct</button>
        <br>
        <button id="incorrectButton">Incorrect</button>`

        let correctButton = document.querySelector("#correctButton")
        let incorrectButton = document.querySelector("#incorrectButton")
        incorrectButton.addEventListener('click', out)
        
        correctButton.addEventListener('click', correctPage)
    }
    
}
function questionPage() {
    userAnswer = ""
    setTimeout(timesUp, 30000)
    if (percentages[stage] != 1){
        if (percentages[stage] <= 50 && passUsed == false){
            hasPass = true
            passGiven = true
        }
        if (hasPass == true){
            passHTML = `<div id="passDiv"><button id="passButton">Pass</button></div>`
        } 
        else {
            // passHTML = `<div id="passDiv">No pass available.</div>`
            if (passUsed == true) {
                passHTML = `<div id="passDiv">Pass used</div>`
            }
        }
    } else {
        passHTML = ``
    }
    
    body.innerHTML= 
    `<span><h1 id="percentageTitleText">${percentages[stage]}%</h1>${passHTML}</span>
    <textarea id="answerField" placeholder="Type answer here..."></textarea>
    <h1>Press Enter on the keyboard when typing to submit.</h1>
    `
    if (percentages[stage] == 1) {
        document.querySelector("#answerField").style.borderColor = "gold"
    }

    answerField = document.querySelector("#answerField");
    answerField.focus()

    answerField.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          userAnswer = answerField.value
          if (userAnswer != "") {
              body.innerHTML = `<h1 class="big">Waiting...</h1>`
          }
        }
      }); 

      if (hasPass == true) {
        passButton = document.querySelector("#passButton")
        passButton.addEventListener('click', usePass)
      }

}

nextButton.addEventListener('click', questionPage)
