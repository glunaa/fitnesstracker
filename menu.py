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
                convertWeight = conversion.poundsToKilo()
        elif choice == '1':
                print('Convert ft -> cm')
                convertHeight = conversion.feetToCentimeter()
        elif choice == '2':
                print('\nbody mass index calculator\n')
                bmi = conversion.bodyMassIndex()
        elif choice == '3':
                print('\nprotein calculator\n')
                protein = conversion.proteinCalculator()
        elif choice == '4':
                print('\nbasal metabolic rate\n')
                bmr = conversion.basalMetabolicRate()
        elif choice == '5':
                print('Exit.')
                break
        else:
            print('Invalid choice. Please try again.')
                
if __name__ == '__main__':
    main()
