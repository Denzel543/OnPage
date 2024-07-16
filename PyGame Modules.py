import pygame
 
pygame.init()

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.get_caption()
run = True
 
player = pygame.Rect((300, 250, 50, 50))
 
while run == True:
 
  pygame.draw.rect()
 
for event in pygame.event.get():
		if event.type == pygame.QUIT:
			run = False 
pygame.quit()