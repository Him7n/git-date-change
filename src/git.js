import moment from "moment";
import throwError from "./errors/throwError.js";
import gitLogConverter from "./gitLogConverter.js";
import execute from "./execute.js";
import path from "path";
// import UnstagedChangesError from "./errors/UnstagedChangesError.js";

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

// Function to normalize file paths to be relative to the repository root
const normalizePaths = (repoRoot, filePaths) => {
  return filePaths.map((filePath) => {
    // Make the path relative to the repository root
    const relativePath = path.relative(repoRoot, filePath);
    return relativePath.replace(/\\/g, "/"); // Convert backslashes to forward slashes for Unix compatibility
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

export const changeDate = async (path, hash, authorDate, committerDate) => {
  try {
    const authorDateFormatted = formatGitDate(authorDate);
    const committerDateFormatted = formatGitDate(committerDate);

    // Check for unstaged changes before running the command
    const { stdout: statusOutput } = await execute(
      `cd ${path} && git status --porcelain`
    );
    if (statusOutput) {
      throwError(new Error("DATE_INVALID"));
    }

    return await execute(`cd ${path} && git filter-branch -f --env-filter \
    'if [ $GIT_COMMIT = ${hash} ]
     then
         export GIT_AUTHOR_DATE="${authorDateFormatted}"
         export GIT_COMMITTER_DATE="${committerDateFormatted}"
     fi'`);
  } catch (err) {
    return throwError(err);
  }
};

export const CommitLOCcount = async (path) => {
  try {
    const logOutput = await execute(
      `cd ${path} && git log --pretty=format:'%H' --shortstat`
    );
    if (!logOutput) {
      throwError(new Error("No output from git command"));
    }

    // Split the output into lines and handle them carefully
    const lines = logOutput.split("\n").filter((line) => line.trim() !== ""); // Filter out any empty lines

    let totalInsertions = 0;
    const commitData = [];

    // Loop through the lines and assume that every even index line (0, 2, 4, ...) is a commit hash
    for (let i = 0; i < lines.length; i += 2) {
      const commitHash = lines[i].trim();
      // insertion lines are the odd ones
      if (commitHash.length === 40 && i + 1 < lines.length) {
        // Check if next line exists
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

    // Calculate effort percentage for each commit
    const results = commitData.map((data) => ({
      ...data,
      effortPercentage: (data.insertions / totalInsertions) * 100,
    }));

    return results;
  } catch (err) {
    throwError(err); // Proper error handling
  }
};
// Files aray contains the path of the files and Folders to be ignored
// const gitIgnoreFiles = (Files) => {};
export const gitIgnorFiles = async (repoPath, ignoreFiles) => {
  try {
    // Fetching commit hashes and messages in one go
    const logOutput = await execute(
      `cd ${repoPath} && git log --pretty=format:'%H%n%s' --numstat`
    );
    if (!logOutput) {
      throw new Error("No output from git command");
    }

    const lines = logOutput.split("\n");
    let commitData = {};
    let currentHash = null;
    let expectMessage = false; // State flag to capture the next line as message

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // Skip empty lines

      if (expectMessage) {
        // The line following the hash is the commit message
        commitData[currentHash].message = trimmedLine;
        expectMessage = false; // Reset the flag
        return;
      }

      // Check if the line is a commit hash
      if (trimmedLine.length === 40 && !/\t/.test(trimmedLine)) {
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
// const execute = require("child_process").execSync; // If you're using Node.js to execute shell commands

async function addCommitMessages(results, repoPath) {
  // Iterate over each commit in the results
  for (let commit of results) {
    try {
      // Fetch the commit message for the given commit hash
      const command = `git log -1 --format=%B ${commit.hash}`;
      const commitMessageOutput = execute(command).toString().trim();

      // Add the commit message to the commit object
      commit.message = commitMessageOutput;
    } catch (error) {
      console.error(
        `Error fetching commit message for hash ${commit.hash}:`,
        error
      );
      // Optionally set a default message or handle the error as needed
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
    // Get the repository root path to ensure paths are relative to it
    // const repoRoot = await getRepoRoot(repoPath);
    console.log("Repo path which  was passed", repoPath);
    // const normalizedIgnoreFiles = normalizePaths(repoPath, Files);
    const results = await gitIgnorFiles(repoPath, Files);
    console.log(results);
    ///addign the names
    // const results2 = await addCommitMessages(results, repoPath);
    // console.log(results2);
    return results;
  } catch (err) {
    throwError(err);
  }
};
