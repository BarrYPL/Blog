document.addEventListener('DOMContentLoaded', function() {
//Dropdown list JS
  var x, i, j, l, ll, selElmnt, a, b, c;
  var hiddenCategoryInput = document.createElement('input');
  hiddenCategoryInput.type = 'hidden';
  hiddenCategoryInput.name = 'category';
  hiddenCategoryInput.value = "";
  document.getElementById('post-form').appendChild(hiddenCategoryInput);
  x = document.getElementsByClassName("custom-select");
  l = x.length;
  for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.setAttribute("id", "categorySelect");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
      c = document.createElement("DIV");
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener("click", function(e) {
          var y, i, k, s, h, sl, yl;
          s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          sl = s.length;
          h = this.parentNode.previousSibling;
          for (i = 0; i < sl; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              hiddenCategoryInput.value = this.innerHTML;
              y = this.parentNode.getElementsByClassName("same-as-selected");
              yl = y.length;
              for (k = 0; k < yl; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function(e) {
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
      });
  }
  function closeAllSelect(elmnt) {
    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i)
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < xl; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }
  document.addEventListener("click", closeAllSelect);

//Name checker
  const inputElement = document.querySelector('input[name="title"]');
  const errorElement = document.querySelector('p.error');
  let isTitleValid = false;

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

  document.getElementById('post-form').addEventListener('submit', function(event) {
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

  //Category name
  const categoryInput = _('catg');
  const categoryParam = document.querySelector('input[name="category"]');
  if (categoryParam) {
    if (categoryInput.value !== '') {
      categoryParam.value = categoryInput.value;
    }
    
    categoryInput.addEventListener('input', function() {
      categoryParam.value = categoryInput.value;
    });
  }
});
