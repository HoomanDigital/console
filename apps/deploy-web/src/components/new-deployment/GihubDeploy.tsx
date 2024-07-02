import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Button, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Spinner } from "@akashnetwork/ui/components";
import { Skeleton } from "@mui/material";
import axios from "axios";
import { Bitbucket, Github, GitlabFull } from "iconoir-react";
import { nanoid } from "nanoid";

import { Service } from "@src/types";

const GithubDeploy = ({ setValue, services }: { setValue: any; services: Service[] }) => {
  const clientId = "Iv23liZYLYN9I2HrgeOh";
  const redirectUri = "http://localhost:3000/new-deployment?step=edit-deployment&type=github";
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const handleLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
  };

  const { data: repos, isLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: async () => {
      const response = await axios.get("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    },
    onSettled: data => {
      if (data?.message === "Bad credentials") {
        localStorage.removeItem("token");
        setToken(null);
        return;
      }
    },
    enabled: !!token
  });

  const { mutate: fetchAccessToken } = useMutation({
    mutationFn: async (code: string) => {
      const response = await axios.post("https://proxy-console-github.vercel.app/authenticate", {
        code
      });
      return response.data;
    },
    onSuccess: data => {
      setToken(data.access_token);
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }
    }
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    setToken(localStorage.getItem("token"));

    if (code && !token) {
      fetchAccessToken(code);
    }
  }, [token]);

  console.log(token, repos);

  return (
    <>
      <div className="mt-6 flex flex-col gap-5 rounded border bg-card px-6 py-6 text-card-foreground">
        <h1 className="font-semibold">Source Code</h1>

        <div className="flex flex-col items-center justify-center gap-6 rounded-sm border py-8">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-lg font-bold text-primary">Connect Account</h1>
            <p className="text-sm text-muted-foreground">Connect your GitHub account to use the GitHub integration.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="">
              <Bitbucket className="mr-2" />
              Bitbucket
            </Button>
            <Button variant="outline" className="">
              <GitlabFull className="mr-2" />
              GitLab
            </Button>
            <Button onClick={handleLogin} variant="outline" className="">
              <Github className="mr-2" />
              Github
            </Button>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="mt-6 flex flex-col gap-5 rounded border bg-card px-6 py-6 text-card-foreground">
          <h1 className="font-semibold">Repos</h1>
          <div className="flex flex-col items-center justify-center gap-6 rounded-sm border px-5 py-8">
            <Skeleton variant="rectangular" width="100%" height={50} className="rounded" />
            <Skeleton variant="rectangular" width="100%" height={50} className="rounded" />
            <Skeleton variant="rectangular" width="100%" height={50} className="rounded" />
          </div>
        </div>
      )}
      {repos?.length > 0 && (
        <div className="mt-6 flex flex-col gap-5 rounded border bg-card px-6 py-6 text-card-foreground">
          <h1 className="font-semibold">Repos</h1>

          <div className="flex flex-col items-center justify-center divide-y rounded-sm border">
            {repos.map((repo: any) => (
              <Repo key={repo.id} repo={repo} services={services} setValue={setValue} token={token} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default GithubDeploy;

const Repo = ({ repo, services, setValue, token }) => {
  const selected = services.find(s => s?.env?.find(e => e.key === "REPO_URL" && e.value === repo.html_url));
  console.log(selected);
  const [packageJson, setPackageJson] = useState<any>(null);
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches", repo.full_name],
    queryFn: async () => {
      const response = await axios.get(`https://api.github.com/repos/${repo.full_name}/branches`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    },
    enabled: !!selected
  });
  //get data from the branch
  useQuery({
    queryKey: ["packageJson", repo.full_name],
    queryFn: async () => {
      const response = await axios.get(`https://api.github.com/repos/${repo.full_name}/contents/package.json`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    },
    enabled: !!selected,
    onSettled: data => {
      if (data?.content === undefined) return;
      const content = atob(data.content);
      const parsed = JSON.parse(content);
      setPackageJson(parsed);
    }
  });

  console.log(packageJson);

  return (
    <div className="flex w-full flex-col gap-6 px-8 py-3">
      <div className="flex w-full items-center justify-between gap-3">
        <p>{repo.name}</p>
        <Button
          variant={selected ? "outline" : "default"}
          onClick={() => {
            setValue("services.0.env", [
              { id: nanoid(), key: "REPO_URL", value: repo.html_url, isSecret: false },
              { id: nanoid(), key: "BRANCH_NAME", value: "main", isSecret: false },
              { id: nanoid(), key: "ACCESS_TOKEN", value: token, isSecret: true }
            ]);
          }}
        >
          {selected ? "Selected" : "Select"}
        </Button>
      </div>
      {selected && (
        <div className="mb-4 flex w-full flex-col gap-6 rounded-lg border p-4">
          <div className="flex w-full items-center justify-between gap-3">
            <p>Choose Branch</p>
            {branchesLoading ? (
              <Spinner size="small" />
            ) : (
              <Select
                onValueChange={value => {
                  setValue("services.0.env", [
                    { id: nanoid(), key: "REPO_URL", value: repo.html_url, isSecret: false },
                    { id: nanoid(), key: "BRANCH_NAME", value: value, isSecret: false },
                    { id: nanoid(), key: "ACCESS_TOKEN", value: token, isSecret: true }
                  ]);
                }}
              >
                <SelectTrigger className="ml-1 w-[10rem]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {branches?.map((branch: any) => (
                      <SelectItem key={branch.name} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
          {/* name the framework and version of the package.json file from base64 content */}
          {packageJson && (
            <div className="flex w-full items-center justify-between gap-3">
              <p>Framework</p>
              <p className="capitalize">{packageJson?.scripts?.start?.split(" ")[0]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
