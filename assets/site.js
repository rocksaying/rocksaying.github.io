document.addEventListener("DOMContentLoaded", function(){
//console.log("my style");

//** start adjust image
function setImageWithTitle() {
  var p;
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
  this.insertAdjacentHTML('afterend',
    '<div class="img_title"><span class="icon icon-image"></span>'.concat(this.title.substr(1), '</div>'));
  this.setAttribute('data-width', this.width);
  this.setAttribute('data-fullsize', 0);
  this.style.maxWidth = '100%';
  p = false;
}

function toggleResizeImage() {
  var dw = parseInt(this.getAttribute('data-width'));
  var fs = parseInt(this.getAttribute('data-fullsize'));
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

var imgs=document.querySelectorAll('article img');
var i, img;
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

// var categories = [
// {'name':'<span class="iconfont">&#xf015;</span>', 'url':'/'},
// {'name':'Programming', 'url':'/categories/programming.html'},
// {'name':'電腦技術', 'url':'/categories/computer.html'},
// {'name':'經濟學/奧地利經濟學派', 'url':'/categories/economics.html'},
// {'name':'哲學/老子', 'url':'/categories/philosophy.html'},
// {'name':'閱讀隨筆', 'url':'/categories/reading.html'},
// {'name':'休閒生活', 'url':'/categories/life.html'},
// {'name':'快報記事', 'url':'/categories/events.html'}
// ];
//
// var cl=[];
// categories.forEach(function(c, i){
// cl.push('<div class="item"><a href="',
//   c.url,'">', c.name,'</a></div>');
// });
// document.getElementById('site_categories').innerHTML=cl.join('');

var inotes = document.querySelectorAll('section.post .Onote');
for (i = 0; i < inotes.length; ++i) {
    inotes[i].insertAdjacentHTML('beforebegin', '<span class="Onote_no">*'+(i+1)+'</span>');
    inotes[i].insertAdjacentHTML('afterbegin', '*'+(i+1)+' ');
}

}, false);
