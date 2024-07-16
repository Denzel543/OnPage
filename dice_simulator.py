# @title Dice Simulator
import random
def roll_dice():
  dice_number = random.randint(1,6)
  return dice_number

print("------------------WELCOME TO DICE ROLLING SIMULATOR----------------------")
while 1:
  choice = input("Do you wanna roll a dice? y/n: ")
  if 'y' in choice.lower():
    print("Rolling Dice...")
    number = roll_dice()
    print("Dice has the number, " + str(number))
  elif  'n' in choice.lower():
    break
  else:
    print("Invalid Input. Please try again!")
    break
