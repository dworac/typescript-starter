/**
 * @file src/commander/commands/create.ts
 * @author dworac <mail@dworac.com>
 *
 *     Create command for the CLI.
 *     This command creates a new project from a template.
 */

/* eslint-disable no-console */

import { Argument, Command } from "commander";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { execSync } from "child_process";
import templates from "../../utils/templates";
import copyTemplate from "../../utils/copyTemplate";

const onGenerate = (
  name: string,
  template: string,
  options: {
    description: string;
    repository: string;
    keywords: string;
    author: string;
  }
) => {
  const { description, repository, keywords, author } = options;

  // New project directory
  const newProjectPath = path.join(name);
  // Template directory
  const templatePath = path.join(__dirname, "..", "templates", template);

  // If new project directory exists, delete it.
  if (fs.existsSync(newProjectPath)) {
    fs.rmSync(newProjectPath, { recursive: true });
  }

  // Create new project directory
  fs.mkdirSync(newProjectPath);

  // Copy template files to new project directory
  copyTemplate(templatePath, newProjectPath, {
    "template.name": name,
    "template.description": description,
    "template.repository": repository,
    "template.keywords": keywords.split(" ").join(","),
    "template.author": author,
  });

  // if git is installed, initialize new project directory as a git repository
  try {
    execSync("git init", { cwd: newProjectPath });
  } catch {
    /* empty */
  }

  console.log(
    chalk.green(
      `Successfully created new project at ${chalk.blue(newProjectPath)}\n`
    )
  );
  console.log("We suggest that you begin by typing:");
  console.log(`  ${chalk.cyan("cd")} ${name}\n`);

  // try to get template.json file from template directory
  const templateJsonPath = path.join(templatePath, "template.json");
  if (fs.existsSync(templateJsonPath)) {
    const templateJson = JSON.parse(fs.readFileSync(templateJsonPath, "utf8"));

    templateJson.commands.forEach((command: unknown) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { description: commandDescription, name: commandName } = command;
      const nameFirstWord = commandName.split(" ")[0];
      const nameRest = commandName.split(" ").slice(1).join(" ");

      console.log(commandDescription);
      console.log(`  ${chalk.cyan(nameFirstWord)} ${nameRest}\n`);
    });
  }
  console.log(
    `You can find more information at the ${chalk.blue("README.md")} file\n`
  );
};

export default (program: Command) => {
  program
    .command("create")
    .description("Generates a new project from a template")
    .argument("<name>", `The new project's name`)
    .addArgument(
      new Argument("<template>", `The project's template to use.`).choices(
        templates
      )
    )
    .option(
      "-d, --description <string>",
      "New project description",
      "A new project"
    )
    .option(
      "-r, --repository <string>",
      "New project git repository",
      "https://github.com/dworac"
    )
    .option("-k, --keywords <string>", "New project keywords", "dworac")
    .option(
      "-a, --author <string>",
      "New project author",
      "dworac <mail@dworac.com>"
    )
    .action(onGenerate);
};
