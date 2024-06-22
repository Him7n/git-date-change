import inquirer from "inquirer";
import chalk from "chalk";
import inquirerFileTreeSelection from "inquirer-file-tree-selection-prompt";
import { argv } from "./bin.js";

export const AskIgnore = (Files) => {
  const path = argv.path || process.cwd();

  inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
  inquirer
    .prompt([
      {
        root: "..",
        type: "file-tree-selection",
        name: "file",
        // multiple: true,
      },
    ])
    .then((answers) => {
      console.log(JSON.stringify(answers));
      console.log(answers);
      Files.push(answers.file);
      console.log(Files);
      inquirer.prompt([
        {
          type: "confirm",
          name: "another ",
          message: "Do you want to add another file/folder to be ignored?",
          default: false,
          prefix: " 🌎 ",
          transformer: (s) => chalk.bold.greenBright(s),
        },
      ]);
    });
};
