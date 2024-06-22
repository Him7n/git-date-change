import minimist from "minimist";
import colors from "colors";
import prompt from "prompt";
import Table from "cli-table";
import {
  getCommits,
  changeDate,
  CommitLOCcount,
  gitIgnorFiles,
  gitIgnoreFiles,
} from "./git.js";
import chalkAnimation from "chalk-animation";
import inquirer from "inquirer";
import chalk from "chalk";
import DatePrompt from "inquirer-date-prompt";
import moment from "moment";
import inquirerFileTreeSelection from "inquirer-file-tree-selection-prompt";
const argv = minimist(process.argv.slice(2));
import path from "path";
import * as url from "node:url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const welcome = async () => {
  const rainbow =
    chalkAnimation.rainbow(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⢸⠉⣹⠋⠉⢉⡟⢩⢋⠋⣽⡻⠭⢽⢉⠯⠭⠭⠭⢽⡍⢹⡍⠙⣯⠉⠉⠉⠉⠉⣿⢫⠉⠉⠉⢉⡟⠉⢿⢹⠉⢉⣉⢿⡝⡉⢩⢿⣻⢍⠉⠉⠩⢹⣟⡏⠉⠹⡉⢻⡍⡇
  ⢸⢠⢹⠀⠀⢸⠁⣼⠀⣼⡝⠀⠀⢸⠘⠀⠀⠀⠀⠈⢿⠀⡟⡄⠹⣣⠀⠀⠐⠀⢸⡘⡄⣤⠀⡼⠁⠀⢺⡘⠉⠀⠀⠀⠫⣪⣌⡌⢳⡻⣦⠀⠀⢃⡽⡼⡀⠀⢣⢸⠸⡇
  ⢸⡸⢸⠀⠀⣿⠀⣇⢠⡿⠀⠀⠀⠸⡇⠀⠀⠀⠀⠀⠘⢇⠸⠘⡀⠻⣇⠀⠀⠄⠀⡇⢣⢛⠀⡇⠀⠀⣸⠇⠀⠀⠀⠀⠀⠘⠄⢻⡀⠻⣻⣧⠀⠀⠃⢧⡇⠀⢸⢸⡇⡇
  ⢸⡇⢸⣠⠀⣿⢠⣿⡾⠁⠀⢀⡀⠤⢇⣀⣐⣀⠀⠤⢀⠈⠢⡡⡈⢦⡙⣷⡀⠀⠀⢿⠈⢻⣡⠁⠀⢀⠏⠀⠀⠀⢀⠀⠄⣀⣐⣀⣙⠢⡌⣻⣷⡀⢹⢸⡅⠀⢸⠸⡇⡇
  ⢸⡇⢸⣟⠀⢿⢸⡿⠀⣀⣶⣷⣾⡿⠿⣿⣿⣿⣿⣿⣶⣬⡀⠐⠰⣄⠙⠪⣻⣦⡀⠘⣧⠀⠙⠄⠀⠀⠀⠀⠀⣨⣴⣾⣿⠿⣿⣿⣿⣿⣿⣶⣯⣿⣼⢼⡇⠀⢸⡇⡇⠇
  ⢸⢧⠀⣿⡅⢸⣼⡷⣾⣿⡟⠋⣿⠓⢲⣿⣿⣿⡟⠙⣿⠛⢯⡳⡀⠈⠓⠄⡈⠚⠿⣧⣌⢧⠀⠀⠀⠀⠀⣠⣺⠟⢫⡿⠓⢺⣿⣿⣿⠏⠙⣏⠛⣿⣿⣾⡇⢀⡿⢠⠀⡇
  ⢸⢸⠀⢹⣷⡀⢿⡁⠀⠻⣇⠀⣇⠀⠘⣿⣿⡿⠁⠐⣉⡀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠉⠓⠳⠄⠀⠀⠀⠀⠋⠀⠘⡇⠀⠸⣿⣿⠟⠀⢈⣉⢠⡿⠁⣼⠁⣼⠃⣼⠀⡇
  ⢸⠸⣀⠈⣯⢳⡘⣇⠀⠀⠈⡂⣜⣆⡀⠀⠀⢀⣀⡴⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢽⣆⣀⠀⠀⠀⣀⣜⠕⡊⠀⣸⠇⣼⡟⢠⠏⠀⡇
  ⢸⠀⡟⠀⢸⡆⢹⡜⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠋⣾⡏⡇⡎⡇⠀⡇
  ⢸⠀⢃⡆⠀⢿⡄⠑⢽⣄⠀⠀⠀⢀⠂⠠⢁⠈⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠄⡐⢀⠂⠀⠀⣠⣮⡟⢹⣯⣸⣱⠁⠀⡇
  ⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁⠀
  
                          Git Date Change `);

  // rainbow.start();
  rainbow.start();
  // setInterval(() => {
  // }, 0);
  // setTimeout(() => {
  //   rainbow.start(); // Animation stops
  // }, 0);
  // setTimeout(() => {
  //   rainbow.stop(); // Animation stops
  // }, 5000);
  // await sleep(100); // Small delay to allow the animation to start
  console.log(`
   
If you don't see formatted output, try to increase width of the terminal to have more space.
`);

  const question = [
    {
      type: "list",
      name: "Method",
      message: "Which method do you want to execute?",
      choices: ["Manual", "Automatic [From Time Range]"],
      filter(val) {
        if (val.toLowerCase() === "manual") {
          return true;
        } else {
          return false;
        }
      },
    },
  ];
  inquirer.prompt(question).then((answers) => {
    if (!answers.Method) {
      // chalk.BackgroundColor("Here we go");
      const auto = chalkAnimation.rainbow("Here we go Ill remove this line");
      setTimeout(() => {
        auto.stop();
      }, 1000);

      TimeRange();
    } else {
      try {
        start({
          count: argv.count || 5,
          hash: argv.hash,
        }).catch((err) => {
          logError(err);
          chalkAnimation.neon("Sayonara...");
          // ill have to move to the inqurer here CRTL + C error
          return process.exit(0);
        });
      } catch (err) {
        console.log(err);
        chalkAnimation.rainbow("Sayonara...");
      }
    }
  });
};
async function getTimestamp() {
  const { timestamp } = await inquirer.prompt({
    type: "date",
    name: "timestamp",
    message: "When will the world end?",
    prefix: " 🌎 ",

    filter: (d) => Math.floor(d.getTime() / 1000),
    validate: (t) => t * 1000 > Date.now() + 86400000 || "God I hope not!",
    transformer: (s) => chalk.bold.red(s),
    locale: "en-US",
    format: { month: "short", hour: undefined, minute: undefined },
    clearable: true,
  });
  return timestamp;
}
const ask = (question) =>
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

const logCommits = (commits) => {
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

const logError = (err) => {
  if (argv.dev) {
    const table = new Table();
    table.push([err.stack]);
    console.log(table.toString());
  } else {
    console.log(colors.red(err.message));
  }
};

const anotherOne = () =>
  ask({
    name: "another",
    description: "Choose another commit from the same list (yes/no)?",
    default: "no",
  }).then(
    ({ another }) =>
      another.toLowerCase() === "y" || another.toLowerCase() === "yes"
  );

const start = async (filter) => {
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

welcome();

async function TimeRange() {
  let startDate;
  let endDate;

  inquirer
    .prompt({
      type: "input",
      name: "startDate",
      message: "Enter StartDate [ex. Thu Jun 20 17:45:44 2024 +0530]",
      prefix: " 🌎 ",
      transformer: (s) => chalk.bold.greenBright(s),
      validate: (input) => {
        const format = "ddd MMM DD HH:mm:ss YYYY ZZ"; // Define the expected format
        if (moment(input, format, true).isValid()) {
          return true;
        } else {
          return `Please enter the date in the correct format: ${format}`;
        }
      },
    })
    .then((ans) => {
      startDate = moment(ans.startDate, "ddd MMM DD HH:mm:ss YYYY ZZ");

      inquirer
        .prompt({
          type: "input",
          name: "endDate",
          message: "Enter EndDate [ex. Thu Jun 20 17:45:44 2024 +0530]",
          prefix: " 🌎 ",
          transformer: (s) => chalk.bold.greenBright(s),
          validate: (input) => {
            const format = "ddd MMM DD HH:mm:ss YYYY ZZ"; // Define the expected format
            if (moment(input, format, true).isValid()) {
              return true;
            } else {
              return `Please enter the date in the correct format: ${format}`;
            }
          },
        })
        .then(async (ans) => {
          endDate = moment(ans.endDate, "ddd MMM DD HH:mm:ss YYYY ZZ");
          const duration = endDate.diff(startDate, "minutes");
          console.log(endDate.add(duration, "minutes"));
          console.log(
            `Added the duration in the EndDate and Displayed it in Date Format ${endDate}`
          );
          chalkAnimation.neon(endDate.toString()).start();

          console.log(
            `The difference between the two dates is ${duration} minutes.`
          );
          console.log("Which files/folders commits should be excuded ?");
          const Files = [];
          await AskIgnore(Files);

          // there is  a problem with the closure /async so Ill continue at the calling funcitnon
        });
    });
}
const AskIgnore = async (Files) => {
  const path2 = argv.path || process.cwd();

  inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
  inquirer
    .prompt([
      {
        root: path2,
        type: "file-tree-selection",
        name: "file",

        // multiple: true,
      },
    ])
    .then((answers) => {
      console.log(JSON.stringify(answers));
      console.log(answers);
      // here remove the path from the answers.Files path
      // console.log(JSON.stringify(answers.files));
      const relativeFilePath = path.relative(path2, answers.file);
      console.log(relativeFilePath);
      // path is a the path fo the repository and the answers.file is the absolute path
      Files.push(relativeFilePath);
      console.log(Files);
      inquirer
        .prompt({
          type: "confirm",
          name: "another",
          message: "Do you want to add another file/folder to be ignored?",
          default: false,
          prefix: " 🌎 ",
          // transformer: (s) => chalk.bold.bgRedBright(s),
        })
        .then((ans) => {
          console.log(ans.another);

          // Check the user's response and react accordingly
          if (ans.another) {
            console.log("Adding another file...");
            AskIgnore(Files); // Call the function again to add more files
          } else {
            console.log("No more files to add.");
            console.log("Final list of files/folders to be ignored:", Files);
            // console.log(__dirname);
            gitIgnoreFiles(path2, Files)
              .then((results) => {
                console.log("Filtered Commit Insertions:", results);
              })
              .catch((err) => {
                console.error("Error processing commits:", err);
              });
          }
        });
    });
};

function askToAddAnother(Files) {
  // Make sure to pass Files here
  inquirer
    .prompt({
      type: "confirm",
      name: "another",
      message: "Do you want to add another file/folder to be ignored?",
      default: false,
      prefix: " 🌎 ",
      transformer: (s) => chalk.bold.greenBright(s),
    })
    .then((ans) => {
      console.log(ans);

      // Check the user's response and react accordingly
      if (ans.another) {
        console.log("Adding another file...");
        AskIgnore(Files); // Call the function again to add more files, passing the Files array
      } else {
        console.log("No more files to add.");
        console.log("Final list of files/folders to be ignored:", Files);
        // Continue with the rest of your program
      }
    });
}
