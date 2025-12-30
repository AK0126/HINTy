from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import dspy
import os
import secrets

from hinty import hint_generator, answer_checker

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(16))

# Initialize your DSPy configuration
lm = dspy.LM("openai/gpt-5-mini")
dspy.settings.configure(lm=lm)


@app.route('/', methods=['GET'])
def index():
    session['answered'] = False
    return render_template('index.html')


@app.route('/api/hint', methods=['POST'])
def generate_hint():
    try:
        if session.get('answered', False):
            return jsonify({'hint': 'The problem has already been answered correctly!', 'done': True})

        data = request.json
        problem = data.get('problem', '')
        previous_hint = data.get('previous_hint', None)
        hint_number = data.get('hint_number', 1)
        
        if not problem:
            return jsonify({'error': 'No problem provided'}), 400
        
        # Generate hint using DSPy
        result = hint_generator(
            problem=problem,
            previous_hint=previous_hint if previous_hint else "None",
            hint_number=str(hint_number)
        )

        if result.last_hint:
            session['answered'] = True

        return jsonify({'hint': result.hint, 'done': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/check-answer', methods=['POST'])
def check_answer():
    try:
        data = request.json
        problem = data.get('problem', '')
        answer = data.get('answer', '')
        
        if not problem or not answer:
            return jsonify({'error': 'Problem and answer are required'}), 400
        
        # Check answer using DSPy
        result = answer_checker(problem=problem, student_answer=answer)
        
        # Parse the is_correct field (handle various formats)
        is_correct = result.is_correct
        
        return jsonify({
            'is_correct': is_correct,
            'feedback': result.feedback
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
