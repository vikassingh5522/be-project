from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("API_KEY"))

def evaluate_code_with_gemini(question, code):
    print("question:", question)
    print("code:", code)
    
    try:
        # Clean the question text
        question = question.strip()
        code = code.strip()
        
        messages = [
            {
            "role": "system",
            "content": '''You are an AI code evaluator. Given a task and a code snippet, your job is to determine whether the code correctly fulfills the task's intent.
Respond with exactly one of these three options:
- **"correct"** — if the code does what the task describes perfectly, even if it includes minor variations in phrasing or formatting.
- **"partially_correct"** — if the code partially fulfills the task but has some issues or missing functionality.
- **"incorrect"** — if the code fails to perform the task, or contains syntax/runtime errors.

Scoring guide:
- "correct" = 5 marks
- "partially_correct" = 3 marks
- "incorrect" = 0 marks

Acceptable variations for "correct" include:
- Adding extra words like "My name is..." or "The number is..."
- Using either single `'` or double `"` quotes.
- Minor spelling or naming differences if they still match the intent

Mark as "partially_correct" if:
- The code has the right approach but minor syntax issues
- The code implements most but not all requirements
- The code has logical errors but the structure is correct

Mark as "incorrect" if:
- The code has major syntax or runtime errors
- The code does not fulfill the task's intent
- The code is completely unrelated to the task

Only respond with one word: `correct`, `partially_correct`, or `incorrect`
'''
        },
        {
            "role": "user",
                "content": f"Task: {question}\n\nCode:\n{code}"
        }
    ]

        # Generate the prompt
        prompt = ""
        for msg in messages:
            if msg["role"] == "system":
                prompt += f"<|system|>\n{msg['content']}\n"
            elif msg["role"] == "user":
                prompt += f"<|user|>\n{msg['content']}\n"

            print("prompt:", prompt)

            # Make the API call
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )

        # Extract the response text
        if not response or not hasattr(response, 'text'):
            raise ValueError("Invalid response from Gemini API")

        answer = response.text.strip().lower()
        print("Gemini answer:", answer)

        # Determine the result and score
        if 'incorrect' in answer:
            return {'status': 'incorrect', 'score': 0}
        elif 'partially_correct' in answer:
            return {'status': 'partially_correct', 'score': 3}
        elif 'correct' in answer:
            return {'status': 'correct', 'score': 5}
        else:
            return {'status': 'error', 'score': 0, 'message': 'Unexpected response format'}
            
    except Exception as e:
        print("Error in evaluate_code_with_gemini:", str(e))
        return {'status': 'error', 'score': 0, 'message': str(e)}
