// 햄버거 메뉴 클릭시 메뉴바 보이기
const hamburgerMenu = document.querySelector('.hamburger-menu');
const menu = document.querySelector('.menu');
const close = document.querySelector('.close-menu');


hamburgerMenu.addEventListener('click', () => {
  hamburgerMenu.classList.toggle('active');
  menu.classList.toggle('active');
});

/*
close.addEventListener('click', () => {
  menu.classList.remove('active');
});
*/

const menuLinks = document.querySelectorAll('.menu-link');

menuLinks.forEach((menuLink) => {
  menuLink.addEventListener('click', () => {
    menu.classList.remove('show');
    hamburgerMenu.classList.remove('active');
  });
});