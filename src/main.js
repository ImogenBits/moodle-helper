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
            return [group, [points, ""]];
          case 1:
            return [group, [points, comment[0]]];
          default:
            throw "incorrectly formatted file";
        }
      })
  );
}

function fillInMarks(marks) {
  for (const row of document.getElementsByTagName("tr")) {
    const groupElem = row.getElementsByClassName("c5")[0];
    const inputElem = row.getElementsByClassName("c6")[0]?.getElementsByTagName("input")[0];
    const feedbackElem = row.getElementsByClassName("c12")[0]?.getElementsByTagName("textarea")[0];
    if (groupElem === undefined || groupElem.textContent === null || inputElem === undefined) {
      continue;
    }
    const matches = [...groupElem.textContent.matchAll(/Abgabegruppe (\d+)/g)];
    if (matches.length === 0) {
      console.log(matches);
      continue;
    }
    const groupNum = matches[0][1];
    if (!(groupNum in marks)) {
      continue;
    }
    if (inputElem.value === "") {
      inputElem.value = marks[groupNum][0];
      feedbackElem.value = marks[groupNum][1];
    } else {
      console.log(`group ${groupNum} already marked`);
    }
  }
}

async function main() {
  const text = await getFileContent();
  const marks = parseCSV(text);
  fillInMarks(marks);
}

const quickSaveButton = document.getElementById("id_savequickgrades");
if (quickSaveButton) {
  const inputElem = document.createElement("input");
  inputElem.type = "file";
  inputElem.style.display = "none";
  inputElem.onchange = async () => {
    if (inputElem.files[0] === undefined) {
      return;
    }
    fillInMarks(parseCSV(await inputElem.files[0].text()));
  }
  const inputButton = document.createElement("button");
  inputButton.classList.add("btn");
  inputButton.classList.add("btn-primary");
  inputButton.innerText = "Import from file";
  inputButton.type = "button";
  inputButton.onclick = function () {
    inputElem.click();
  };

  const buttonRow = quickSaveButton.parentElement.parentElement.cloneNode(true);
  buttonRow.id = "fitem_id_uploadgradefile";
  buttonRow.childNodes[3].childNodes[1].replaceWith(inputButton);
  inputButton.after(inputElem);
  quickSaveButton.parentElement.parentElement.before(buttonRow);
}
