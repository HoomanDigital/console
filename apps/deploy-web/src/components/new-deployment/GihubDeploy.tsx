import { useEffect, useState } from "react";
import { Button, Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from "@akashnetwork/ui/components";
import { Bitbucket, Github, GitlabFull } from "iconoir-react";
import { set } from "lodash";

import { Service } from "@src/types";
import Advanced from "../remote-deploy/Advanced";
import { handleLogin, useFetchAccessToken, useRepos, useUserProfile } from "../remote-deploy/api";
import { useBitFetchAccessToken, useBitUserProfile } from "../remote-deploy/bitbucket-api";
import Branches from "../remote-deploy/Branches";
import CustomInput from "../remote-deploy/CustomInput";
import Details from "../remote-deploy/Details";
import Repos from "../remote-deploy/Repos";
import { appendEnv } from "../remote-deploy/utils";

const BitBucketKey = "HfxhSWx78u8juqs2Ta";

const handleLoginBit = () => {
  window.location.href = `https://bitbucket.org/site/oauth2/authorize?client_id=${BitBucketKey}&response_type=code`;
};

const GithubDeploy = ({ setValue, services, control }: { setValue: any; services: Service[]; control: any }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [type, setType] = useState<"github" | "gitlab" | "bitbucket">((localStorage.getItem("type") as "github" | "gitlab" | "bitbucket") || "github");
  const { data: repos, isLoading } = useRepos(type, setToken, token);

  const { data: userProfile, isLoading: fetchingProfile } = useUserProfile(type, token);
  const { data: userProfileBit, isLoading: fetchingProfileBit } = useBitUserProfile(type, token);
  console.log(userProfileBit);

  const { mutate: fetchAccessToken, isLoading: fetchingToken } = useFetchAccessToken(setToken);
  const { mutate: fetchAccessTokenBit, isLoading: fetchingTokenBit } = useBitFetchAccessToken(setToken);

  const [selectedTab, setSelectedTab] = useState("git");

  useEffect(() => {
    const url = new URL(window.location.href);

    const code = url.searchParams.get("code");
    setToken(localStorage.getItem("token"));

    if (code && !token) {
      if (type === "github") fetchAccessToken(code);
      if (type === "bitbucket") fetchAccessTokenBit(code);
    }
  }, [token, type]);

  console.log(type, token);

  return (
    <>
      <div className="mt-6 flex flex-col gap-5 rounded border bg-card px-6 py-6 text-card-foreground">
        <h1 className="font-semibold">Configure</h1>
        <div className="flex flex-col gap-5 rounded border bg-card px-6 py-6 text-card-foreground">
          <h1 className="font-semibold">Source Code</h1>

          {
            <Tabs
              onValueChange={value => {
                setSelectedTab(value);
                setValue("services.0.env", []);
              }}
              defaultValue="git"
            >
              <TabsList>
                <TabsTrigger value="git">Git Provider</TabsTrigger>
                <TabsTrigger value="public">Public Git Repository</TabsTrigger>
              </TabsList>
              <TabsContent value="git">
                {" "}
                {fetchingToken || fetchingProfile || fetchingTokenBit || fetchingProfileBit ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded border px-5 py-10">
                    <Spinner size="large" />
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : token ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded border px-5 py-10">
                    <h1 className="text-2xl font-semibold text-primary">Welcome, {type === "bitbucket" ? userProfileBit?.display_name : userProfile?.login}</h1>
                    <p className="text-muted-foreground">Let’s Configure and Deploy your new web service ({type})</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-6 rounded-sm border py-8">
                    <div className="flex flex-col items-center justify-center">
                      <h1 className="text-lg font-bold text-primary">Connect Account</h1>
                      <p className="text-sm text-muted-foreground">Connect your GitHub account to use the GitHub integration.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setType("bitbucket");
                          localStorage.setItem("type", "bitbucket");
                          handleLoginBit();
                        }}
                        variant="outline"
                        className=""
                      >
                        <Bitbucket className="mr-2" />
                        Bitbucket
                      </Button>
                      <Button variant="outline" className="">
                        <GitlabFull className="mr-2" />
                        GitLab
                      </Button>
                      <Button
                        onClick={() => {
                          setType("github");
                          localStorage.setItem("type", "github");
                          handleLogin();
                        }}
                        variant="outline"
                        className=""
                      >
                        <Github className="mr-2" />
                        Github
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="public" className="flex flex-col gap-6">
                <CustomInput
                  label="Repository URL"
                  description="The Repository Branch used for your private service"
                  placeholder="eg. anything"
                  onChange={e => appendEnv("REPO_URL", e.target.value, false, setValue, services)}
                />
                <CustomInput
                  label="Branch Name"
                  description="The Repository Branch used for your private service"
                  placeholder="eg. anything"
                  onChange={e => appendEnv("BRANCH_NAME", e.target.value, false, setValue, services)}
                />
              </TabsContent>
            </Tabs>
          }
        </div>
        {selectedTab === "git" && (
          <div className="grid grid-cols-2 gap-6">
            <Repos repos={repos} setValue={setValue} token={token} isLoading={isLoading} />
            <Branches repos={repos} services={services} setValue={setValue} token={token} />
          </div>
        )}
      </div>{" "}
      <Details services={services} setValue={setValue} />
      <Advanced services={services} control={control} />
    </>
  );
};

export default GithubDeploy;
