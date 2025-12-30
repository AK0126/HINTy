const problemInput = document.getElementById('problem');
const startBtn = document.getElementById('startBtn');
const inputSection = document.getElementById('inputSection');
const workingSection = document.getElementById('workingSection');
const examplesSection = document.getElementById('examplesSection');
const problemDisplay = document.getElementById('problemDisplay');
const getHintBtn = document.getElementById('getHintBtn');
const newProblemBtn = document.getElementById('newProblemBtn');
const hintsContainer = document.getElementById('hintsContainer');
const errorBox = document.getElementById('error');
const exampleBtns = document.querySelectorAll('.example-btn');

const mainAnswerInput = document.getElementById('mainAnswer');
const checkMainBtn = document.getElementById('checkMainBtn');
const mainResult = document.getElementById('mainResult');

let currentProblem = '';
let hints = [];

// Event Listeners
startBtn.addEventListener('click', startProblem);
getHintBtn.addEventListener('click', generateHint);
newProblemBtn.addEventListener('click', resetToInput);
checkMainBtn.addEventListener('click', checkMainAnswer);

mainAnswerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkMainAnswer();
});

exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        problemInput.value = btn.textContent;
    });
});

function startProblem() {
    const problem = problemInput.value.trim();
    
    if (!problem) {
        showError('Please enter a math problem');
        return;
    }

    currentProblem = problem;
    problemDisplay.textContent = problem;
    
    // Switch views
    inputSection.classList.add('hidden');
    examplesSection.classList.add('hidden');
    workingSection.classList.remove('hidden');
    
    // Reset state
    resetWorkingState();
}

function resetToInput() {
    inputSection.classList.remove('hidden');
    examplesSection.classList.remove('hidden');
    workingSection.classList.add('hidden');
    resetWorkingState();
}

function resetWorkingState() {
    hints = [];
    hintsContainer.innerHTML = '';
    errorBox.classList.add('hidden');
    mainResult.classList.add('hidden');
    mainAnswerInput.value = '';
    updateHintButton();
}

function updateHintButton() {
    if (hints.length > 0) {
        getHintBtn.innerHTML = '<span style="font-size: 1.25rem;">➕</span> Get Another Hint';
    } else {
        getHintBtn.innerHTML = '💡 Get a Hint';
    }
}

function disableHintButton() {
    getHintBtn.innerHTML = '✅ All Hints Provided';
}

async function generateHint() {
    getHintBtn.disabled = true;
    getHintBtn.innerHTML = '<span class="spinner"></span> Getting Hint...';
    errorBox.classList.add('hidden');

    try {
        const previousHint = hints.length > 0 ? hints[hints.length - 1].text : null;
        
        const response = await fetch('/api/hint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                problem: currentProblem,
                previous_hint: previousHint,
                hint_number: hints.length + 1
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate hint');
        }

        const hintObj = {
            id: Date.now(),
            text: data.hint,
            answer: '',
            result: null
        };
        
        hints.push(hintObj);
        if (!data.done) {
            renderHint(hintObj, hints.length - 1);
            updateHintButton();
            getHintBtn.disabled = false;
        } else {
            renderDone(hintObj, hints.length - 1);
            disableHintButton();
        }
    } catch (error) {
        showError(error.message);
    }
}

function renderHint(hint, index) {
    const hintElement = document.createElement('div');
    hintElement.className = 'hint-box';
    hintElement.id = `hint-${hint.id}`;
    hintElement.innerHTML = `
        <div class="hint-content">
            <span class="hint-icon">💡</span>
            <div>
                <h3>Hint ${index + 1}:</h3>
                <p>${hint.text}</p>
            </div>
        </div>
        <div class="hint-answer-section">
            <h4>Check Your Answer to This Hint:</h4>
            <div class="answer-input-group">
                <input 
                    type="text" 
                    id="hint-answer-${hint.id}"
                    placeholder="Enter your answer to the hint..."
                    class="hint-answer-input"
                >
                <button id="check-hint-${hint.id}" class="check-hint-btn">Check</button>
            </div>
            <div id="hint-result-${hint.id}" class="result-box hidden"></div>
        </div>
    `;
    
    hintsContainer.appendChild(hintElement);
    
    // Add event listeners
    const answerInput = document.getElementById(`hint-answer-${hint.id}`);
    const checkBtn = document.getElementById(`check-hint-${hint.id}`);
    
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkHintAnswer(index);
    });
    
    checkBtn.addEventListener('click', () => checkHintAnswer(index));
}

function renderDone(hint, index) {
    const hintElement = document.createElement('div');
    hintElement.className = 'hint-box';
    hintElement.id = `hint-${hint.id}`;
    hintElement.innerHTML = `
        <div class="hint-content">
            <span class="hint-icon">💡</span>
            <div>
                <h3>Hint ${index + 1}:</h3>
                <p>${hint.text}</p>
            </div>
        </div>
    `;
    
    hintsContainer.appendChild(hintElement);
}

async function checkHintAnswer(hintIndex) {
    const hint = hints[hintIndex];
    const answerInput = document.getElementById(`hint-answer-${hint.id}`);
    const checkBtn = document.getElementById(`check-hint-${hint.id}`);
    const resultBox = document.getElementById(`hint-result-${hint.id}`);
    
    const answer = answerInput.value.trim();
    
    if (!answer) {
        showError('Please enter your answer to the hint');
        return;
    }

    checkBtn.disabled = true;
    checkBtn.innerHTML = '<span class="spinner"></span> Checking...';
    resultBox.classList.add('hidden');
    errorBox.classList.add('hidden');

    try {
        const response = await fetch('/api/check-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem: hint.text, answer })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to check hint answer');
        }

        hints[hintIndex].result = data;
        showResult(resultBox, data.is_correct, data.feedback);
    } catch (error) {
        showError(error.message);
    } finally {
        checkBtn.disabled = false;
        checkBtn.textContent = 'Check';
    }
}

async function checkMainAnswer() {
    const answer = mainAnswerInput.value.trim();
    
    if (!answer) {
        showError('Please enter your answer');
        return;
    }

    checkMainBtn.disabled = true;
    checkMainBtn.innerHTML = '<span class="spinner"></span> Checking...';
    mainResult.classList.add('hidden');
    errorBox.classList.add('hidden');

    try {
        const response = await fetch('/api/check-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem: currentProblem, answer })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to check answer');
        }

        showResult(mainResult, data.is_correct, data.feedback);
    } catch (error) {
        showError(error.message);
    } finally {
        checkMainBtn.disabled = false;
        checkMainBtn.textContent = 'Check';
    }
}

function showResult(element, isCorrect, feedback) {
    element.className = isCorrect ? 'result-box correct' : 'result-box incorrect';
    element.innerHTML = `
        <div class="result-content">
            <span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
            <div>
                <strong>${isCorrect ? 'Correct! 🎉' : 'Not quite right'}</strong>
                <p>${feedback}</p>
            </div>
        </div>
    `;
    element.classList.remove('hidden');
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
}