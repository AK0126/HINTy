from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import dspy
from hinty import hint_generator, answer_checker

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize your DSPy configuration
lm = dspy.LM("openai/gpt-5-mini")
dspy.settings.configure(lm=lm)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/api/hint', methods=['POST'])
def generate_hint():
    try:
        data = request.json
        problem = data.get('problem', '')
        
        if not problem:
            return jsonify({'error': 'No problem provided'}), 400
        
        # Generate hint using DSPy
        result = hint_generator(problem=problem)
        
        return jsonify({'hint': result.hint})
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
