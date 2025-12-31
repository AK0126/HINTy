const problemInput = document.getElementById('problem');
const startBtn = document.getElementById('startBtn');
const inputSection = document.getElementById('inputSection');
const workingSection = document.getElementById('workingSection');
const examplesSection = document.getElementById('examplesSection');
const problemDisplay = document.getElementById('problemDisplay');
const revealHintBtn = document.getElementById('revealHintBtn');
const newProblemBtn = document.getElementById('newProblemBtn');
const hintsContainer = document.getElementById('hintsContainer');
const errorBox = document.getElementById('error');
const exampleBtns = document.querySelectorAll('.example-btn');

const mainAnswerInput = document.getElementById('mainAnswer');
const checkMainBtn = document.getElementById('checkMainBtn');
const mainResult = document.getElementById('mainResult');

let currentProblem = '';
let allHints = [];  // All hints pre-generated
let revealedHints = [];  // Hints currently shown to user

// Event Listeners
startBtn.addEventListener('click', startProblem);
revealHintBtn.addEventListener('click', revealNextHint);
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

async function startProblem() {
    const problem = problemInput.value.trim();
    
    if (!problem) {
        showError('Please enter a math problem');
        return;
    }

    // Show loading state
    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="spinner"></span> Generating hints...';

    try {
        // Call /api/start to generate all hints upfront
        const response = await fetch('/api/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                problem
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to start problem');
        }

        currentProblem = problem;
        allHints = data.hints;  // Store all pre-generated hints
        revealedHints = [];
        
        problemDisplay.textContent = problem;
        
        // Switch views
        inputSection.classList.add('hidden');
        examplesSection.classList.add('hidden');
        workingSection.classList.remove('hidden');
        
        // Reset state
        // resetWorkingState();
        updateRevealHintButton();
        
    } catch (error) {
        showError(error.message);
    } finally {
        startBtn.disabled = false;
        startBtn.innerHTML = '▶ Start';
    }
}

function revealNextHint() {
    if (revealedHints.length >= allHints.length) {
        showError('No more hints available!');
        return;
    }
    
    const nextHintText = allHints[revealedHints.length];
    const hintObj = {
        id: Date.now(),
        text: nextHintText,
        answer: '',
        result: null
    };
    
    revealedHints.push(hintObj);
    renderHint(hintObj, revealedHints.length - 1);
    updateRevealHintButton();
    errorBox.classList.add('hidden');
}

function resetToInput() {
    inputSection.classList.remove('hidden');
    examplesSection.classList.remove('hidden');
    workingSection.classList.add('hidden');
    resetWorkingState();
}

function resetWorkingState() {
    allHints = [];
    revealedHints = [];
    hintsContainer.innerHTML = '';
    errorBox.classList.add('hidden');
    mainResult.classList.add('hidden');
    mainAnswerInput.value = '';
}

function updateRevealHintButton() {
    if (revealedHints.length >= allHints.length) {
        revealHintBtn.disabled = true;
        revealHintBtn.textContent = '✅ All Hints Provided';
    } else if (revealedHints.length > 0) {
        revealHintBtn.disabled = false;
        revealHintBtn.innerHTML = '<span style="font-size: 1.25rem;">➕</span> Get Another Hint';
    } else {
        revealHintBtn.disabled = false;
        revealHintBtn.innerHTML = '💡 Get Hint';
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

async function checkHintAnswer(hintIndex) {
    const hint = revealedHints[hintIndex];
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
            body: JSON.stringify({ problem: hint.text, context: currentProblem, answer })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to check hint answer');
        }

        revealedHints[hintIndex].result = data;
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
            body: JSON.stringify({ problem: currentProblem, context: '', answer })
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
