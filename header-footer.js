(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var burger = header.querySelector('.dr-header-burger');
  var panel = header.querySelector('.dr-header-nav-panel');
  if (!burger || !panel) return;

  burger.addEventListener('click', function () {
    var expanded = burger.getAttribute('aria-expanded') === 'true';
    var newState = !expanded;
    burger.setAttribute('aria-expanded', newState ? 'true' : 'false');
    panel.setAttribute('aria-hidden', newState ? 'false' : 'true');

    if (newState) {
      panel.classList.add('dr-header-nav-panel--open');
    } else {
      panel.classList.remove('dr-header-nav-panel--open');
    }
  });
})();
