const noSpaceBlankChar = "‎"
const spaceBlankChar = " "
let body = document.querySelector("body");
let nextButton = document.querySelector("#nextButton");
let correctButton;
let incorrectButton;
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
let skipPercentagesHTML = "";
let userAnswer = "";
let hasPass = false;
let passUsed = false;
let passInUse = false;
let passHTML = "";
let passUsedHTML = "";
let skipPercentageText;
let selectedPercentage;
let prevSelectedPercentage;
let p;
let selectedPassUsedState;
let unusedButton;
let usedButton;
let timerInterval;
let timeValue;
let timerText;
// The wake lock sentinel.
let wakeLock = null;

// SCREEN WAKE LOCK PROBABLY ONLY WORKS ON HTTPS
// Function that attempts to request a screen wake lock. 
const requestWakeLock = async () => {
  try {
    wakeLock = await navigator.wakeLock.request();
    wakeLock.addEventListener('release', () => {
        document.body.innerHTML += `Screen Wake Lock released: ${wakeLock.released}<br>`;
    });
    document.body.innerHTML += `Screen Wake Lock released: ${wakeLock.released}<br>`;
  } catch (err) {
    document.body.innerHTML += `${err.name}, ${err.message}<br>`;
  }
};

// Request a screen wake lock…
requestWakeLock();

const handleVisibilityChange = async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
};
document.addEventListener('visibilitychange', handleVisibilityChange);


function winPage(){
    if (passUsed == true) {
        passUsedHTML = `<h1>You used your pass.</h1>`
    } else {
        passUsedHTML = `<h1>You didn't use a pass.</h1>`
    }
    body.style.backgroundColor = "lightgreen"
    body.innerHTML = `
    <h1 class="big rainbow">YOU WON!!</h1>
    <h1 class="medium">You are a member of the 1% club!</h1>
    ${passUsedHTML}

    `
    
}

function changeGameStatePage() {
    selectedPercentage = percentages[stage];
    selectedPassUsedState = passUsed;
    skipPercentagesHTML = ""
    for (let i = 0; i < percentages.length; i++){
        skipPercentagesHTML += `<button class="smallToMedium trim" id="skipTo${percentages[i]}">${percentages[i]}%</button>
        ` 
    }
    body.innerHTML = 
    `
    <h2 class="smaller">Next question percentage:</h2>
    ${skipPercentagesHTML}
    <h2 class="smaller">Have you used a pass?</h2>
    <button id="unused" class="smallest darkGreen">Not yet! 😎</button>
    <button id="used" class="smallest darkRed">I've used it... 😢</button>
    <h2 class="smaller">Confirm or discard changes:</h2>
    <button id="confirmChanges" class="smallToMedium green">Confirm</button>
    <button id="discardChanges" class="smallToMedium red">Discard</button>
    `
    for (let i = 0; i < percentages.length; i++) {
        document.querySelector(`#skipTo${percentages[i]}`).addEventListener('click', function(e){
            prevSelectedPercentage = selectedPercentage
            selectedPercentage = Number(e.target.id.replace("skipTo", "")) // a safe approach?
            if (prevSelectedPercentage !== selectedPercentage){
                document.querySelector(`#skipTo${selectedPercentage}`).classList.add("selected")
                document.querySelector(`#skipTo${prevSelectedPercentage}`).classList.remove("selected")
            }

        }) // note: I spent a very long time debugging an issue that was caused by using:
        // ... addEventListener("click", someFunc(arg)) , this caused many issues as I tried to pass an argument like this...
    }
    document.querySelector(`#skipTo${selectedPercentage}`).classList.add("selected")

    unusedButton = document.querySelector("#unused")
    usedButton = document.querySelector("#used")

    unusedButton.addEventListener('click', function(){
        selectedPassUsedState = false;
        unusedButton.classList.add("selected")
        unusedButton.style.color = "green";
        usedButton.classList.remove("selected")
        usedButton.style.color = "white"
    })
    usedButton.addEventListener('click', function(){
        selectedPassUsedState = true;
        usedButton.classList.add("selected")
        usedButton.style.color = "red";
        unusedButton.classList.remove("selected")
        unusedButton.style.color = "white"
    })

    if (selectedPassUsedState === true) {
        usedButton.classList.add("selected")
        usedButton.style.color = "red";
    } else{
        unusedButton.classList.add("selected")
        unusedButton.style.color = "green";
    }

    document.querySelector("#confirmChanges").addEventListener('click', function(){
        stage = percentages.indexOf(selectedPercentage)
        passUsed = selectedPassUsedState
        timeStartsNowButtonPage()
    })
    document.querySelector("#discardChanges").addEventListener('click', timeStartsNowButtonPage)

    
}

function nextQuestionWaitingPage() {
    stage = stage + 1
    timeStartsNowButtonPage()
}
function timeStartsNowButtonPage() {
    
    body.innerHTML = `
    <h1 class="medium" id="nextQuestionText">Next Question: ${percentages[stage]}%</h1>
    <div><button id="nextButton" class="big">'Your time starts... NOW'</button></div>
    <br>
    <div><button id="changeGameStateButton">Change game state</button></div>
    `
    
    if (percentages[stage] === 1) {
        // document.querySelector("#nextQuestionText").style.color = "black"
        document.querySelector("#nextQuestionText").classList.add('goldglow');
        document.body.style.backgroundColor = "black";
    }
    else {
        document.body.style.backgroundColor = "blue"
    }
    nextButton = document.querySelector("#nextButton");
    changeGameStateButton = document.querySelector("#changeGameStateButton");

    nextButton.addEventListener('click', questionPage);
    changeGameStateButton.addEventListener('click', changeGameStatePage)
    
}
function correctPage() {
    if (percentages[stage] != 1) {
        nextQuestionWaitingPage()
    } else {
        winPage()
    }
    
}
function usePass() {
    passInUse = true
    passUsed = true
    body.innerHTML = `
    <h1 class="big">Used pass, waiting...</h1>
    <div id="time">${timeValue}s</div>`
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
    clearInterval(timerInterval)
    if (passInUse == true) {
        passInUse = false
        hasPass = false
        nextQuestionWaitingPage()
        
    }
    else {
        if (userAnswer == "") {
            ans = document.querySelector("#answerField").value
            if (ans != ""){
                userAnswer = ans
            } else {
                userAnswer = `${noSpaceBlankChar} ${noSpaceBlankChar} ${noSpaceBlankChar} ${noSpaceBlankChar} ${noSpaceBlankChar} `
            }
        }
        body.innerHTML = `
        <h1>You put:</h1>
        <div id="answerTextDiv" class="medium">${userAnswer}</div>
        <br>
        <button id="correctButton">Correct</button>
        <br>
        <button id="incorrectButton">Incorrect</button>`
       
        correctButton = document.querySelector("#correctButton")
        incorrectButton = document.querySelector("#incorrectButton")
        incorrectButton.addEventListener('click', out)
        
        correctButton.addEventListener('click', correctPage)
        
    }
    
}

function questionPage() {
    userAnswer = ""
    passHTML = ``
    setTimeout(timesUp, 30000)
    timeValue = 30
    if (percentages[stage] != 1){
        if (passUsed === false && percentages[stage] <= 50){
            passHTML = `<div id="passDiv"><button id="passButton">Pass</button></div>`
        } 
        else if (percentages[stage] <= 50 && passUsed == true) {
            // passHTML = `<div id="passDiv">No pass available.</div>`
            if (passUsed == true) {
                passHTML = `<div id="passDiv">Pass used.</div>`
            }
        }
    } else {
        passHTML = ``
    }
    
    body.innerHTML= 
    `<h1 id="percentageTitleText">${percentages[stage]}%</h1>${passHTML}
    <textarea id="answerField" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type answer here..."></textarea>
    `
    if (percentages[stage] === 1) {
        document.querySelector("#answerField").style.borderColor = "gold"
        document.querySelector("#percentageTitleText").style.color = "gold"
    }

    timerInterval = setInterval(function() {
        timeValue -= 1
        timerText = document.querySelector("#time")
        timerText.innerText = `${timeValue}s`
    }, 1000)
    answerField = document.querySelector("#answerField");
    answerField.focus()

    answerField.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          userAnswer = answerField.value
          if (userAnswer != "") {
              body.innerHTML = `
              <h1 class="big">Answer submitted</h1>
              <div id="time">${timeValue}s</div>`
          }
        }
      }); 

      if (passUsed === false && percentages[stage] <= 50) {
        document.querySelector("#passButton").addEventListener('click', usePass)
      }

}

nextButton.addEventListener('click', questionPage)
changeGameStateButton.addEventListener('click', changeGameStatePage)
