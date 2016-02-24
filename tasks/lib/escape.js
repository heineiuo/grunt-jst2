// 
// if (typeof _ === 'undefined') {
//   var _ = {
//     escape: escape
//   }
// }

function escape(string) {

  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
      reUnescapedHtml = /[&<>"'`]/g;

  // reset `lastIndex` because in IE < 9 `String#replace` does not
  string = (string == null) ? '' : String(string);
  return string && (reUnescapedHtml.lastIndex = 0, reUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, escapeHtmlChar)
    : string;


    function escapeHtmlChar(chr) {
      var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
      };

      return htmlEscapes[chr];
    }
}
