# @title Alarm clock
import time

print("Alarm Clock")
time_hour = int(input("Enter hour now: "))
time_mins = int(input("Enter mins now: "))
set_timer = str(input("Enter timer: "))
print(f"{time_hour}:{time_mins}")

while 2:
  time.sleep(int(60))
  time_mins += 1
  if set_timer == str(f"{time_hour}:{time_mins}"):
    print(f"We've reached: {time_hour}:{time_mins}")
  print(str(f"{time_hour}:{time_mins}"))
  if time_mins == 60:
    time_mins = 0
    time_hour += 1
  if time_hour == 12 and time_mins == 59:
    time_hour = 1
    time_mins = 0
