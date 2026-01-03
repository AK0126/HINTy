from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import mlflow
from dotenv import load_dotenv
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)

# Force error output to stdout
@app.errorhandler(500)
def internal_error(error):
    print("=" * 80, file=sys.stderr)
    print("500 ERROR CAUGHT:", file=sys.stderr)
    print(traceback.format_exc(), file=sys.stderr)
    print("=" * 80, file=sys.stderr)
    return jsonify({'error': 'Internal server error', 'details': str(error)}), 500


# Set up MLflow
def setup_mlflow():
    try:
        uri = os.getenv('MLFLOW_TRACKING_URI')
        username = os.getenv('DAGSHUB_USERNAME') 
        token = os.getenv('DAGSHUB_TOKEN')
        
        if all([uri, username, token]):
            os.environ['MLFLOW_TRACKING_USERNAME'] = username
            os.environ['MLFLOW_TRACKING_PASSWORD'] = token
            mlflow.set_tracking_uri(uri)
            mlflow.set_experiment("HINTy")
            return True
    except Exception as e:
        print(f"MLflow setup failed: {e}")
    return False

# Set up MLflow first
MLFLOW_ENABLED = setup_mlflow()

from hinty import hint_generator, answer_checker


@app.route('/', methods=['GET'])
def index():
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
    port = int(os.getenv('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)
