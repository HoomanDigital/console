import { Dispatch, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Spinner } from "@akashnetwork/ui/components";
import { GithubCircle, Lock } from "iconoir-react";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";

import remoteDeployStore from "@src/store/remoteDeployStore";
import { Service } from "@src/types";
const Repos = ({
  repos,
  setValue,
  isLoading,
  services,
  setDeploymentName
}: {
  repos: any;
  setValue: any;
  services: Service[];
  isLoading: boolean;
  setDeploymentName: Dispatch<string>;
  deploymentName: string;
}) => {
  const [open, setOpen] = useState(false);
  console.log(repos);
  const [token] = useAtom(remoteDeployStore.tokens);
  return (
    <div className="flex flex-col gap-5 rounded border bg-card px-6 py-6 text-card-foreground">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold">Select Repository</h1>
        <p className="text-muted-foreground">The Repository Branch used for your private service</p>
      </div>

      <Select
        onOpenChange={value => {
          setOpen(value);
        }}
        value={services?.[0]?.env?.find(e => e.key === "REPO_URL")?.value}
        open={open}
        onValueChange={value => {
          setValue("services.0.env", [
            { id: nanoid(), key: "REPO_URL", value: value, isSecret: false },
            { id: nanoid(), key: "BRANCH_NAME", value: repos?.find(repo => repo.html_url === value)?.default_branch, isSecret: false },

            { id: nanoid(), key: "ACCESS_TOKEN", value: token?.access_token, isSecret: false }
          ]);
          setDeploymentName(repos?.find(repo => repo.html_url === value)?.name);
        }}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            {isLoading && <Spinner size="small" />}
            <SelectValue placeholder={"Select Repository"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {repos?.map((repo: any) => (
              <SelectItem key={repo.html_url} value={repo.html_url}>
                <div className="flex items-center">
                  <GithubCircle className="mr-2" />
                  {repo.name}

                  {repo.private && <Lock className="ml-1 text-xs" />}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Repos;
