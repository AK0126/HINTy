from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import os
import secrets

from hinty import hint_generator, answer_checker

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(16))


@app.route('/', methods=['GET'])
def index():
    session['answered'] = False
    return render_template('index.html')


@app.route('/api/start', methods=['POST'])
def start_problem():
    """Generate all hints when user starts a problem"""
    try:
        data = request.json
        problem = data.get('problem', '')
        
        if not problem:
            return jsonify({'error': 'No problem provided'}), 400
        
        # Generate sequence of hints
        hints = hint_generator(problem=problem).hints
        
        # Return hints to frontend (without solutions)
        return jsonify({
            'status': 'ready',
            'hints': hints
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/check-answer', methods=['POST'])
def check_answer():
    try:
        data = request.json
        problem = data.get('problem', '')
        context = data.get('context', '')
        answer = data.get('answer', '')
        
        if not problem or not answer:
            return jsonify({'error': 'Problem and answer are required'}), 400
        
        # Check answer using DSPy
        result = answer_checker(problem=problem, context=context, student_answer=answer)
        
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
