from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import dspy
from hinty import hint_generator

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

if __name__ == '__main__':
    app.run(debug=True, port=5001)
