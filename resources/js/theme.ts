const toggle = document.querySelector<HTMLButtonElement>('#theme')!;
const apply = () => { const dark = localStorage.getItem('theme') === 'dark'; document.documentElement.dataset.theme = dark ? 'dark' : 'light'; toggle.textContent = dark ? 'Terang' : 'Gelap'; };
apply(); toggle.addEventListener('click', () => { localStorage.setItem('theme', localStorage.getItem('theme') === 'dark' ? 'light' : 'dark'); apply(); });
