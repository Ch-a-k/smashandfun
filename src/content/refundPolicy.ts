export type RefundPolicySectionKey =
  | 'overview'
  | 'legalBasis'
  | 'reservationNature'
  | 'clientCancellation'
  | 'rescheduling'
  | 'providerCancellation'
  | 'complaints'
  | 'final';

export type RefundPolicySection = {
  key: RefundPolicySectionKey;
  title: string;
  content: string[];
};

export type RefundPolicyDocument = {
  title: string;
  lastUpdatedLabel: string;
  summaryTitle: string;
  summaryText: string;
  faqIntro: string;
  faqLinkLabel: string;
  sections: RefundPolicySection[];
};

export const refundPolicyContent: Record<'pl' | 'en', RefundPolicyDocument> = {
  pl: {
    title: 'Polityka zwrotów',
    lastUpdatedLabel: 'Ostatnia aktualizacja:',
    summaryTitle: 'Najkrótsza wersja',
    summaryText:
      'Rezerwacja w Smash&Fun blokuje konkretny termin, personel, przygotowanie sali i możliwość przyjęcia innych klientów. Z tego powodu w przypadku rezygnacji klienta wpłata co do zasady nie podlega zwrotowi, natomiast w miarę dostępności możemy zaproponować zmianę daty lub godziny. Jeżeli usługa nie może zostać wykonana z przyczyn leżących po naszej stronie albo klientowi przysługują uprawnienia wynikające z bezwzględnie obowiązujących przepisów prawa, stosujemy odpowiednie rozwiązanie zgodne z prawem, w tym zmianę terminu albo zwrot środków.',
    faqIntro: 'Zapoznaj się z naszą',
    faqLinkLabel: 'Polityką zwrotów',
    sections: [
      {
        key: 'overview',
        title: '1. Cel i zakres dokumentu',
        content: [
          'Niniejsza Polityka zwrotów określa zasady postępowania w przypadku rezygnacji z rezerwacji, próśb o zmianę terminu, niewykonania usługi oraz rozliczeń dotyczących usług oferowanych przez SMASH&FUN sp. z o.o. Dokument ma charakter informacyjny i porządkujący. Jego celem jest jasne przedstawienie, w jakich sytuacjach środki mogą zostać zachowane przez Usługodawcę, a w jakich przypadkach klient może oczekiwać zmiany terminu, ponownego wykonania usługi albo zwrotu.',
          'Usługi świadczone przez SMASH&FUN mają charakter usług rozrywkowych i rekreacyjnych realizowanych w konkretnym dniu i przedziale czasowym. Oznacza to, że każda rezerwacja blokuje określony slot w kalendarzu, zaangażowanie personelu, przygotowanie wyposażenia ochronnego, przygotowanie pomieszczenia oraz realną możliwość sprzedaży tego samego terminu innemu klientowi.',
          'Z perspektywy organizacyjnej rezerwacja nie jest wyłącznie zapisaniem klienta na listę. Jest to decyzja operacyjna wpływająca na plan pracy zespołu, dostępność narzędzi, harmonogram sprzątania, przygotowanie sal do kolejnych sesji, a w wielu wypadkach także odmowę przyjęcia innych osób zainteresowanych tym samym terminem. Z tego powodu polityka zwrotów w usługach terminowych nie może być utożsamiana z typowym zwrotem towaru kupionego online.',
          'Niniejsza Polityka obejmuje rezerwacje dokonywane przez konsumentów, osoby fizyczne prowadzące działalność gospodarczą w zakresie, w jakim przepisy przyznają im ochronę konsumencką, oraz klientów biznesowych, przy czym zakres ochrony ustawowej może różnić się w zależności od statusu klienta i charakteru zawartej umowy.',
          'W razie sprzeczności między niniejszą Polityką a bezwzględnie obowiązującymi przepisami prawa pierwszeństwo mają przepisy prawa. Publikujemy ten dokument po to, aby klient z góry wiedział, jakie są nasze praktyki operacyjne i jakie uprawnienia zachowuje mimo braku klasycznego zwrotu w przypadku rezygnacji z usługi rozrywkowej świadczonej w konkretnym terminie.',
          'Każda osoba dokonująca rezerwacji powinna zapoznać się z treścią niniejszej Polityki przed opłaceniem zamówienia. Dokonanie rezerwacji oznacza przyjęcie do wiadomości, że wybór konkretnego dnia i godziny ma znaczenie zasadnicze, a skutki rezygnacji z takiego terminu są odmienne niż przy zwykłych zakupach internetowych dotyczących rzeczy ruchomych.',
        ],
      },
      {
        key: 'legalBasis',
        title: '2. Podstawy prawne i zgodność z prawem polskim',
        content: [
          'Polityka została przygotowana z uwzględnieniem przepisów prawa polskiego, w szczególności ustawy z dnia 30 maja 2014 r. o prawach konsumenta, przepisów Kodeksu cywilnego oraz ogólnych zasad odpowiedzialności za niewykonanie lub nienależyte wykonanie zobowiązania. Przy tworzeniu treści kierowaliśmy się założeniem, że komunikat dla klienta musi być jednocześnie prosty, uczciwy i zgodny z przepisami bezwzględnie obowiązującymi.',
          'W odniesieniu do umów zawieranych na odległość zasadą jest istnienie 14-dniowego prawa odstąpienia od umowy przez konsumenta. Ustawa o prawach konsumenta przewiduje jednak wyjątki. Zgodnie z art. 38 ust. 1 pkt 12 tej ustawy prawo odstąpienia nie przysługuje w odniesieniu do umów o świadczenie usług związanych z wypoczynkiem, wydarzeniami rozrywkowymi, sportowymi lub kulturalnymi, jeżeli w umowie oznaczono dzień lub okres świadczenia usługi.',
          'W praktyce oznacza to, że klient rezerwujący konkretną sesję w rage roomie na oznaczony dzień i godzinę nie korzysta z ustawowego, bezwarunkowego prawa do odstąpienia od umowy w terminie 14 dni tylko dlatego, że rezerwacja została zawarta online. Taka konstrukcja prawna wynika z charakteru usługi terminowej, której wartość zależy od zarezerwowanego i zablokowanego slotu czasowego.',
          'Jednocześnie zgodnie z art. 7 ustawy o prawach konsumenta klient nie może zrzec się praw przyznanych mu ustawą, a postanowienia mniej korzystne niż przepisy ustawowe są nieważne. Z tego względu niniejsza Polityka nie może i nie ma na celu wyłączać uprawnień klienta wynikających z reklamacji, odpowiedzialności za niewykonanie usługi, zwrotu środków należnego w razie odwołania przez Usługodawcę ani innych praw przyznanych przez prawo.',
          'W naszej komunikacji rozróżniamy więc dwie sytuacje. Pierwsza to zwykła rezygnacja klienta z zarezerwowanego terminu, gdy usługa mogłaby zostać przez nas wykonana zgodnie z umową. Druga to sytuacja, w której usługa nie może zostać wykonana z przyczyn leżących po naszej stronie, zostaje wykonana nienależycie albo obowiązujące przepisy przyznają klientowi określone roszczenie. W pierwszej sytuacji co do zasady nie dokonujemy zwrotu. W drugiej respektujemy obowiązujące przepisy i odpowiednie roszczenia klienta.',
          'Celem niniejszej Polityki nie jest tworzenie pozoru, że przedsiębiorca może dowolnie wyłączyć wszelką odpowiedzialność. Celem jest jedynie jednoznaczne wskazanie, że w odniesieniu do terminowych usług rozrywkowych brak jest ustawowego, automatycznego prawa do bezkosztowego odstąpienia w ciągu 14 dni, a ciężar organizacyjny zarezerwowanego terminu uzasadnia brak zwrotu w razie zwykłej rezygnacji klienta.',
          'Jeżeli organy administracji, sądy, praktyka rynkowa albo zmiany ustawowe będą wymagały doprecyzowania niniejszego dokumentu, odpowiednio go zaktualizujemy. Ostateczna ocena konkretnej sprawy zawsze zależy od całokształtu okoliczności, treści zawartej umowy i obowiązującego stanu prawnego.',
        ],
      },
      {
        key: 'reservationNature',
        title: '3. Charakter rezerwacji i przyczyny braku zwrotu przy zwykłej rezygnacji klienta',
        content: [
          'Rezerwacja terminu w SMASH&FUN nie jest neutralna ekonomicznie. Po przyjęciu rezerwacji blokujemy określony zasób czasowy, którego nie możemy sprzedać podwójnie. W praktyce oznacza to, że po opłaceniu i potwierdzeniu rezerwacji dany slot zostaje wyłączony z ogólnej dostępności albo pozostaje trudniejszy do odsprzedania w krótkim czasie.',
          'W tym samym czasie odmawiamy lub możemy odmówić przyjęcia innych klientów na ten sam termin. Dotyczy to zarówno klientów indywidualnych, jak i grup, par oraz osób rezerwujących spontanicznie. Im bliżej terminu, tym mniejsza szansa, że wolne miejsce uda się sprzedać innej osobie na uczciwych warunkach i bez strat po stronie organizacyjnej.',
          'Zarezerwowana usługa wymaga także przygotowania personelu, sprzętu ochronnego, narzędzi, harmonogramu wejść i wyjść, sprzątania po poprzedniej sesji oraz przygotowania pomieszczenia zgodnie z planem pracy. W niektórych przypadkach obejmuje to również organizację dodatkowych elementów, takich jak rozszerzony pakiet przedmiotów do zniszczenia, obsługa grupy lub dodatkowe życzenia zgłoszone przy zamówieniu.',
          'Z tego względu w przypadku zwykłej decyzji klienta o rezygnacji z terminu przyjmujemy zasadę, że wpłacone środki co do zasady nie podlegają zwrotowi. Nie jest to sankcja karna, lecz skutek charakteru usługi terminowej i zablokowania zasobu, który w okresie poprzedzającym realizację był utrzymywany do dyspozycji konkretnego klienta.',
          'Brak zwrotu nie oznacza, że ignorujemy sytuację klienta. Oznacza jedynie, że podstawowym rozwiązaniem w usługach tego typu nie jest cofnięcie płatności, lecz próba zagospodarowania już zakupionej rezerwacji w sposób organizacyjnie możliwy, na przykład przez zmianę daty albo godziny, jeżeli pozwalają na to realne możliwości grafiku.',
          'W naszej ocenie taki model jest także transparentny wobec wszystkich klientów. Gdyby każda rezerwacja mogła zostać w dowolnym momencie bezkosztowo cofnięta, prowadziłoby to do niepewności grafiku, sztucznego blokowania terminów i zwiększenia cen dla wszystkich użytkowników. Uczciwe zasady wymagają więc, aby odpowiedzialność za rezygnację z konkretnego terminu nie była przerzucana wyłącznie na przedsiębiorcę.',
          'Jednocześnie powyższe nie wyłącza indywidualnego podejścia. Możemy dobrowolnie dopuścić inne rozwiązanie w szczególnych okolicznościach, ale taka decyzja ma charakter uznaniowy i zależy od dostępności, czasu zgłoszenia, zakresu przygotowań już poniesionych przez nas oraz możliwości sprzedaży zwolnionego terminu innemu klientowi.',
        ],
      },
      {
        key: 'clientCancellation',
        title: '4. Rezygnacja dokonana przez klienta',
        content: [
          'Jeżeli klient rezygnuje z rezerwacji z przyczyn leżących po jego stronie, przyjmujemy zasadę, że płatność za usługę nie podlega zwrotowi. Dotyczy to w szczególności zmiany planów, problemów logistycznych, spóźnienia, braku możliwości przyjazdu, pomyłki przy wyborze godziny, rezygnacji z udziału przez uczestnika albo innych przyczyn niezwiązanych z działaniem lub zaniechaniem Usługodawcy.',
          'Powyższa zasada ma zastosowanie również wtedy, gdy rezerwacja została dokonana przez internet, telefonicznie lub w inny sposób na odległość, o ile dotyczy usługi rozrywkowej świadczonej w oznaczonym dniu lub okresie. W takim wypadku klient nie korzysta z automatycznego 14-dniowego prawa odstąpienia, ponieważ ustawowy wyjątek obejmuje usługi tego rodzaju.',
          'W przypadku rezygnacji po stronie klienta nie jesteśmy zobowiązani do automatycznego przyjęcia wniosku o zwrot tylko dlatego, że klient poinformował nas z wyprzedzeniem. Wcześniejsze zgłoszenie ma jednak znaczenie praktyczne, ponieważ zwiększa szansę na dobrowolną reorganizację grafiku i zaproponowanie alternatywnego terminu, o ile pozwalają na to realne możliwości.',
          'Jeżeli klient nie stawi się na umówioną sesję albo stawi się z takim opóźnieniem, że wykonanie usługi w pierwotnym zakresie okaże się niemożliwe lub istotnie utrudnione, rezerwacja może zostać uznana za niewykorzystaną z przyczyn leżących po stronie klienta. W takiej sytuacji również nie powstaje po naszej stronie obowiązek zwrotu środków tylko z tego powodu, że slot nie został finalnie wykorzystany.',
          'Dla porządku wyjaśniamy, że niniejsza zasada dotyczy zwykłej rezygnacji z usługi, a nie reklamacji dotyczącej jakości wykonania. Jeżeli klient uważa, że usługa została niewykonana albo wykonana nienależycie, powinien złożyć reklamację. Taka sprawa będzie oceniana odrębnie i zgodnie z przepisami prawa, a nie wyłącznie przez pryzmat zasad rezygnacji z rezerwacji.',
          'W niektórych szczególnych sytuacjach życiowych, takich jak nagłe zdarzenie losowe, możemy rozważyć rozwiązanie indywidualne. Nie tworzy to jednak po stronie klienta automatycznego roszczenia o zwrot pieniędzy. Decyzja zależy od okoliczności sprawy, terminu zgłoszenia, dostępności nowych slotów oraz możliwości organizacyjnych po naszej stronie.',
          'Jeżeli klient dokonuje rezerwacji dla większej grupy, organizatora wydarzenia firmowego lub jako osoba rezerwująca w imieniu innych uczestników, odpowiada za przekazanie im tej Polityki. Rezygnacja jednego uczestnika nie musi oznaczać podstaw do zwrotu całej rezerwacji, jeżeli usługa jako całość mogła zostać wykonana zgodnie z umową.',
        ],
      },
      {
        key: 'rescheduling',
        title: '5. Zmiana daty lub godziny zamiast zwrotu',
        content: [
          'Rozumiemy, że w praktyce klientowi często zależy bardziej na zachowaniu wartości rezerwacji niż na sporze o zwrot. Dlatego podstawowym rozwiązaniem, które możemy zaproponować w przypadku rezygnacji klienta, jest zmiana daty lub godziny realizacji usługi. Takie rozwiązanie ma charakter organizacyjnego kompromisu i nie powinno być utożsamiane z prawnym obowiązkiem dokonania zwrotu.',
          'Zmiana terminu jest możliwa wyłącznie wtedy, gdy mamy dostępne inne sloty, a przesunięcie rezerwacji nie zakłóca już ułożonego harmonogramu pracy. Znaczenie ma także to, jak wcześnie klient zgłosi prośbę o zmianę. Im wcześniej otrzymamy wiadomość, tym większa szansa, że uda się zaproponować nowe rozwiązanie bez szkody dla organizacji pracy i bez naruszania praw innych klientów.',
          'Co do zasady dopuszczamy jednorazową zmianę terminu. Dodatkowe przesunięcia mogą zostać odrzucone, jeżeli prowadziłyby do nadmiernej niepewności po stronie organizacyjnej albo do wielokrotnego blokowania terminów, których nie możemy uczciwie oferować innym klientom. Każda kolejna prośba może być oceniana indywidualnie.',
          'Zmiana terminu może wymagać dostosowania zakresu usługi do aktualnej dostępności. Oznacza to, że nowy termin może przypadać na inną godzinę, inny dzień, a w razie ograniczonej dostępności także na zbliżony, ale nie identyczny układ organizacyjny. W miarę możliwości staramy się zachować zakupiony pakiet i standard usługi.',
          'Jeżeli klient otrzyma propozycję nowego terminu, powinien potwierdzić ją w wyznaczonym czasie. Brak potwierdzenia może skutkować utratą zarezerwowanego alternatywnego slotu. Zmiana terminu bez wyraźnego potwierdzenia byłaby niebezpieczna organizacyjnie, dlatego wymagamy jednoznacznej akceptacji nowego rozwiązania.',
          'Możliwość przełożenia rezerwacji nie oznacza, że termin pierwotny przestaje mieć znaczenie. W dalszym ciągu jest to sytuacja szczególna i dobrowolna po naszej stronie, której celem jest zachowanie dobrej relacji z klientem oraz praktyczne wykorzystanie środków już wpłaconych na poczet usługi, zamiast ich zwrotu.',
          'Jeżeli przełożenie okaże się niemożliwe z uwagi na brak dostępności lub zbyt późne zgłoszenie, pozostaje w mocy zasada ogólna, zgodnie z którą przy zwykłej rezygnacji z terminu płatność nie podlega zwrotowi. Zmiana daty lub godziny ma więc charakter preferowanego, ale nie gwarantowanego rozwiązania alternatywnego.',
        ],
      },
      {
        key: 'providerCancellation',
        title: '6. Sytuacje leżące po stronie Usługodawcy',
        content: [
          'Jeżeli usługa nie może zostać wykonana z przyczyn leżących po stronie SMASH&FUN, klient nie pozostaje bez ochrony. Dotyczy to w szczególności sytuacji, w której z powodów organizacyjnych, technicznych, bezpieczeństwa albo innych zawinionych przez nas nie jesteśmy w stanie przeprowadzić sesji zgodnie z zawartą umową.',
          'W takim przypadku proponujemy klientowi w pierwszej kolejności zmianę terminu na najbliższy dostępny i akceptowalny slot. Jeżeli klient nie jest zainteresowany nowym terminem albo jego zaproponowanie nie jest możliwe, dokonujemy odpowiedniego zwrotu środków w zakresie, w jakim wynika to z niewykonania umowy albo uzgodnionego sposobu zakończenia sprawy.',
          'Podobnie postępujemy wtedy, gdy usługa została przerwana albo ograniczona z przyczyn leżących po naszej stronie w stopniu istotnym dla klienta. Ocena konkretnego przypadku zależy od okoliczności faktycznych, ale zasadą jest, że klient nie powinien ponosić negatywnych konsekwencji organizacyjnych błędów lub zaniedbań przedsiębiorcy.',
          'Jeżeli konieczność przełożenia terminu wynika z okoliczności związanych z bezpieczeństwem uczestników albo personelu, również traktujemy sprawę priorytetowo. Bezpieczeństwo ma pierwszeństwo przed utrzymaniem pierwotnego harmonogramu. W takich przypadkach celem jest znalezienie rozwiązania zgodnego z prawem, rozsądkiem i dobrymi praktykami rynkowymi.',
          'W przypadku wystąpienia nadzwyczajnych okoliczności niezależnych od obu stron, takich jak awaria infrastruktury, zagrożenie bezpieczeństwa, decyzja odpowiednich służb albo inne zdarzenie o charakterze wyjątkowym, sposób dalszego postępowania może wymagać indywidualnej oceny. Będziemy wówczas działać w dobrej wierze i proponować rozwiązania adekwatne do sytuacji.',
          'To właśnie rozróżnienie między zwykłą rezygnacją klienta a niewykonaniem lub nienależytym wykonaniem usługi przez przedsiębiorcę jest kluczowe dla zgodności niniejszej Polityki z prawem. Brak zwrotu przy zwykłej rezygnacji nie oznacza, że przedsiębiorca może zatrzymać środki również wtedy, gdy sam nie wywiązał się z umowy.',
        ],
      },
      {
        key: 'complaints',
        title: '7. Reklamacje, uprawnienia ustawowe i kontakt',
        content: [
          'Niniejsza Polityka nie ogranicza prawa klienta do złożenia reklamacji, jeżeli uważa on, że usługa nie została wykonana, została wykonana nienależycie albo rozliczenie jest nieprawidłowe. Reklamacja powinna możliwie dokładnie opisywać zdarzenie, numer rezerwacji, datę usługi oraz oczekiwany sposób rozwiązania sprawy.',
          'Klient może skontaktować się z nami drogą elektroniczną lub telefonicznie, a jeżeli sprawa wymaga formalnego rozpatrzenia, powinien przekazać zgłoszenie na trwałym nośniku. W odpowiedzi przedstawimy stanowisko uwzględniające zarówno postanowienia niniejszej Polityki, jak i bezwzględnie obowiązujące przepisy prawa.',
          'Jeżeli reklamacja dotyczy niewykonania lub nienależytego wykonania usługi, sprawa będzie rozpatrywana nie tylko na gruncie zasad rezygnacji z rezerwacji, ale również przepisów o odpowiedzialności kontraktowej. Oznacza to, że nie odrzucamy automatycznie wszystkich żądań tylko dlatego, że dokument posługuje się zasadą braku zwrotu przy zwykłej rezygnacji klienta.',
          'W przypadku konsumentów i innych podmiotów objętych odpowiednią ochroną ustawową respektujemy zasadę, że postanowienia mniej korzystne niż przepisy prawa są nieważne, a w ich miejsce stosuje się odpowiednie normy ustawowe. To istotna gwarancja, że niniejszy dokument nie może być wykorzystywany do obchodzenia prawa.',
          'Jeżeli sprawa zakończy się uznaniem reklamacji w całości albo w części, sposób rozliczenia zostanie dopasowany do okoliczności. Może to oznaczać zmianę terminu, ponowne wykonanie usługi, obniżenie ceny, zwrot odpowiedniej części płatności albo zwrot całości środków, jeżeli będzie to prawnie i faktycznie uzasadnione.',
          'Zależy nam na możliwie polubownym rozwiązywaniu sporów. Zachęcamy do kontaktu z odpowiednim wyprzedzeniem, zwłaszcza gdy klient przewiduje problem z dotarciem na sesję lub chce przełożyć termin. W praktyce szybki kontakt znacznie zwiększa szansę na znalezienie rozwiązania korzystnego dla obu stron bez konieczności angażowania formalnych procedur.',
          'W razie potrzeby klient może także korzystać z przysługujących mu środków ochrony prawnej, w tym z pomocy miejskich lub powiatowych rzeczników konsumentów albo innych dostępnych instrumentów przewidzianych przez prawo. Naszym celem jest jednak przede wszystkim jasna komunikacja i ograniczenie ryzyka sporów poprzez transparentne zasady już na etapie rezerwacji.',
        ],
      },
      {
        key: 'final',
        title: '8. Postanowienia końcowe',
        content: [
          'Dokonując rezerwacji, klient potwierdza, że rozumie charakter usługi terminowej oraz to, że rezerwacja konkretnego dnia i godziny wiąże się z blokadą zasobów po stronie SMASH&FUN. Z tego względu zwykła rezygnacja klienta nie rodzi po naszej stronie automatycznego obowiązku zwrotu środków.',
          'Jednocześnie deklarujemy, że w miarę dostępności i rozsądnych możliwości organizacyjnych preferujemy rozwiązania praktyczne, w szczególności jednorazową zmianę daty lub godziny, jeżeli klient zgłosi problem odpowiednio wcześnie. Zależy nam, aby wpłacona kwota mogła zostać wykorzystana na realizację usługi, a nie wyłącznie stała się przedmiotem sporu.',
          'W każdej sprawie zachowujemy jednak pełny szacunek dla bezwzględnie obowiązujących przepisów prawa polskiego. Jeżeli prawo przewiduje dla klienta określone uprawnienie, niniejsza Polityka nie ma pierwszeństwa przed ustawą. W takim zakresie stosujemy odpowiednie normy ustawowe niezależnie od treści niniejszego dokumentu.',
          'Polityka może być okresowo aktualizowana w celu doprecyzowania procedur, poprawy komunikacji albo dostosowania dokumentu do zmian organizacyjnych i prawnych. Aktualna wersja jest publikowana na stronie internetowej i obowiązuje od daty wskazanej w nagłówku dokumentu.',
          'Jeżeli klient ma wątpliwości co do zasad anulowania, przełożenia terminu lub możliwych skutków rezygnacji, rekomendujemy kontakt z nami przed dokonaniem płatności. W przypadku usług terminowych najwięcej nieporozumień wynika z założenia, że każda rezerwacja działa tak samo jak zwykły zakup online, co w świetle przepisów i praktyki organizacyjnej nie jest prawdą.',
          'Niniejsza Polityka została przygotowana po to, aby ograniczyć niejasności i wprost wyjaśnić, że co do zasady nie zwracamy środków za rezerwacje odwołane przez klienta, ponieważ w tym czasie odmawiamy innym klientom możliwości zapisu, planujemy personel i utrzymujemy gotowość do świadczenia usługi. Zamiast zwrotu możemy natomiast, jeśli to realnie możliwe, zaproponować zmianę daty albo godziny.',
        ],
      },
    ],
  },
  en: {
    title: 'Refund Policy',
    lastUpdatedLabel: 'Last updated:',
    summaryTitle: 'Short version',
    summaryText:
      'A reservation at Smash&Fun blocks a specific time slot, staff allocation, room preparation and the opportunity to accept other customers. For that reason, when the customer cancels, the payment is generally non-refundable; however, subject to availability, we may offer a change of date or time instead. If the service cannot be provided for reasons attributable to us, or if mandatory law grants the customer a specific remedy, we will apply the appropriate lawful solution, including rescheduling or a refund where required.',
    faqIntro: 'Please review our',
    faqLinkLabel: 'Refund Policy',
    sections: [
      {
        key: 'overview',
        title: '1. Purpose and scope of this document',
        content: [
          'This Refund Policy sets out the rules applicable to reservation cancellations, requests to change the booked date or time, situations in which the service is not performed, and the related financial settlements concerning services offered by SMASH&FUN sp. z o.o. The document is intended to provide order and transparency. Its purpose is to explain when funds may generally be retained by the Service Provider and when the customer may expect rescheduling, repeat performance or a refund.',
          'The services offered by SMASH&FUN are entertainment and leisure services performed on a specific day and within a specific time window. This means that every reservation blocks a defined slot in the calendar, the availability of staff, protective equipment, room preparation and, in practical terms, the opportunity to sell the same time slot to another customer.',
          'From an operational perspective, a reservation is not merely a name entered into a system. It is a concrete scheduling decision that affects the work plan of the team, the availability of tools and safety equipment, the preparation and clean-up timetable and, in many cases, the refusal of other potential bookings for the same time. For that reason, the refund model for a scheduled entertainment service cannot be treated in the same way as the return of a standard online purchase of goods.',
          'This Policy applies to consumers, sole traders to the extent they benefit from consumer-style protection under applicable law, and business customers, although the exact scope of statutory protection may vary depending on the legal status of the customer and the nature of the contract.',
          'If any provision of this Policy conflicts with mandatory law, mandatory law prevails. We publish this document so that the customer knows in advance what our operational practice is and which legal rights remain available even though a classic refund is generally not granted when the customer cancels a scheduled entertainment service.',
          'Anyone making a reservation should read this Policy before paying for the booking. By placing a reservation, the customer acknowledges that choosing a specific date and time is a fundamental element of the contract and that cancelling such a slot has consequences different from cancelling a standard online sale of goods.',
        ],
      },
      {
        key: 'legalBasis',
        title: '2. Legal basis and compliance with Polish law',
        content: [
          'This Policy has been prepared with Polish law in mind, in particular the Act of 30 May 2014 on Consumer Rights, the Civil Code and the general rules on liability for non-performance or improper performance of contractual obligations. Our intention has been to present the rules in a way that is understandable to customers while remaining consistent with mandatory legal provisions.',
          'As a general rule, consumers concluding distance contracts have a 14-day right to withdraw. However, the Consumer Rights Act contains statutory exceptions. Under Article 38(1)(12), the right of withdrawal does not apply to contracts for services related to leisure, entertainment, sport or culture if the contract specifies the day or period of performance.',
          'In practice, this means that a customer booking a rage room session for a specified day and hour does not benefit from an automatic statutory 14-day right of withdrawal merely because the reservation was made online. This legal model reflects the nature of a scheduled service whose economic value is closely connected to the reserved and blocked time slot.',
          'At the same time, Article 7 of the Consumer Rights Act provides that a consumer cannot waive statutory rights and that contractual terms less favourable than the statute are invalid. Therefore, this Policy is not intended to exclude rights arising from complaints, liability for non-performance, refunds due where the Service Provider cancels the service, or any other mandatory rights granted by law.',
          'For this reason, our communication clearly distinguishes between two different scenarios. The first is an ordinary cancellation by the customer where we are ready and able to perform the service as agreed. The second is a situation where the service cannot be performed for reasons attributable to us, the service is performed improperly, or mandatory law grants the customer a specific remedy. In the first scenario, payment is generally not refunded. In the second scenario, we follow the law and apply the appropriate remedy.',
          'The purpose of this Policy is not to suggest that a trader may freely exclude all liability. The purpose is only to make it clear that scheduled leisure and entertainment services are subject to a statutory exception from the usual 14-day withdrawal regime and that the operational burden of holding a specific slot justifies a no-refund rule in the case of an ordinary customer cancellation.',
          'If administrative practice, court decisions or legislative amendments require clarification or revision of this document, we will update it accordingly. The outcome of any individual case always depends on the full factual background, the content of the contract and the legal framework applicable at the time.',
        ],
      },
      {
        key: 'reservationNature',
        title: '3. Nature of the reservation and why ordinary customer cancellations are generally non-refundable',
        content: [
          'A time slot booked with SMASH&FUN is not economically neutral. Once a reservation is accepted, we block a defined resource in time that cannot be sold twice. In practical terms, after the reservation is paid and confirmed, that slot is removed from general availability or becomes significantly harder to resell on fair commercial terms.',
          'At the same time, we may refuse or lose the opportunity to accept other customers for the same date and hour. This affects individual customers, couples, groups and last-minute buyers alike. The closer the scheduled time, the less realistic it becomes to fill the cancelled slot with another customer without loss.',
          'A confirmed booking also requires staff allocation, preparation of safety equipment, tools, entry and exit scheduling, cleaning after previous sessions and room setup according to the work plan. In some cases it also involves additional preparation related to upgraded packages, group handling or special requests made at the time of booking.',
          'For those reasons, when the customer simply decides not to use the reserved slot, the payment is generally non-refundable. This is not designed as a penalty, but as a reflection of the scheduled nature of the service and of the fact that a defined operational resource has already been committed to a particular customer.',
          'A no-refund rule does not mean that the customer is ignored. It simply means that, for this type of service, the primary practical solution is not the reversal of the payment but an attempt, where possible, to make use of the existing reservation through a change of date or time, provided that this can be done without unfairly disrupting operations.',
          'In our view, this model is also fair to other customers. If every reservation could be cancelled at any moment without consequences, time slots would be blocked speculatively, schedules would become unreliable and prices for all customers would likely increase. Transparent rules require that the consequences of cancelling a specific slot are not shifted entirely onto the Service Provider.',
          'That said, the above does not prevent an individual solution. In special circumstances we may voluntarily agree to a different outcome, but such a decision is discretionary and depends on availability, the timing of the request, the degree of preparation already incurred and the realistic chance of reselling the released slot.',
        ],
      },
      {
        key: 'clientCancellation',
        title: '4. Cancellation initiated by the customer',
        content: [
          'If the customer cancels the reservation for reasons on the customer\'s side, payment for the service is generally non-refundable. This includes changes of personal plans, logistical issues, inability to attend, mistakes in selecting the hour, withdrawal by one of the participants or other reasons not attributable to any act or omission of the Service Provider.',
          'This rule also applies when the reservation was made online, by phone or otherwise at a distance, provided that the booking concerns an entertainment service to be performed on a specified date or during a specified period. In such a case, the statutory 14-day withdrawal right does not apply because the legal exception covers services of this nature.',
          'Even if the customer informs us in advance, we are not automatically obliged to refund the booking fee merely because the cancellation was notified before the session takes place. Early notice is still helpful in practice because it improves the chances of voluntary schedule reorganisation and of offering an alternative time slot if real availability exists.',
          'If the customer does not appear for the booked session, or arrives so late that performance in the originally agreed scope becomes impossible or significantly impaired, the reservation may be treated as unused for reasons attributable to the customer. In that situation, the mere fact that the slot ultimately remained unused does not create an automatic refund obligation.',
          'For clarity, this rule concerns an ordinary cancellation of the service and does not replace the complaint procedure regarding the quality of performance. If the customer believes that the service was not provided at all or was provided improperly, a complaint should be submitted. That type of case is assessed separately, under applicable law, and not solely through the lens of an ordinary cancellation rule.',
          'In certain exceptional life situations, such as sudden unforeseen events, we may consider an individual solution. However, this does not create an automatic legal claim to a refund. The decision depends on the circumstances, the timing of the notice, the availability of new time slots and the operational possibilities on our side.',
          'If the reservation was made for a larger group, a corporate event or by one person on behalf of several participants, the booking party is responsible for communicating this Policy to the others. The cancellation of one participant does not necessarily justify a refund of the whole reservation if the service as a whole could still have been performed in accordance with the contract.',
        ],
      },
      {
        key: 'rescheduling',
        title: '5. Change of date or time instead of a refund',
        content: [
          'In practice, many customers care more about preserving the value of the reservation than about disputing the refund itself. For that reason, the main alternative solution we may offer when a customer cancels is a change of date or time. This is an operational compromise rather than a recognition of a legal obligation to refund.',
          'A change of date is possible only if other time slots remain available and moving the booking does not disturb an already planned work schedule. The timing of the customer request also matters. The earlier we receive notice, the greater the chance that a workable alternative can be proposed without undermining operations or the expectations of other customers.',
          'As a rule, we may allow a one-time rescheduling. Further changes may be refused if they would create excessive uncertainty, repeatedly block slots that should be offered to other customers or otherwise become disproportionate from an organisational perspective. Any additional requests may therefore be assessed individually.',
          'Rescheduling may require adjustment to current availability. This means that the new reservation may need to fall on another hour, another day or, if availability is limited, under a similar but not identical organisational arrangement. Whenever reasonably possible, we try to preserve the purchased package and the expected service standard.',
          'If a new time slot is proposed, the customer should confirm it within the time limit indicated by us. Failure to confirm may result in the loss of the tentative replacement slot. For operational reasons we require clear acceptance and do not treat an unconfirmed proposal as a final rearrangement of the reservation.',
          'The possibility of rescheduling does not mean that the original time slot loses importance. It remains a specific and committed booking, and any alternative solution is a voluntary accommodation intended to preserve customer goodwill and practical use of the funds already paid rather than to reverse the transaction.',
          'If rescheduling is impossible because there is no availability or because the notice arrives too late, the general rule remains in force: in the case of an ordinary customer cancellation, payment is not refunded. A change of date or time is therefore a preferred solution where feasible, but it is not guaranteed in every case.',
        ],
      },
      {
        key: 'providerCancellation',
        title: '6. Situations attributable to the Service Provider',
        content: [
          'If the service cannot be performed for reasons attributable to SMASH&FUN, the customer remains protected. This includes, in particular, situations where, for organisational, technical, safety-related or other reasons on our side, we are unable to carry out the session as agreed.',
          'In such a case, our first step is to offer the customer the nearest available and acceptable replacement slot. If the customer is not interested in a new date, or if rescheduling is not possible, we will provide the appropriate refund to the extent justified by the non-performance of the contract or by the agreed method of resolving the matter.',
          'We follow a similar approach if the service is interrupted or materially limited for reasons attributable to us. The assessment of any specific case depends on the facts, but the underlying principle is that the customer should not bear the negative operational consequences of mistakes or failures on the part of the trader.',
          'If a session has to be postponed due to safety reasons affecting participants or staff, we also treat the matter as a priority. Safety takes precedence over preserving the original timetable. In such cases, our goal is to offer a lawful and sensible solution consistent with good market practice.',
          'Where extraordinary circumstances beyond the control of both parties arise, such as infrastructure failure, a safety threat, a binding decision of public authorities or another exceptional event, further handling may require an individual assessment. In those cases we act in good faith and seek a solution proportionate to the situation.',
          'The distinction between an ordinary customer cancellation and the Service Provider\'s own failure to perform is central to the legal compliance of this Policy. A no-refund rule for ordinary cancellations does not mean that we may also retain funds where we ourselves failed to provide the contracted service.',
        ],
      },
      {
        key: 'complaints',
        title: '7. Complaints, statutory rights and contact',
        content: [
          'This Policy does not limit the customer\'s right to submit a complaint if the customer believes that the service was not performed, was performed improperly or the financial settlement is incorrect. A complaint should describe the event as precisely as possible, indicate the reservation number, the date of the service and the remedy expected by the customer.',
          'Customers may contact us electronically or by phone and, if formal handling is needed, they should send the complaint on a durable medium. Our response will take into account both this Policy and the mandatory provisions of law applicable to the specific situation.',
          'If the complaint concerns non-performance or improper performance, the matter will be reviewed not only under the rules for reservation cancellations but also under the general rules of contractual liability. In other words, we do not automatically reject all claims merely because this document sets out a general no-refund rule for ordinary customer cancellations.',
          'For consumers and other persons benefiting from relevant statutory protection, we respect the principle that contractual terms less favourable than mandatory law are invalid. This is an important safeguard showing that the Policy is not intended to circumvent legal standards.',
          'If a complaint is upheld in whole or in part, the financial or practical resolution will be adapted to the circumstances. This may mean rescheduling, repeat performance of the service, a price reduction, a partial refund or a full refund if that is legally and factually justified.',
          'We aim to resolve issues amicably whenever possible. We strongly encourage customers to contact us as early as possible, especially if they foresee a problem with attending the session or wish to request a new date. In practice, early communication greatly increases the chance of finding a mutually acceptable solution without formal escalation.',
          'Where necessary, customers may also use the legal protection mechanisms available to them, including assistance from consumer ombudsmen or other instruments provided by law. Our aim, however, is first and foremost to reduce disputes through clear communication and transparent rules already at the booking stage.',
        ],
      },
      {
        key: 'final',
        title: '8. Final provisions',
        content: [
          'By making a reservation, the customer confirms understanding of the scheduled nature of the service and of the fact that reserving a specific day and hour commits operational resources on the part of SMASH&FUN. For that reason, an ordinary cancellation by the customer does not create an automatic refund obligation on our side.',
          'At the same time, we declare that, subject to availability and reasonable operational possibilities, we prefer practical solutions, in particular a one-time change of date or time if the customer reports the issue sufficiently early. Our goal is that the amount already paid may still be used for the service rather than become the subject of an avoidable dispute.',
          'In every case, however, we remain fully bound by mandatory provisions of Polish law. If the law grants the customer a specific right, this Policy does not override the statute. To that extent, the relevant statutory rules apply regardless of the wording of this document.',
          'This Policy may be updated from time to time in order to clarify procedures, improve communication or adapt the document to organisational or legal changes. The current version is published on the website and applies from the date indicated in the header of the document.',
          'If the customer has any doubts about cancellation rules, rescheduling options or the possible consequences of cancelling a booking, we recommend contacting us before payment is made. With scheduled services, many misunderstandings arise from the assumption that every reservation operates like an ordinary online retail purchase, which is not the case in law or in business practice.',
          'This Policy has been prepared to remove uncertainty and to state clearly that, as a rule, we do not refund bookings cancelled by the customer because during that time we may reject other customers, schedule staff and remain ready to perform the service. Instead of a refund, we may, where realistically possible, offer a change of date or time.',
        ],
      },
    ],
  },
};
