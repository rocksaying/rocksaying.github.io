document.addEventListener("DOMContentLoaded", function(){
//console.log("my style");

//** start adjust image
function setImageWithTitle() {
  this.insertAdjacentHTML('afterend',
    '<div><span class="icon icon-image"></span>'.concat(this.title.substr(1), '</div>'));
  this.setAttribute('data-width', this.width);
  this.style.maxWidth = '97%';
  this.nextElementSibling.style.marginTop = '-26px';
}

function toggleResizeImage() {
  //console.log("%s, %s, %s", this.width, this.style.width, this.style.maxWidth);
  if (this.style.maxWidth != '97%') {  console.log('down size');
    this.style.maxWidth = '97%';
  }
  else {  console.log('full size');
    var dw = this.getAttribute('data-width');
    this.style.maxWidth = (dw ? dw + 'px' : '100%');
  }
  //console.log("width: %s", this.width);
  this.nextElementSibling.style.width = this.width+'px';
}

var imgs=document.querySelectorAll('article img');
var i, img;
for (i=0;i<imgs.length;++i) {
  img=imgs[i];
  img.title='圖'.concat(i+1,': ',(img.title?img.title:img.alt));
  img.addEventListener('click',toggleResizeImage,false);
  if (img.complete) {
    console.log('complete'); // Firefox, Chrome
    setImageWithTitle.call(img);
  }
  else {
    console.log('wait load'); // IE
    img.addEventListener('load',setImageWithTitle,false);
  }
}
//**** end adjust image

var categories = [
{'name':'<span class="iconfont">&#xf015;</span>', 'url':'/'},
{'name':'Programming', 'url':'/categories/programming.html'},
{'name':'電腦技術', 'url':'/categories/computer.html'},
{'name':'經濟學/奧地利經濟學派', 'url':'/categories/economics.html'},
{'name':'哲學/老子', 'url':'/categories/philosophy.html'},
{'name':'閱讀隨筆', 'url':'/categories/reading.html'},
{'name':'生活記事', 'url':'/categories/events.html'}
];

var cl=[];
categories.forEach(function(c, i){
cl.push('<div class="category"><a href="',
  c.url,'">', c.name,'</a></div>');
});
document.getElementById('site_categories').innerHTML=cl.join('');

}, false);
