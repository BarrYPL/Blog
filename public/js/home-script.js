window.addEventListener("load", function(evt) {
    const terminal = document.querySelector('.terminal');
    const terminalHeader = document.querySelector('.terminal-header');
    const desktop = document.querySelector('#desktop');
    let isDragging = false;
    let offsetX, offsetY;
    let isTerminalVisible = true;
    let isMaximized = false;
    let previousStyles = {};
    let inputLength = 1;

    const terminalIcon = _('terminal-icon');
    const contextMenu = _('context-menu');

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

    function showContextMenu(event) {
        event.preventDefault();
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        contextMenu.style.top = `${mouseY}px`;
        contextMenu.style.left = `${mouseX}px`;
        contextMenu.style.display = 'block';
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    function toggleTerminalVisibility() {
        if (isTerminalVisible) {
            terminal.style.display = 'none';
        } else {
            terminal.style.display = 'block';
        }
        isTerminalVisible = !isTerminalVisible;
    }

    function maximizeTerminal() {
        const menuBarHeight = 40;
        if (!isMaximized) {
            previousStyles = {
                width: terminal.style.width,
                height: terminal.style.height,
                left: terminal.style.left,
                top: terminal.style.top
            };

            const maxWidth = desktop.offsetWidth;
            const maxHeight = desktop.offsetHeight - menuBarHeight;
            terminal.style.width = `${maxWidth}px`;
            terminal.style.height = `${maxHeight}px`;
            terminal.style.left = `0px`;
            terminal.style.top = `0px`;

            isMaximized = true;
        } else {
            terminal.style.width = previousStyles.width;
            terminal.style.height = previousStyles.height;
            terminal.style.left = previousStyles.left;
            terminal.style.top = previousStyles.top;

            isMaximized = false;
        }
    }

    function closeDesktop() {
        desktop.style.display = 'none';
        aboveDesktop.style.display = 'none';
    }

    terminalIcon.addEventListener('contextmenu', showContextMenu);

    document.addEventListener('click', function () {
        hideContextMenu();
    });

    _('open-terminal').addEventListener('click', function () {
        toggleTerminalVisibility();
        hideContextMenu();
    });

    _('maximize-terminal').addEventListener('click', function () {
        maximizeTerminal();
        hideContextMenu();
    });

    _('close-desktop').addEventListener('click', function () {
        closeDesktop();
        hideContextMenu();
    });

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

    function addCursor(element) {
        const existingCursor = document.querySelector('#logo-coursor');
        if (existingCursor) {
            existingCursor.remove();
        }
        const cursorSpan = document.createElement('span');
        cursorSpan.classList.add('logo-coursor');
        cursorSpan.setAttribute('id', 'logo-coursor');
        element.appendChild(cursorSpan);
    }

    function getRandomSpeed() {
        return Math.floor(Math.random() * (250 - 50 + 1)) + 50;
    }

    async function typeWriterParagraph(text, isCommand = false) {
        let container = _("welcome-paragraph");
        for (let i = 0; i < text.length; i++) {
            container.innerHTML += text.charAt(i);
            addCursor(container);
            scrollToBottom();
            await sleep(isCommand ? getRandomSpeed() : 20);
        }
        if (isCommand) {
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
                    container.innerHTML += elem.textContent.charAt(i);
                    addCursor(container);
                    scrollToBottom();
                    await sleep(20);
                }
            } else if (elem.nodeType === Node.ELEMENT_NODE) {
                container.innerHTML += elem.outerHTML;
                addCursor(container);
                scrollToBottom();
            }
        }
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

        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await sleep(2000);
        await typeWriterParagraph(command2, true);

        _("welcome-paragraph").innerHTML += lsOutput + "<br>";
        addCursor(_("welcome-paragraph"));

        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await sleep(2000);
        await typeWriterParagraph(command3, true);

        _("welcome-paragraph").innerHTML += prompt2;
        addCursor(_("welcome-paragraph"));
        await typeWriterHTML(messageString);

        _("welcome-paragraph").innerHTML += prompt2;
        await insertInputField();
        addCursor(_("welcome-paragraph"));
    }

    function insertInputField() {
        const existingInput = document.querySelector('#commandInput');
        if (existingInput) {
            existingInput.remove();
        }

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = 'commandInput';
        inputField.classList.add('command-input');
        inputField.autofocus = true;
        inputField.autocomplete = false;

        _("welcome-paragraph").appendChild(inputField);
        inputField.focus();
        addCursor(_("welcome-paragraph"));

        inputField.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                const command = inputField.value.trim();
                if (command) {
                    processCommand(command);
                    inputField.remove();
                    inputLength = 1;
                }
            } else {
                inputLength = inputField.value.length + 2;
                if (event.key === "Backspace" || event.key === "Delete") {
                    if (inputLength > 2) { inputLength--; }
                }
                console.log(inputLength);
                inputField.style.width = `${inputLength}ch`;
            }
        });
    }

    async function processCommand(command) {
        const prompt2 = '<span class="prompt">BarrY:/home$</span>';
        const inputField = document.querySelector('#commandInput');

        if (inputField) {
            const commandOutput = document.createElement("span");
            commandOutput.innerHTML = ` ${command}<br>`;
            _("welcome-paragraph").appendChild(commandOutput);

            inputField.remove();
        }

        if (command === 'clear' || command === 'cls') {
            _("welcome-paragraph").innerHTML = '';
            _("welcome-paragraph").innerHTML += prompt2;
            insertInputField();
            addCursor(_("welcome-paragraph"));
            return;
        }

        const response = await fetch('/terminal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: command })
        });

        if (response.ok) {
            const result = await response.text();
            const responseOutput = document.createElement("div");
            responseOutput.innerHTML = result;
            _("welcome-paragraph").appendChild(responseOutput);
        } else {
            const errorOutput = document.createElement("div");
            errorOutput.innerHTML = "Błąd serwera.";
            _("welcome-paragraph").appendChild(errorOutput);
        }
        const terminal = document.querySelector('.terminal');
        terminal.scrollTop = terminal.scrollHeight;

        _("welcome-paragraph").innerHTML += prompt2;
        insertInputField();
        addCursor(_("welcome-paragraph"));
    }

    //red-dot code
    const redDot = document.querySelector('.red-dot');
    if (redDot) {
        redDot.addEventListener("click", function (e) {
            console.log(e);
            closeDesktop();
        });
    } else {
        console.error("Element z klasą 'red-dot' nie został znaleziony.");
    }

    //yellow-dot code
    const yellowDot = document.querySelector('.yellow-dot');

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
            maximizeTerminal(); // Korzysta z tej samej funkcji co menu kontekstowe
        });
    } else {
        console.error("Element z klasą 'green-dot' nie został znaleziony.");
    }

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

// Resizing window
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
                isMaximized = false;
                previousStyles = {
                    width: event.target.style.width,
                    height: event.target.style.height,
                    left: event.target.style.left,
                    top: event.target.style.top
                };
            }
        }
    });

    terminalAnimation();
});
