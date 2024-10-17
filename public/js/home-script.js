window.addEventListener("load", function(evt) {
    let prompt1 = "BarrY:/$ ";          // Początkowy prompt
    let prompt2 = "BarrY:/home$ ";      // Zaktualizowany prompt
    let command1 = "cd home";           // Pierwsze polecenie
    let command2 = "cat readme.md";     // Drugie polecenie
    let messageString = '<strong>Hi,</strong> nice to see You on website, where I share my knowledge in ethical <strong>hacking</strong>. You\'ll find Capture The Flag <strong>write-ups</strong>, blog posts, and more. Additionally, I\'ll be hosting a series of posts specifically designed for complete beginners, introducing them to the exciting field of <strong>cybersecurity</strong>. I\'m happy to share my thoughts, experiences, and knowledge with you!';

    // Dodajemy początkowy prompt do paragrafu
    _("welcome-paragraph").innerHTML = prompt1;

    async function typeWriterParagraph(text, isCommand = false) {
        let container = _("welcome-paragraph");
        for (let i = 0; i < text.length; i++) {
            container.innerHTML += text.charAt(i);  // Dodawanie znaków pojedynczo
            await sleep(20);  // Czas opóźnienia, może być dostosowany do potrzeb
        }
        if (isCommand) {
            container.innerHTML += "<br>";  // Dodanie nowej linii po komendzie
        }
    }

    async function typeWriterHTML(html) {
        let container = _("welcome-paragraph");
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        let elements = tempDiv.childNodes;

        for (let elem of elements) {
            if (elem.nodeType === Node.TEXT_NODE) {
                // Jeśli to jest zwykły tekst, piszemy znak po znaku
                for (let i = 0; i < elem.textContent.length; i++) {
                    container.innerHTML += elem.textContent.charAt(i);
                    await sleep(20);  // Czas opóźnienia dla tekstu
                }
            } else if (elem.nodeType === Node.ELEMENT_NODE) {
                // Dodajemy tag otwierający, a następnie zawartość jako całość
                container.innerHTML += elem.outerHTML;
            }
        }
    }

    async function terminalAnimation() {
        // Pierwsze polecenie: cd home
        await typeWriterParagraph(command1, true);
        // Nowy znak zachęty
        _("welcome-paragraph").innerHTML += prompt2;

        // Drugie polecenie: cat readme.md
        await typeWriterParagraph(command2, true);
        // Nowy znak zachęty z treścią readme
        _("welcome-paragraph").innerHTML += prompt2;

        // Wyświetlenie treści z HTML (messageString)
        await typeWriterHTML(messageString);
    }

    terminalAnimation();  // Uruchomienie całej animacji
});
