
function buildPostUrls(tag, postname, user) {
  var sites = [
  {
    name: "steemit.com",
    url: `https://steemit.com/${tag}/@${user}/${postname}`
  },
  {
    name: "steemd.com",
    url: `https://steemd.com/${tag}/@${user}/${postname}`
  },
  {
    name: "busy.org",
    url: `https://busy.org/${tag}/@${user}/${postname}`
  }
  ]
  if (tag === 'utopian-io') {
    sites.push({
      name: "utopian.io",
      url: `https://utopian.io/${tag}/${user}/${postname}`
    })
  }
  if (tag === 'dtube') {
    sites.push({
      name: "d.tube",
      url: `https://d.tube/#!/v/${user}/${postname}`
    })
  }
  if (tag === 'dmania') {
    sites.push({
      name: "dmania.lol",
      url: `https://dmania.lol/post/${user}/${postname}`
    })
  }
  return sites;
}

function buildUserUrls(user) {
  return [
  {
    name: "steemit.com",
    url: `https://steemit.com/@${user}`
  },
  {
    name: "steemd.com",
    url: `https://steemd.com/@${user}`
  },
  {
    name: "busy.org",
    url: `https://busy.org/@${user}`
  },
  {
    name: "utopian.io",
    url: `https://utopian.io/@${user}`
  },
  {
    name: "d.tube",
    url: `https://d.tube/#!/c/${user}`
  },
  {
    name: "dmania.lol",
    url: `https://dmania.lol/profile/${user}`
  }
  ]

}
// Busy, utopian, steemd, and steemit have the same url setup
// Steemit, steemd, and Busy have all posts
// Utopian only has utopian tags, dtube only has dtube tags, dmania only has dmania tags
// urldata => {host: busy.org; path: /dtube/@foo/bar; hash}
// Can either be on a feed, user, or page
function DetermineSites(urldata){
  var tag;
  var user;
  var postname;
  switch (urldata.host) {
    case "steemit.com":
    case "utopian.io":
    case "steemd.com":
    case "busy.org":
      if(urldata.path.match(/\/[a-zA-Z\-0-9@]+/g) && urldata.path.match(/\/[a-zA-Z\-0-9@]+/g).length==3) {
        // Looking at a post
        var matches = urldata.path.match(/\/[a-zA-Z\-0-9@]+/g).map(s => s.substring(1));
        tag = matches[0];
        user = matches[1].substring(1);
        postname = matches[2];
      }
      else if(urldata.path.match(/@[a-zA-Z\-0-9]+/)) {
        // Looking at a user
        user = urldata.path.match(/@[a-zA-Z\-0-9]+/)[0].substring(1);
      }
      break;
    case "dmania.lol":
      if(urldata.path.match(/\/post\//)) {
        // Looking at a post
        var matches = urldata.path.match(/\/[a-zA-Z\-0-9@]+/g).map(s => s.substring(1));
        tag = "dmania";
        user = matches[1];
        postname = matches[2];
      }
      else if(urldata.path.match(/\/profile\//)) {
        var matches = urldata.path.match(/\/[a-zA-Z\-0-9@]+/g).map(s => s.substring(1));
        user = matches[matches.length - 1];
        // Looking at a user
      }
      break;
    case "d.tube":
      if(urldata.hash.match(/\/v\//)) {
        // Looking at a post
        var matches = urldata.hash.match(/\/[a-zA-Z\-0-9@]+/g).map(s => s.substring(1));
        tag = "dtube"
        postname = matches[matches.length - 1];
        user = matches[matches.length - 2];
      }
      else if(urldata.hash.match(/\/c\//)) {
        // Looking at a user
        var matches = urldata.hash.match(/\/[a-zA-Z\-0-9@]+/g).map(s => s.substring(1));
        user = matches[matches.length - 1];
      }
      break;
  }
  if ((typeof tag != 'undefined') && (typeof postname != 'undefined') && (typeof user != 'undefined')) {
    return buildPostUrls(tag, postname, user).filter(s => s.name !== urldata.host);
  }
  else if (typeof user != 'undefined') {
    return buildUserUrls(user).filter(s => s.name !== urldata.host);
  }


  return [];
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg == "request_generate_sister_urls") {
    sendResponse({
      sites: DetermineSites(request.data)
      });
  } else {
    console.log("Unknown message occured");
    console.dir(request);
    sendResponse({})
  }
  // Note: Returning true is required here!
  //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
  return true; 
})
