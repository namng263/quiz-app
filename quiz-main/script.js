// TODO(you): Write the JavaScript necessary to complete the assignment.

// get elements
const intro = document.querySelector("#introduction");
const attempt = document.querySelector("#attempt-quiz");  
const review = document.querySelector('#review-quiz');
const showBox = document.querySelector(".confirm-box");
const hideBox = document.querySelector('.confirm-cancel');
const theQuiz = document.querySelector('.the-quiz');
const subBox = document.querySelector('#box-submit');
const theSelected = document.querySelector('.the-selected');
const reviewResult = document.querySelector('#box-result')

let quizID;
let answObj = {};

// get data
async function takeQuestion() {
    let obj201 = await fetch(`https://wpr-quiz-api.herokuapp.com/attempts`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    }).then(function(res) {
        return res.json();

    }).catch((error) => console.log(error));

    quizID = obj201._id;
    return obj201;
}

// Start the quiz
function startTheQuiz() {
    // hide introduction
    intro.classList.add('no-display');

    // display attempt part
    takeQuestion().then(function(obj201) {
        attempt.classList.remove('no-display');

        obj201.questions.map((question, quesIndex) => {
            const divQues = quizQues(question, quesIndex)
            theQuiz.appendChild(divQues)
            
            // the answer form
            const form = document.createElement('form')
            form.setAttribute("class", "option-list")
            question.answers.map((answ, answIndex) => {
                const divSelection = quizAnswer(question._id, answ, answIndex);
                form.appendChild(divSelection);
                theQuiz.appendChild(form)
            });
        });
        // create the submit button
        subBox.innerHTML = `<button id="btn-submit">Submit your answers ❯ </button>`
        
        // Confirm to submit the quiz
        function showConfirm() {
            showBox.classList.add('open-box');
        }
        
        const clickSub = document.querySelector("#btn-submit");
        clickSub.addEventListener("click", showConfirm);
    });
};

// open quiz part
const clickStart = document.querySelector("#btn-start");
clickStart.addEventListener("click", startTheQuiz);
clickStart.addEventListener("click", backToTop);

function quizQues(question, quesIndex) {
    const h2 = document.createElement("h2")
    h2.setAttribute("class", "question-index")
    const divQues = document.createElement("div")
    h2.textContent = "Question " + (quesIndex + 1) + " of 10"

    const p = document.createElement("p")
    p.setAttribute("class", "question-text")
    p.textContent = question.text

    divQues.appendChild(h2)
    divQues.appendChild(p)

    return divQues;
}

// populate the ans
function quizAnswer(quesID, answ, answIndex) {
    const divOption = document.createElement("div")
    divOption.setAttribute("class", "option")
    divOption.innerHTML = `<input type = "radio" id = "${answIndex}-${quesID}" name = "${quesID}" value = "${answIndex}" > <label class="option-content" for= "${answIndex}-${quesID}"> </label>`

    divOption.querySelector("label").textContent = answ;

    //option selected 
    divOption.addEventListener("click", answSelected)

    return divOption;
}

// highlight the answer user choose
function answSelected(event) {
    const selection = event.currentTarget;
    const form = selection.parentElement;

    const input = selection.querySelector("input")
    input.checked = true

    const optionSelected = form.querySelector(".option-selected")
    if (optionSelected) {
        optionSelected.classList.remove("option-selected")
    }

    selection.classList.add("option-selected")

    answObj[input.name] = Number(input.value);
}

async function setQuestion() {
    let obj200 = await fetch(`https://wpr-quiz-api.herokuapp.com/attempts/${quizID}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "userAnswers": answObj })

    }).then(function (res) {
        return res.json();

    }).catch((error) => console.log(error));

    return obj200;
}

// Close the box when user hit cancel 
function hideConfirm() {
    showBox.classList.remove('open-box');
}

// Show the review part
function showResult() {
    showBox.classList.remove('open-box');
    attempt.classList.add('no-display');
    
    setQuestion().then(function(obj200) {
        review.classList.remove('no-display');

        obj200.questions.map((question, quesIndex) => {
            const theQuiz = quizQues(question, quesIndex)
            theSelected.appendChild(theQuiz)
            
            
            const form = document.createElement("form")
            form.setAttribute("class", "option-list")
            question.answers.map((answ, answIndex) => {
                // create the wrong and right answers
                const divSelection = scoreQuizAnswer(question._id, answ, answIndex, obj200.correctAnswers)
                form.appendChild(divSelection)
                theSelected.appendChild(form) 
            });
        });

        // score box
        const numCorrect = obj200.score
        reviewResult.innerHTML = `<h2>Result:</h2>
        <p class="num-correct">${numCorrect}/10</p>
        <p class="percent-right">${numCorrect*10}%</p>
        <p class="feedback-content">${obj200.scoreText}</p>
        <button id="btn-try-again">Try again</button>`

        const clickAgain = document.querySelector("#btn-try-again");
        clickAgain.addEventListener("click", againTheQuiz);
        clickAgain.addEventListener("click", backToTop);

    });
};

// user close the box
const result = document.querySelector('.confirm-ok')
result.addEventListener('click', showResult);
result.addEventListener("click", backToTop);

hideBox.addEventListener('click', hideConfirm);

// mark the quiz
function scoreQuizAnswer(quesID, answ, answIndex, rightAnsw) {
    const divSelection = document.createElement("div");
    divSelection.setAttribute("class", "option");
    divSelection.innerHTML = `<input type = "radio" id = "${answIndex}-${quesID}" name = "${quesID}" value = "${answIndex}" > <label class="option-content" for= "${answIndex}-${quesID}"> </label>`

    const label = divSelection.querySelector("label")
    label.textContent = answ;
    label.disabled = true;

    const input = divSelection.querySelector("input")
    input.disabled = true;

    // user's ans right 
    if (answIndex === answObj[quesID] && answIndex === Number(rightAnsw[quesID])) {
        input.checked = true;
        divSelection.classList.add("correct-answer")
    }

    // user not choose option
    if (answIndex !== answObj[quesID] && answIndex === Number(rightAnsw[quesID])) {
        divSelection.classList.add("option-correct")
    }

    // user's ans wrong
    if (answIndex === answObj[quesID] && answIndex !== Number(rightAnsw[quesID])) {
        input.checked = true;
        divSelection.classList.add("wrong-answer")
    }

    return divSelection;
}

// Scroll to the page's top
function backToTop() {
    const backToTop = document.querySelector("body");
    backToTop.scrollIntoView();
}

// Try the quiz again
function againTheQuiz() {
    location.reload();
}
