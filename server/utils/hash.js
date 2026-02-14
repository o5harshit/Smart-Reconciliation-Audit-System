import fs from "fs";
import crypto from "crypto";

export const getFileHash = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
};

export const getObjectHash = (obj) => {
  const normalized = JSON.stringify(
    Object.keys(obj || {})
      .sort()
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {})
  );
  return crypto.createHash("sha256").update(normalized).digest("hex");
};

