// import UnstagedChangesError from "./UnstagedChangesError";
// import DateInvalidError from "./DateInvalidError";

export default (err) => {
  if (!err || !err.message) {
    throw new Error("Something went wrong Senpai !!!");
  } else if (err.message === "DATE_INVALID") {
    throw new Error("Invalid date Senpai !!!");
  } else if (err.message.toLowerCase().indexOf("unstaged changes") > -1) {
    throw new Error("You have some unstaged changes Senpai !!!");
  } else {
    throw err;
  }
};
