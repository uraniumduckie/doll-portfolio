(() => {
  const button = document.querySelector('.language-button');
  if (!button) return;

  // Keep the original Russian markup so switching back preserves formatting.
  const translations = [
    ['title', "Svetlana’s Dolls"],
    ['.brand', 'Svetlana<span>·</span>'],
    ['nav a[href="#work"]', 'Dolls'],
    ['nav a[href="#process"]', 'Portfolio'],
    ['.nav-contact', 'Contact <span>↗</span>'],
    ['.hero .eyebrow', 'Personal page &amp; portfolio'],
    ['.hero h1', 'I give dolls new life<br />and preserve their<br /><em>stories.</em>'],
    ['.intro', 'This website is my quiet corner of the internet — a home for the dolls I have found, loved, restored, and never forgotten.'],
    ['.intro + .intro', 'Every doll has her own unique character, her own “destiny.” Once, she was loved and cared for. But time, which spares almost no one, changes both toys and the lives of the children who owned them. Repairing and restoring long-forgotten dolls makes me feel that I can slow the relentless fading of a doll’s “soul” and give her a chance at a “second life.” Afterwards, she always has a grateful, unmistakable look that touches the heart. It feels like magic — a reminder that miracles really can happen, especially when a doll’s little owner, now grown up, finds her beloved companion again and is overwhelmed with joy.'],
    ['.hero .text-link', 'See my work <span>↓</span>'],
    ['#work .eyebrow', 'Favorite creations'],
    ['#work h2', 'My <em>most</em><br /> treasured dolls'],
    ['#work .outlined-link', 'My complete portfolio<span>↗</span>'],
    ['#process .eyebrow', 'My portfolio'],
    ['#process h2', 'Photographs of<br />all my work'],
    ['.steps li:nth-child(1) h3 a', 'Restoration'],
    ['.steps li:nth-child(1) p', 'Body repairs and hair rerooting.'],
    ['.steps li:nth-child(2) h3 a', 'Shoes'],
    ['.steps li:nth-child(2) p', 'Unique, custom-made shoes.'],
    ['.steps li:nth-child(3) h3 a', 'Hair'],
    ['.steps li:nth-child(3) p', 'Hair rerooting and restoration.'],
    ['.steps li:nth-child(4) h3 a', 'Complete portfolio'],
    ['.steps li:nth-child(4) p', 'All my work in one place.'],
    ['#contact .eyebrow', 'Would you like to place an order?'],
    ['#contact h2', 'Write to me anytime!'],
    ['footer > span:first-child', `© <span id="year">${new Date().getFullYear()}</span> Svetlana`],
    ['footer > span:nth-child(2)', 'Made with love'],
    ['footer > a', 'Back to top ↑'],
    ['.slideshow-empty', 'No photos have been added yet.']
  ].map(([selector, english]) => {
    const element = document.querySelector(selector);
    return { element, english, russian: element?.innerHTML };
  });

  const attributes = [];
  const translateAttribute = (selector, attribute, english) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      attributes.push({ element, attribute, russian: element.getAttribute(attribute),
        english: typeof english === 'function' ? english(index) : english });
    });
  };
  translateAttribute('.brand', 'aria-label', 'Svetlana’s home');
  translateAttribute('.hero-portrait img', 'alt', 'Svetlana');
  translateAttribute('.favorites-slideshow', 'aria-label', 'Favorite dolls');
  translateAttribute('.favorites-slideshow', 'aria-roledescription', 'carousel');
  translateAttribute('.slideshow-slide img', 'alt', (index) => `Doll ${index + 1}`);
  translateAttribute('.slideshow-dot', 'aria-label', (index) => `Show photo ${index + 1}`);
  translateAttribute('.slideshow-prev', 'aria-label', 'Previous slide');
  translateAttribute('.slideshow-next', 'aria-label', 'Next slide');

  const setLanguage = (language) => {
    const english = language === 'en';
    document.documentElement.lang = language;
    translations.forEach(({ element, russian, english: translated }) => {
      if (element) element.innerHTML = english ? translated : russian;
    });
    attributes.forEach(({ element, attribute, russian, english: translated }) => {
      element.setAttribute(attribute, english ? translated : russian);
    });
    const menu = document.querySelector('.menu-button');
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-label', english
      ? (open ? 'Close navigation' : 'Open navigation')
      : (open ? 'Закрыть навигацию' : 'Открыть навигацию'));
    button.textContent = english ? 'RU' : 'EN';
    button.lang = english ? 'ru' : 'en';
    button.setAttribute('aria-label', english ? 'Переключить на русский' : 'Switch to English');
    try { localStorage.setItem('site-language', language); } catch (_) { /* Storage is optional. */ }
  };

  button.addEventListener('click', () => {
    setLanguage(document.documentElement.lang === 'en' ? 'ru' : 'en');
  });
  let language = 'ru';
  try { if (localStorage.getItem('site-language') === 'en') language = 'en'; } catch (_) { /* Use Russian by default. */ }
  setLanguage(language);
})();
