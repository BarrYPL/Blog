document.addEventListener('DOMContentLoaded', function () {
  const fileTableBody = document.querySelector('#file-table tbody');
  const currentPathDisplay = _('current-path');
  const optionsDiv = _('options-div');

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

  function deleteCurrentDir(path) {
    if (confirm('Are you sure you want to delete this directory?')) {
    fetch(`/rmdir${path}`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          fetchFiles();
        }
      })
      .catch(error => console.error('Error:', error));
    }
  }

  function handleBookmarkClick(event) {
    event.preventDefault();
    const path = event.currentTarget.getAttribute('data-path');
    const icon = event.currentTarget.querySelector('i');
    const action = icon.classList.contains('fa-regular') ? 'publish' : 'hide';

    fetch('/manage-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: path, action: action })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          if (icon.classList.contains('fa-regular')) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
          } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
          }
        } else {
          alert('Failed to publish/unpublish file');
        }
      })
      .catch(error => console.error('Error:', error));
  }

  function handleDeleteClick(event) {
    event.preventDefault();
    const path = event.currentTarget.getAttribute('data-path');

    if (confirm('Are you sure you want to delete this file?')) {
      fetch('/manage-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: path, action: 'delete' })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('File successfully deleted');
            fetchFiles(currentPathDisplay.textContent); // Refresh the file list
          } else {
            alert('Failed to delete file: ' + data.error);
          }
        })
        .catch(error => console.error('Error:', error));
    }
  }

  function renderFiles(data) {
    fileTableBody.innerHTML = '';
    currentPathDisplay.innerHTML = data.path;

    optionsDiv.innerHTML = '';
    if (data.parent_path !== '/') {
      optionsDiv.innerHTML = `<a href="#" data-path="${data.parent_path}" class="main-button">cd..</a>`;
    }

    const mkdir = document.createElement('a');
    mkdir.href = '#';
    mkdir.dataset.path = data.path;
    mkdir.className = 'main-button';
    mkdir.textContent = 'MKDIR';
    mkdir.id = "mkdir-button";

    optionsDiv.appendChild(mkdir);

    if (data.files.length === 0) {
      const rmdir = document.createElement('a');
      rmdir.href = '#';
      rmdir.dataset.path = data.path;
      rmdir.className = 'main-button';
      rmdir.textContent = 'RMDIR';
      rmdir.id = "rmdir-button";
      optionsDiv.appendChild(rmdir);
    }

    data.files.forEach(file => {
      const row = document.createElement('tr');
      if (file.is_directory) {
        row.classList.add('folder');
        row.innerHTML = `
          <td><a href="#" data-path="${data.path}/${file.name}">${file.name}</a></td>
          <td><i class="fa-solid fa-folder"></i></td>
          <td></td>
        `;
      } else {
        const fullPath = `${data.path}/${file.name}`;
        const bookmarkClass = file.is_public ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        row.classList.add('file');
        row.innerHTML = `
          <td><a href="/getfile${fullPath.replace('/files', '')}" class="file-link">${file.name}</a></td>
          <td><i class="fa-solid fa-file"></i></td>
          <td>
            <a href="#" data-path="${fullPath.replace('/files', '')}"><i class="fa-solid fa-trash"></i></a>
            <a href="#" data-path="${fullPath.replace('/files', '')}" class="bookmark-link"><i class="${bookmarkClass}"></i></a>
          </td>
        `;
      }
      fileTableBody.appendChild(row);
    });

    const bookmarkLinks = document.querySelectorAll('.bookmark-link');
    bookmarkLinks.forEach(link => {
      link.addEventListener('click', handleBookmarkClick);
    });

    const deleteLinks = document.querySelectorAll('.fa-trash');
    deleteLinks.forEach(icon => {
      icon.parentElement.addEventListener('click', handleDeleteClick);
    });

    const rmdirButton = _('rmdir-button');
    if (rmdirButton) {
      rmdirButton.addEventListener('click', function(e) {
        e.preventDefault();
        const path = e.target.getAttribute('data-path');
        deleteCurrentDir(path);
      });
    }
  }

  document.querySelector('.file-browser-container').addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && e.target.classList.contains('file-link')) {
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
