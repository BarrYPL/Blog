function removeHTMLTagsFromElements() {
    const postElements = document.querySelectorAll('.post-content');
    postElements.forEach((divElement) => {
        const originalText = divElement.innerHTML;
        const cleanText = new DOMParser().parseFromString(originalText, 'text/html').body.textContent || '';
        divElement.textContent = cleanText;
    });
}

window.addEventListener('DOMContentLoaded', removeHTMLTagsFromElements);
