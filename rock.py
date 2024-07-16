# @title Rock Paper Scissors
import random
def AI_pick():
  AI = random.randint(1,3)
  return AI
rounds = (0)
player_p = (0)
AI_p = (0)
while rounds != 3:
  player = int(input("1 - Rock/ 2 - Paper/ 3 - Scissors: "))
  AI_show = AI_pick()
  print("AI chose " + str(AI_show) + ". You chose " + str(player) + ".")
  rounds += 1
  if player == 1 and AI_show == 1:
    print("No one won.")
  if player == 2 and AI_show == 2:
    print("No one won.")
  if player == 3 and AI_show == 3:
    print("No one won.")
  if AI_show == 3 and player == 1:
    print("A point for you")
    player_p += 1
  elif player > AI_show:
    print("A point for you.")
    player_p += 1
  elif AI_show > player:
    print("A point for AI.")
    AI_p += 1
while rounds == 3:
  if player_p > AI_p:
    print("You win!")
    break
  else:
    print("AI Wins!")
    break
