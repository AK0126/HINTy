import dspy

# Initialize your DSPy configuration
lm = dspy.LM("openai/gpt-5-mini")
#dspy.configure(lm=lm)


# DSPy Signatures
class MathHintsGenerator(dspy.Signature):
    """Generate a sequence of helpful hints as smaller math questions that guide towards solving the problem. 
    Each successive hint should builds upon the previous hint and get closer to the solution.
    The solution to the final hint should be the same as the solution to the original problem."""

    problem: str = dspy.InputField(desc="The original math problem to solve")
    hints: list[str] = dspy.OutputField(desc="A list of smaller math questions that helps solve the problem, progressively getting closer to the answer. Do not mention the solution in the hint.")


class AnswerChecker(dspy.Signature):
    """Check if a student's answer to a math problem is correct."""
    problem: str = dspy.InputField()
    context: str = dspy.InputField(desc="Provided if the problem is a hint to a larger math problem")
    student_answer: str = dspy.InputField()
    is_correct: bool = dspy.OutputField()
    feedback: str = dspy.OutputField(desc="Helpful feedback about the answer. Do not provide feedback about the context.")


# Create the predictors
hint_generator = dspy.ChainOfThought(MathHintsGenerator)
answer_checker = dspy.ChainOfThought(AnswerChecker)
