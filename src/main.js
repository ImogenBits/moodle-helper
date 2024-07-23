/**
 *
 * @param {HTMLTableRowElement[]} table
 * @param {{
 *   identifier_column: string;
 *   data: {
 *     [key: string]: {
 *       points: Number | null;
 *       feedback?: string;
 *     }
 *   }
 * }} student_data
 * @returns
 */
function fillInGrades(table, student_data) {
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
    if (feedbackElem && feedbackElem.value !== curr_data.feedback) {
      feedbackElem.parentElement.classList.add("quickgrademodified");
      feedbackElem.value = curr_data.feedback;
    }
  }
  return overriden;
}

/**
 *
 * @param {Event} event
 * @returns
 */
async function fileSelect(event) {
  if (!event.target?.files || event.target.files[0] === undefined) {
    return;
  }
  const text = await files[0].text();
  const student_data = await JSON.parse(text);

  const didOverwrite = fillInMarks(gradingTable, student_data);
  messageElem.textContent =
    "Imported data, double check it's correct and submit with the button below.";
  if (didOverwrite) {
    messageElem.textContent += " This overwrote some data, affected rows are highlighted.";
  }
  messageElem.hidden = false;
  inputElem.files = null;
  inputElem.value = "";
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
  inputElem.onchange = fileSelect;
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
