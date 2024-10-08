document.addEventListener('DOMContentLoaded', function() {
  //Name checker
  const inputElement = document.querySelector('input[name="title"]');
  const errorElement = document.querySelector('p.error');
  let isTitleValid = false;

  if (inputElement){
    inputElement.addEventListener('input', function() {
      const inputValue = inputElement.value;

      fetch('/check-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: inputValue })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          errorElement.textContent = data.error;
          isTitleValid = false;
        } else {
          errorElement.textContent = '';
          isTitleValid = true;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        errorElement.textContent = 'Wystąpił błąd podczas sprawdzania tytułu.';
        isTitleValid = false;
      });
    });
  }

  const submitBtn = document.getElementById('post-form');
  if (submitBtn) {
    submitBtn.addEventListener('submit', function(event) {
      const title = inputElement.value.trim();
      const tags = document.querySelector('input[name="tags"]').value.trim();
      const categorySelect = document.getElementById('categorySelect').value;

      if (!title) {
        alert('Please enter a title.');
        event.preventDefault();
        return;
      }

      if (!isTitleValid) {
        alert('The title is not valid or already exists.');
        event.preventDefault();
        return;
      }

      if (categorySelect === "" || categorySelect === "Select category...") {
        alert('Please select a category.');
        event.preventDefault();
        return;
      }

      if (!tags) {
        alert('Please enter some tags.');
        event.preventDefault();
        return;
      }
    });
  }

  const circles = document.querySelectorAll(".circle"),
  progressBar = document.querySelector(".indicator");

  let currentStep = getStageFromUrl() + 1 || 1;

  function getStageFromUrl() {
    const urlParts = window.location.pathname.split('/');
    const stage = urlParts[urlParts.length - 1];
    return parseInt(stage) || 0;
  }

  const updateDOM = () => {
    circles.forEach((circle, index) => {
      circle.classList[`${index < currentStep ? "add" : "remove"}`]("active");
    });

    progressBar.style.width = `${((currentStep - 1) / (circles.length - 1)) * 100}%`;
  };

  updateDOM();
});
