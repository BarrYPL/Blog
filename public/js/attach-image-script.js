document.addEventListener('DOMContentLoaded', function() {
    const galleryImages = document.querySelectorAll('.thumbnail-image');
    const postImageDiv = document.querySelector('.post-image');
    const hiddenInput = document.querySelector('input[name="image-name"]');

    galleryImages.forEach(image => {
        image.addEventListener('click', function() {
            const clickedImageSrc = image.getAttribute('src');
            let currentImage = postImageDiv.querySelector('img');
            const placeholder = postImageDiv.querySelector('.placeholder');

            if (placeholder) {
                placeholder.remove();
            }

            if (currentImage) {
                currentImage.setAttribute('src', clickedImageSrc);
            } else {
                const newImage = document.createElement('img');
                newImage.setAttribute('src', clickedImageSrc);
                newImage.setAttribute('class', 'current-thumbnail');
                postImageDiv.appendChild(newImage);
                const addedImage = postImageDiv.querySelector('img.current-thumbnail');
                addedImage.style.width = '100%';
                addedImage.style.height = '100%';
                addedImage.style.objectFit = 'cover';
            }

            const imageName = clickedImageSrc.split('/').pop();
            hiddenInput.value = imageName;
        });
    });
});
