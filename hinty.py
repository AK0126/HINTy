import dspy
import mlflow

mlflow.set_tracking_uri("http://127.0.0.1:5000/")
mlflow.set_experiment("HINTy")

mlflow.dspy.autolog()

# Your DSPy signature and module
class MathHintGenerator(dspy.Signature):
    """Generate a helpful hint for solving a math problem."""
    problem = dspy.InputField()
    answer = dspy.OutputField()
    hint = dspy.OutputField(desc="A helpful hint for solving the problem. Must be posed as a question.")

# Create the predictor
hint_generator = dspy.ChainOfThought(MathHintGenerator)
