window.addEventListener("load", function(evt) {
    let prompt1 = '<span class="prompt">BarrY:/$</span> ';
    let prompt2 = '<span class="prompt">BarrY:/home$</span> ';
    let command1 = "cd home";
    let command2 = "ls";
    let command3 = "cat readme.md";

    // Funkcja do uzyskania dzisiejszej daty w formacie dd:mm:rrrr
    function getCurrentDate() {
        let today = new Date();
        let day = String(today.getDate()).padStart(2, '0');
        let month = String(today.getMonth() + 1).padStart(2, '0'); // Miesiące zaczynają się od 0
        let year = today.getFullYear();
        return `${day}.${month}.${year}`;
    }

    let todayDate = `passwords_${getCurrentDate()}`; // Generowanie nazwy pliku z dzisiejszą datą

    // Wiadomość do wyświetlenia po wpisaniu ls
    let lsOutput = `readme.md<br>${todayDate}`;

    let messageString = '<strong>Hi,</strong> nice to see You on website, where I share my knowledge in ethical <strong>hacking</strong>. You\'ll find Capture The Flag <strong>write-ups</strong>, blog posts, and more. Additionally, I\'ll be hosting a series of posts specifically designed for complete beginners, introducing them to the exciting field of <strong>cybersecurity</strong>. I\'m happy to share my thoughts, experiences, and knowledge with you!';

    function addCursor(container) {
        container.innerHTML += '<span class="logo-coursor"></span>';
    }

    // Funkcja do losowania prędkości dla komend
    function getRandomSpeed() {
        return Math.floor(Math.random() * (250 - 50 + 1)) + 50; // Losowa prędkość między 50 a 250 ms
    }

    // Funkcja do wpisywania tekstu z losową prędkością (dla komend)
    async function typeWriterParagraph(text, isCommand = false) {
        let container = _("welcome-paragraph");
        for (let i = 0; i < text.length; i++) {
            container.innerHTML = container.innerHTML.slice(0, -30); // Usuń kursor przed dodaniem nowego tekstu
            container.innerHTML += text.charAt(i);
            addCursor(container); // Dodaj kursor na końcu
            await sleep(isCommand ? getRandomSpeed() : 20); // Losowa prędkość dla komend, stała prędkość dla innych tekstów
        }
        if (isCommand) {
            container.innerHTML = container.innerHTML.slice(0, -30); // Usuń kursor
            container.innerHTML += "<br>";
            addCursor(container); // Dodaj kursor na końcu
        }
    }

    async function typeWriterHTML(html) {
        let container = _("welcome-paragraph");
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        let elements = tempDiv.childNodes;

        for (let elem of elements) {
            if (elem.nodeType === Node.TEXT_NODE) {
                for (let i = 0; i < elem.textContent.length; i++) {
                    container.innerHTML = container.innerHTML.slice(0, -30); // Usuń kursor
                    container.innerHTML += elem.textContent.charAt(i);
                    addCursor(container); // Dodaj kursor na końcu
                    await sleep(20); // Stała prędkość 20 ms dla wiadomości powitalnej
                }
            } else if (elem.nodeType === Node.ELEMENT_NODE) {
                container.innerHTML = container.innerHTML.slice(0, -30); // Usuń kursor
                container.innerHTML += elem.outerHTML;
                addCursor(container); // Dodaj kursor na końcu
            }
        }
        container.innerHTML = container.innerHTML.slice(0, -30); // Usuń kursor
        container.innerHTML += "<br>";
        addCursor(container); // Dodaj kursor na końcu
    }

    async function terminalAnimation() {
        _("welcome-paragraph").innerHTML = "";
        _("welcome-paragraph").innerHTML += prompt1;
        addCursor(_("welcome-paragraph"));
        await sleep(2000);
        // Wyświetlanie polecenia cd home w stylu maszyny do pisania z losową prędkością
        await typeWriterParagraph(command1, true);

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await sleep(2000);
        // Wyświetlanie polecenia ls w stylu maszyny do pisania z losową prędkością
        await typeWriterParagraph(command2, true);

        // Wyświetlanie plików w stylu maszyny do pisania z stałą prędkością
        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += lsOutput + "<br>"; // Dodanie <br> po wyniku ls
        addCursor(_("welcome-paragraph"));

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await sleep(2000);
        // Wyświetlanie polecenia cat readme.md w stylu maszyny do pisania z losową prędkością
        await typeWriterParagraph(command3, true);

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await typeWriterHTML(messageString);

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
    }

    terminalAnimation();
});
