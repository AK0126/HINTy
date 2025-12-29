const problemInput = document.getElementById('problem');
const startBtn = document.getElementById('startBtn');
const inputSection = document.getElementById('inputSection');
const workingSection = document.getElementById('workingSection');
const examplesSection = document.getElementById('examplesSection');
const problemDisplay = document.getElementById('problemDisplay');
const getHintBtn = document.getElementById('getHintBtn');
const newProblemBtn = document.getElementById('newProblemBtn');
const hintBox = document.getElementById('hintBox');
const hintText = document.getElementById('hintText');
const errorBox = document.getElementById('error');
const exampleBtns = document.querySelectorAll('.example-btn');

const mainAnswerInput = document.getElementById('mainAnswer');
const checkMainBtn = document.getElementById('checkMainBtn');
const mainResult = document.getElementById('mainResult');

const hintAnswerInput = document.getElementById('hintAnswer');
const checkHintBtn = document.getElementById('checkHintBtn');
const hintResult = document.getElementById('hintResult');

let currentProblem = '';

// Event Listeners
startBtn.addEventListener('click', startProblem);
getHintBtn.addEventListener('click', generateHint);
newProblemBtn.addEventListener('click', resetToInput);
checkMainBtn.addEventListener('click', checkMainAnswer);
checkHintBtn.addEventListener('click', checkHintAnswer);

mainAnswerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkMainAnswer();
});

hintAnswerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkHintAnswer();
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
    hintBox.classList.add('hidden');
    errorBox.classList.add('hidden');
    mainResult.classList.add('hidden');
    hintResult.classList.add('hidden');
    mainAnswerInput.value = '';
    hintAnswerInput.value = '';
}

async function generateHint() {
    getHintBtn.disabled = true;
    getHintBtn.innerHTML = '<span class="spinner"></span> Getting Hint...';
    hintBox.classList.add('hidden');
    hintResult.classList.add('hidden');
    hintAnswerInput.value = '';
    errorBox.classList.add('hidden');

    try {
        const response = await fetch('/api/hint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem: currentProblem })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate hint');
        }

        hintText.textContent = data.hint;
        hintBox.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
    } finally {
        getHintBtn.disabled = false;
        getHintBtn.innerHTML = '💡 Get a Hint';
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

async function checkHintAnswer() {
    const hintQuestion = hintText.textContent;
    const answer = hintAnswerInput.value.trim();
    
    if (!answer) {
        showError('Please enter your answer to the hint');
        return;
    }

    checkHintBtn.disabled = true;
    checkHintBtn.innerHTML = '<span class="spinner"></span> Checking...';
    hintResult.classList.add('hidden');
    errorBox.classList.add('hidden');

    try {
        const response = await fetch('/api/check-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem: hintQuestion, answer })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to check hint answer');
        }

        showResult(hintResult, data.is_correct, data.feedback);
    } catch (error) {
        showError(error.message);
    } finally {
        checkHintBtn.disabled = false;
        checkHintBtn.textContent = 'Check';
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