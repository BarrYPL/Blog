window.addEventListener("load", function(evt) {
    let prompt1 = '<span class="prompt">BarrY:/$</span> ';
    let prompt2 = '<span class="prompt">BarrY:/home$</span> ';
    let command1 = "cd home";
    let command2 = "ls";
    let command3 = "cat readme.md";

    function getCurrentDate() {
        let today = new Date();
        let day = String(today.getDate()).padStart(2, '0');
        let month = String(today.getMonth() + 1).padStart(2, '0');
        let year = today.getFullYear();
        return `${day}.${month}.${year}`;
    }

    let todayDate = `passwords_${getCurrentDate()}`;
    let lsOutput = `readme.md<br>${todayDate}`;

    let messageString = '<strong>Hi,</strong> nice to see You on website, where I share my knowledge in ethical <strong>hacking</strong>. You\'ll find Capture The Flag <strong>write-ups</strong>, blog posts, and more. Additionally, I\'ll be hosting a series of posts specifically designed for complete beginners, introducing them to the exciting field of <strong>cybersecurity</strong>. I\'m happy to share my thoughts, experiences, and knowledge with you!';

    function addCursor(container) {
        container.innerHTML += '<span class="logo-coursor"></span>';
    }

    function getRandomSpeed() {
        return Math.floor(Math.random() * (250 - 50 + 1)) + 50;
    }

    async function typeWriterParagraph(text, isCommand = false) {
        let container = _("welcome-paragraph");
        for (let i = 0; i < text.length; i++) {
            container.innerHTML = container.innerHTML.slice(0, -30);
            container.innerHTML += text.charAt(i);
            addCursor(container);
            await sleep(isCommand ? getRandomSpeed() : 20);
        }
        if (isCommand) {
            container.innerHTML = container.innerHTML.slice(0, -30);
            container.innerHTML += "<br>";
            addCursor(container);
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
                    container.innerHTML = container.innerHTML.slice(0, -30);
                    container.innerHTML += elem.textContent.charAt(i);
                    addCursor(container);
                    await sleep(20);
                }
            } else if (elem.nodeType === Node.ELEMENT_NODE) {
                container.innerHTML = container.innerHTML.slice(0, -30);
                container.innerHTML += elem.outerHTML;
                addCursor(container);
            }
        }
        container.innerHTML = container.innerHTML.slice(0, -30);
        container.innerHTML += "<br>";
        addCursor(container);
    }

    async function terminalAnimation() {
        _("welcome-paragraph").innerHTML = "";
        _("welcome-paragraph").innerHTML += prompt1;
        addCursor(_("welcome-paragraph"));
        await sleep(2000);
        await typeWriterParagraph(command1, true);

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await sleep(2000);
        await typeWriterParagraph(command2, true);

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += lsOutput + "<br>";
        addCursor(_("welcome-paragraph"));

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await sleep(2000);
        await typeWriterParagraph(command3, true);

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await typeWriterHTML(messageString);

        _("welcome-paragraph").innerHTML = _("welcome-paragraph").innerHTML.slice(0, -30);
        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
    }

    const redDot = document.querySelector('.red-dot');
    if (redDot) {
        redDot.addEventListener("click", function (e) {
            console.log(e);
            _('desktop').style.display = 'none';
            _('above-desktop').style.display = 'none';
        });
    } else {
        console.error("Element z klasą 'red-dot' nie został znaleziony.");
    }

    const terminal = document.querySelector('.terminal');
    const yellowDot = document.querySelector('.yellow-dot');
    const terminalIcon = _('terminal-icon');
    let isTerminalVisible = true;

    function toggleTerminalVisibility() {
        if (isTerminalVisible) {
            terminal.style.display = 'none';
        } else {
            terminal.style.display = 'block';
        }
        isTerminalVisible = !isTerminalVisible;
    }

    if (yellowDot) {
        yellowDot.addEventListener("click", function() {
            toggleTerminalVisibility();
        });
    } else {
        console.error("Element z klasą 'yellow-dot' nie został znaleziony.");
    }

    if (terminalIcon) {
        terminalIcon.addEventListener("click", function() {
            toggleTerminalVisibility();
        });
    } else {
        console.error("Element o ID 'terminal-icon' nie został znaleziony.");
    }

    terminalAnimation();
});
