# Moodle Grading Helper

This simple Chrome extension massively simplifies and speeds up the workflow of setting grades in Moodle.
Instead of manually entering every student's grade you can make a simple file containing grades (and comments) and
automatically import them into the web interface.

## Installation

To install the extension follow these steps:

1. Download the code in this repository into an arbitrary folder.

2. Navigate to `chrome://extensions` in a new Chrome tab.

3. Enable **Developer mode** using the toggle on the top right.

4. Click the **Load upacked** button in the top left and select the folder you downloaded the extension into in step 1.

The extension now is installed. Make sure it also is enabled by checking that it appears in the extension menu next to
the address bar.

### Site Access

This extension will only attempt to read and modify specific Moodle pages to limit data privacy concerns as much as
possible. By default, this is set to only the RWTH Aachen Moodle found at https://moodle.rwth-aachen.de/. You can change
this by modifying the `matches` entry of the `content_scripts` in your local copy of the `manifest.json` file.

## Usage

To use the extension simply navigate to the Moodle quick grading page of an assignment you want to edit. Note that
this extension works best if you've widened the display settings enough to display all students that you want grade on
a single page.

On the bottom of the page you should find an **Import from file** button above the usual **Save all quick grading
changes**. Click this and select a file containing the grades you want to import. The extension will now fill in
everyone's points and grading comments from this file. Double check that everything is filled in correctly and press
**Save all quick grading changes** to submit your grades to Moodle.

### File Formatting

The file you select needs to be a csv file where each nonempty line is formatted as

```
identifier, points [, comment]
```

- The first entry of each line is used to identify the student or group of students that this result is for.
- The second entry needs to be a numerical value that will be entered as the points achieved in this assignment.
- The third entry is optional and will be entered into the *Grading comment* field if present.

For example, a grading file might look like this:

```
1, 17
8, 57, well done!

```

Using the default settings this means that every student in group 1 will be awarded 17 points while every student in
group 8 gets 57 points and a "well done!" comment.

## Using Different Student Identifiers

You can also use things other than groups to match assignment results to students. The two settings for this extension
let you specify exactly how you want this to happen.
The first, the *Identifier column* declares what column of the quick grading table you want to use, and the second
*Identifier pattern* contains a regex used to extract each student's identifier from this column.
This regex needs to contain a single capture group. The value it captures will be matched against the first entry of
each row in your grading file.

Here are some example setups for common use cases. Note that the settings values need to match the exact verbiage you
see in your Moodle page and may be different depending on what display language you use and how the course is managed.

### Group Numbers

This is the default setup. Here the Moodle room is set up such that students are submitting assignments in groups that
are graded together. This means that we want our grading file to contains a single record for each group, not for each
student. We then need to set *Identifier column* to `Group` and use the *Identifier pattern* to extract the group's
number from the column's text field. E.g. if groups are named as `Tutorium {tutorialNum} Abgabegruppe {groupNum}`
a good pattern would be `Abgabegruppe (\d+)`.

### Student IDs

If we want to grade every student individually and identify them using their student ID we can easily set *Identifier
column* to `Registration number` and *Identifier pattern* to `(\d+)`.

### Student Names

Identifying students with their name is highly impractical since names are not unique. In addition to this, Moodle
formats names as `lastname, firstname`, which is not a valid field entry in a csv. Because of this using student names
as an identifier is currently not supported. Please use another method such as student IDs instead.

## Notes

Please always double-check that the data entered into the Moodle page is indeed correct before submitting potentially
incorrect grades.

If you find a bug in this extension, please do [open an issue](https://github.com/ImogenBits/moodle-helper/issues/new)
on this GitHub page.

This work is licensed using the MIT license.
