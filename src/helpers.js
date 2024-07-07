import Table from "cli-table";
import colors from "colors";
import prompt from "prompt";
import inquirer from "inquirer";
import chalk from "chalk";
import moment from "moment";
import path from "path";
import minimist from "minimist";
import { changeDate, gitIgnoreFiles } from "./git.js";
import chalkAnimation from "chalk-animation";
import inquirerFileTreeSelection from "inquirer-file-tree-selection-prompt";
import { logCommitDetailsTable } from "./log.js";

const argv = minimist(process.argv.slice(2));

export const makeCommitsChanges = async (results, path2) => {
  try {
    for (const commit of results) {
      try {
        console.log(
          "Changing the date of the commit ",
          chalk.bold.italic.magenta(commit.message)
        );
        let str = "Please wait...";
        const rainbow = chalkAnimation.rainbow(str).start();

        // Add a new dot every second
        setInterval(() => {
          rainbow.replace((str += "."));
        }, 1000);
        await changeDate(
          path2,
          commit.hash,
          commit.actualTime, // Assuming you want to change the actualTime
          commit.actualTime // Using the same time for both author and committer date
        );
        console.log(
          chalk.greenBright.bold.italic(
            `Changed date for commit ${commit.message} successfully !`
          )
        );
      } catch (err) {
        console.error(
          `Error changing date for commit `,
          chalk.red.bold(commit.message)
        );
        console.log(chalk.bold.blue.italic(err));
        break; // Break the loop if an error occurs
      }
    }
  } catch (err) {
    console.error("Error during commit changes:", err);
  }
};
export const logCommits = (commits) => {
  const table = new Table({
    head: ["No.", "Author", "Subject", "Date"],
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "",
      "bottom-mid": "",
      "bottom-left": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "",
      "right-mid": "",
      middle: " ",
    },
  });

  table.push(
    ...commits.map((commit, index) => [
      index + 1,
      `${commit.name}`,
      commit.subject.slice(0, 50),
      commit.date,
    ])
  );

  console.log(table.toString());
};

export const logError = (err) => {
  if (argv.dev) {
    const table = new Table();
    table.push([err.stack]);
    console.log(table.toString());
  } else {
    console.log(colors.red(err.message));
  }
};

export const ask = (question) =>
  new Promise((resolve, reject) => {
    console.log("");
    prompt.get([].concat(question), (err, output) => {
      if (err) {
        return reject(err);
      }
      console.log("");
      return resolve(output);
    });
  });

export const anotherOne = () =>
  ask({
    name: "another",
    description: "Choose another commit from the same list (yes/no)?",
    default: "no",
  }).then(
    ({ another }) =>
      another.toLowerCase() === "y" || another.toLowerCase() === "yes"
  );

export async function askForChanges(results) {
  logCommitDetailsTable(results); // Display commits with index for user reference

  const { changeCommit } = await inquirer.prompt({
    name: "changeCommit",
    type: "confirm",
    message: chalk.yellowBright("Would you like to change a commit date?"),
  });

  if (changeCommit) {
    const { index } = await inquirer.prompt({
      name: "index",
      type: "number",
      message: chalk.yellowBright(
        "Enter the index number of the commit you want to change:"
      ),
      validate: (input) => {
        // Check if the input is a number and within the range of the results array
        const pass = input > 0 && input <= results.length;
        if (pass) {
          return true;
        }
        return chalk.redBright("Please enter a valid index number!");
      },
    });

    const { newDate } = await inquirer.prompt({
      name: "newDate",
      type: "input",
      message:
        "Enter the new date for the commit [format: ddd MMM DD HH:mm:ss YYYY ZZ]:",
      validate: (input) => {
        if (moment(input, "ddd MMM DD HH:mm:ss YYYY ZZ", true).isValid()) {
          return true;
        }
        return "Please enter the date in the correct format: ddd MMM DD HH:mm:ss YYYY ZZ";
      },
    });

    // Update the actualTime of the commit at the given index
    results[index - 1].actualTime = newDate;

    // Recur to ask again if further changes are desired
    return askForChanges(results);
  } else {
    return results; // No more changes, return the updated results
  }
}

export const gitIgnoreFilesAndAskDuration = async (
  Files,
  durationinInt,
  startDate
) => {
  const path2 = argv.path || process.cwd();
  gitIgnoreFiles(path2, Files)
    .then((results) => {
      inquirer
        .prompt({
          type: "input",
          name: "duration",
          message:
            chalk.yellowBright(
              "What is the minimum commit time range that you want to assign to a commit?"
            ) + " [ex. 02:45:44 ]",
          prefix: " 🌎 ",
          transformer: (s) => chalk.bold.greenBright(s),
          validate: (input) => {
            const format = "HH:mm:ss"; // Define the expected format
            if (moment(input, format, true).isValid()) {
              if (!checkIfTimeEnough(input, results, durationinInt)) {
                let noofCommits = results.length;
                return `The minimum time required should be less than ${Math.floor(
                  durationinInt / noofCommits
                )} seconds.`;
              } else {
                return true;
              }
            } else {
              return `Please enter the time in the correct format: ${format}`;
            }
          },
        })
        .then(async (result) => {
          const mintime = moment(result.duration, "HH:mm:ss");
          const timeString = result.duration; // "HH:mm:ss"
          const parts = timeString.split(":");
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          const seconds = parseInt(parts[2], 10);

          const minSec = Math.floor(hours * 60 * 60 + minutes * 60 + seconds);

          assignTimePeriods(results, durationinInt, minSec);

          calculateNewCommitDates(results, startDate);

          askForChanges(results).then((results) => {
            makeCommitsChanges(results, path2).then((final) => {
              console.log(chalk.magentaBright("Sayonara !!!"));
              return process.exit();
            });
          });
        });
    })
    .catch((err) => {
      console.error("Error processing commits:", err);
    });
};

export const calculateNewCommitDates = (results, startDate) => {
  let currentDate = startDate.clone();

  results.forEach((commit) => {
    const timePeriodMinutes = parseInt(commit.timePeriodAssigned, 10);

    if (isNaN(timePeriodMinutes)) {
      console.error(
        `Invalid time period for commit ${commit.hash}, setting to 0.`
      );
      commit.actualTime = currentDate.format("ddd MMM DD HH:mm:ss YYYY ZZ");
      return;
    }

    currentDate.add(timePeriodMinutes, "seconds");

    commit.actualTime = currentDate.format("ddd MMM DD HH:mm:ss YYYY ZZ");
  });

  return results;
};

export const assignTimePeriods = (
  results,
  totalTimeMinutes,
  minimumTimeMinutes
) => {
  let remainingTime = totalTimeMinutes - results.length * minimumTimeMinutes;
  const totalEffortPoints = results.reduce(
    (sum, commit) => sum + commit.effortPercentage,
    0
  );

  if (remainingTime < 0) {
    console.error(
      "Error: Not enough total time to allocate minimum time to each commit."
    );
    remainingTime = 0;
  }

  results.forEach((commit, index) => {
    if (commit.effortPercentage > 0) {
      let effortTime =
        (commit.effortPercentage / totalEffortPoints) * remainingTime;
      commit.timePeriodAssigned = Math.round(minimumTimeMinutes + effortTime);
    } else {
      const offset = 0.2 * minimumTimeMinutes; // Random offset up to 20% of minimumTimeMinutes
      commit.timePeriodAssigned =
        minimumTimeMinutes + Math.floor(Math.random() * offset);
    }
    commit.timePeriodAssigned = Math.max(
      commit.timePeriodAssigned,
      minimumTimeMinutes
    ); // Ensure not below minimum
  });

  normalizeTimeAssignments(results, totalTimeMinutes, minimumTimeMinutes);
  return results;
};

const normalizeTimeAssignments = (
  results,
  totalTimeMinutes,
  minimumTimeMinutes
) => {
  let assignedTotal = results.reduce(
    (acc, commit) => acc + commit.timePeriodAssigned,
    0
  );
  let excessTime = assignedTotal - totalTimeMinutes;
  if (excessTime > 0) {
    results.sort((a, b) => b.timePeriodAssigned - a.timePeriodAssigned);

    for (let commit of results) {
      if (excessTime <= 0) break;

      let possibleReduction = commit.timePeriodAssigned - minimumTimeMinutes;
      if (possibleReduction > 0) {
        let reductionAmount = Math.min(excessTime, possibleReduction);
        commit.timePeriodAssigned -= reductionAmount;
        excessTime -= reductionAmount;
      }
    }

    if (excessTime > 0) {
      console.warn(
        "Cannot reduce further without violating minimum time constraints."
      );
    }
  }
  console.log(
    chalk.magenta(
      "Normalization complete. Total time is now adjusted to fit within the limit."
    )
  );
};

export const AskIgnore = async (Files, durationinInt, startDate) => {
  const path2 = argv.path || process.cwd();

  inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
  inquirer
    .prompt([
      {
        root: path2,
        type: "file-tree-selection",
        name: "file",
      },
    ])
    .then((answers) => {
      const relativeFilePath = path.relative(path2, answers.file);
      Files.push(relativeFilePath);
      inquirer
        .prompt({
          type: "confirm",
          name: "another",
          message: chalk.yellowBright(
            "Do you want to add another file/folder to be ignored"
          ),
          default: false,
          prefix: " ? ",
        })
        .then((ans) => {
          if (ans.another) {
            console.log(chalk.magentaBright("Adding another file..."));
            AskIgnore(Files, durationinInt, startDate);
          } else {
            console.log(chalk.redBright("No more files to add."));
            gitIgnoreFiles(path2, Files)
              .then((results) => {
                inquirer
                  .prompt({
                    type: "input",
                    name: "duration",
                    message:
                      chalk.yellowBright(
                        "What is the minimum commit time range that you want to assign to a commit?"
                      ) + " [ex. 02:45:44 ]",
                    prefix: " 🌎 ",
                    transformer: (s) => chalk.bold.greenBright(s),
                    validate: (input) => {
                      const format = "HH:mm:ss";
                      if (moment(input, format, true).isValid()) {
                        if (!checkIfTimeEnough(input, results, durationinInt)) {
                          let noofCommits = results.length;
                          return `The minimum time required should be less than ${Math.floor(
                            durationinInt / noofCommits
                          )} seconds.`;
                        } else {
                          return true;
                        }
                      } else {
                        return `Please enter the time in the correct format: ${format}`;
                      }
                    },
                  })
                  .then(async (result) => {
                    const mintime = moment(result.duration, "HH:mm:ss");
                    const timeString = result.duration;
                    const parts = timeString.split(":");
                    const hours = parseInt(parts[0], 10);
                    const minutes = parseInt(parts[1], 10);
                    const seconds = parseInt(parts[2], 10);

                    const minSec = Math.floor(
                      hours * 60 * 60 + minutes * 60 + seconds
                    );

                    assignTimePeriods(results, durationinInt, minSec);

                    calculateNewCommitDates(results, startDate);

                    askForChanges(results).then((results) => {
                      makeCommitsChanges(results, path2).then((final) => {
                        return console.log(
                          chalk.magenta.italic.bold("Sayonaara Senpai !!!")
                        );
                      });
                    });
                  });
              })
              .catch((err) => {
                console.error("Error processing commits:", err);
              });
          }
        });
    });
};

export const checkIfTimeEnough = (inputTime, results, durationinInt) => {
  const parts = inputTime.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const minsecs = hours * 3600 + minutes * 60 + seconds;
  const noofCommits = results.length;
  const totalInputSeconds = noofCommits * minsecs;
  const minimumRequiredSeconds = durationinInt;

  if (totalInputSeconds >= minimumRequiredSeconds) {
    return false;
  } else {
    return true;
  }
};
