# RoleBall server

Server servira igru i prosleđuje poruke između domaćina sobe i igrača.
Meč se računa u browseru domaćina, a server samo prenosi poruke, pa radi na svakoj mreži.

## Fajlovi
- `server.js` – server (Node.js + WebSocket)
- `package.json` – zavisnosti (samo `ws`)
- `public/index.html` – igra

## Postavljanje na Render.com (besplatno)
1. Napravi novi GitHub repozitorijum i ubaci ova tri fajla (`server.js`, `package.json`, folder `public` sa `index.html`).
   Najlakše: na GitHub-u "Add file" → "Upload files" i prevuci sve.
2. Na render.com se registruj preko GitHub naloga.
3. "New" → "Web Service" → izaberi taj repozitorijum.
4. Podešavanja:
   - Region: Frankfurt (najbliže Srbiji)
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `node server.js`
   - Instance type: Free
5. Klikni "Deploy". Kad završi, dobiješ link tipa `https://ime-servera.onrender.com`.
6. Pošalji link prijateljima. Svi otvaraju isti link, domaćin napravi sobu, ostali uđu sa kodom.

Napomena: besplatan server "zaspi" posle oko 15 minuta bez korišćenja. Prvo otvaranje posle toga traje do minut.

## Pokretanje na svom računaru (za proveru)
```
npm install
node server.js
```
Pa otvori http://localhost:3000 u dva taba.

## Izmena igre
Zameni `public/index.html` novom verzijom i ponovo pošalji na GitHub; Render sam ponovo postavlja server.
