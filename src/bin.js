import minimist from "minimist";
import colors from "colors";
import prompt from "prompt";
import Table from "cli-table";
import { getCommits, changeDate } from "./git.js";
import chalkAnimation from "chalk-animation";
import inquirer from "inquirer";
import chalk from "chalk";
import DatePrompt from "inquirer-date-prompt";
import moment from "moment";
const argv = minimist(process.argv.slice(2));

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
  let EndDate;
  inquirer
    .prompt({
      type: "input",
      name: "Date",
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
      startDate = moment(ans.Date, "ddd MMM DD HH:mm:ss YYYY ZZ");
      // startDate = ans;
      console.log(startDate);
      console.log(typeof startDate);
      console.log(ans);

      inquirer
        .prompt({
          type: "input",
          name: "Date",
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
        .then((ans) => {
          EndDate = moment(ans.Date, "ddd MMM DD HH:mm:ss YYYY ZZ");
          // startDate = ans;
          console.log(EndDate);
          console.log(typeof EndDate);
          console.log(ans);
        });
    });

  // ive got the Start Date and the EndDate
  let commits;
  let commit;

  const dirPath = argv.path || process.cwd();

  getCommits(dirPath, {
    count: argv.count || 5,
    hash: argv.hash,
  }).then((_commits) => {
    commits = _commits;

    console.log(commits);
    return logCommits(commits);
  });
  // here calculate the line addded count of the each commit and console log it
}
