/** @type RegExp */
var groupRegex;
var groupColumn;
chrome.storage.sync.get(["groupPattern", "groupColumn"], (items) => {
  groupRegex = new RegExp(items.groupPattern, "g");
  groupColumn = items.groupColumn;
});

chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.groupPattern?.newValue) {
    groupRegex = new RegExp(changes.groupPattern.newValue, "g");
  }
  if (changes.groupColumn?.newValue) {
    groupColumn = changes.groupColumn.newValue;
  }
});

async function getFileContent() {
  const inputElem = document.createElement("input");
  inputElem.type = "file";
  var resolve;
  const promise = new Promise((res, _) => {
    resolve = res;
  });
  inputElem.onchange = (e) => {
    resolve();
  };

  inputElem.click();
  await promise;
  return await inputElem.files[0].text();
}

/**
 * Parses a csv into a js object
 * @param {string} file
 * @returns {object} object containing the parsed values as Map<string, [number, string]>
 */
function parseCSV(file) {
  return Object.fromEntries(
    file
      .split(/\r?\n/)
      .filter((line) => line.length !== 0)
      .map((line) => {
        const [group, points, ...comment] = line.split(",").map((s) => s.trim());
        switch (comment.length) {
          case 0:
            return [group, [Number(points), ""]];
          case 1:
            return [group, [Number(points), comment[0]]];
          default:
            throw "incorrectly formatted file";
        }
      })
  );
}

/**
 *
 * @param {HTMLTableRowElement[]} table
 * @param {{ [key: string]: [number, string] }} marks
 * @returns
 */
function fillInMarks(table, marks) {
  var overriden = false;
  const columns = [...table.querySelectorAll("thead th")];
  const groupColIndex = columns.indexOf(columns.find((c) => c.innerText.includes(groupColumn)));

  for (const row of table.querySelectorAll("tbody tr")) {
    const groupElem = row.children[groupColIndex];
    const inputElem = row.querySelector("input.quickgrade");
    const feedbackElem = row.querySelector("textarea.quickgrade");
    if (groupElem === undefined || groupElem.textContent === null || inputElem === undefined) {
      continue;
    }
    const matches = [...groupElem.textContent.matchAll(groupRegex)];
    if (matches.length === 0) {
      continue;
    }
    const groupNum = matches[0][1];
    if (!(groupNum in marks)) {
      continue;
    }
    if (
      (inputElem.value !== "" && Number(inputElem.value) !== marks[groupNum][0]) ||
      (feedbackElem && feedbackElem.value !== "" && feedbackElem.value !== marks[groupNum][1])
    ) {
      row.classList.remove("unselectedrow");
      row.classList.add("selectedrow");
      overriden = true;
    }
    if (inputElem.value === "" || Number(inputElem.value) !== marks[groupNum][0]) {
      inputElem.parentElement.classList.add("quickgrademodified");
      inputElem.value = marks[groupNum][0];
    }
    if (feedbackElem && feedbackElem.value !== marks[groupNum][1]) {
      feedbackElem.parentElement.classList.add("quickgrademodified");
      feedbackElem.value = marks[groupNum][1];
    }
  }
  return overriden;
}

const gradingForms = document.getElementsByClassName("quickgradingform");
if (gradingForms.length !== 0) {
  const gradingTable = gradingForms[0].getElementsByTagName("table")[0];

  const quickSaveButton = document.getElementById("id_savequickgrades");
  const messageElem = document.createElement("span");
  messageElem.hidden = true;
  messageElem.style.marginLeft = "1rem";
  const inputElem = document.createElement("input");
  inputElem.type = "file";
  inputElem.style.display = "none";
  inputElem.onchange = async () => {
    if (!inputElem.files || inputElem.files[0] === undefined) {
      return;
    }
    const didOverwrite = fillInMarks(gradingTable, parseCSV(await inputElem.files[0].text()));
    messageElem.textContent =
      "Imported data, double check it's correct and submit with the button below.";
    if (didOverwrite) {
      messageElem.textContent += " This ovverwrote some data, affected rows are highlighted.";
    }
    messageElem.hidden = false;
    inputElem.files = null;
    inputElem.value = "";
  };
  const inputButton = document.createElement("button");
  inputButton.classList.add("btn", "btn-primary");
  inputButton.innerText = "Import from file";
  inputButton.type = "button";
  inputButton.onclick = function () {
    inputElem.click();
  };

  const buttonRow = quickSaveButton.parentElement.parentElement.cloneNode(true);
  buttonRow.id = "fitem_id_uploadgradefile";
  buttonRow.childNodes[3].childNodes[1].replaceWith(inputButton);
  inputButton.after(messageElem);
  messageElem.after(inputElem);
  quickSaveButton.parentElement.parentElement.before(buttonRow);
}
