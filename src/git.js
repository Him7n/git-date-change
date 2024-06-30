import moment from "moment";
import throwError from "./errors/throwError.js";
import gitLogConverter from "./gitLogConverter.js";
import execute from "./execute.js";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const exec = promisify(execCallback);

moment.suppressDeprecationWarnings = true;

const getRepoRoot = async (repoPath) => {
  try {
    const { stdout } = await execute("git rev-parse --show-toplevel", {
      cwd: repoPath,
    });
    return stdout.trim();
  } catch (error) {
    throw new Error("Failed to find Git repository root: " + error.message);
  }
};

const normalizePaths = (repoRoot, filePaths) => {
  return filePaths.map((filePath) => {
    const relativePath = path.relative(repoRoot, filePath);
    return relativePath.replace(/\\/g, "/");
  });
};

export const getCommits = async (path, { count, hash }) => {
  let commitLog;

  if (hash) {
    commitLog = await execute(`cd ${path} && git log -1 -U ${hash} --pretty`);
  } else {
    commitLog = await execute(`cd ${path} && git log -n${count} --pretty`);
  }
  return gitLogConverter(commitLog);
};

export const formatGitDate = (date) => {
  const momentDate = moment(date);
  if (!momentDate.isValid()) {
    throwError(new Error("DATE_INVALID"));
  }
  return momentDate.format("ddd MMM DD HH:mm:ss YYYY ZZ");
};

export const changeDate = async (repoPath, hash, authorDate, committerDate) => {
  try {
    const authorDateFormatted = formatGitDate(authorDate);
    const committerDateFormatted = formatGitDate(committerDate);

    // console.log(`Changing date for commit ${hash}`);
    // console.log(`Author Date: ${authorDateFormatted}`);
    // console.log(`Committer Date: ${committerDateFormatted}`);

    // Check for unstaged changes before running the command
    const { stdout: statusOutput } = await exec(
      `cd ${repoPath} && git status --porcelain`
    );
    if (statusOutput) {
      // console.log("Unstaged changes detected.");
      throwError(new Error("unstaged changes"));
    }

    if (process.platform === "win32") {
      // Windows approach
      const scriptContent = `
        @echo off
        setlocal
        set GIT_AUTHOR_DATE="${authorDateFormatted}"
        set GIT_COMMITTER_DATE="${committerDateFormatted}"
        cd /d "${repoPath}" && git filter-branch -f --env-filter "if [ $GIT_COMMIT = ${hash} ]; then export GIT_AUTHOR_DATE='${authorDateFormatted}'; export GIT_COMMITTER_DATE='${committerDateFormatted}'; fi"
        endlocal
      `;

      const scriptPath = path.join(repoPath, "change-date.bat");
      fs.writeFileSync(scriptPath, scriptContent);

      // console.log(`Executing command from batch file: ${scriptPath}`);
      const { stdout, stderr } = await exec(`cmd.exe /c "${scriptPath}"`);

      fs.unlinkSync(scriptPath); // Clean up the script file

      // console.log(`Command stdout: ${stdout}`);
      // console.log(`Command stderr: ${stderr}`);

      return { stdout, stderr };
    } else {
      // Unix approach
      const filterBranchCommand = `cd ${repoPath} && GIT_COMMIT=${hash} GIT_AUTHOR_DATE="${authorDateFormatted}" GIT_COMMITTER_DATE="${committerDateFormatted}" git filter-branch -f --env-filter "if [ \\$GIT_COMMIT = ${hash} ]; then export GIT_AUTHOR_DATE=\\"${authorDateFormatted}\\"; export GIT_COMMITTER_DATE=\\"${committerDateFormatted}\\"; fi"`;

      // console.log(`Executing command: ${filterBranchCommand}`);
      const { stdout, stderr } = await exec(filterBranchCommand);

      // console.log(`Command stdout: ${stdout}`);
      // console.log(`Command stderr: ${stderr}`);

      return { stdout, stderr };
    }
  } catch (err) {
    // console.error("Error changing date:", err);
    throw err;
  }
};

// const formatGitDate = (date) => {
//   const momentDate = moment(date, "ddd MMM DD HH:mm:ss YYYY ZZ", true);
//   if (!momentDate.isValid()) {
//     throwError(new Error("DATE_INVALID"));
//   }
//   return momentDate.toISOString();
// };
export const CommitLOCcount = async (path) => {
  try {
    const logOutput = await execute(
      `cd ${path} && git log --pretty=format:'%H' --shortstat`
    );
    if (!logOutput) {
      throwError(new Error("No output from git command"));
    }

    const lines = logOutput.split("\n").filter((line) => line.trim() !== "");

    let totalInsertions = 0;
    const commitData = [];

    for (let i = 0; i < lines.length; i += 2) {
      const commitHash = lines[i].trim();
      if (commitHash.length === 40 && i + 1 < lines.length) {
        const statsLine = lines[i + 1].trim();
        const match = /(\d+) insertion/.exec(statsLine);

        if (match && match[1]) {
          const insertions = parseInt(match[1], 10);
          totalInsertions += insertions;
          commitData.push({
            commitHash: commitHash,
            insertions: insertions,
          });
        }
      }
    }

    const results = commitData.map((data) => ({
      ...data,
      effortPercentage: (data.insertions / totalInsertions) * 100,
    }));

    return results;
  } catch (err) {
    throwError(err);
  }
};

export const gitIgnorFiles = async (repoPath, ignoreFiles) => {
  console.log("ignoreFiles:", ignoreFiles);
  try {
    // Fetching commit hashes and messages in one go
    const logOutput = await execute(
      `cd ${repoPath} && git log --pretty=format:'%H%n%s' --numstat`
    );
    if (!logOutput) {
      throw new Error("No output from git command");
    }

    const lines = logOutput.split(/\r?\n/); // Split lines correctly for both Windows and Unix
    let commitData = {};
    let currentHash = null;
    let expectMessage = false; // State flag to capture the next line as message

    lines.forEach((line) => {
      const trimmedLine = line.trim().replace(/^'|'$/g, ""); // Trim spaces and remove leading/trailing single quotes
      // console.log(`Processing line: '${trimmedLine}'`); // Log each line being processed

      if (!trimmedLine) return; // Skip empty lines

      if (expectMessage) {
        if (commitData[currentHash]) {
          commitData[currentHash].message = trimmedLine;
          expectMessage = false; // Reset the flag
        } else {
          console.error(
            `Error: commitData[${currentHash}] is undefined when expecting message`
          );
        }
        return;
      }

      // Check if the line is a commit hash
      if (trimmedLine.length === 40 && /^[0-9a-f]{40}$/.test(trimmedLine)) {
        currentHash = trimmedLine;
        expectMessage = true; // Set flag to capture the next line as the message
        commitData[currentHash] = {
          hash: currentHash,
          message: "", // Initialize the message to be filled in the next line
          filePaths: [],
          totalInsertions: 0,
        };
      } else if (!expectMessage && trimmedLine.includes("\t")) {
        // Ensure it's a numstat line
        if (!currentHash || !commitData[currentHash]) {
          console.error(
            `Error: currentHash is undefined when processing numstat`
          );
          return;
        }
        const lineParts = trimmedLine.split("\t");
        if (lineParts.length === 3) {
          const [insertions, , filePath] = lineParts;
          if (!isIgnored(filePath, ignoreFiles)) {
            const insertionsCount = parseInt(insertions, 10);
            if (!isNaN(insertionsCount)) {
              commitData[currentHash].filePaths.push(filePath);
              commitData[currentHash].totalInsertions += insertionsCount;
            }
          }
        }
      }
    });

    // Calculate the total insertions for effort percentage calculation
    const totalInsertions = Object.values(commitData).reduce(
      (acc, commit) => acc + commit.totalInsertions,
      0
    );

    // Add effort percentage to each commit
    const results = Object.values(commitData).map((commit) => ({
      ...commit,
      effortPercentage: (commit.totalInsertions / totalInsertions) * 100,
    }));

    return results;
  } catch (err) {
    throw err;
  }
};

async function addCommitMessages(results, repoPath) {
  for (let commit of results) {
    try {
      const command = `git log -1 --format=%B ${commit.hash}`;
      const commitMessageOutput = execute(command).toString().trim();

      commit.message = commitMessageOutput;
    } catch (error) {
      console.error(
        `Error fetching commit message for hash ${commit.hash}:`,
        error
      );
      commit.message = "Commit message unavailable";
    }
  }

  return results;
}

function isIgnored(filePath, ignoreFiles) {
  return ignoreFiles.some((ignoreFile) => filePath.includes(ignoreFile));
}

function totalInsertions(data) {
  return Object.values(data).reduce(
    (acc, commit) => acc + commit.totalInsertions,
    0
  );
}

export const gitIgnoreFiles = async (repoPath, Files) => {
  try {
    const results = await gitIgnorFiles(repoPath, Files);
    return results;
  } catch (err) {
    throwError(err);
  }
};
