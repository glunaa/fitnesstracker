import conversion


def main():
    print('Welcome Fitness App')
    print('Select from the following menu to calculate fitness measurements.')

    menuList = ['convert lb -> kg', 'convert ft -> cm',
                'bmi calculator', 'protein calculator', 'basal metabolic rate']

    while True:
        for x in range(len(menuList)):
            print("[{}]".format(x), menuList[x])
        print('[5] Quit')

        choice = input('Enter your choice: ')

        if choice == '0':
            print('Convert lb -> kg')
            pounds = input('enter weight in pounds to convert to kilogram ')
            result = conversion.poundsToKilo(pounds)
            print('\nyour weight in kilograms is', result)

        elif choice == '1':
            print('Convert ft -> cm')
            inches = input('enter height in inches ')
            result = conversion.feetToCentimeter(inches)
            print('\nyour height in cm is', result)

        elif choice == '2':
            print('\nbody mass index calculator\n')
            heightCm = input('Please enter height in centimeters ')
            weightKg = input('Please enter weight in kilograms ')
            bmi, category = conversion.bodyMassIndex(heightCm, weightKg)
            print('\nBMI Categories: ')
            print('UnderWeight = < 18.5')
            print('Normal Weight = 18.5 - 24.9')
            print('Overweight = 25 - 29.9')
            print('Obesity = BMI of 30 or greater\n')
            print('Your BMI is', bmi)
            print('You are', category + '.\n')

        elif choice == '3':
            print('\nprotein calculator\n')
            weightKg = input('enter weight in kg ')
            result = conversion.proteinCalculator(weightKg)
            print('Your daily protein intake should be', result, 'grams per day.')

        elif choice == '4':
            print('\nbasal metabolic rate\n')
            weightKg = input('enter your weight in kilograms ')
            heightCm = input('enter height in centimeters ')
            age = input('enter age ')
            result = conversion.basalMetabolicRate(weightKg, heightCm, age)
            print('Your BMR is', result, 'calories more or less.')

        elif choice == '5':
            print('Exit.')
            break

        else:
            print('Invalid choice. Please try again.')


if __name__ == '__main__':
    main()
