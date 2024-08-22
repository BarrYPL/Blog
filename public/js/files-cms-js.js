function toggleFolder(folderId, prefix) {
    var folderContent = document.getElementById(folderId);
    var folderSpan = document.querySelector(`[data-folder-id="${folderId}"]`);

    if (folderContent.style.display === "none") {
      fetch(`/load_folder?path=${encodeURIComponent(folderId)}&prefix=${encodeURIComponent(prefix)}`)
            .then(response => response.text())
            .then(data => {
                folderContent.innerHTML = data.replace(/(?:├───|└───)(.*?)(<br>)/g, (match, fileName, br) => {
                    if (!fileName.includes('<span')) {
                        var filePath = folderId.replace(/_/g, '/') + '/' + fileName.trim();
                        return `${prefix}├───<a href="/getfile${decodeURIComponent(filePath).replace(/^\/?public/, '').replace(/\+/g, '%20')}">${fileName.trim()}</a>${br}`;
                    }
                    return match;
                });
                folderContent.style.display = "block";
                folderSpan.textContent = folderSpan.textContent.replace('[+]', '[-]');
            });
    } else {
        folderContent.style.display = "none";
        folderSpan.textContent = folderSpan.textContent.replace('[-]', '[+]');
    }
}
