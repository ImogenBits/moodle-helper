
chrome.storage.sync.get("activePage", items => {
  chrome.scripting.registerContentScripts([{
    id: "inject-script",
    js: ["src/main.js"],
    matches: [items.activePage],
  }]).then(() => console.log("aaaaaaa"))
})

chrome.storage.sync.onChanged.addListener(changes => {
  if (changes.activePage?.newValue) {
    chrome.scripting.updateContentScripts([{
      id: "inject-script",
      matches: [changes.activePage.newValue]
    }]).then(() => console.log("bbbbbb"));
  }
});
