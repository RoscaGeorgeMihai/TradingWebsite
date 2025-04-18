# Proiect Web Trading Website Rosca George-Mihai

Am ales aceasta tema de proiect intrucat in ultima perioada am inceput sa economisesc niste fonduri pe care m-am hotarat sa le investesc putin cate putin in actiuni astfel ca ma pasioneaza acest domeniu.  

Am inceput sa lucrez putin si la partea de backend, avand implementate functionalitatile pentru creare de cont si logare, dar si pentru pastrarea sesiunii.  

Am lucrat putin si la fetch-ul datelor pentru pretul stock-urilor/cryptocurrency-urilor si commodities-urilor prin API-ul celor de la marketstack, astfel incat sa folosesc date reale in generarea graficelor si furnizarea informatiilor despre companii/criptomonede/bunuri insa problema este numarul limitat de request-uri pe care il am la dispozitie. Initial aveam un numar de 100 de request-uri, dar am contactat echipa lor de support si mi-au oferit un free trial de o luna care imi ofera un numar de 10,000 de request-uri. Totusi am ales pentru prezentarea frontend-ului sa nu furnizez token-ul pentru api ci sa simulez datele afisate.  

In folder-ul MongoDB am si export-urile pentru modelele users si transactions intrucat numai acestea sunt populate. 

Website-ul de trading creat de mine are 3 categorii de useri:  
    - Vizitatori  
    - Utilizatori logati  
    - Admin  

## Vizitatori  
Vizitatorii pot vedea pagina de home, paginile dedicate stock-urilor, criptomonedelor si bunurilor (commodities) si pagina dedicata stirilor.  
Astfel utilizatorii care nu detin un cont pe website sau nu sunt logati vor putea viziona in mare parte numai preturile stock-urilor/bunurilor si criptomonedelor fara a le putea cumpara.  
In plus vor mai avea optiunea sa se logheze sau sa isi creeze un cont.  

## Utilizatorii logati
Utilizatorii logati vor putea accesa tot ce pot si vizitatorii numai ca in plus vor putea accesa si pagina de Invest unde vor vedea un istoric al tranzactiilor (depuneri/retrageri) si vor putea depune fonduri (aceasta parte este legata cu backend-ul, iar toate tranzactiile vor putea fi vazute la istoric)  
In plus de asta vor putea cumpara si vinde stock-uri/commodities si criptomonede (momentan nu am implementat pagina pentru cumparare si vindere, sunt numai butoanele)  
Vor avea vizibila si partea de portfoliu unde isi vor vedea toate assets-urile.  

## Admin
Adminul va avea drepturile pe care le au si utilizatorii logati, numai ca in plus va avea in Navbar si un link catre pagina de admin dashboard.   
In dashboard va putea vedea totalul utilizatorilor, totalul depozitelor facute pe site si totalul assets-urilor valabile pe website.  
Va putea sa vada depozitele si retragerile facute in ziua curenta, alertele importante pentru website si activitatile recente ale utilizatorilor.  
In plus, la fiecare categorie voi genera niste grafice cand voi avea si implementarea de backend gata.  