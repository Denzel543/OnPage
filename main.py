import httpx
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

template = """
Answer the question below: 

Here is the conversation history: {context}

Question: {question}

Answer: 
"""

model = OllamaLLM(model="llama3")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model


def handle_converstation():
    context = ""
    print("Welcome to the DenzAI chatbot! Type 'exit' to end the conversation.")
    while True:
        user_input = str(input("You: "))
        if user_input.lower() == "exit":
            break

        try:
            result = chain.invoke({"context": context, "question": user_input})
            print("DenzAI: ", result)
            context += f"\nUser: {user_input}\nAI: {result}"
        except httpx.ConnectError as e:
            print(f"Connection error: {e}")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    handle_converstation()