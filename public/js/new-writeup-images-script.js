document.addEventListener('DOMContentLoaded', function() {
  const imagesLinks = document.querySelectorAll(".images-holder a");

  imagesLinks.forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const fileName = link.textContent.trim();
      const markdownText = `![${fileName.replace(/\.[^/.]+$/, "")}](./images/${fileName})`;
      easyMDE.codemirror.replaceSelection(markdownText);
    });
  });
});
