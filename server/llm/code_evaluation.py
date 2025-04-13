import openai

client = openai.OpenAI(api_key="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")

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "What is a Sun Temple?"}
    ]
)

print(response.choices[0].message.content)
