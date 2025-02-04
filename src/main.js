/**
 *
 * @param {HTMLTableRowElement[]} table
 * @param {{
 *   identifier_column: string;
 *   data: {
 *     [key: string]: {
 *       points: Number | null;
 *       feedback?: string;
 *       found?: Boolean;
 *     }
 *   }
 * }} student_data
 * @returns
 */
function fillInData(table, student_data) {
  var overriden = false;
  const columns = [...table.querySelectorAll("thead th")];
  const groupColIndex = columns.indexOf(
    columns.find((c) => c.innerText.includes(student_data.identifier_column))
  );

  for (const row of table.querySelectorAll("tbody tr")) {
    const groupElem = row.children[groupColIndex];
    const inputElem = row.querySelector("input.quickgrade");
    const feedbackElem = row.querySelector("textarea.quickgrade");
    if (!groupElem?.textContent || !inputElem) {
      continue;
    }
    const curr_data = student_data.data[groupElem.textContent];
    if (!curr_data) {
      continue;
    }
    curr_data.found = true;
    if (
      (inputElem.value !== "" && Number(inputElem.value) !== curr_data.points) ||
      (feedbackElem && feedbackElem.value !== "" && feedbackElem.value !== curr_data.feedback)
    ) {
      row.classList.remove("unselectedrow");
      row.classList.add("selectedrow");
      overriden = true;
    }
    if (inputElem.value === "" || Number(inputElem.value) !== curr_data.points) {
      inputElem.parentElement.classList.add("quickgrademodified");
      inputElem.value = curr_data.points;
    }
    if (curr_data.feedback && feedbackElem && feedbackElem.value !== curr_data.feedback) {
      feedbackElem.parentElement.classList.add("quickgrademodified");
      feedbackElem.value = curr_data.feedback;
    }
  }
  return overriden;
}

/**
 *
 * @param {HTMLSpanElement} messageElem
 * @param {HTMLTableElement} gradingTable
 * @param {Event} event
 * @returns
 */
async function fileSelect(messageElem, gradingTable, event) {
  if (!event.target?.files[0]) {
    return;
  }
  const text = await event.target.files[0].text();
  const student_data = await JSON.parse(text);

  const didOverwrite = fillInData(gradingTable, student_data);
  messageElem.textContent =
    "Imported data, double check it's correct before saving.";
  if (didOverwrite) {
    messageElem.textContent += "\nThis overwrote some data, affected rows are highlighted.";
  }
  const missedGroups = Object.entries(student_data.data).reduce(
    (acc, [key, val]) => (val.found ? acc : [...acc, key]),
    []
  );
  if (missedGroups.length != 0) {
    messageElem.textContent +=
      "\nCould not find the following groups in the table: " + missedGroups.join(", ");
  }
  messageElem.hidden = false;
  inputElem.files = null;
  inputElem.value = "";
}

const gradingForms = document.getElementsByClassName("quickgradingform");
if (gradingForms.length !== 0) {
  const gradingTable = gradingForms[0].getElementsByTagName("table")[0];
  
  const messageElem = document.createElement("span");
  messageElem.hidden = true;
  messageElem.style.marginLeft = "1rem";
  const inputElem = document.createElement("input");
  inputElem.type = "file";
  inputElem.style.display = "none";
  inputElem.onchange = async (e) => {
    fileSelect(messageElem, gradingTable, e);
  };
  const inputButton = document.createElement("button");
  inputButton.classList.add("btn", "btn-primary");
  inputButton.innerText = "Import from file";
  inputButton.type = "button";
  inputButton.onclick = function () {
    inputElem.click();
  };
  
  const quickSaveButton = document.querySelector("[data-region=quick-grading-save]");
  quickSaveButton.parentElement.before(messageElem, inputElem, inputButton);
}
