function removeHTMLTags(civID) {
    const divElement = _(divID);
    const originalText = divElement.innerHTML;
    const cleanText = new DOMParser().parseFromString(originalText, 'text/html').body.textContent || '';
    divElement.textContent = cleanText;
}
