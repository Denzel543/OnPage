run = True
while run == True:
    print("Calculator.py")
    first = input("Enter first number: ")
    second = input("Enter second number: ")
    print("1. Addition")
    print("2. Subtraction")
    print("3. Multiplication")
    print("4. Division")
    print("5. Exit")
    math_form = input("1/2/3/4/5: ")
    if math_form == '1':
        print("The answer is: ")
        result = float(first) + float(second)
        print("Sum: " + str(result))
    if math_form == '2':
        print("The answer is: ")
        result = float(first) - float(second)
        print("Sum: " + str(result))
    if math_form == '3':
        print("The answer is: ")
        result = float(first) * float(second)
        print("Sum: " + str(result))
    if math_form == '4':
        print("The answer is: ")
        result = float(first) / float(second)
        print("Sum: " + str(result))
    if math_form == '5' :
        print("Stopping...")
        run = False   