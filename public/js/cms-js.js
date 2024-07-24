document.addEventListener('DOMContentLoaded', function() {
  function block_deleting(e){
    e.preventDefault();
    if(window.confirm("Na pewno chcesz usunąć element?")){
      window.location = e.currentTarget.href;
    }
  }
  
  const forms = document.querySelectorAll('.publish-form');

  forms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      const formData = new FormData(form);
      const button = event.submitter;
      const buttonValue = button.value;
      const postId = formData.get('post_id');
      formData.append('button', buttonValue);

      fetch('/publish', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          if (buttonValue === '1') {
            button.value = '0';
            button.textContent = 'Hide';
            _(`is_public_${postId}`).textContent = '1';
          } else {
            button.value = '1';
            button.textContent = 'Publish';
            _(`is_public_${postId}`).textContent = '0';
          }
        } else {
          alert('Wystąpił błąd!');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Wystąpił błąd podczas przesyłania żądania.');
      });
    });
  });

  document.querySelectorAll('#del-button').forEach(item => {
    item.addEventListener('click', block_deleting);
  })
});
