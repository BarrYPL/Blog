function toggleFolder(folderId, prefix) {
    var folderContent = document.getElementById(folderId);
    var folderSpan = document.querySelector(`[data-folder-id="${folderId}"]`);

    if (folderContent.style.display === "none") {
        fetch(`/load_folder?path=${encodeURIComponent(folderId)}&prefix=${encodeURIComponent(prefix)}`)
            .then(response => response.text())
            .then(data => {
                var files = data.match(/(?:├───|└───)(.*?)(<br>)/g);
                if (files) {
                    var lastFile = files[files.length - 1];
                    folderContent.innerHTML = data.replace(/(?:├───|└───)(.*?)(<br>)/g, (match, fileName, br, index) => {
                        var isLastFile = match === lastFile;
                        var filePath = folderId.replace(/_/g, '/') + '/' + fileName.trim();
                        var prefix = isLastFile ? '└───' : '├───';
                        if (!fileName.includes('<span')) {
                            return `${prefix}─> <a href="/getfile${decodeURIComponent(filePath).replace(/^\/?public/, '').replace(/\+/g, '%20')}" class="file">${fileName.trim()}</a>${br}`;
                        }
                        return match;
                    });
                }

                folderContent.style.display = "block";
                folderSpan.textContent = folderSpan.textContent.replace('[+]', '[-]');
            });
    } else {
        folderContent.style.display = "none";
        folderSpan.textContent = folderSpan.textContent.replace('[-]', '[+]');
    }
}
