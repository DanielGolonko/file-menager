const os = require("os");
const path = require("path");
const process = require("process");

const args = process.argv.slice(2);
const usernameArg = args.find((arg) => arg.startsWith("--username="));
const username = usernameArg ? usernameArg.split("=")[1] : "User";

let currentDir = os.homedir();

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDirectory();

process.on("SIGINT", () => {
  console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
  process.exit();
});

function printCurrentDirectory() {
  console.log(`You are currently in ${currentDir}`);
}

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ">",
});

rl.prompt();

rl.on("line", (line) => {
  const input = line.trim();
  switch (input) {
    case "up":
      goUp();
      break;
    case ".exit":
      rl.close();
      break;
    default:
      console.log("Invalid input");
  }
  rl.prompt();
}).on("close", () => {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit(0);
});

function goUp() {
  const parentDir = path.dirname(currentDir);
  if (parentDir !== currentDir) {
    currentDir = parentDir;
  }
  printCurrentDirectory();
}

const fs = require("fs");

function changeDirectory(dir) {
  const newPath = path.resolve(currentDir, dir);
  fs.stat(newPath, (err, stats) => {
    if (err || !stats.isDirectory()) {
      console.log("Operation failed");
    } else {
      currentDir = newPath;
      printCurrentDirectory();
    }
  });
}

function listDirectory() {
  fs.readdir(currentDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.log("Operation failed");
      return;
    }
    const dirs = files.filter((f) => f.isDirectory()).map((f) => f.name);
    const regularFiles = files.filter((f) => f.isFile()).map((f) => f.name);
    const sortedList = [...dirs, ...regularFiles].sort();
    sortedList.forEach((f) => console.log(f));
  });
}

rl.on("line", (line) => {
  const input = line.trim().split(" ");
  const command = input[0];
  const argument = input[1];

  switch (command) {
    case "cd":
      if (argument) {
        changeDirectory(argument);
      } else {
        console.log("Invalid input");
      }
      break;
    case "ls":
      listDirectory();
      break;
    case "up":
      goUp();
      break;
    case ".exit":
      rl.close();
      break;
    default:
      console.log("Invalid input");
  }
  rl.prompt();
});

const { createReadStream, createWriteStream } = require("fs");

function copyFile(src, dest) {
  const srcPath = path.resolve(currentDir, src);
  const destPath = path.resolve(currentDir, dest);

  const readStream = createReadStream(srcPath);
  const writeStream = createWriteStream(destPath);

  readStream.on("error", () => console.log("Operation failed"));
  writeStream.on("error", () => console.log("Operation failed"));

  readStream.pipe(writeStream);
  writeStream.on("finish", () =>
    console.log(`File copied from ${src} to ${dest}`)
  );
}

function moveFile(src, dest) {
  const srcPath = path.resolve(currentDir, src);
  const destPath = path.resolve(currentDir, dest);

  fs.rename(srcPath, destPath, (err) => {
    if (err) {
      console.log("Operation failed");
    } else {
      console.log(`File moved from ${src} to ${dest}`);
    }
  });
}

function removeFile(file) {
  const filePath = path.resolve(currentDir, file);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("Operation failed");
    } else {
      console.log(`File ${file} deleted`);
    }
  });
}

function renameFile(oldName, newName) {
  const oldPath = path.resolve(currentDir, oldName);
  const newPath = path.resolve(currentDir, newName);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.log("Operation failed");
    } else {
      console.log(`File renamed from ${oldName} to ${newName}`);
    }
  });
}

rl.on("line", (line) => {
  const input = line.trim().split(" ");
  const command = input[0];
  const arg1 = input[1];
  const arg2 = input[2];

  switch (command) {
    case "copy":
      if (arg1 && arg2) {
        copyFile(arg1, arg2);
      } else {
        console.log("Invalid input");
      }
      break;
    case "move":
      if (arg1 && arg2) {
        moveFile(arg1, arg2);
      } else {
        console.log("Invalid input");
      }
      break;
    case "rm":
      if (arg1) {
        removeFile(arg1);
      } else {
        console.log("Invalid input");
      }
      break;
    case "rn":
      if (arg1 && arg2) {
        renameFile(arg1, arg2);
      } else {
        console.log("Invalid input");
      }
      break;
    default:
      console.log("Invalid input");
  }
  rl.prompt();
});

function getOSInfo() {
  console.log("Operating System Info:");
  console.log(`Architecture: ${os.arch()}`);
  console.log(`Total Memory: ${(os.totalmem() / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Free Memory: ${(os.freemem() / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`User Info: ${JSON.stringify(os.userInfo())}`);
}

rl.on("line", (line) => {
  const input = line.trim();

  switch (input) {
    case "os-info":
      getOSInfo();
      break;

    default:
      console.log("Invalid input");
  }
  rl.prompt();
});

const zlib = require("zlib");

function compressFile(src, dest) {
  const srcPath = path.resolve(currentDir, src);
  const destPath = path.resolve(currentDir, dest);

  const readStream = createReadStream(srcPath);
  const writeStream = createWriteStream(destPath);
  const gzip = zlib.createGzip();

  readStream.on("error", () => console.log("Operation failed"));
  writeStream.on("error", () => console.log("Operation failed"));

  readStream.pipe(gzip).pipe(writeStream);
  writeStream.on("finish", () =>
    console.log(`File ${src} compressed to ${dest}`)
  );
}

function decompressFile(src, dest) {
  const srcPath = path.resolve(currentDir, src);
  const destPath = path.resolve(currentDir, dest);

  const readStream = createReadStream(srcPath);
  const writeStream = createWriteStream(destPath);
  const gunzip = zlib.createGunzip();

  readStream.on("error", () => console.log("Operation failed"));
  writeStream.on("error", () => console.log("Operation failed"));

  readStream.pipe(gunzip).pipe(writeStream);
  writeStream.on("finish", () =>
    console.log(`File ${src} decompressed to ${dest}`)
  );
}

rl.on("line", (line) => {
  const input = line.trim().split(" ");
  const command = input[0];
  const arg1 = input[1];
  const arg2 = input[2];

  switch (command) {
    case "compress":
      if (arg1 && arg2) {
        compressFile(arg1, arg2);
      } else {
        console.log("Invalid input");
      }
      break;
    case "decompress":
      if (arg1 && arg2) {
        decompressFile(arg1, arg2);
      } else {
        console.log("Invalid input");
      }
      break;
    default:
      console.log("Invalid input");
  }
  rl.prompt();
});

const crypto = require("crypto");

function calculateHash(file) {
  const filePath = path.resolve(currentDir, file);
  const hash = crypto.createHash("sha256");
  const readStream = createReadStream(filePath);

  readStream.on("error", () => console.log("Operation failed"));
  readStream.on("data", (chunk) => {
    hash.update(chunk);
  });
  readStream.on("end", () => {
    const hashValue = hash.digest("hex");
    console.log(`SHA-256 hash of ${file}: ${hashValue}`);
  });
}

rl.on("line", (line) => {
  const input = line.trim().split(" ");
  const command = input[0];
  const arg1 = input[1];

  switch (command) {
    case "hash":
      if (arg1) {
        calculateHash(arg1);
      } else {
        console.log("Invalid input");
      }
      break;
    default:
      console.log("Invalid input");
  }
  rl.prompt();
});
