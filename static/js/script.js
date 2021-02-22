window.Get = (function() {
  var query = window.location.search.substring(1);
  var raw_vars = query.split("&");
  var params = {};
  for(var key in raw_vars) {
    param = raw_vars[key].split("=");
    variable = param[0];
    value = param[1];
    if(variable) {
      params[variable] = decodeURIComponent(value);
    }
  }
  return params;
})();

window.CompiledHref = function(obj) {
  var str = "";
  for(var key in obj) {
    if(str !== "")
      str += "&";
    str += key + "=" + obj[key];
  }
  return document.location.origin + document.location.pathname + "?" + str;
};

$(function( ) {
  $(".confirm").on("click", function(e) {
    if(confirm('Are you sure?'))
      document.location.href = e.target.dataset.href;
  });
});
