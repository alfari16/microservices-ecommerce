var current=0;
$(document).ready(function(){
  $(this).scroll(function(){
    var scroll = ($(this).scrollTop());
    if(scroll>250){
      $('nav').removeClass('static'); 
    }else $('nav').addClass('static');
  });
})