

def poundsToKilo(): #case 0
    pounds = input('enter weight in pounds to convert to kilogram ')
    kg = float(pounds) / 2.2
    
    rounded = round(kg,2)
    
    print('\nyour weight in kilograms is ',rounded )
    
    
def feetToCentimeter(): #case 1
    height = input('enter height in inches ' )
    
    cm = 2.54 * float(height)
    
    rounded = round(cm,2)
    
    print('\nyour height in cm is ',rounded)

def bodyMassIndex():# case 2
    # kg/ (meters)^2
    heightCm = input('Please enter height in centimeters ')
    weightKg = input('Please enter weight in kilograms ')
    
    cm = float(heightCm)    
    kg = float(weightKg)
    #convert to meters 1cm = 0.01m
    meters =  round(cm * 0.01,2)
    #metric bmi formula
    bmi = round(kg / (meters * meters),2)
    
    print('\nBMI Categories: ')
    print('UnderWeight = < 18.5')
    print('Normal Weight = 18.5 - 24.9')
    print('Overweight = 25 - 29.9')
    print('Obesity = BMI of 30 or greater\n')
    print('Your BMI is ',bmi)
    
    if bmi <= 18.5:
        print('You are UnderWeight.\n')
    elif 18.5 <= bmi <= 24.9:
        print('You are Normal Weight,\n')
    elif 25 <= bmi <= 29.9:
        print('You are OverWeight.\n')
    elif bmi >= 30:
        print('You are Obese.\n')
        
def proteinCalculator():#case 3
    # ADA recommends 1g of protein for kg of body weight.
    weightKg = input('enter weight in kg ')
    
    protein = 1.0 * float(weightKg)
    
    rounded = round(protein,2)
    
    print('Your daily protein intake should be ',rounded,'grams per day.')
    
def basalMetabolicRate():
    weightKg = input('enter your weight in kilograms ')
    heightCm = input('enter height in centimeters ')
    age = input('enter age')
    
    kg = round(float(weightKg),2)
    cm = round(float(heightCm),2)
    intAge = int(age)
    
    #mens formula
    bmr = round(88.362 + (13.397 * kg) + (4.799 * cm) - (5.677 * intAge),2)
    
    print('Your bmr is ', bmr, 'calories more or less.')
