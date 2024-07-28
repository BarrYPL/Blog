document.addEventListener('DOMContentLoaded', function () {
  const fileTree = document.getElementById('file-tree');
  const currentPathDisplay = document.getElementById('current-path');

  function fetchFiles(path = '') {
    fetch(`${path}`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          renderFiles(data);
        }
      })
      .catch(error => console.error('Error:', error));
  }

  function renderFiles(data) {
    fileTree.innerHTML = '';
    currentPathDisplay.innerHTML = data.path;
    if (data.parent_path !== '/') {
      const parentLi = document.createElement('li');
      parentLi.classList.add('cd-button');
      parentLi.innerHTML = `<a href="#" data-path="${data.parent_path}" class="main-button">cd..</a>`;
      fileTree.appendChild(parentLi);
    }
    data.files.forEach(file => {
      const li = document.createElement('li');
      if (file.is_directory) {
        li.classList.add('folder');
        li.innerHTML = `<a href="#" data-path="${data.path}/${file.name}"><i class="fa-solid fa-folder"></i> ${file.name}</a>`;
      } else {
        const fullPath = `${data.path}/${file.name}`;
        li.classList.add('file');
        li.innerHTML = `<a href="/getfile${fullPath.replace('/files', '')}" class="file-link"><i class="fa-solid fa-file"></i> ${file.name}</a>`;
      }
      fileTree.appendChild(li);
    });
  }

  fileTree.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && e.target.classList.contains('file-link')) {
      // Allow default behavior for file links
      return;
    }
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const path = e.target.getAttribute('data-path');
      fetchFiles(path);
    }
  });

  fetchFiles();
});
