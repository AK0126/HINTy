const problemInput = document.getElementById('problem');
const generateBtn = document.getElementById('generateBtn');
const hintBox = document.getElementById('hint');
const errorBox = document.getElementById('error');
const exampleBtns = document.querySelectorAll('.example-btn');

generateBtn.addEventListener('click', generateHint);

exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        problemInput.value = btn.textContent;
        hintBox.classList.add('hidden');
        errorBox.classList.add('hidden');
    });
});

async function generateHint() {
    const problem = problemInput.value.trim();
    
    if (!problem) {
        showError('Please enter a math problem');
        return;
    }

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating...';
    hintBox.classList.add('hidden');
    errorBox.classList.add('hidden');

    try {
        const response = await fetch('/api/hint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate hint');
        }

        showHint(data.hint);
    } catch (error) {
        showError(error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '💡 Get Hint';
    }
}

function showHint(hint) {
    hintBox.innerHTML = `<h3>💡 Hint:</h3><p>${hint}</p>`;
    hintBox.classList.remove('hidden');
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
}