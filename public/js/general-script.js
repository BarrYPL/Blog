"use strict";
var isExpanded = false;

function _(el){
 return document.getElementById(el);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomSpeed() {
  return Math.floor(Math.random() * (250 - 50 + 1)) + 50;
}

function blur_background(value) {
    var contentDiv = document.querySelector('.content');
    contentDiv.style.filter = "blur(" + value + "px)";
}

function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function customAlert(message, alertClass = 'alert') {
  const alertContainer = document.getElementById('alert-container');
  const alertDiv = document.createElement('div');

  alertDiv.className = alertClass === 'alert' ? 'custom-alert' : 'custom-error';
  alertDiv.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.className = 'close-btn';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = () => {
    alertDiv.style.opacity = '0';
    setTimeout(() => alertDiv.remove(), 500);
  };

  alertDiv.appendChild(closeButton);
  alertContainer.appendChild(alertDiv);

   setTimeout(() => {
     alertDiv.style.opacity = '0';
     setTimeout(() => alertDiv.remove(), 500);
   }, 2000);
}

function toggleMenu() {
    var menuRight = document.querySelector('.menu-right');
    isExpanded = menuRight.classList.toggle('menu-right-expanded');
    if (isExpanded) {
        blur_background(5);
    } else {
        blur_background(0);
    }
}

window.addEventListener("load", function(evt){
  document.onclick = function(e) {
    var menuRight = document.querySelector('.menu-right');
    if (isExpanded && !(e.target.id == 'hamburger-menu' || e.target.className.includes('menu'))) {
      isExpanded = menuRight.classList.toggle('menu-right-expanded');
      blur_background(0);
    }
  }
});

//onload
window.addEventListener("load", function(evt){
  let txt = 'BarrYPL The Hacker';
  let speed = 50;

  const subpage = document.location.pathname === '/' ? 'home' : document.location.pathname.split('/').filter(Boolean).pop();

  async function typeWriter(text) {
    var i = 0;
    while (i < text.length) {
      _("logo-text").innerHTML += text.charAt(i);
      i++;
      await sleep(getRandomSpeed());
    }
  }

  async function deleteWriter() {
    var i = _("logo-text").innerHTML.length;
    while (i > 0) {
      var currentText = _("logo-text").innerHTML;
      _("logo-text").innerHTML = currentText.slice(0, -1);
      i--;
      await sleep(speed);
    }
  }

  async function loopTypeDelete() {
    while (true) {
      await typeWriter(capitalize(decodeURI(subpage)));
      await sleep(2000);
      await deleteWriter();
      await sleep(1000);
      await typeWriter(txt);
      await sleep(2000);
      await deleteWriter();
      await sleep(1000);
    }
  }

  loopTypeDelete();

  function showImageInOverlay(src) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        const img = document.createElement('img');
        img.src = src;
        overlay.appendChild(img);
        overlay.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });

        document.body.appendChild(overlay);
    }

    document.querySelectorAll('img').forEach(function(image) {
        if (image.parentElement.tagName.toLowerCase() !== 'a') {
            image.addEventListener('click', function() {
                showImageInOverlay(image.src);
            });
        }
    });
})
