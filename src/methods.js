import { changeDate, getCommits } from "./git.js";
import chalkAnimation from "chalk-animation";
import colors from "colors";
import inquirer from "inquirer";
import Table from "cli-table";
import chalk from "chalk";
import moment from "moment";
import path from "path";
import minimist from "minimist";
import {
  logCommits,
  logError,
  ask,
  anotherOne,
  askForChanges,
  calculateNewCommitDates,
  assignTimePeriods,
  gitIgnoreFilesAndAskDuration,
  AskIgnore,
  checkIfTimeEnough,
} from "./helpers.js";

const argv = minimist(process.argv.slice(2));

export const TimeRange = async () => {
  let startDate;
  let endDate;

  inquirer
    .prompt({
      type: "input",
      name: "startDate",
      message:
        chalk.yellowBright("Enter StartDate") +
        " [ex. Thu Jun 20 17:45:44 2024 +0530]",
      prefix: " 🌎 ",
      transformer: (s) => chalk.bold.greenBright(s),
      validate: (input) => {
        const format = "ddd MMM DD HH:mm:ss YYYY ZZ"; // Define the expected format
        if (moment(input, format, true).isValid()) {
          return true;
        } else {
          return chalk.redBright(
            `Please enter the date in the correct format: ${format}`
          );
        }
      },
    })
    .then((ans) => {
      startDate = moment(ans.startDate, "ddd MMM DD HH:mm:ss YYYY ZZ");

      inquirer
        .prompt({
          type: "input",
          name: "endDate",
          message:
            chalk.yellowBright("Enter EndDate") +
            " [ex. Thu Jun 20 17:45:44 2024 +0530]",
          prefix: " 🌎 ",
          transformer: (s) => chalk.bold.greenBright(s),
          validate: (input) => {
            const format = "ddd MMM DD HH:mm:ss YYYY ZZ"; // Define the expected format
            if (moment(input, format, true).isValid()) {
              return true;
            } else {
              return chalk.redBright(
                `Please enter the date in the correct format: ${format}`
              );
            }
          },
        })
        .then(async (ans) => {
          endDate = moment(ans.endDate, "ddd MMM DD HH:mm:ss YYYY ZZ");
          const duration = endDate.diff(startDate, "seconds");
          const durationinInt = parseInt(duration);

          inquirer
            .prompt({
              type: "confirm",
              name: "another",
              message: chalk.yellowBright(
                "Do you want to ignore any File/Folder changes?"
              ),
              default: false,
              prefix: " ? ",
            })
            .then(async (ans) => {
              if (ans.another) {
                const Files = [];
                const result = await AskIgnore(Files, durationinInt, startDate);
              } else {
                const Files = [];
                gitIgnoreFilesAndAskDuration(Files, durationinInt, startDate);
              }
            });
        });
    });
};

export const start = async (filter) => {
  let commits;
  let commit;

  const dirPath = argv.path || process.cwd();

  return getCommits(dirPath, filter)
    .then((_commits) => {
      commits = _commits;
      return logCommits(commits);
    })
    .then(() =>
      ask([
        {
          name: "number",
          description: "Enter commit number to edit (1, 2, ..etc)",
          pattern: /[0-9]+/,
          required: true,
        },
        {
          name: "date",
          description: "Enter the new date",
          required: true,
        },
      ])
    )
    .then(({ number, date }) => {
      if (number > commits.length) {
        throw new Error(`Number must be between 1 and ${commits.length}`);
      }
      commit = commits[number - 1];
      chalkAnimation.rainbow("Please wait...").start();
      return changeDate(dirPath, commit.hash, date, date);
    })
    .then(() => {
      console.log(
        colors.green(`Date changed successfully for commit [${commit.subject}]`)
      );
    })
    .then(anotherOne)
    .then((yes) => yes && start(filter))
    .catch((err) => {
      logError(err);
      return anotherOne().then((yes) => yes && start(filter));
    });
};
