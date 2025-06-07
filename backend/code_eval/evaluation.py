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
Respond with either:
- **"correct"** — if the code does what the task describes, even if it includes minor variations in phrasing or formatting, or adds harmless extra text.
- **"incorrect"** — if the code fails to perform the task, or contains syntax/runtime errors.
Acceptable variations include:
- Adding extra words like "My name is..." or "The number is..."
- Using either single `'` or double `"` quotes.
- Minor spelling or naming differences (e.g., "John" vs "john") if they still match the intent of "your name"
Only mark as **incorrect** if:
- The code has syntax or runtime errors
- Or it does **not fulfill the task's intent**, regardless of formatting
Only respond with one word: `correct` or `incorrect`
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

        # Determine the result
        if 'incorrect' in answer:
            return 'incorrect'
        elif 'correct' in answer:
            return 'correct'
        else:
            return "error: Unexpected response format"
            
    except Exception as e:
        print("Error in evaluate_code_with_gemini:", str(e))
        return f"error: {str(e)}"
