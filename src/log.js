import colors from "colors";
import Table from "cli-table";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

export const logError = (err) => {
  if (argv.dev) {
    const table = new Table();
    table.push([err.stack]);
    console.log(table.toString());
  } else {
    console.log(colors.red(err.message));
  }
};

export const logCommitDetailsTable = (commits) => {
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
