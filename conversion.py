

def poundsToKilo(pounds): #case 0
    kg = float(pounds) / 2.2
    return round(kg, 2)


def feetToCentimeter(inches): #case 1
    cm = 2.54 * float(inches)
    return round(cm, 2)


def bodyMassIndex(heightCm, weightKg): # case 2
    # kg / (meters)^2
    cm = float(heightCm)
    kg = float(weightKg)
    # convert to meters: 1cm = 0.01m
    meters = round(cm * 0.01, 2)
    # metric bmi formula
    bmi = round(kg / (meters * meters), 2)

    if bmi <= 18.5:
        category = 'UnderWeight'
    elif 18.5 <= bmi <= 24.9:
        category = 'Normal Weight'
    elif 25 <= bmi <= 29.9:
        category = 'OverWeight'
    else:
        category = 'Obese'

    return bmi, category


def proteinCalculator(weightKg): #case 3
    # ADA recommends 1g of protein per kg of body weight
    protein = 1.0 * float(weightKg)
    return round(protein, 2)


def basalMetabolicRate(weightKg, heightCm, age):
    kg = round(float(weightKg), 2)
    cm = round(float(heightCm), 2)
    intAge = int(age)

    # Mifflin-St Jeor formula (male)
    bmr = round(88.362 + (13.397 * kg) + (4.799 * cm) - (5.677 * intAge), 2)
    return bmr
