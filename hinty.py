import dspy

# Your DSPy signature and module
class MathHintGenerator(dspy.Signature):
    """Generate a helpful hint for solving a math problem without giving away the answer."""
    problem = dspy.InputField(desc="The math problem to solve.")
    hint = dspy.OutputField(desc="A helpful hint for solving the problem. Must be posed as a question.")

# Create the predictor
hint_generator = dspy.ChainOfThought(MathHintGenerator)
