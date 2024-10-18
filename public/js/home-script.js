window.addEventListener("load", function(evt) {
    const terminal = document.querySelector('.terminal');
    const terminalHeader = document.querySelector('.terminal-header');
    const desktop = document.querySelector('#desktop');
    let isDragging = false;
    let offsetX, offsetY;

    let prompt1 = '<span class="prompt">BarrY:/$</span> ';
    let prompt2 = '<span class="prompt">BarrY:/home$</span> ';
    let command1 = "cd home";
    let command2 = "ls";
    let command3 = "cat readme.md";
    let todayDate = `passwords_${getCurrentDate()}`;
    let lsOutput = `readme.md<br>${todayDate}`;
    let messageString = '<strong>Hi,</strong> nice to see You on website, where I share my knowledge in ethical <strong>hacking</strong>. You\'ll find Capture The Flag <strong>write-ups</strong>, blog posts, and more. Additionally, I\'ll be hosting a series of posts specifically designed for complete beginners, introducing them to the exciting field of <strong>cybersecurity</strong>. I\'m happy to share my thoughts, experiences, and knowledge with you!';

    const desktopWidth = desktop.offsetWidth;
    const terminalMinWidth = 200;
    const terminalMaxWidth = desktopWidth * 0.8;
    const randomWidth = Math.floor(Math.random() * (terminalMaxWidth - terminalMinWidth + 1)) + terminalMinWidth;
    const maxLeft = desktopWidth - randomWidth;
    const randomLeft = Math.floor(Math.random() * (maxLeft + 1));
    terminal.style.width = `${randomWidth}px`;
    terminal.style.left = `${randomLeft}px`;

    function getCurrentDate() {
      let today = new Date();
      let day = String(today.getDate()).padStart(2, '0');
      let month = String(today.getMonth() + 1).padStart(2, '0');
      let year = today.getFullYear();
      return `${day}.${month}.${year}`;
    }

    function scrollToBottom() {
      terminal.scrollTop = terminal.scrollHeight;
    }

    function disableTextSelection() {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      document.body.style.msUserSelect = "none";
    }

    function enableTextSelection() {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.msUserSelect = "";
    }

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
            scrollToBottom();
            await sleep(isCommand ? getRandomSpeed() : 20);
        }
        if (isCommand) {
            container.innerHTML = container.innerHTML.slice(0, -30);
            container.innerHTML += "<br>";
            addCursor(container);
            scrollToBottom();
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
                    scrollToBottom();
                    await sleep(20);
                }
            } else if (elem.nodeType === Node.ELEMENT_NODE) {
                container.innerHTML = container.innerHTML.slice(0, -30);
                container.innerHTML += elem.outerHTML;
                addCursor(container);
                scrollToBottom();
            }
        }
        container.innerHTML = container.innerHTML.slice(0, -30);
        container.innerHTML += "<br>";
        addCursor(container);
        scrollToBottom();
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

    //red-dot code
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

    //yellow-dot code
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

    //green-dot code
    const greenDot = document.querySelector('.green-dot');
    if (greenDot) {
        greenDot.addEventListener("click", function (e) {
            const terminal = document.querySelector('.terminal');
            const desktop = document.querySelector('#desktop');
            const menuBarHeight = 40;

            if (terminal && desktop) {
                const maxWidth = desktop.offsetWidth;
                const maxHeight = desktop.offsetHeight - menuBarHeight;
                terminal.style.width = `${maxWidth}px`;
                terminal.style.height = `${maxHeight}px`;
                terminal.style.left = `0px`;
                terminal.style.top = `0px`;
            } else {
                console.error("Elementy 'terminal' lub 'desktop' nie zostały znalezione.");
            }
        });
    } else {
        console.error("Element z klasą 'green-dot' nie został znaleziony.");
    }

    //Window animation
    terminalHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - terminal.offsetLeft;
        offsetY = e.clientY - terminal.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        terminal.style.left = `${e.clientX - offsetX}px`;
        terminal.style.top = `${e.clientY - offsetY}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    terminalHeader.addEventListener('mousedown', (e) => {
      disableTextSelection();
      isDragging = true;
      offsetX = e.clientX - terminal.offsetLeft;
      offsetY = e.clientY - terminal.offsetTop;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', () => {
        isDragging = false;
        enableTextSelection();
      });
    });

    //Resizing window
    interact('.terminal').resizable({
        edges: { left: false, right: true, bottom: true, top: false },
        listeners: {
            move (event) {
                let { x, y } = event.target.dataset;

                x = (parseFloat(x) || 0) + event.deltaRect.left;
                y = (parseFloat(y) || 0) + event.deltaRect.top;

                Object.assign(event.target.style, {
                    width: `${event.rect.width}px`,
                    height: `${event.rect.height}px`,
                    transform: `translate(${x}px, ${y}px)`
                });

                Object.assign(event.target.dataset, { x, y });
            }
        }
    });

    terminalAnimation();
});
