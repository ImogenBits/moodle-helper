const saveOptions = () => {
  const groupColumn = document.getElementById("groupColumn").value;
  const groupPattern = document.getElementById("groupPattern").value;
  const status = document.getElementById("status");

  try {
    new RegExp(groupPattern);
  } catch {
    status.textContent = "Group Pattern is not a valid regular expression";
    return;
  }

  chrome.storage.sync.set({ groupColumn, groupPattern }, () => {
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

const restoreOptions = () => {
  chrome.storage.sync.get({
    groupColumn: "Group",
    groupPattern: "Abgabegruppe (\\d+)",
  }, (items) => {
    document.getElementById("groupColumn").value = items.groupColumn;
    document.getElementById("groupPattern").value = items.groupPattern;
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
