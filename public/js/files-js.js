document.addEventListener('DOMContentLoaded', () => {
  const fileTableBody = document.querySelector('#file-table tbody');
  const currentPathDisplay = document.getElementById('current-path');
  const optionsDiv = document.getElementById('options-div');
  let multiDeleteButton;

  async function fetchFiles(path = '') {
    try {
      const response = await fetch(`${path}`, { method: 'POST' });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        renderFiles(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleFileOperation(url, body) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    Object.keys(options).forEach(key => {
      if (key === 'dataset') {
        Object.keys(options.dataset).forEach(dataKey => {
          element.dataset[dataKey] = options.dataset[dataKey];
        });
      } else {
        element[key] = options[key];
      }
    });
    return element;
  }

  async function deleteCurrentDir(path) {
    if (confirm('Are you sure you want to delete this directory?')) {
      const data = await handleFileOperation(`/rmdir${path}`, {});
      if (data.error) {
        alert(data.error);
      } else {
        fetchFiles();
      }
    }
  }

  async function createNewDir(currentPath) {
    const dirName = prompt('Enter the name of the new directory:');
    if (dirName) {
      const data = await handleFileOperation('/mkdir', { path: currentPath, name: dirName });
      if (data.error) {
        alert(data.error);
      } else {
        fetchFiles(currentPath);
      }
    }
  }

  async function handleBookmarkClick(event) {
    event.preventDefault();
    const path = event.currentTarget.getAttribute('data-path');
    const icon = event.currentTarget.querySelector('i');
    const action = icon.classList.contains('fa-regular') ? 'publish' : 'hide';
    const data = await handleFileOperation('/manage-files', { path, action });

    if (data.success) {
      icon.classList.toggle('fa-regular');
      icon.classList.toggle('fa-solid');
    } else {
      alert('Failed to publish/unpublish file');
    }
  }

  async function handleDeleteClick(event) {
    event.preventDefault();
    const path = event.currentTarget.getAttribute('data-path');
    if (confirm('Are you sure you want to delete this file?')) {
      const data = await handleFileOperation('/manage-files', { path, action: 'delete' });
      if (data.success) {
        alert('File successfully deleted');
        fetchFiles(currentPathDisplay.textContent);
      } else {
        alert('Failed to delete file: ' + data.error);
      }
    }
  }

  async function handleRenameClick(event) {
    event.preventDefault();
    const target = event.currentTarget.tagName === 'I' ? event.currentTarget.parentElement : event.currentTarget;
    const oldPath = target.getAttribute('data-path');
    const newName = prompt('Enter the new name for the file:');
    if (newName) {
      const pathParts = oldPath.split('/');
      pathParts.pop();
      const newPath = pathParts.join('/') + '/' + newName;
      const data = await handleFileOperation('/manage-files', { path: oldPath, newPath, action: 'rename' });
      if (data.success) {
        alert('File successfully renamed');
        fetchFiles(currentPathDisplay.textContent);
      } else {
        alert('Failed to rename file: ' + data.error);
      }
    }
  }

  function handleCheckboxClick() {
    const checkboxes = document.querySelectorAll('#file-table tbody input[type="checkbox"]:checked');
    if (checkboxes.length > 1) {
      if (!multiDeleteButton) {
        multiDeleteButton = createElement('a', {
          href: '#',
          className: 'main-button',
          textContent: 'multi del.',
          id: 'multi-delete-button'
        });
        optionsDiv.appendChild(multiDeleteButton);
        multiDeleteButton.addEventListener('click', handleMultiDeleteClick);
      }
    } else if (multiDeleteButton) {
      multiDeleteButton.remove();
      multiDeleteButton = null;
    }
  }

  async function handleMultiDeleteClick(event) {
    event.preventDefault();
    const checkboxes = document.querySelectorAll('#file-table tbody input[type="checkbox"]:checked');
    const paths = Array.from(checkboxes).map(checkbox => checkbox.value);
    const currentPath = currentPathDisplay.textContent;

    if (paths.length > 0 && confirm('Are you sure you want to delete these files?')) {
      let successCount = 0;

      for (const path of paths) {
        const data = await handleFileOperation('/manage-files', { path, action: 'delete' });
        if (data.success) {
          successCount++;
        }
      }

      if (successCount === paths.length) {
        alert('All files successfully deleted');
      } else {
        alert(`${successCount} out of ${paths.length} files successfully deleted`);
      }

      fetchFiles(currentPath); // Ensure we are passing the correct path
    }
  }

  function renderFiles(data) {
    fileTableBody.innerHTML = '';
    currentPathDisplay.textContent = data.path;
    optionsDiv.innerHTML = '';

    if (data.parent_path !== '/') {
      const cdParent = createElement('a', {
        href: '#',
        dataset: { path: data.parent_path },
        className: 'main-button',
        textContent: 'cd..'
      });
      optionsDiv.appendChild(cdParent);
    }

    const mkdirButton = createElement('a', {
      href: '#',
      dataset: { path: data.path },
      className: 'main-button',
      textContent: 'MKDIR',
      id: 'mkdir-button'
    });
    optionsDiv.appendChild(mkdirButton);

    if (data.files.length === 0) {
      const rmdirButton = createElement('a', {
        href: '#',
        dataset: { path: data.path.replace('/files', '') },
        className: 'main-button',
        textContent: 'RMDIR',
        id: 'rmdir-button'
      });
      optionsDiv.appendChild(rmdirButton);
    }

    data.files.forEach(file => {
      const row = createElement('tr', { className: file.is_directory ? 'folder' : 'file' });
      if (file.is_directory) {
        row.innerHTML = `
          <td><a href="#" data-path="${data.path}/${file.name}">${file.name}</a></td>
          <td><i class="fa-solid fa-folder"></i></td>
          <td><a href="#" data-path="${data.path.replace('/files', '')}/${file.name}" class="rename-link"><i class="fa-solid fa-file-signature"></i></a></td>
        `;
      } else {
        const fullPath = `${data.path}/${file.name}`.replace('/files', '');
        const bookmarkClass = file.is_public ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        row.innerHTML = `
          <td><a href="/getfile${fullPath}" class="file-link">${file.name}</a></td>
          <td><i class="fa-solid fa-file"></i></td>
          <td>
            <a href="#" data-path="${fullPath}" class="rename-link"><i class="fa-solid fa-file-signature"></i></a>
            <a href="#" data-path="${fullPath}"><i class="fa-solid fa-trash"></i></a>
            <a href="#" data-path="${fullPath}" class="bookmark-link"><i class="${bookmarkClass}"></i></a>
            <input type="checkbox" name="" value="${fullPath}">
          </td>
        `;
      }
      fileTableBody.appendChild(row);
    });

    optionsDiv.querySelectorAll('.main-button').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        const path = e.currentTarget.dataset.path;
        if (button.id === 'mkdir-button') {
          createNewDir(path);
        } else if (button.id === 'rmdir-button') {
          deleteCurrentDir(path);
        } else {
          fetchFiles(path);
        }
      });
    });

    fileTableBody.querySelectorAll('.bookmark-link').forEach(link => {
      link.addEventListener('click', handleBookmarkClick);
    });

    fileTableBody.querySelectorAll('.fa-trash').forEach(icon => {
      icon.parentElement.addEventListener('click', handleDeleteClick);
    });

    fileTableBody.querySelectorAll('.rename-link').forEach(link => {
      link.addEventListener('click', handleRenameClick);
    });

    fileTableBody.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('click', handleCheckboxClick);
    });
  }

  document.querySelector('.file-browser-container').addEventListener('click', e => {
    if (e.target.tagName === 'A' && e.target.classList.contains('file-link')) {
      return;
    }
    if (e.target.tagName === 'A') {
      e.preventDefault();
      fetchFiles(e.target.dataset.path);
    }
  });

  fetchFiles();
});
