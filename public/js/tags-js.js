function removeHTMLTagsFromString(htmlString) {
    return new DOMParser().parseFromString(htmlString, 'text/html').body.textContent || '';
}

document.addEventListener('DOMContentLoaded', function() {
  const tags = document.querySelectorAll('.tag');

  tags.forEach(function(tag) {
    tag.addEventListener('click', function() {
      const tagName = tag.textContent.trim();

      fetch(`/tags/${tagName}`, {
        method: 'POST',
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          renderArticles(data);
        } else {
          throw new Error(data.error || 'Wystąpił nieznany błąd');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        displayError('Wystąpił błąd podczas przetwarzania żądania.');
      });
    });
  });

  function renderArticles(data) {
    const articlesContainer = document.createElement('div');
    articlesContainer.classList.add('articles-content');

    const tagHeader = document.createElement('h2');
    tagHeader.classList.add('choosen-tag');
    tagHeader.textContent = data.tag;
    articlesContainer.appendChild(tagHeader);

    const horizontalLane = document.createElement('hr');
    articlesContainer.appendChild(horizontalLane);

    const articlesDiv = document.createElement('div');
    articlesDiv.classList.add('articles');

    if (data.articles && data.articles.length > 0) {
      data.articles.forEach(articleData => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article');

        const titleElement = document.createElement('h3');

        const articleAnchor = document.createElement('a');
        articleAnchor.setAttribute('href','/post/'+articleData.id);
        articleAnchor.innerHTML = articleData.title;

        const contentElement = document.createElement('p');
        contentElement.textContent = removeHTMLTagsFromString(articleData.content);

        articleDiv.appendChild(titleElement);
        titleElement.appendChild(articleAnchor);
        articleDiv.appendChild(contentElement);
        articlesDiv.appendChild(articleDiv);
      });
    } else {
      const noArticlesMessage = document.createElement('p');
      noArticlesMessage.textContent = 'Brak artykułów dla tego tagu.';
      articlesDiv.appendChild(noArticlesMessage);
    }

    articlesContainer.appendChild(articlesDiv);
    const container = document.querySelector('.articles-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(articlesContainer);
    } else {
      displayError('Nie znaleziono kontenera .articles-container.');
    }
  }

  function displayError(message) {
    alert(message);
  }
});
