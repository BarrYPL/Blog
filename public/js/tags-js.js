document.addEventListener('DOMContentLoaded', function() {
  const tags = document.querySelectorAll('.tag');

  tags.forEach(function(tag) {
    tag.addEventListener('click', function() {
      const tagName = tag.textContent.trim();

      fetch(`/tags/${tagName}`, {
        method: 'POST',
      })
      .then(response => response.json())
      .then(data => {
        renderArticles(data);
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Wystąpił błąd podczas przetwarzania żądania.');
      });
    });
  });

  function renderArticles(data) {
    const articlesContainer = document.createElement('div');
    articlesContainer.classList.add('articles-content');

    const tagHeader = document.createElement('h2');
    tagHeader.classList.add('choosen-tag');
    tagHeader.textContent = ">/tags/"+data.tag+" $";
    articlesContainer.appendChild(tagHeader);

    const articlesDiv = document.createElement('div');
    articlesDiv.classList.add('articles');
    articlesContainer.appendChild(articlesDiv);

    data.articles.forEach(articleData => {
      const articleDiv = document.createElement('div');
      articleDiv.classList.add('article');

      const titleElement = document.createElement('h3');
      titleElement.textContent = articleData.title;

      const contentElement = document.createElement('p');
      contentElement.textContent = articleData.content;

      articleDiv.appendChild(titleElement);
      articleDiv.appendChild(contentElement);
      articlesDiv.appendChild(articleDiv);
    });
    const container = document.querySelector('.articles-container');
    container.innerHTML = '';
    container.appendChild(articlesContainer);
  }
});
