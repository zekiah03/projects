const int displayPeriod = 80;
const int antenPeriod = 60;
const int trialNumber = 20;
const int repeatNumber = 2;
const int sheetNumber = 3;
const int phaseNumber = 4;
const int distractNumber = 3;
const int duration = 1000;
const int targetOto = 1000;
const int distractOto = 1000;
const int Hyoujijikan[sheetNumber] = {displayPeriod, displayPeriod, antenPeriod};
const int Col[5] = {7, 8, 9, 10, 11};
const int Row[5] = {2, 3, 4, 5, 6};
const int otoPin = 13;
const int dataLED[4][5][5] = {
  {
    {0, 1, 0, 0, 0},
    {1, 0, 1, 0, 0},
    {0, 1, 0, 0, 0},
    {0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0}
  },
  {
    {0, 0, 0, 1, 0},
    {0, 0, 1, 0, 1},
    {0, 0, 0, 1, 0},
    {0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0}
  },
  {
    {0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0},
    {0, 1, 0, 0, 0},
    {1, 0, 1, 0, 0},
    {0, 1, 0, 0, 0}
  },
  {
    {0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0},
    {0, 0, 0, 1, 0},
    {0, 0, 1, 0, 1},
    {0, 0, 0, 1, 0}
  },
};
int randomLED[distractNumber][5][5];
int data_val[5][5];
int i;
int j;
int k;
int m;
int n;
int basho = 0;
int phase = 0;
int sheet = 0;
int sheet_old = sheetNumber;
int distract = 0;
int repeat = 0;
int trial = 0;
unsigned long time1;
unsigned long time2;
unsigned long time3;
int stateFlag = 0;
int otoFlag;
char yondaatai[trialNumber];
int hyoujibasho[trialNumber];
int henka[trialNumber];
long hyoujijikan[repeatNumber][trialNumber];
char gomi;

void setup() {
  randomSeed(analogRead(0));
  Serial.begin(9600);
  Serial.print("Program Start");
  Serial.print("\n");
  for (j = 0; j < 5; j++) {
    pinMode(Col[j], OUTPUT);
    pinMode(Row[j], OUTPUT);
  }
  pinMode(otoPin, OUTPUT);
}

void loop() {
  if (stateFlag == 0) {
    stateFlag = 1;
    otoFlag = 0;
    distract = 0;
    phase = 0;
    sheet = 0;
    sheet_old = sheetNumber;
    henka[trial] = random(0, 2);
    basho = random(0, 4);
    hyoujibasho[trial] = basho;

    for (m = 0; m < distractNumber; m++) {
      for (i = 0; i < 5; i++) {
        for (j = 0; j < 5; j++) {
          randomLED[m][i][j] = 0;
        }
      }
    }
    for (m = 0; m < distractNumber; m++) {
      k = 0;
      while (k < 4) {
        i = random(0, 5);
        j = random(0, 5);
        if (randomLED[m][i][j] == 0) {
          randomLED[m][i][j] = 1;
          k++;
        }
      }
    }
    for (m = 0; m < distractNumber; m++) {
      for (n = 0; n < 4; n++) {
        k = 0;
        for (i = 0; i < 5; i++) {
          for (j = 0; j < 5; j++) {
            if (randomLED[m][i][j] == 1 && dataLED[n][i][j] == 1) {
              k++;
            }
          }
        }
        if (k > 1) {
          stateFlag = 0;
        }
      }
    }
  }

  if (stateFlag == 1) {
    if (otoFlag == 0) {
      otoFlag = 1;
      if (phase == 2) {
        for (i = 0; i < 5 ; i++) {
          for (j = 0; j < 5; j++) {
            data_val[i][j] = dataLED[basho][i][j];
          }
        }
        if (henka[trial] == 1) {
          tone(otoPin, targetOto);
        }
        else {
          tone(otoPin, distractOto);
        }
        delay(300);  // delay added
      }
      else {
        for (i = 0; i < 5 ; i++) {
          for (j = 0; j < 5; j++) {
            data_val[i][j] = randomLED[distract][i][j];
          }
        }
        tone(otoPin, distractOto);
        distract++;
        delay(300);  //delay added
      }
      if (distract == distractNumber) {
        distract = 0;
      }
    }

    if (sheet != sheet_old) {
      time1 = micros();
      sheet_old = sheet;
    }

    switch (sheet) {
      case 0:
        for (i = 0; i < 5 ; i++) {
          for (j = 0; j < 5; j++) {
            digitalWrite(Col[j], LOW);
            if (data_val[i][j] > 0) {
              digitalWrite(Col[j], HIGH);
            }
          }
          digitalWrite(Row[i], LOW);
          delayMicroseconds(duration);
          digitalWrite(Row[i], HIGH);
        }
        break;
      case 1:
        for (i = 0; i < 5 ; i++) {
          for (j = 0; j < 5; j++) {
            digitalWrite(Col[j], HIGH);
          }
          digitalWrite(Row[i], LOW);
          delayMicroseconds(duration);
          digitalWrite(Row[i], HIGH);
        }
        break;
      case 2:
        for (i = 0; i < 5 ; i++) {
          for (j = 0; j < 5; j++) {
            digitalWrite(Col[j], LOW);
          }
          digitalWrite(Row[i], LOW);
          delayMicroseconds(duration);
          digitalWrite(Row[i], HIGH);
        }
        break;
    }
    time2 = micros();
    time3 = time2 - time1;
    
    if (time3 >= (long)Hyoujijikan[sheet] * 1000) {
      noTone(otoPin);
      if (sheet == 0 && phase == 2) {
        hyoujijikan[repeat][trial] = time3;
      }
      sheet++;
      if (sheet == sheetNumber) {
        sheet = 0;
        phase++;
        otoFlag = 0;
      }
      if (phase == phaseNumber) {
        phase = 0;
        repeat++;
      }
      if (repeat == repeatNumber) {
        repeat = 0;
        stateFlag = 2;
      }
    }
  }



  if (stateFlag == 2) {
    stateFlag = 0;
    while (Serial.available() > 0) {
      gomi = Serial.read();
    }
    Serial.println("basho wo nyuuryoku shitekudasai");
    while (Serial.available() <= 0) {
      delay(10);
    }
    yondaatai[trial] = Serial.read();
    switch (yondaatai[trial]) {
      case 'i':
        Serial.println("Left Upper");
        yondaatai[trial] = 0;
        break;
      case 'o':
        Serial.println("Right Upper");
        yondaatai[trial] = 1;
        break;
      case 'k':
        Serial.println("Left Lower");
        yondaatai[trial] = 2;
        break;
      case 'l':
        Serial.println("Right Lower");
        yondaatai[trial] = 3;
        break;
      default:
        Serial.println("mistype");
        yondaatai[trial] = 99;
    }
    trial++;
    if (trial >= trialNumber) {
      stateFlag = 3;
    }
  }

  if (stateFlag == 3) {
    Serial.println();
    Serial.println("Hyouji jikan(Settei chi) ");
    Serial.print(displayPeriod);
    Serial.println(" msec");
    Serial.print("Shikou kaisuu");
    Serial.print("\t");
    Serial.print("Oto no Henka(Ari = 1)");
    Serial.print("\t");
    Serial.print("Hyouji shita basho");
    Serial.print("\t");
    Serial.print("Nyuuryoku shita basho");
    Serial.print("\t");
    Serial.print("Correct = 1 / Incorrect = 0");
    Serial.print("\t");
    for (i = 0; i < repeatNumber; i++ ) {
      Serial.print("Hyouji jikan (repeat " + String(i + 1)+")");
      Serial.print("\t");
    }
    Serial.println();

    for (k = 0; k < trialNumber; k++) {
      Serial.print(k + 1, DEC);
      Serial.print("\t");
      Serial.print(henka[k], DEC);
      Serial.print("\t");
      Serial.print(hyoujibasho[k], DEC);
      Serial.print("\t");
      Serial.print(yondaatai[k], DEC);
      Serial.print("\t");
      if (hyoujibasho[k] == yondaatai[k]) {
        Serial.print(1, DEC);
        Serial.print("\t");
      } else {
        Serial.print(0, DEC);
        Serial.print("\t");
      }
      for (i = 0; i < repeatNumber ; i++ ) {
        Serial.print(hyoujijikan[i][k] / 1000.0, 2);
        Serial.print("\t");
      }
      Serial.println();
    }
    Serial.println();
    stateFlag = 4;
  }

  //tone(otoPin, targetOto);
  //delay(300);
  //noTone(otoPin);



}
