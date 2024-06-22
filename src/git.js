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
    const logOutput = await execute(
      `cd ${repoPath} && git log --pretty=format:'%H' --numstat`
    );
    if (!logOutput) {
      throw new Error("No output from git command");
    }

    const lines = logOutput.split("\n").filter((line) => line.trim() !== "");
    let totalInsertions = 0;
    const commitData = [];

    for (let i = 0; i < lines.length; i++) {
      const lineParts = lines[i].split("\t");
      if (lineParts.length === 3) {
        const [insertions, , filePath] = lineParts;
        if (!isIgnored(filePath, ignoreFiles)) {
          const insertionsCount = parseInt(insertions, 10);
          if (!isNaN(insertionsCount)) {
            totalInsertions += insertionsCount;
            commitData.push({
              filePath,
              insertions: insertionsCount,
            });
          }
        }
      }
    }

    const results = commitData.map((data) => ({
      ...data,
      effortPercentage: (data.insertions / totalInsertions) * 100,
    }));

    return results;
  } catch (err) {
    throw err;
  }
};

function isIgnored(filePath, ignoreFiles) {
  return ignoreFiles.some((ignoreFile) => filePath.includes(ignoreFile));
}

export const gitIgnoreFiles = async (repoPath, Files) => {
  try {
    // Get the repository root path to ensure paths are relative to it
    // const repoRoot = await getRepoRoot(repoPath);
    console.log("Repo path which  was passed", repoPath);
    // const normalizedIgnoreFiles = normalizePaths(repoPath, Files);
    const results = await gitIgnorFiles(repoPath, Files);
    return results;
  } catch (err) {
    throwError(err);
  }
};
