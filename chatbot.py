# @title Simple Chatbot
import random

print("ChatBot> My name is ChatBot. How can I help you?")

def hello():
  print(f"""ChatBot> {greetings[random.randint(0,4)]} {emojis[random.randint(0,12)]}""")


def bye():
  print(f"""ChatBot> {leave[random.randint(0,4)]} {emojis[random.randint(0,12)]}""")


greetings = [
    'Welcome',
    'Hi!',
    'Hello!',
    'How are you?',
    'Is everything fine?'
]

leave = [
    'Bye!',
    'See you soon!',
    'Thank you and bye!',
    'Take care',
    'See you later'
]
emojis = [
    ':)',
    ':(',
    ':/',
    ':P',
    ':O',
    ';)',
    ':D',
    '>:)',
    '>:(',
    '>:P',
    '>:D',
    '>:O',
    '>:/',
]
while 1:
  user = input("You> ").lower()
  if user == 'hello' or user == 'hi':
    hello()
  elif user == 'bye':
    bye()
  else:
    print("ChatBot> Try a different word.")
    break
