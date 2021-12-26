document.addEventListener("DOMContentLoaded", function(){
//console.log("my style");
//document.getElementsByTagName('h1')[0].insertAdjacentHTML('afterend', window.screen.availWidth + ', ' + window.screen.width);

//** start adjust image
function setImageWithTitle() {
  let p;
  if (this.parentElement.tagName == 'P' || this.parentElement.tagName == 'p') {
    p = this.parentElement;
  }
  else {
    p = document.createElement('p');
    this.parentElement.insertBefore(p, this);
    p.appendChild(this);
  }
  p.style.textIndent = '0em';
  p.style.textAlign = 'center';
  p.style.marginTop = '-1.5em';
  p.style.marginBottom = '3em';
  this.insertAdjacentHTML('afterend',
    '<div class="img_title"><span class="icon icon-image"></span>'.concat(this.title.substr(1), '</div>'));
  this.setAttribute('data-width', this.width);
  this.setAttribute('data-fullsize', 0);
  this.style.maxWidth = '100%';
  p = false;
}

function toggleResizeImage() {
  let dw = parseInt(this.getAttribute('data-width'));
  let fs = parseInt(this.getAttribute('data-fullsize'));
  //console.log(dw);

  if (dw <= parseInt(this.clientWidth) && fs == 0) {
    //console.log('small image');
    return;
  }
  if (this.style.maxWidth != '100%') {  console.log('down size');
    this.setAttribute('data-fullsize', 0);
    this.style.maxWidth = '100%';
  }
  else {  console.log('full size:' + dw);
    this.setAttribute('data-fullsize', 1);
    this.style.maxWidth = (dw ? dw + 'px' : '100%');
  }
  //console.log("width: %s", this.width);
  //this.nextElementSibling.style.width = this.width+'px';
}

let imgs=document.querySelectorAll('article img');
let i, img;
for (i=0;i<imgs.length;++i) {
  img=imgs[i];
  img.title='圖'.concat(i+1,': ',(img.title?img.title:img.alt));
  img.addEventListener('click',toggleResizeImage,false);
  if (img.complete) {
    //console.log('complete'); // Firefox, Chrome
    setImageWithTitle.call(img);
  }
  else {
    //console.log('wait load'); // IE
    img.addEventListener('load',setImageWithTitle,false);
  }
}
//**** end adjust image

let inotes = document.querySelectorAll('section.post span.note');
for (i = 0; i < inotes.length; ++i) {
    inotes[i].insertAdjacentHTML('beforebegin', '<span class="note_no">*'+(i+1)+'</span>');
    inotes[i].insertAdjacentHTML('afterbegin', '*'+(i+1)+' ');
}

// tag 觸發 google adsense 搜尋
// let tags = document.getElementsByClassName("tag");
// 第一個是"分類"，跳過。
// for (i = 1; i < tags.length; ++i) {
    // tags[i].addEventListener('click', (ev)=>{
        // let gsc_input = document.getElementById("gsc-i-id1");
        // let gsc_btn = document.getElementsByClassName("gsc-search-button");
        // gsc_input.value = ev.target.innerText;
        // gsc_btn = gsc_btn[gsc_btn.length-1].click();
    // });
// }

}, false);
