# @title Waste Management
import random as rdn

available_waste = 0
money = 0

def collect():
  available_waste = rdn.randint(0, 5)
  waste += available_waste
  print(f"Collected Waste: {available_waste}")


waste = 0

print("Waste Management")
while 1:
  collector = input("C - Collect, R - Recycle , Q - Quit, M - Money, W - Waste: ").lower()
  if collector == 'c':
    available_waste = rdn.randint(0, 5)
    waste += available_waste
    print(f"Collected Waste: {available_waste}")
  elif collector == 'r':
    waste = 0
    money += rdn.randint(1, 10)
  elif collector == 'm':
    print(f"Amount of Money: {money}")
  elif collector == 'w':
    print(f"Waste Amount: {waste}")
  elif collector == 'q':
     break
