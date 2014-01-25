function DeftDraft(textarea) {
  this.textarea = textarea;
}

DeftDraft.prototype.textobject = function(beforeFunc, afterFunc, func) {
  var content = this.textarea.val();
  var sel = this.textarea.getSelection();

  var before = beforeFunc.call(this, sel.start, content); // -> position
  var after = afterFunc.call(this, sel.end, content);

  console.log(before + ", " + after);
  if (this.alreadySelected(before, after)) {
    func.call(this, sel, content);
  } else {
    this.textarea.setSelection(sel.start - before, sel.end + after);
  }   
}

DeftDraft.prototype.word = function(func) {
  this.textobject(this.wordBoundaryBefore, this.wordBoundaryAfter, func);
}

DeftDraft.prototype.sentence = function(func) {
  this.textobject(this.sentenceBoundaryBefore, this.sentenceBoundaryAfter, func);
}

DeftDraft.prototype.paragraph = function(func) {
  this.textobject(this.paragraphBoundaryBefore, this.paragraphBoundaryAfter, func);
}

// ================== next / prev ===================

DeftDraft.prototype.nextWord = function() {
  this.word(function(sel, content) { this.selectForward(sel, content, 
    /[\w']+(\W|$)/ )});
}

DeftDraft.prototype.nextSentence = function() {
  this.sentence(function(sel, content) { this.selectForward(sel, content, 
    /.*?[.!?](\W|$)/ )});
}

DeftDraft.prototype.nextParagraph = function() {
  this.paragraph(function(sel, content) { this.selectForward(sel, content, 
    /.+(\n\n|$)/ )});
}

DeftDraft.prototype.prevWord = function() {
  this.word(function(sel, content) { this.selectBackward(sel, content,
    /(^|\W)[\w']+(\W|$)/ )});
}

DeftDraft.prototype.prevSentence = function() {
  this.sentence(function(sel, content) { this.selectBackward(sel, content,
    /(^|\W)[.?!].*?(\W[.!?]|$|\n\n)/ )});
}

DeftDraft.prototype.prevParagraph = function() {
  this.paragraph(function(sel, content) { this.selectBackward(sel, content,
    /(\n\n|^).+(\n\n|$)/ )});
}

// =================== after / before =================

DeftDraft.prototype.selectForward = function(sel, content, regex) {
  content_after = content.substr(sel.end);
  res = regex.exec(content_after);

  if (res !== null) {
    this.textarea.setSelection(sel.end + res.index, sel.end + res.index + res[0].length - res[1].length);
  } else {
    sel.start = 0;
    sel.end = 0;
    this.selectForward(sel, content, regex);
  }  
}

DeftDraft.prototype.selectBackward = function(sel, content, regex) {
  content_before = this.reverse(content.substr(0, sel.start));
  res = regex.exec(content_before);

  if (res !== null) {
    this.textarea.setSelection(sel.start - res.index - res[0].length + res[2].length, sel.start - res.index - res[1].length);
  } else {
    sel.start = content.length;
    sel.end = content.length;
    this.selectBackward(sel, content, regex);
  }
}

// ==================== boundaries ===================

DeftDraft.prototype.wordBoundaryBefore = function(pos, content) {
  content = this.reverse(content.substr(0, pos));
  res = /\W/.exec(content);

  if (res !== null) {
    return res.index;
  } else {
    return content.length;
  }
}

DeftDraft.prototype.wordBoundaryAfter = function(pos, content) {
  content = content.substr(pos);
  res = /\W/.exec(content);

  if (res !== null) {
    return res.index;
  } else {
    return content.length;
  }
}

DeftDraft.prototype.sentenceBoundaryBefore = function(pos, content) {
  content = this.reverse(content.substr(0, pos));
  res = /((^|\W)[.!?]|\n)/.exec(content);

  console.log(res);

  if (res !== null) {
    return res.index;
  } else {
    return content.length;
  }  
}

DeftDraft.prototype.sentenceBoundaryAfter = function(pos, content) {
  pos = pos - 1;
  content = content.substr(pos);
  res = /[.!?](\W|$)/.exec(content);

  if (res !== null) {
    return res.index;
  } else {
    return content.length;
  }
}

DeftDraft.prototype.paragraphBoundaryBefore = function(pos, content) {
  content = this.reverse(content.substr(0, pos));
  res = /\n\n/.exec(content);

  if (res !== null) {
    return res.index;
  } else {
    return content.length;
  }  
}

DeftDraft.prototype.paragraphBoundaryAfter = function(pos, content) {
  content = content.substr(pos);
  res = /\n\n/.exec(content);

  if (res !== null) {
    return res.index;
  } else {
    return content.length;
  }
}

// ===================== helpers ==================

DeftDraft.prototype.reverse = function(str) {
  return str.split("").reverse().join("");
}

DeftDraft.prototype.alreadySelected = function(start, end) {
  return (start === 0 && end === 0);
}

DeftDraft.prototype.nextHeading = function() {

}

DeftDraft.prototype.prevHeading = function() {

}

DeftDraft.prototype.expand = function() {

}

DeftDraft.prototype.compress = function() {

}

var dd = new DeftDraft($('#editor'));
Mousetrap.bind('ctrl+w', function() {dd.nextWord(); return false});
Mousetrap.bind('ctrl+shift+w', function() {dd.prevWord(); return false});
Mousetrap.bind('ctrl+s', function() {dd.nextSentence(); return false});
Mousetrap.bind('ctrl+shift+s', function() {dd.prevSentence(); return false});
Mousetrap.bind('ctrl+q', function() {dd.nextParagraph(); return false});
Mousetrap.bind('ctrl+shift+q', function() {dd.prevParagraph(); return false});
Mousetrap.bind('ctrl+d', function() {dd.nextHeading(); return false});
Mousetrap.bind('ctrl+shift+d', function() {dd.prevHeading(); return false});
Mousetrap.bind('ctrl+e', function() {dd.expand(); return false});
Mousetrap.bind('ctrl+shift+e', function() {dd.compress(); return false});
