import { Dispatch, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Spinner } from "@akashnetwork/ui/components";
import { Bitbucket, GithubCircle, GitlabFull, Lock } from "iconoir-react";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";

import remoteDeployStore from "@src/store/remoteDeployStore";
import { useWorkspaces } from "../api/bitbucket-api";
import { useGitLabGroups } from "../api/gitlab-api";
const Groups = ({ isLoading, group, setGroup }: { isLoading: boolean; group: string; setGroup: Dispatch<string> }) => {
  const [open, setOpen] = useState(false);

  const [token] = useAtom(remoteDeployStore.tokens);
  const { data, isLoading: loadingWorkSpaces } = useGitLabGroups();
  console.log(data);

  return (
    <div className="flex flex-col gap-5 rounded border bg-card px-6 py-6 text-card-foreground">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold">Select Group</h1>
        <p className="text-muted-foreground">Select a Group to use for deployment</p>
      </div>

      <Select
        onOpenChange={value => {
          setOpen(value);
        }}
        open={open}
        onValueChange={value => {
          setGroup(value);
        }}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            {isLoading || (loadingWorkSpaces && <Spinner size="small" />)}
            <SelectValue placeholder={"Select"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {data?.map((work: any) => (
              <SelectItem key={work.path} value={work.path}>
                <div className="flex items-center">
                  <GitlabFull className="mr-2" />
                  {work.name}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Groups;
