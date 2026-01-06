# HINTy: Math Hint Generation with DSPy

An intelligent problem solving system that generates progressive hints for math problems. Powered by DSPy and GPT-5-mini. Personal project for learning DSPy.

## Live Demo
Check it out here: [https://hinty.onrender.com](https://hinty.onrender.com)

(I'm deploying the website on the Render free plan, so it takes around ~50 seconds for the website to start up. Sorry!)

## Features
The backend prompts GPT-5-mini using [**DSPy**](https://dspy.ai/), a library that "compiles AI programs into effective prompts" for language models. Instead of directly prompting GPT, DSPy allows builders to work with modularized Python code, which is then converted into LM prompts (analogous to C code being compiled into assembly, for example.) All the DSPy used in this project is in `hinty.py`. 

The app also traces all LM calls using MLflow, to understand how the LM behaves under the hood (ex. looking at how the LM reasons in a Chain-of-Thought prompt, below.) 

![MLflow Example](./screenshots/mlflow.png)

The MLflow server is hosted on Dagshub.

The app is built with Flask, with Vanilla JavaScript + CSS + HTML for the frontend.

## DSPy

The DSPy Signatures and Modules used in this project are in `hinty.py`. The signature `MathHintsGenerator` is used to generate a list of sequential hints to a math problem, and the signature `AnswerChecker` is used to check if an inputted solution correctly answers the given problem. The task of checking whether two math expressions are the same is annoying (ex. "2/3" and "two-thirds" and "\frac{2}{3}" should all be correct); prompting GPT makes this task much easier and natural, at the cost of increased latency.


