# HINTy: Math Hint Generation with DSPy

An intelligent problem solving system that generates progressive hints for math problems. Powered by DSPy and GPT-5-mini.

## Live Demo
Check it out here: [https://hinty.onrender.com](https://hinty.onrender.com)

(I'm deploying the website on the Render free plan, so it takes around ~50 seconds for the website to start up. Sorry!)

## Features
The backend prompts GPT-5-mini using [**DSPy**](https://dspy.ai/), a library that "compiles AI programs into effective prompts" for language models. Instead of directly prompting GPT, DSPy allows builders to work with modularized Python code, which is then converted into LM prompts (analogous to C code being compiled into assembly, for example.) All the DSPy used in this project is in `hinty.py`. 



The app is built with Flask, with Vanilla JavaScript + CSS + HTML for the frontend.
