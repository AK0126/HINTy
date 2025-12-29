import dspy
import mlflow

mlflow.set_tracking_uri("http://127.0.0.1:5000/")
mlflow.set_experiment("HINTy")

mlflow.dspy.autolog()

# Your DSPy signature and module
class MathHintGenerator(dspy.Signature):
    """Generate a helpful hint for solving a math problem."""
    problem: str = dspy.InputField()
    answer: str = dspy.OutputField()
    hint: str = dspy.OutputField(desc="A helpful hint for solving the problem. Must be posed as a question.")

# Create the predictor
hint_generator = dspy.ChainOfThought(MathHintGenerator)

class AnswerChecker(dspy.Signature):
    """Check if a student's answer to a math problem is correct."""
    problem: str = dspy.InputField()
    student_answer: str = dspy.InputField()
    is_correct: bool = dspy.OutputField()
    feedback: str = dspy.OutputField(desc="Helpful feedback about the answer")

answer_checker = dspy.ChainOfThought(AnswerChecker)
