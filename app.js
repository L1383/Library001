
let novels = JSON.parse(localStorage.getItem('novels')) || [];

function saveNovels() {
  localStorage.setItem('novels', JSON.stringify(novels));
}

function addNovel() {
  const name = document.getElementById('novelInput').value.trim();
  const genres = Array.from(document.querySelectorAll('#genres input:checked')).map(el => el.value);
  const chapters = parseInt(document.getElementById('chapterCount').value);
  const chaptersRead = parseInt(document.getElementById('chaptersRead').value);
  const rating = parseFloat(document.getElementById('ratingInput').value);
  const links = document.getElementById('linksInput').value.trim().split(',').map(l => l.trim()).filter(l => l);
  const favorite = document.getElementById('favoriteInput').checked;
  const completed = document.getElementById('completedInput').checked;

  if (!name) return;

  novels.push({ name, genres, chapters, chaptersRead, rating, links, favorite, completed });
  saveNovels();
  renderNovels();
}

function renderNovels() {
  const list = document.getElementById('novelList');
  list.innerHTML = '';

  novels.forEach((novel, index) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <strong>${novel.name}</strong><br/>
      ژانر: ${novel.genres.join(', ')}<br/>
      فصول: ${novel.chapters || '?'} | خوانده‌شده: ${novel.chaptersRead || 0}<br/>
      امتیاز: ${novel.rating || '-'}<br/>
      لینک‌ها: ${novel.links.map(l => `<a href="\${l}" target="_blank">📎</a>`).join(' ')}<br/>
      ${novel.favorite ? '⭐ مورد علاقه' : ''} ${novel.completed ? '✔️ تکمیل‌شده' : ''}
    `;
    list.appendChild(div);
  });
}

renderNovels();
