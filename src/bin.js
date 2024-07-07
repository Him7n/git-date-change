#!/usr/bin/env node

import minimist from "minimist";
import { welcome } from "./welcome.js";

const argv = minimist(process.argv.slice(2));

welcome();
