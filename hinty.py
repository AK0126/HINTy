import dspy
import mlflow

mlflow.set_tracking_uri("http://127.0.0.1:5000/")
mlflow.set_experiment("HINTy")

mlflow.dspy.autolog()

# DSPy Signatures
class MathHintGenerator(dspy.Signature):
    """Generate a helpful hint as a smaller math question that guides towards solving the problem. 
    If a previous hint is provided, generate the next hint that builds upon it and gets closer to the solution."""
    problem = dspy.InputField(desc="The original math problem to solve")
    previous_hint = dspy.InputField(desc="The previous hint that was given, if any")
    hint_number = dspy.InputField(desc="Which hint number this is (1, 2, 3, etc.)")
    hint = dspy.OutputField(desc="A smaller math question that helps solve the problem, progressively getting closer to the answer")
    last_hint: bool = dspy.OutputField(desc="Boolean indicating if the answer to this hint solves the original problem")


class AnswerChecker(dspy.Signature):
    """Check if a student's answer to a math problem is correct."""
    problem: str = dspy.InputField()
    student_answer: str = dspy.InputField()
    is_correct: bool = dspy.OutputField()
    feedback: str = dspy.OutputField(desc="Helpful feedback about the answer")


# Create the predictors
hint_generator = dspy.ChainOfThought(MathHintGenerator)
answer_checker = dspy.ChainOfThought(AnswerChecker)
