from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("API_KEY"))

def evaluate_code_with_gemini(question, code):
    print("question:",question)
    print("code:",code)
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
            "content": question + "\n\n" + code
        },
        {
            "role": "assistant",
            "content": ""
        }
    ]

    prompt = ""
    for msg in messages:
        if msg["role"] == "system":
            prompt += f"<|system|>\n{msg['content']}\n"
        elif msg["role"] == "user":
            prompt += f"<|user|>\n{msg['content']}\n"
        elif msg["role"] == "assistant":
            prompt += f"<|assistant|>\n"

    print("prompt:",prompt)
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        if not response.candidates or not response.candidates[0].content.parts:
            raise ValueError("Response missing candidates or content parts")
            # return "error: (Response missing candidates or content parts)"

        answer = response.candidates[0].content.parts[0].text
        print("Gemini answer:", answer)

        answer_lower = answer.lower().strip()
        if 'incorrect' in answer_lower:
            return 'incorrect'
        elif 'correct' in answer_lower:
            return 'correct'
        else:
            return "error evaluating code"
    except Exception as e:
        print(e)
        return f"error: {str(e)}"
