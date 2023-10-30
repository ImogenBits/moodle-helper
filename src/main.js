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

function fillInMarks(marks) {
  var overriden = false;
  for (const row of document.getElementsByTagName("tr")) {
    const groupElem = row.getElementsByClassName("c5")[0];
    const inputElem = row.getElementsByClassName("c6")[0]?.getElementsByTagName("input")[0];
    const feedbackElem = row.getElementsByClassName("c12")[0]?.getElementsByTagName("textarea")[0];
    if (groupElem === undefined || groupElem.textContent === null || inputElem === undefined) {
      continue;
    }
    const matches = [...groupElem.textContent.matchAll(/Abgabegruppe (\d+)/g)];
    if (matches.length === 0) {
      continue;
    }
    const groupNum = matches[0][1];
    if (!(groupNum in marks)) {
      continue;
    }
    if (
      (inputElem.value !== "" && Number(inputElem.value) !== marks[groupNum][0]) ||
      (feedbackElem.value !== "" && feedbackElem.value !== marks[groupNum][1])
    ) {
      row.classList.remove("unselectedrow");
      row.classList.add("selectedrow");
      overriden = true;
    }
    if (Number(inputElem.value) !== marks[groupNum][0]) {
      inputElem.parentElement.classList.add("quickgrademodified");
      inputElem.value = marks[groupNum][0];
    }
    if (feedbackElem.value !== marks[groupNum][1]) {
      feedbackElem.parentElement.classList.add("quickgrademodified");
      feedbackElem.value = marks[groupNum][1];
    }
  }
  return overriden;
}

async function main() {
  const text = await getFileContent();
  const marks = parseCSV(text);
  fillInMarks(marks);
}

const quickSaveButton = document.getElementById("id_savequickgrades");
if (quickSaveButton) {
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
    const didOverwrite = fillInMarks(parseCSV(await inputElem.files[0].text()));
    messageElem.textContent = "Imported data, double check it's correct and submit with the button below."
    if (didOverwrite) {
      messageElem.textContent += " Overwrote some data, affected rows are highlighted.";
    }
    messageElem.hidden = false;
    inputElem.files = null;
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
