# Git Date Change

![Git Date Change](https://img.shields.io/badge/version-1.1.1-blue.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Description

`Git Date Change` is a tool for changing git commit dates with lines of code (LOC) calculations. It offers three methods to adjust commit dates:

1. **Manual Date Entry**: Manually set the date for each commit.
2. **Time Range with LOC Calculation**: Automatically determine commit times based on a specified time range and LOC calculations.
3. **Time Range with AI**: Automatically determine commit times based on a specified time range using AI.

## Features

- **Manual Date Change**: Allows users to manually specify the commit date.
- **Automatic Date Calculation**: Automatically calculates commit dates based on LOC or AI within a specified time range.
- **Commit Filtering**: Ability to exclude specific files or folders from the commit date change process.
- **Cross-Platform Support**: Works on both Windows and Linux systems.

## Installation

To install the tool globally, run:

```bash
npm install -g git-date-change
```

## Usage

To run the project, use the following command:

```bash
git-date-change

```

run with arguments:

```bash
git-date-change --count <noofcommits-to-see-in-table-at-a-time>

```

## Contributing

Contributions are welcome! Please create a pull request or submit an issue for any improvements or bugs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [chalk](https://www.npmjs.com/package/chalk)
- [inquirer](https://www.npmjs.com/package/inquirer)
- [moment](https://www.npmjs.com/package/moment)
- [child_process](https://nodejs.org/api/child_process.html)

## Contact

**Author**: Himanshu Sharma

**Email**: [kanekihiman@gmail.com](mailto:kanekihiman@gmail.com)

**GitHub**: [Him7n](https://github.com/Him7n)
