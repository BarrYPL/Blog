document.addEventListener('DOMContentLoaded', () => {
  const fileTableBody = document.querySelector('#file-table tbody');
  const currentPathDisplay = document.getElementById('current-path');
  const optionsDiv = document.getElementById('options-div');
  const dropZone = document.getElementById('drop-zone');
  const customMenu = document.getElementById('custom-menu');
  let multiDeleteButton;
  let currentPath = '';

  async function fetchFiles(path_to_fetch = '') {
    try {
      const response = await fetch(path_to_fetch, { method: 'POST' });
      const data = await response.json();
      if (data.error) {
        customAlert(data.error, 'error');
      } else {
        renderFiles(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function showCustomMenu(event) {
    event.preventDefault();

    const eventDataPath = event.target.getAttribute('data-path');
    const isZipped = eventDataPath.slice(-3) === 'zip';
    const menuItems = ['unzip', 'rename', 'delete', 'pub'];

    menuItems.forEach(item => document.getElementById(item).setAttribute('data-path', eventDataPath));

    const clickX = event.pageX;
    const clickY = event.pageY;
    const isPublic = event.currentTarget.getAttribute('is_public') === 'true';

    document.getElementById('pub').innerHTML = isPublic
      ? `<i class="fa-solid fa-bookmark"></i> Hide`
      : `<i class="fa-regular fa-bookmark"></i> Publish`;

    document.getElementById('unzip').style.display = isZipped ? 'block' : 'none';

    customMenu.style.left = `${clickX}px`;
    customMenu.style.top = `${clickY}px`;
    customMenu.style.display = 'block';
  }

  function showCustomMenuDirectories(event) {
    event.preventDefault();
    const eventDataPath = event.target.getAttribute('data-path');
    const menuItems = ['unzip', 'rename', 'delete', 'pub'];

    menuItems.forEach(item => document.getElementById(item).setAttribute('data-path', eventDataPath));
    document.getElementById('delete').style.display = 'none';
    document.getElementById('unzip').style.display = 'none';
    document.getElementById('pub').innerHTML = `<i class="fa-solid fa-folder-open"></i> Open`;

    const clickX = event.pageX;
    const clickY = event.pageY;

    customMenu.style.left = `${clickX}px`;
    customMenu.style.top = `${clickY}px`;
    customMenu.style.display = 'block';
  }

  function hideCustomMenu() {
    customMenu.style.display = 'none';
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
      customAlert('Error' + error, 'error');
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

  async function unzipFile(event) {
    const path = event.currentTarget.getAttribute('data-path');
    let currentPath = currentPathDisplay.textContent.replace('/files', '');
    if (!currentPath.length) { currentPath = '/'; }
    const data = await handleFileOperation('/manage-files', { path, currentPath, action: 'unzip' });
    if (data.error) {
      customAlert('Error: ' + data.error, 'erorr');
    } else {
      fetchFiles(currentPathDisplay.textContent);
    }
  }

  async function deleteCurrentDir(path) {
    if (confirm('Are you sure you want to delete this directory?')) {
      const data = await handleFileOperation(`/rmdir${path}`, {});
      if (data.error) {
        customAlert('Error: ' + data.error, 'error');
      } else {
        let pathSegments = currentPathDisplay.textContent.replace('/files','').split('/');
        pathSegments.pop();
        let parentDirectory = pathSegments.join('/');
        customAlert(data.message);
        fetchFiles(parentDirectory);
      }
    }
  }

  async function createNewDir(currentPath) {
    const dirName = prompt('Enter the name of the new directory:');
    if (dirName) {
      const data = await handleFileOperation('/mkdir', { path: currentPath, name: dirName });
      if (data.error) {
        customAlert('Error: ' + data.error, 'error');
      } else {
        fetchFiles(currentPath);
      }
    }
  }

  async function handleBookmarkClick(event) {
    event.preventDefault();
    const isPublic = event.currentTarget.getAttribute('is_public');
    if (isPublic !== 'Open') {
      const path = event.currentTarget.getAttribute('data-path');
      const icon = event.currentTarget.querySelector('i');
      const action = icon.classList.contains('fa-regular') ? 'publish' : 'hide';
      const data = await handleFileOperation('/manage-files', { path, action });

      if (data.success) {
        fetchFiles(currentPathDisplay.textContent);
      } else {
        customAlert('Failed to publish/unpublish file', 'error');
      }
    } else {
      const path = event.currentTarget.getAttribute('data-path');
      fetchFiles(path);
    }
  }

  async function handleDeleteClick(event) {
    event.preventDefault();
    const path = event.currentTarget.getAttribute('data-path');
    if (confirm('Are you sure you want to delete this file?')) {
      const data = await handleFileOperation('/manage-files', { path, action: 'delete' });
      if (data.success) {
        customAlert('File successfully deleted');
        fetchFiles(currentPathDisplay.textContent);
      } else {
        customAlert('Failed to delete file: ' + data.error, 'error');
      }
    }
  }

  async function handleRenameClick(event) {
    event.preventDefault();
    const target = event.currentTarget.tagName === 'I' ? event.currentTarget.parentElement : event.currentTarget;
    const oldPath = target.getAttribute('data-path').replace('/files','');
    const newName = prompt('Enter the new name for the file:', oldPath.split('/').pop());
    if (newName) {
      const pathParts = oldPath.split('/');
      pathParts.pop();
      const newPath = pathParts.join('/') + '/' + newName;
      const data = await handleFileOperation('/manage-files', { path: oldPath, newPath, action: 'rename' });
      if (data.success) {
        customAlert('File successfully renamed');
        fetchFiles(currentPathDisplay.textContent);
      } else {
        customAlert('Failed to rename file: ' + data.error, 'error');
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
    const reloadPath = currentPathDisplay.textContent;

    if (paths.length > 0 && confirm('Are you sure you want to delete these files?')) {
      let successCount = 0;

      for (const path of paths) {
        const data = await handleFileOperation('/manage-files', { path, action: 'delete' });
        if (data.success) {
          successCount++;
        }
      }

      if (successCount === paths.length) {
        customAlert('All files successfully deleted');
      } else {
        customAlert(`${successCount} out of ${paths.length} files successfully deleted`, 'error');
      }
      fetchFiles(reloadPath);
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
          <td><a href="#" class="directory-link" data-path="${data.path}/${file.name}" is_public="directory">${file.name}</a></td>
          <td><i class="fa-solid fa-folder"></i></td>
          <td><a href="#" data-path="${data.path.replace('/files', '')}/${file.name}" class="rename-link"><i class="fa-solid fa-file-signature"></i></a></td>
        `;
      } else {
        const fullPath = `${data.path}/${file.name}`.replace('/files', '');
        const bookmarkClass = file.is_public ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        const icon = fullPath.slice(-3) === 'zip' ? 'fa-solid fa-file-zipper' : 'fa-solid fa-file';
        row.innerHTML = `
          <td><a href="/getfile${fullPath}" class="file-link" data-path="${fullPath}" is_public="${file.is_public}">${file.name}</a></td>
          <td><i class="${icon}"></i></td>
          <td class="options">
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

    fileTableBody.querySelectorAll('.file-link').forEach(link => {
      link.addEventListener('contextmenu', showCustomMenu);
    });

    fileTableBody.querySelectorAll('.directory-link').forEach(link => {
      link.addEventListener('contextmenu', showCustomMenuDirectories);
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

  document.addEventListener('click', event => {
    if (!customMenu.contains(event.target)) {
      hideCustomMenu();
    }
  });

  customMenu.querySelectorAll('li').forEach(menuItem => {
    menuItem.addEventListener('click', function () {
      const action = this.id;
      const path = this.getAttribute('data-path');

      const textNodes = Array.from(this.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
      const is_public = textNodes.map(node => node.textContent.trim()).join('');

      const dummyEvent = {
        preventDefault: () => {},
        currentTarget: {
          getAttribute: (attr) => {
            if (attr === 'data-path') return path;
            if (attr === 'is_public') return is_public;
            return null;
          },
          querySelector: (selector) => this.querySelector(selector)
        }
      };

      switch (action) {
        case 'rename':
          handleRenameClick(dummyEvent);
          break;
        case 'delete':
          handleDeleteClick(dummyEvent);
          break;
        case 'pub':
          handleBookmarkClick(dummyEvent);
          break;
        case 'unzip':
          unzipFile(dummyEvent);
          break;
        default:
          break;
      }
      hideCustomMenu();
    });
  });


  fetchFiles();

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
  });

  dropZone.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    handleFiles(files);
  }

  function handleFiles(files) {
    [...files].forEach(uploadFile);
  }

  function uploadFile(file) {
    const url = '/files-upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPathDisplay.textContent.replace('/files', ''));

    fetch(url, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          customAlert('File uploaded successfully');
          fetchFiles(currentPathDisplay.textContent);
        } else {
          customAlert('File upload failed: ' + data.message, 'error');
        }
      })
      .catch(error => {
        customAlert('Erorr:' + error, 'error');
      });
    }
});
