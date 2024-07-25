document.addEventListener('DOMContentLoaded', (event) => {
    const codeBlocks = document.querySelectorAll('pre.highlight');

    codeBlocks.forEach(block => {
        const classes = block.className.split(' ');
        let languageClass = classes.find(cls => cls !== 'highlight' && cls !== 'plaintext');
        if (classes.includes('plaintext')) {
            return;
        }
        let languageName = languageClass || '';
        if (languageName) {
            const languageInfo = document.createElement('p');
            languageInfo.className = "code-name";
            languageInfo.textContent = languageName;
            block.parentNode.insertBefore(languageInfo, block);
        }
    });

  const codeParts = document.querySelectorAll('code');
  codeParts.forEach(block => {
      const copyIcon = document.createElement('i');
      copyIcon.classList.add('fa-regular', 'fa-copy');
      copyIcon.style.cursor = 'pointer';
      copyIcon.style.position = 'absolute';
      copyIcon.style.top = '5px';
      copyIcon.style.right = '5px';
      copyIcon.style.color = '#888';
      block.style.position = 'relative';

      block.appendChild(copyIcon);
      copyIcon.addEventListener('click', () => {
          const textarea = document.createElement('textarea');
          textarea.value = block.innerText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyIcon.style.color = '#c70606';
          setTimeout(() => {
              copyIcon.style.color = '#888';
          }, 2000);
      });
  });
});
