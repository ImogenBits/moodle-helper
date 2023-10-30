const saveOptions = () => {
  const groupPattern = document.getElementById("groupPattern").value;
  const status = document.getElementById("status");

  try {
    new RegExp(groupPattern);
  } catch {
    status.textContent = "Group Pattern is not a valid regular expression"
    return;
  }

  chrome.storage.sync.set({ groupPattern: groupPattern }, () => {
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

const restoreOptions = () => {
  chrome.storage.sync.get(
    { groupPattern: "Abgabegruppe (d+)" },
    (items) => {
      document.getElementById("groupPattern").value = items.groupPattern;
    }
  );
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
