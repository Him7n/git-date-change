#!/usr/bin/env node
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

//here goes nothing
import * as url from "node:url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeTable = () => {
  var table = new Table({
    head: ["TH 1 label", "TH 2 label"],
    // chars: {
    //   top: "",
    //   "top-mid": "",
    //   "top-left": "",
    //   "top-right": "",
    //   bottom: "",
    //   "bottom-mid": "",
    //   "bottom-left": "",
    //   "bottom-right": "",
    //   left: "",
    //   "left-mid": "",
    //   mid: "",
    //   "mid-mid": "",
    //   right: "",
    //   "right-mid": "",
    //   middle: " ",
    // },
    // colWidths: [100, 200],
  });

  // table is an Array, so you can `push`, `unshift`, `splice` and friends
  table.push(["First value", "Second value"], ["First value", "Second value"]);

  console.log(table.toString());
};

const welcome = async () => {
  const rainbow = chalkAnimation.rainbow(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                     ⠀⠀⠀⠀⠀⢰⣶⣶⣦⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                     ⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⣶⣦⠀⠀⠀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠘⢯⣗⣲⣤⣠⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠉⠀⠀⠀⠀⠀⢀⡤⠖⠚⠉⠉⠉⠉⠙⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⣠⣤⣶⣶⣶⡆⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⠛⠀⠀⠀⢀⡀⠀⠀⠐⠚⠁⣀⠀⠀⠀⣴⠚⠉⠀⠀⠀⠉⠻⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀
                    ⠀⠀⠀⠀⠀⣤⣾⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⡿⠛⠁⠀⠀⢀⡴⠋⠀⠀⠀⢀⣠⠚⠁⢀⣴⠖⠁⠀⢰⠀⢰⡀⠀⠀⠈⠻⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀
                    ⠀⠀⠀⢠⣾⣿⣿⣿⣿⣿⣿⡟⠁⠀⠀⠀⠀⠀⠀⢸⣿⣿⡟⠑⠀⠀⠀⣠⠟⠀⠀⠀⠀⣠⠞⠁⠀⣠⠞⠁⠀⠀⢠⡟⠀⢸⣧⠀⠀⢀⠀⠈⢿⣿⣿⠀⠀⠀⠀⠀⠀
                    ⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⠏⠀⠀⠀⠀⣰⠋⠀⠀⠀⢠⡾⠃⠀⢀⣴⠋⠀⠀⠀⣴⢿⠃⠀⡎⠹⣧⠀⠈⣷⡀⠈⣿⡇⠀⠀⠀⠀⠀⠀
                    ⠀⢰⣿⣿⣿⣿⣿⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⣰⣶⠇⠀⠀⢀⡇⣰⠇⡔⠀⠀⣰⡟⠁⠀⣠⣾⠃⠀⠀⢀⡞⢁⡟⠀⣼⠁⠀⢻⡦⠄⠸⣷⠀⢹⣸⠀⠀⠀⠀⠀⠀
                    ⠀⣾⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡏⠀⠀⠀⣼⢁⣏⡞⠀⢀⣼⠏⠀⣴⡿⢣⠏⠀⢀⣾⠋⠀⡼⠁⣼⠃⠀⠀⢸⣷⢤⣤⣿⠀⠈⣿⠀⠀⠀⠀⠀⠀
                    ⢰⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣿⣿⠀⠐⠀⢰⠇⡾⠺⣄⣰⠋⡏⣠⣾⡟⠁⡞⠀⣰⣿⠃⠀⣰⢃⡼⠁⠀⠀⠀⢸⢳⡶⠒⣿⠀⠀⣿⠀⠀⠀⠀⠀⠀
                    ⢸⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠶⠋⣾⡈⢠⣄⣀⣸⣰⡇⢀⡼⠙⢾⣴⣫⠏⠀⢠⠇⡴⠁⠃⠀⣰⣧⠞⠁⠀⠀⠀⠀⢸⠀⡇⠀⡇⠀⢀⢸⡀⠀⠀⠀⠀⠀
                    ⢸⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⡇⢸⣿⣿⠛⣿⣿⠿⢷⣶⣿⣶⣿⣭⣶⣾⣿⣁⣀⡀⣼⣽⡧⠶⠒⠉⠉⠉⠀⡎⢰⡇⢸⠁⠀⡞⢸⠀⠀⠀⠀⠀⠀
                    ⠸⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⢸⣿⣿⡀⢹⡟⢀⠀⣿⡏⢸⣿⣿⠏⠉⣿⣿⣿⡿⢿⣿⡿⠿⣶⣶⣶⣶⣾⣥⣼⣇⣞⣆⣸⠁⣿⠀⠀⠀⠀⠀⠀
                    ⠀⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⣴⢏⣇⣾⣿⣿⡇⠸⢀⣿⠀⡏⢀⣿⣿⠏⣰⡇⢸⣿⣿⠁⢸⣿⠁⣷⣶⣤⣾⡟⠉⣿⣿⡟⢹⣿⡏⣼⣿⠀⠀⠀⠀⠀⠀
                    ⠀⢸⣿⣿⣿⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀⡼⡃⢸⣿⣿⣿⣿⣇⣀⣼⣿⡇⠀⣼⣿⠋⢀⣉⣉⠀⢿⣿⠀⣸⡟⠀⣉⣉⣹⣿⡇⢰⣿⣿⠃⢸⣿⡿⠋⣿⡆⠀⠀⠀⠀⠀
                    ⠀⠀⠻⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⢠⠞⣹⢡⣿⢻⡏⢹⢿⣿⣟⠛⠻⠿⠿⠿⠷⣶⣿⣿⣿⣦⣸⣯⣀⣿⡇⢀⣿⣿⣿⣿⡇⠸⣿⡿⠀⣾⣿⠁⢰⣿⣷⡀⠀⠀⠀⠀
                    ⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣶⣴⠏⢀⣧⡿⣿⠸⣿⠸⣎⢻⣿⡻⣄⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠛⠛⠻⠿⠿⠿⢿⣿⣶⣤⣤⣾⣿⣿⢀⣿⠉⢧⡻⠄⠀⠀⠀
                    ⠀⠀⠀⠀⠈⠙⢿⣿⣿⣿⣿⣿⣿⠀⣾⡟⠀⣿⠀⢻⡇⢹⣆⠹⣧⠈⠳⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡤⢺⣿⡟⠉⣹⣿⣾⢿⡄⠈⢳⡀⠀⠀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠉⠻⢿⣿⣿⡏⡀⣿⠁⠀⠸⣧⠈⢷⢸⢻⣷⣬⣷⣀⠀⠀⠀⠀⢰⣶⣾⣯⣽⣳⣦⣤⠀⠀⠀⠀⠀⠀⣠⡿⢋⣠⣾⡷⢛⢻⣿⣇⡇⢸⣿⠀⠀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢇⠙⠾⣆⠀⠀⠘⢷⣿⡟⢀⡙⢧⣿⣿⣛⠲⠄⠀⠸⣿⡏⠀⠀⢙⣿⡇⠀⠀⠦⠤⢤⣶⣯⣾⢟⣫⡿⠁⣎⡾⠈⣿⢧⡞⢸⠇⠀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠴⠚⢧⡀⠈⠓⠄⢀⡴⠋⠙⠷⣶⡶⠾⣿⣿⣿⣃⡀⠀⠉⢅⣀⣀⣘⡿⠁⠀⠀⣀⣴⣿⡿⠟⣻⡿⠋⢀⣾⣟⡁⢠⣿⠟⣠⡟⠀⠀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡏⠀⠀⠀⠉⠓⠶⠦⣤⣀⡠⢤⣀⣈⣽⡳⠯⣿⣿⣿⣿⣾⣄⡀⠀⠀⢀⣀⣤⣶⣿⡿⢟⡥⠴⠾⢥⣤⠞⣻⠋⠀⠙⣿⡵⢟⡁⠻⢤⡀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⢹⠀⠀⢠⠀⠀⠀⠀⣀⣀⡉⠛⡿⠋⠀⣿⣄⢸⡿⣇⠹⣿⣿⣿⣿⣿⣿⣿⣿⠟⠉⠉⣙⣇⠀⠀⠀⠙⡾⠁⠀⠀⣠⠋⠉⢳⡙⠲⣄⠁⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠈⡆⠀⠘⡇⠀⠀⢸⡁⠀⠙⣾⠁⠀⢸⠉⠻⣆⡇⢹⣀⠈⠙⢿⣿⣿⣿⢿⡏⠀⣠⠞⣡⢜⣳⡄⠀⢰⠁⠀⣠⠞⠁⠀⣠⠞⠉⡇⠈⢳⡀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⠀⠸⡄⠀⢹⡀⣤⠒⢧⡀⠀⠈⣇⠀⢸⡀⠀⢹⠇⣼⠉⢙⠦⢄⣈⡉⠀⠼⡄⣼⠃⣴⡟⠋⢹⠇⠀⣼⠀⢠⠇⠀⣠⠾⠁⠀⠀⠛⠀⠀⣷
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠼⡆⠀⠱⡄⠀⡧⢿⡀⠀⠳⡄⠀⠸⡦⠀⢳⣴⣫⠾⠛⣷⣸⡀⠀⢂⠀⠀⠀⣻⣿⣰⠋⠀⠀⣿⠀⠀⠹⠤⢾⣀⡾⠁⢀⡠⠀⠀⠀⠀⠀⡿
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡅⠀⠙⣄⠀⠙⢦⡀⣿⠀⠀⢹⡀⣀⣀⣼⡍⠻⠿⠙⢶⠞⠛⠉⣻⣿⠀⠀⠀⠘⢦⡀⠀⠀⠀⠈⠛⠒⠻⠄⠀⠀⠀⠀⠀⠀
                    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠳⠆⠈⠳⠤⠨⠗⠛⠀⠀⠀⠏⠻⠇⠼⠁⠂⠀⠀⠀⠃⠀⠸⠋⠿⠷⠄⠀⠰⠃⠙⠲⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀


██████╗ ██╗████████╗    ██████╗  █████╗ ████████╗███████╗     ██████╗██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ ███████╗
██╔════╝ ██║╚══██╔══╝    ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝    ██╔════╝██║  ██║██╔══██╗████╗  ██║██╔════╝ ██╔════╝
██║  ███╗██║   ██║       ██║  ██║███████║   ██║   █████╗      ██║     ███████║███████║██╔██╗ ██║██║  ███╗█████╗  
██║   ██║██║   ██║       ██║  ██║██╔══██║   ██║   ██╔══╝      ██║     ██╔══██║██╔══██║██║╚██╗██║██║   ██║██╔══╝  
╚██████╔╝██║   ██║       ██████╔╝██║  ██║   ██║   ███████╗    ╚██████╗██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗
 ╚═════╝ ╚═╝   ╚═╝       ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝
`);

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
  // makeTable();
  const question = [
    {
      type: "list",
      name: "Method",
      message: chalk.redBright("Which method do you want to execute?"),
      choices: [
        "Manual",
        "Automatic : [Time Range LOC]",
        "Automatic-AI :[Time Range]",
      ],
      filter(val) {
        if (val.toLowerCase() === "manual") {
          return 1;
        } else if (val.toLowerCase() === "automatic : [time range loc]") {
          return 2;
        } else {
          return console.log(chalk.red.bold.italic("Feature Comming Soon"));
        }
      },
    },
  ];
  inquirer.prompt(question).then((answers) => {
    // console.log(answers.Method);
    if (answers.Method == 2) {
      // chalk.BackgroundColor("Here we go");
      const auto = chalkAnimation.rainbow(
        "Make sure you dont have any unstaged changes, Press any key to continue ..."
      );
      setTimeout(() => {
        auto.stop();
      }, 1000);

      TimeRange();
    } else if (answers.Method == 1) {
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
        chalkAnimation.rainbow("Sayonara...").start();
        return process.exit(0);
      }
    } else {
      return console.log(chalk.red.bold.italic("Feature Comming Soon"));
      // return process.exit(0);

      // chalkAnimation.rainbow("Feature Comming Soon...");
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
      // console.log(chalk.chalkAnimation())
      chalkAnimation.rainbow("Please wait...").start()
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

const logCommitDetailsTable = (commits) => {
  const table = new Table({
    head: [
      "No.",
      "Hash",
      "Name",
      "Insertions",
      "Effort",
      "Time Assigned",
      "Date",
    ],
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
      `${commit.hash}`,
      commit.message?.slice(0, 40),
      commit.totalInsertions,

      commit.effortPercentage.toString().slice(0, 4),
      commit.timePeriodAssigned,
      commit.actualTime,
    ])
  );

  console.log(table.toString());
};

function calculateNewCommitDates(results, startDate) {
  // Make sure to clone the start date to avoid mutating the original date
  let currentDate = startDate.clone();

  results.forEach((commit) => {
    // Ensure the time period is correctly parsed as an integer
    const timePeriodMinutes = parseInt(commit.timePeriodAssigned, 10);

    // Check for NaN and set to 0 if parsed value is not a number
    if (isNaN(timePeriodMinutes)) {
      console.error(
        `Invalid time period for commit ${commit.hash}, setting to 0.`
      );
      commit.actualTime = currentDate.format("ddd MMM DD HH:mm:ss YYYY ZZ");
      return;
    }

    // Add the time period to the current date
    currentDate.add(timePeriodMinutes, "seconds");

    // Store the new date in the commit object
    commit.actualTime = currentDate.format("ddd MMM DD HH:mm:ss YYYY ZZ");
  });

  console.log(
    "-----------------------------------------------------------------------------------"
  );
  // logCommitDetailsTable(results);
  // askForChanges(results);

  // console.log(results);

  return results; // Return the updated results with the actual commit times
}
async function gitIgnoreFilesAndAskDuration(Files, durationinInt, startDate) {
  const path2 = argv.path || process.cwd();
  gitIgnoreFiles(path2, Files)
    .then((results) => {
      // console.log("Filtered Commit Insertions:", results);

      // Ask for Minimum Time-span for the Commit
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

                // return false;
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
          // console.log(mintime);
          // const Mintiemsec = mintime.format("second");
          // console.log(
          //   "Min time isn secodns thru the format --------",
          //   Mintiemsec
          // );
          // console.log(results.length);
          const timeString = result.duration; // "HH:mm:ss"
          const parts = timeString.split(":");
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          const seconds = parseInt(parts[2], 10);

          const minSec = Math.floor(hours * 60 * 60 + minutes * 60 + seconds);

          // console.log("Total Minutes:", Math.floor(totalMinutes));
          // const minTimeMinutes = mintime.format("seconds");
          // console.log(minTimeMinutes);

          // const totalMinutes = console.log(totalMinutes);
          // console.log(
          //   durationinInt,
          //   "this should be in minutes why undefined"
          // );
          // console.log(
          //   "min seconds for each commmit thu the calculation ",
          //   minSec
          // );
          assignTimePeriods(results, durationinInt, minSec);
          //returnign the results ;
          // return results;

          calculateNewCommitDates(results, startDate);
          // console.log(results);

          // ask if you wanna change anything ornot??
          askForChanges(results).then((results) => {
            makeCommitsChanges(results, path2).then((final) => {
              // console.log("All Done?");
              console.log(chalk.magentaBright("Sayonara !!!"));
              return process.exit();
            });
          });
          // now I gotta make the changes here

          // console.log(chalkAnimation.karaoke("All Done??"));
        });
    })
    .catch((err) => {
      console.error("Error processing commits:", err);
    });
}

async function TimeRange() {
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
          // console.log(endDate.add(duration, "seconds"));
          // console.log(
          //   `Added the duration in the EndDate and Displayed it in Date Format ${endDate}`
          // );
          // // console.log(`format it ${endDate.format("minutes")}}`);
          // console.log(parseInt(duration));
          const durationinInt = parseInt(duration);
          // console.log(typeof durationinInt);
          // console.log(`it is supposed to be undefined ${durationinInt}`);

          // chalkAnimation.neon(endDate.toString()).start();

          // console.log(
          //   `The difference between the two dates is ${duration} minutes.`
          // );

          inquirer
            .prompt({
              type: "confirm",
              name: "another",
              message: chalk.yellowBright(
                "Do you want to ignore any File/Folder changes ?"
              ),
              default: false,
              prefix: " ? ",
              // transformer: (s) => chalk.bold.bgRedBright(s),
            })
            .then(async (ans) => {
              // console.log(ans.another);

              // Check the user's response and react accordingly
              if (ans.another) {
                // console.log(chalk.magentaBright("Adding another file..."));
                // AskIgnore(Files, durationinInt, startDate); // Call the function again to add more files
                console.log(
                  chalk.yellowBright(
                    "Which files/folders commits should be excuded ?"
                  )
                );
                const Files = [];
                const result = await AskIgnore(Files, durationinInt, startDate);
              } else {
                console.log(chalk.redBright("No more files to add."));
                const Files = [];
                gitIgnoreFilesAndAskDuration(Files, durationinInt, startDate);
                // console.log(
                //   chalk.yellowBright(
                //     "Final list of files/folders to be ignored:"
                //   ),
                //   Files
                // );
              }
            });

          // console.log("Which files/folders commits should be excuded ?");

          // console.log("result is showing undefined");
          // there is  a problem with the closure /async so Ill continue at the calling funcitnon
        });
    });
}
function checkIfTimeEnough(inputTime, results, durationinInt) {
  // Convert inputTime from "HH:mm:ss" to total seconds
  const parts = inputTime.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  // console.log(results);
  const minsecs = hours * 3600 + minutes * 60 + seconds;
  const noofCommits = results.length;
  const totalInputSeconds = noofCommits * minsecs;
  // Define the minimum required seconds, e.g., 30 minutes
  const minimumRequiredSeconds = durationinInt; // 30 minutes in seconds

  // Check if the entered time is enough
  if (totalInputSeconds >= minimumRequiredSeconds) {
    // console.error(
    //   "The minimum time required should be less than",
    //   Math.floor(durationinInt / noofCommits)
    // );
    return false;
  } else {
    // console.log("min time chalega!");
    return true;
  }
}
// function askforChanges(results) {

//   logCommitDetailsTable(results);
// }
async function askForChanges(results) {
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
export const makeCommitsChanges = async (results, path2) => {
  try {
    // await stashChanges(path2); // Stash changes at the start

    for (const commit of results) {
      try {
        console.log(
          "Changing the date of the commit ",
          chalk.bold.italic.magenta(commit.message)
        );
        let str = "Please wait...";
        const rainbow = chalkAnimation.rainbow(str).start()

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
        console.error(`Error changing date for commit `, chalk.red.bold(commit.message));
        console.log(chalk.bold.blue.italic(err));
        break; // Break the loop if an error occurs
      }
    }

    // await popStash(path2); // Pop stash at the end
  } catch (err) {
    // console.error("Error during commit changes:", err);

    return;
  }

  return;
};
const askMinCommitTime = async (results) => {
  // console.log("Filtered Commit Insertions:", results);

  // Ask for Minimum Time-span for the Commit
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

            // return false;
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
      // console.log(mintime);
      const Mintiemsec = mintime.format("second");
      // console.log(
      //   "Min time isn secodns thru the format --------",
      //   Mintiemsec
      // );
      // console.log(results.length);
      const timeString = result.duration; // "HH:mm:ss"
      const parts = timeString.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);

      const minSec = Math.floor(hours * 60 * 60 + minutes * 60 + seconds);

      // console.log("Total Minutes:", Math.floor(totalMinutes));
      const minTimeMinutes = mintime.format("seconds");
      // console.log(minTimeMinutes);

      // const totalMinutes = console.log(totalMinutes);
      // console.log(
      //   durationinInt,
      //   "this should be in minutes why undefined"
      // );
      // console.log(
      //   "min seconds for each commmit thu the calculation ",
      //   minSec
      // );
      assignTimePeriods(results, durationinInt, minSec);
      //returnign the results ;
      // return results;

      calculateNewCommitDates(results, startDate);
      // console.log(results);

      // ask if you wanna change anything ornot??
      askForChanges(results).then((results) => {
        makeCommitsChanges(results, path2).then((final) => {
          console.log("All Done?");
        });
      });
      // now I gotta make the changes here

      // console.log(chalkAnimation.karaoke("All Done??"));
    });
};
const AskIgnore = async (Files, durationinInt, startDate) => {
  // console.log("duration in int");
  // console.log(durationinInt);
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
      // console.log(JSON.stringify(answers));
      // console.log(answers);
      // here remove the path from the answers.Files path
      // console.log(JSON.stringify(answers.files));
      const relativeFilePath = path.relative(path2, answers.file);
      // console.log(relativeFilePath);
      // path is a the path fo the repository and the answers.file is the absolute path
      Files.push(relativeFilePath);
      // console.log(Files);
      inquirer
        .prompt({
          type: "confirm",
          name: "another",
          message: chalk.yellowBright(
            "Do you want to add another file/folder to be ignored"
          ),
          default: false,
          prefix: " ? ",
          // transformer: (s) => chalk.bold.bgRedBright(s),
        })
        .then((ans) => {
          // console.log(ans.another);

          // Check the user's response and react accordingly
          if (ans.another) {
            console.log(chalk.magentaBright("Adding another file..."));
            AskIgnore(Files, durationinInt, startDate); // Call the function again to add more files
          } else {
            console.log(chalk.redBright("No more files to add."));
            console.log(
              chalk.yellowBright("Final list of files/folders to be ignored:"),
              Files
            );
            // console.log(__dirname);
            gitIgnoreFiles(path2, Files)
              .then((results) => {
                // console.log("Filtered Commit Insertions:", results);

                // Ask for Minimum Time-span for the Commit
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

                          // return false;
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
                    // console.log(mintime);
                    const Mintiemsec = mintime.format("second");
                    // console.log(
                    //   "Min time isn secodns thru the format --------",
                    //   Mintiemsec
                    // );
                    // console.log(results.length);
                    const timeString = result.duration; // "HH:mm:ss"
                    const parts = timeString.split(":");
                    const hours = parseInt(parts[0], 10);
                    const minutes = parseInt(parts[1], 10);
                    const seconds = parseInt(parts[2], 10);

                    const minSec = Math.floor(
                      hours * 60 * 60 + minutes * 60 + seconds
                    );

                    // console.log("Total Minutes:", Math.floor(totalMinutes));
                    const minTimeMinutes = mintime.format("seconds");
                    console.log(minTimeMinutes);

                    // const totalMinutes = console.log(totalMinutes);
                    // console.log(
                    //   durationinInt,
                    //   "this should be in minutes why undefined"
                    // );
                    // console.log(
                    //   "min seconds for each commmit thu the calculation ",
                    //   minSec
                    // );
                    assignTimePeriods(results, durationinInt, minSec);
                    //returnign the results ;
                    // return results;

                    calculateNewCommitDates(results, startDate);
                    // console.log(results);

                    // ask if you wanna change anything ornot??
                    askForChanges(results).then((results) => {
                      makeCommitsChanges(results, path2).then((final) => {
                        // console.log("All Done?");
                        return console.log(
                          chalk.magenta.italic.bold("Sayonaara Senpai !!!")
                        );
                      });
                    });
                    // now I gotta make the changes here

                    // console.log(chalkAnimation.karaoke("All Done??"));
                  });
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
function calculateRemainingTime(
  totalTimeMinutes,
  minimumTimeMinutes,
  numCommits
) {
  if (isNaN(totalTimeMinutes) || totalTimeMinutes <= 0) {
    console.log(totalTimeMinutes);
    throw new Error(
      "Invalid or non-positive total time provided.",
      totalTimeMinutes
    );
  }
  if (isNaN(minimumTimeMinutes) || minimumTimeMinutes < 0) {
    throw new Error("Invalid or negative minimum time provided.");
  }
  if (isNaN(numCommits) || numCommits <= 0) {
    throw new Error("Invalid or non-positive number of commits provided.");
  }

  const totalMinimumRequiredTime = minimumTimeMinutes * numCommits;
  let remainingTime = totalTimeMinutes - totalMinimumRequiredTime;

  if (remainingTime < 0) {
    console.warn(
      `Warning: Not enough total time (${totalTimeMinutes} minutes) to allocate minimum time (${minimumTimeMinutes} minutes each) to ${numCommits} commits. Adjusting remaining time to zero.`
    );
    remainingTime = 0;
  }

  return remainingTime;
}
// function calculateOffset(index, totalCommits, totalMinutes) {
//   const baseOffsetPercentage = 0.05; // 5% of the minimum time
//   const decrementPerCommit = baseOffsetPercentage / totalCommits;
//   const offsetForThisCommit =
//     (baseOffsetPercentage - index * decrementPerCommit) * totalMinutes;
//   return Math.max(0, Math.round(offsetForThisCommit)); // Ensure non-negative offset
// }

function assignTimePeriods(results, totalTimeMinutes, minimumTimeMinutes) {
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
      // For 0% effort, assign a random additional time between 0 and a defined offset
      const offset = 0.2 * minimumTimeMinutes; // Random offset up to 20% of minimumTimeMinutes
      commit.timePeriodAssigned =
        minimumTimeMinutes + Math.floor(Math.random() * offset);
    }
    commit.timePeriodAssigned = Math.max(
      commit.timePeriodAssigned,
      minimumTimeMinutes
    ); // Ensure not below minimum
  });
  // console.log("Before Normalisation");
  // console.log(results);
  // logCommitDetailsTable(results)

  normalizeTimeAssignments(results, totalTimeMinutes, minimumTimeMinutes);
  return results;
}

function normalizeTimeAssignments(
  results,
  totalTimeMinutes,
  minimumTimeMinutes
) {
  let assignedTotal = results.reduce(
    (acc, commit) => acc + commit.timePeriodAssigned,
    0
  );
  let excessTime = assignedTotal - totalTimeMinutes;
  // console.log(excessTime);
  if (excessTime > 0) {
    // We need to reduce the total assigned time
    // Sort results in descending order based on time assigned
    results.sort((a, b) => b.timePeriodAssigned - a.timePeriodAssigned);

    for (let commit of results) {
      if (excessTime <= 0) break; // Stop if no excess time remains

      // Calculate possible reduction keeping the minimum time in check
      let possibleReduction = commit.timePeriodAssigned - minimumTimeMinutes;
      if (possibleReduction > 0) {
        let reductionAmount = Math.min(excessTime, possibleReduction);
        commit.timePeriodAssigned -= reductionAmount;
        excessTime -= reductionAmount; // Reduce the excess time
      }
    }

    // If still excess remains after trying to reduce from all, and we're at minimums
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
}

// function normalizeTimeAssignments(results, totalTimeMinutes) {
//   const assignedTotal = results.reduce(
//     (acc, commit) => acc + commit.timePeriodAssigned,
//     0
//   );

//   if (assignedTotal > totalTimeMinutes) {
//     const scale = totalTimeMinutes / assignedTotal;
//     results.forEach((commit) => {
//       commit.timePeriodAssigned = Math.round(commit.timePeriodAssigned * scale);
//       commit.timePeriodAssigned = Math.max(
//         commit.timePeriodAssigned,
//         minimumTimeMinutes
//       ); // Recheck minimum
//     });
//   }
// }

// function normalizeTimeAssignments(results, totalTimeMinutes) {
//   const assignedTotal = results.reduce(
//     (acc, commit) => acc + commit.timePeriodAssigned,
//     0
//   );

//   if (assignedTotal > totalTimeMinutes) {
//     const scale = totalTimeMinutes / assignedTotal;
//     results.forEach((commit) => {
//       commit.timePeriodAssigned = Math.round(commit.timePeriodAssigned * scale);
//     });
//   }
// }
