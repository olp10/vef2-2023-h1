# Hópverkefni 1

Uppskriftabók

## Vefþjónustur

GET á / birtir lista yfir allar aðgerðir fyrir vefþjónustur

## Notendur

Einn admin notandi til

Username: admin
Password: password

Það eru einhverjir böggar í notendaumsjón hjá okkur.

Þegar POSTað á login, þá er maður loggaður inn og getur POSTað uppskriftum og gert þær aðgerðir sem þurfa innskráningu, en af einhverri ástæðu sem við fundum ekki út úr, þá er eins og maður loggist aftur út eftir 20-30 sek og þarf að logga sig aftur inn.

Bjuggum einnig til annan notanda sem er ekki admin til að prufa admin vs. ekki admin

Username: notAdmin
Password: notAdmin

## Tests

Voru ekki útfærð

## Uppsetning

`createdb vef2-2023-h1`

`npm install`
`npm run setup`
`npm run dev`