import chalkAnimation from "chalk-animation";
import { TimeRange, start } from "./methods.js";
import inquirer from "inquirer";
import chalk from "chalk";
import minimist from "minimist";
import { logError } from "./log.js";

const argv = minimist(process.argv.slice(2));

export const welcome = async () => {
  const rainbow = chalkAnimation.rainbow(` 
  ⠀⠀⢰⣶⣶⣦⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
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

  rainbow.start();

  console.log(`

If you don't see formatted output, try to increase the width of the terminal to have more space.
`);

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
          return console.log(chalk.red.bold.italic("Feature Coming Soon"));
        }
      },
    },
  ];
  inquirer.prompt(question).then((answers) => {
    if (answers.Method == 2) {
      const auto = chalkAnimation.rainbow(
        "Make sure you don't have any unstaged changes, Press any key to continue ..."
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
          return process.exit(0);
        });
      } catch (err) {
        console.log(err);
        chalkAnimation.rainbow("Sayonara...").start();
        return process.exit(0);
      }
    } else {
      return console.log(chalk.red.bold.italic("Feature Coming Soon"));
    }
  });
};
