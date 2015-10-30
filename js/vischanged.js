if (typeof document.hidden !== "undefined") {
      hiddenObj = "hidden";
      visChangeEvent = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
      hiddenObj = "msHidden";
      visChangeEvent = "msvisibilitychange";
  } else if (typeof document.mozHidden !== "undefined") {
      hiddenObj = "mozHidden";
      visChangeEvent = "mozvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
      hiddenObj = "webkitHidden";
      visChangeEvent = "webkitvisibilitychange";
  }