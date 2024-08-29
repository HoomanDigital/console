import dotenv from "@dotenvx/dotenvx";
import fs from "fs";
import pino from "pino";

const logger = pino().child({ context: "ENV" });

const config = (path: string) => {
  if (fs.existsSync(path)) {
    dotenv.config({ path });
    logger.info(`Loaded ${path}`);
  }
};
config("env/.env.local");
config("env/.env");

const deploymentEnv = process.env.DEPLOYMENT_ENV;

if (deploymentEnv && deploymentEnv !== "local") {
  config(`env/.env.${deploymentEnv}`);
}

const network = process.env.NETWORK || "mainnet";
config(`env/.env.${network}`);
